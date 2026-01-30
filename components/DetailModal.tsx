/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Yoga, Exercise } from "@/lib/types";
import MuscleGroupImage from "./MuscleGroupImage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMars, faVenus } from "@fortawesome/free-solid-svg-icons";

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
  const [imageGender, setImageGender] = useState<"male" | "female">("male");

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
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{item.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Images with Gender Selector */}
          <div className="mb-6">
            {!isYoga(item) && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setImageGender("male")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    imageGender === "male"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  <FontAwesomeIcon icon={faMars} />
                  Male
                </button>
                <button
                  onClick={() => setImageGender("female")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    imageGender === "female"
                      ? "bg-pink-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  <FontAwesomeIcon icon={faVenus} />
                  Female
                </button>
              </div>
            )}
            <div className="bg-gray-100 rounded-lg overflow-hidden h-80">
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
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600 text-sm">Category</p>
              <p className="font-semibold">{item.pose_category}</p>
            </div>
            {isYoga(item) && (
              <div>
                <p className="text-gray-600 text-sm">Difficulty</p>
                <p className="font-semibold">{item.difficulty}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700">{item.description}</p>
          </div>

          {/* Benefits */}
          {item.benefits && item.benefits.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Benefits</h3>
              <ul className="list-disc list-inside space-y-1">
                {item.benefits.map((benefit, idx) => (
                  <li key={idx} className="text-gray-700">
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Alignment Cues */}
          {item.alignment_cues && item.alignment_cues.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Alignment Cues</h3>
              <ul className="list-disc list-inside space-y-1">
                {item.alignment_cues.map((cue, idx) => (
                  <li key={idx} className="text-gray-700">
                    {cue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Body Parts / Muscles */}
          {isYoga(item) ? (
            <>
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Primary Body Parts</h3>
                <div className="flex flex-wrap gap-2">
                  {item.primary_body_parts.map((part, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Muscle Group Image */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-4">Muscles Engaged</h3>
                <MuscleGroupImage exercise={item as Exercise} />
              </div>

              {(item as Exercise).equipment && (item as Exercise).equipment.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2">Equipment</h3>
                  <div className="flex flex-wrap gap-2">
                    {(item as Exercise).equipment.map((eq, idx) => (
                      <span
                        key={idx}
                        className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
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
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Related Poses</h3>
              <div className="flex flex-wrap gap-2">
                {item.related_poses.map((pose, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRelatedPoseClick(pose)}
                    className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors"
                  >
                    {pose}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isYoga(item) && (item as Exercise).related_exercises && (item as Exercise).related_exercises.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Related Exercises</h3>
              <div className="flex flex-wrap gap-2">
                {(item as Exercise).related_exercises.map((exercise, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRelatedExerciseClick(exercise)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors"
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
