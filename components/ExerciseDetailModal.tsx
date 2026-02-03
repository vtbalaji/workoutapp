"use client";

import { useEffect, useRef } from "react";
import { WorkoutExercise } from "@/lib/types";
import MuscleGroupImage from "./MuscleGroupImage";
import AnimatedExerciseImage from "./AnimatedExerciseImage";
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Close Button Only */}
        <div className="absolute top-6 right-4 z-20">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl sm:text-4xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="pt-4 px-4 pb-0 sm:p-6">
          {/* Exercise Name - Right above image with minimal gap */}
          <div className="mb-0">
            {(() => {
              const names = exercise.exerciseName.split('/').map(name => name.trim());
              if (names.length === 1) {
                return (
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {names[0]}
                  </h1>
                );
              }
              return (
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                    {names[0]}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    {names.slice(1).join(' / ')}
                  </p>
                </div>
              );
            })()}
          </div>
          {/* Exercise Animation - Using AnimatedExerciseImage component */}
          <div className="bg-white sm:rounded-lg overflow-hidden mb-0 sm:mb-0" style={{ height: '300px' }}>
            {exercise.exerciseSlug ? (
              <AnimatedExerciseImage
                exercise={exercise}
                isPlaying={true}
                containerId="exercise-detail-modal"
              />
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="text-6xl sm:text-7xl mb-4">💪</div>
                <p className="text-gray-500 text-base sm:text-lg">No image available</p>
              </div>
            )}
          </div>

          {/* Exercise Stats */}
          <div className={`grid ${exercise.sets > 1 ? 'grid-cols-3' : 'grid-cols-2'} gap-3 sm:gap-4 px-4 sm:px-0 py-1 sm:py-0 mb-2 sm:mb-3`}>
            {exercise.sets > 1 && (
              <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg flex items-center justify-center gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-blue-600">{exercise.sets}</span>
                <span className="text-sm sm:text-base text-gray-600 font-medium">Sets</span>
              </div>
            )}
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg flex items-center justify-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-green-600">{exercise.reps}</span>
              <span className="text-sm sm:text-base text-gray-600 font-medium">Reps</span>
            </div>
            <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg flex items-center justify-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-orange-600">{exercise.restSeconds}s</span>
              <span className="text-sm sm:text-base text-gray-600 font-medium">Rest</span>
            </div>
          </div>

          {/* Muscle Diagram */}
          {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
            <div className="mb-6 sm:mb-8 px-4 sm:px-0">
              <MuscleGroupImage
                exercise={{
                  primary_muscles: exercise.primaryMuscles,
                  secondary_muscles: exercise.secondaryMuscles || [],
                } as any}
              />
            </div>
          )}

          {/* Description */}
          {exercise.description && (
            <div className="px-4 sm:px-0 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{exercise.description}</p>
            </div>
          )}

          {/* Equipment */}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div className="px-4 sm:px-0 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Equipment</h3>
              <div className="flex flex-wrap gap-2 sm:gap-2">
                {exercise.equipment.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg text-sm sm:text-base font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {exercise.notes && (
            <div className="px-4 sm:px-0 pb-4 sm:pb-2 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{exercise.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
