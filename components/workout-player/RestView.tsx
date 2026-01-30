"use client";

import { WorkoutExercise } from "@/lib/types";
import AnimatedExerciseImage from "../AnimatedExerciseImage";

interface RestViewProps {
  exercise: WorkoutExercise & {
    sectionName?: string;
    sectionSets?: number;
    currentSectionRound?: number;
  };
  restSecondsLeft: number;
}

export default function RestView({
  exercise,
  restSecondsLeft,
}: RestViewProps) {
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      {/* Section round indicator */}
      {exercise.sectionName && exercise.sectionSets && exercise.sectionSets > 1 && (
        <div className="w-full mb-2">
          <p className="text-sm text-indigo-600 font-semibold text-center">
            {exercise.sectionName} - Round {exercise.currentSectionRound} of {exercise.sectionSets}
          </p>
        </div>
      )}

      {/* Exercise name */}
      <div className="w-full mb-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center whitespace-nowrap overflow-hidden text-ellipsis">
          {exercise.exerciseName}
        </h1>
      </div>

      {/* Faded exercise image with animation */}
      <div className="w-full max-w-md h-64 sm:h-80 mb-3 flex items-center justify-center">
        <AnimatedExerciseImage
          exercise={exercise}
          isPlaying={true}
          opacity={0.3}
          containerId="player-rest-view"
        />
      </div>

      {/* Rest label */}
      <p className="text-blue-500 text-base font-semibold mb-3">
        Rest before next set
      </p>

      {/* HUGE countdown */}
      <p className="text-blue-500 text-7xl font-bold">
        {formatCountdown(restSecondsLeft)}
      </p>
    </div>
  );
}
