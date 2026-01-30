"use client";

import { useState, useEffect, useRef } from "react";
import { WorkoutExercise } from "@/lib/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMars, faVenus } from "@fortawesome/free-solid-svg-icons";
import MuscleGroupImage from "./MuscleGroupImage";

interface ExerciseDetailModalProps {
  exercise: WorkoutExercise;
  onClose: () => void;
}

export default function ExerciseDetailModal({
  exercise,
  onClose,
}: ExerciseDetailModalProps) {
  const [imageGender, setImageGender] = useState<"male" | "female">("male");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const iframeSrc = exercise.exerciseSlug
    ? `/svg-animator.html?slug=${encodeURIComponent(exercise.exerciseSlug)}&gender=${imageGender}&playing=true`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {exercise.exerciseName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Gender Toggle */}
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => setImageGender("male")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                imageGender === "female"
                  ? "bg-pink-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faVenus} />
              Female
            </button>
          </div>

          {/* Exercise Animation - Using iframe */}
          <div className="bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '400px' }}>
            {iframeSrc ? (
              <iframe
                ref={iframeRef}
                key={`${exercise.exerciseSlug}-${imageGender}`}
                src={iframeSrc}
                className="w-full h-[400px] border-0"
                style={{ background: 'transparent' }}
                title={exercise.exerciseName}
                loading="eager"
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-2">💪</div>
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>

          {/* Exercise Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{exercise.sets}</div>
              <div className="text-sm text-gray-600 font-medium">Sets</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{exercise.reps}</div>
              <div className="text-sm text-gray-600 font-medium">Reps</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{exercise.restSeconds}s</div>
              <div className="text-sm text-gray-600 font-medium">Rest</div>
            </div>
          </div>

          {/* Muscle Diagram */}
          {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
            <div>
              <MuscleGroupImage
                exercise={{
                  primary_muscles: exercise.primaryMuscles,
                  secondary_muscles: [],
                } as any}
              />
            </div>
          )}

          {/* Description */}
          {exercise.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{exercise.description}</p>
            </div>
          )}

          {/* Primary Muscles */}
          {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Primary Muscles</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.primaryMuscles.map((muscle, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.equipment.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {exercise.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-700 leading-relaxed">{exercise.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
