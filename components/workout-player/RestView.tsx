"use client";

import { WorkoutExercise } from "@/lib/types";
import AnimatedExerciseImage from "../AnimatedExerciseImage";

interface RestViewProps {
  exercise: WorkoutExercise;
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
      {/* Exercise name */}
      <div className="w-full mb-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center whitespace-nowrap overflow-hidden text-ellipsis">
          {exercise.exerciseName}
        </h1>
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
