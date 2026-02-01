/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Yoga, Exercise } from "@/lib/types";
import MuscleGroupImage from "./MuscleGroupImage";
import { useUserProfile } from "@/hooks/useUserProfile";

interface DetailModalProps {
  item: Yoga | Exercise | null;
  type: "yoga" | "exercise" | null;
  onClose: () => void;
}

function isYoga(item: Yoga | Exercise): item is Yoga {
  return "sanskrit_name" in item;
}

export default function DetailModal({ item, onClose }: DetailModalProps) {
  const [selectedRelated, setSelectedRelated] = useState<Yoga | Exercise | null>(null);
  const { profile } = useUserProfile();
  const imageGender = profile.gender;

  const handleRelatedExerciseClick = async (exerciseTitle: string) => {
    try {
      const response = await fetch("/api/exercises");
      if (!response.ok) return;
      const exercises: Exercise[] = await response.json();
      const found = exercises.find(
        (ex) => ex.title.toLowerCase() === exerciseTitle.toLowerCase()
      );
      if (found) {
        setSelectedRelated(found);
      }
    } catch (error) {
      console.error("Error fetching related exercise:", error);
    }
  };

  const handleRelatedPoseClick = async (poseTitle: string) => {
    try {
      const response = await fetch("/api/yoga");
      if (!response.ok) return;
      const poses: Yoga[] = await response.json();
      const found = poses.find(
        (pose) => pose.title.toLowerCase() === poseTitle.toLowerCase()
      );
      if (found) {
        setSelectedRelated(found);
      }
    } catch (error) {
      console.error("Error fetching related pose:", error);
    }
  };

  if (!item) return null;

  // If a related exercise is selected, show it instead
  if (selectedRelated) {
    return <DetailModal item={selectedRelated} type="exercise" onClose={() => setSelectedRelated(null)} />;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center sm:p-2"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-xl sm:rounded-lg w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-3 py-2 flex justify-between items-center">
          <h2 className="text-sm font-bold truncate pr-2">{item.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>

        <div className="p-3">
          {/* Exercise Image */}
          <div className="mb-3">
            <div className="bg-gray-100 rounded overflow-hidden h-48 sm:h-56">
              {!isYoga(item) ? (
                <iframe
                  key={`${(item as Exercise).slug}-${imageGender}`}
                  src={`/svg-animator.html?slug=${encodeURIComponent((item as Exercise).slug)}&gender=${imageGender}&playing=true`}
                  className="w-full h-full border-0"
                  style={{ background: 'transparent' }}
                  title={item.title}
                  loading="eager"
                />
              ) : (
                <img
                  src={`/yoga-images/${item.slug}/male.svg`}
                  alt={item.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400?text=Image";
                  }}
                />
              )}
            </div>
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-gray-50 rounded p-1.5">
              <p className="text-gray-500 text-[10px]">Category</p>
              <p className="font-medium text-xs">{item.pose_category}</p>
            </div>
            {isYoga(item) && (
              <div className="bg-gray-50 rounded p-1.5">
                <p className="text-gray-500 text-[10px]">Difficulty</p>
                <p className="font-medium text-xs">{item.difficulty}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-3">
            <h3 className="font-semibold text-xs mb-1">Description</h3>
            <p className="text-gray-600 text-xs leading-relaxed">{item.description}</p>
          </div>

          {/* Benefits */}
          {item.benefits && item.benefits.length > 0 && (
            <div className="mb-3">
              <h3 className="font-semibold text-xs mb-1">Benefits</h3>
              <ul className="space-y-0.5">
                {item.benefits.map((benefit, idx) => (
                  <li key={idx} className="text-gray-600 text-xs flex gap-1">
                    <span className="text-green-500">•</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Alignment Cues */}
          {item.alignment_cues && item.alignment_cues.length > 0 && (
            <div className="mb-3">
              <h3 className="font-semibold text-xs mb-1">Alignment Cues</h3>
              <ul className="space-y-0.5">
                {item.alignment_cues.map((cue, idx) => (
                  <li key={idx} className="text-gray-600 text-xs flex gap-1">
                    <span className="text-blue-500">•</span>
                    {cue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Body Parts / Muscles */}
          {isYoga(item) ? (
            <div className="mb-3">
              <h3 className="font-semibold text-xs mb-1">Primary Body Parts</h3>
              <div className="flex flex-wrap gap-1">
                {item.primary_body_parts.map((part, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px]"
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Muscle Group Image */}
              <div className="mb-3">
                <h3 className="font-semibold text-xs mb-1">Muscles Engaged</h3>
                <MuscleGroupImage exercise={item as Exercise} />
              </div>

              {(item as Exercise).equipment && (item as Exercise).equipment.length > 0 && (
                <div className="mb-3">
                  <h3 className="font-semibold text-xs mb-1">Equipment</h3>
                  <div className="flex flex-wrap gap-1">
                    {(item as Exercise).equipment.map((eq, idx) => (
                      <span
                        key={idx}
                        className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px]"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Related Items */}
          {isYoga(item) && item.related_poses && item.related_poses.length > 0 && (
            <div className="mb-3">
              <h3 className="font-semibold text-xs mb-1">Related Poses</h3>
              <div className="flex flex-wrap gap-1">
                {item.related_poses.map((pose, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRelatedPoseClick(pose)}
                    className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-0.5 rounded text-[10px] transition-colors"
                  >
                    {pose}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isYoga(item) && (item as Exercise).related_exercises && (item as Exercise).related_exercises.length > 0 && (
            <div className="mb-3">
              <h3 className="font-semibold text-xs mb-1">Related Exercises</h3>
              <div className="flex flex-wrap gap-1">
                {(item as Exercise).related_exercises.map((exercise, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRelatedExerciseClick(exercise)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-0.5 rounded text-[10px] transition-colors"
                  >
                    {exercise}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
