"use client";

import { Workout } from "@/lib/types";

interface CompletionModalProps {
  workout: Workout;
  totalSeconds: number;
  onClose: () => void;
  onViewWorkout: () => void;
}

export default function CompletionModal({
  workout,
  totalSeconds,
  onClose,
  onViewWorkout,
}: CompletionModalProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalExercises = workout.sections.reduce(
    (sum, section) => sum + section.exercises.length,
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-3 sm:p-8">
        <div className="text-center">
          {/* Success icon */}
          <div className="w-12 h-12 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-6">
            <svg
              className="w-6 h-6 sm:w-10 sm:h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Workout Complete!
          </h2>
          <p className="text-xs sm:text-base text-gray-600 mb-3 sm:mb-8">Great job finishing your workout</p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-8">
            <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
              <p className="text-xl sm:text-3xl font-bold text-indigo-600">
                {formatTime(totalSeconds)}
              </p>
              <p className="text-[10px] sm:text-sm text-gray-600">Duration</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
              <p className="text-xl sm:text-3xl font-bold text-indigo-600">
                {totalExercises}
              </p>
              <p className="text-[10px] sm:text-sm text-gray-600">Exercises</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-1.5 sm:space-y-3">
            <button
              onClick={onViewWorkout}
              className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm sm:text-base"
            >
              View Workout Details
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm sm:text-base"
            >
              Back to Workouts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
