"use client";

import { WorkoutExercise } from "@/lib/types";
import AnimatedExerciseImage from "../AnimatedExerciseImage";

interface RestViewProps {
  exercise: WorkoutExercise;
  restSecondsLeft: number;
  onSkipExercise: () => void;
}

export default function RestView({
  exercise,
  restSecondsLeft,
  onSkipExercise,
}: RestViewProps) {
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      {/* Exercise name + skip */}
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {exercise.exerciseName}
        </h1>
        <button
          onClick={onSkipExercise}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Skip exercise"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Faded exercise image with animation */}
      <div className="w-full max-w-md h-80 sm:h-96 mb-12 flex items-center justify-center">
        <AnimatedExerciseImage
          exercise={exercise}
          isPlaying={true}
          opacity={0.3}
          containerId="player-rest-view"
        />
      </div>

      {/* Rest label */}
      <p className="text-green-500 text-lg font-semibold mb-4">
        Rest before next set
      </p>

      {/* HUGE countdown */}
      <p className="text-green-500 text-8xl font-bold">
        {formatCountdown(restSecondsLeft)}
      </p>
    </div>
  );
}
