"use client";

import { useEffect, useRef } from "react";
import { WorkoutExercise } from "@/lib/types";
import MuscleGroupImage from "./MuscleGroupImage";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ExerciseDetailModalProps {
  exercise: WorkoutExercise;
  onClose: () => void;
}

export default function ExerciseDetailModal({
  exercise,
  onClose,
}: ExerciseDetailModalProps) {
  const { profile } = useUserProfile();
  const imageGender = profile.gender;
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
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-2 sm:py-4 flex items-center justify-between z-10">
          <h2 className="text-base sm:text-2xl font-bold text-gray-900">
            {exercise.exerciseName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-0 sm:p-6">
          {/* Exercise Animation - Using iframe - Edge to edge on mobile */}
          <div className="bg-gray-50 sm:rounded-lg overflow-hidden flex items-center justify-center mb-0 sm:mb-6" style={{ minHeight: '300px' }}>
            {iframeSrc ? (
              <iframe
                ref={iframeRef}
                key={`${exercise.exerciseSlug}-${imageGender}`}
                src={iframeSrc}
                className="w-full h-[300px] sm:h-[400px] border-0"
                style={{ background: 'transparent' }}
                title={exercise.exerciseName}
                loading="eager"
              />
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="text-4xl sm:text-6xl mb-2">💪</div>
                <p className="text-gray-500 text-sm sm:text-base">No image available</p>
              </div>
            )}
          </div>

          {/* Exercise Stats */}
          <div className="grid grid-cols-3 gap-1 sm:gap-4 px-2 sm:px-0 py-1 sm:py-0 mb-0.5 sm:mb-6">
            <div className="text-center p-1 sm:p-4 bg-blue-50 rounded">
              <div className="text-base sm:text-3xl font-bold text-blue-600">{exercise.sets}</div>
              <div className="text-[10px] sm:text-sm text-gray-600 font-medium">Sets</div>
            </div>
            <div className="text-center p-1 sm:p-4 bg-green-50 rounded">
              <div className="text-base sm:text-3xl font-bold text-green-600">{exercise.reps}</div>
              <div className="text-[10px] sm:text-sm text-gray-600 font-medium">Reps</div>
            </div>
            <div className="text-center p-1 sm:p-4 bg-orange-50 rounded">
              <div className="text-base sm:text-3xl font-bold text-orange-600">{exercise.restSeconds}s</div>
              <div className="text-[10px] sm:text-sm text-gray-600 font-medium">Rest</div>
            </div>
          </div>

          {/* Muscle Diagram */}
          {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
            <div className="px-4 sm:px-0 mb-2 sm:mb-6">
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
            <div className="px-4 sm:px-0 mb-2 sm:mb-6">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Description</h3>
              <p className="text-xs sm:text-base text-gray-700 leading-relaxed">{exercise.description}</p>
            </div>
          )}

          {/* Equipment */}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div className="px-4 sm:px-0 mb-2 sm:mb-6">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Equipment</h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {exercise.equipment.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {exercise.notes && (
            <div className="px-4 sm:px-0 pb-4 sm:pb-0 mb-2 sm:mb-6">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Notes</h3>
              <p className="text-xs sm:text-base text-gray-700 leading-relaxed">{exercise.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
