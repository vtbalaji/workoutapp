"use client";

import { WorkoutExercise } from "@/lib/types";
import AnimatedExerciseImage from "../AnimatedExerciseImage";

interface ExerciseViewProps {
  exercise: WorkoutExercise;
  currentSet: number;
  playerState: "preview" | "active" | "rest" | "complete";
  onSkipExercise: () => void;
}

export default function ExerciseView({
  exercise,
  currentSet,
  playerState,
  onSkipExercise,
}: ExerciseViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      {/* Exercise name */}
      <div className="w-full mb-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center whitespace-nowrap overflow-hidden text-ellipsis">
          {exercise.exerciseName}
        </h1>
      </div>

      {/* Large exercise image with animation */}
      <div className="w-full max-w-md h-80 sm:h-96 mb-12 flex items-center justify-center">
        <AnimatedExerciseImage
          exercise={exercise}
          isPlaying={playerState === "active"}
          containerId="player-exercise-view"
        />
      </div>

      {playerState === "preview" ? (
        <>
          {/* Preview: Show sets, reps, rest */}
          <div className="flex gap-8 mb-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{exercise.sets}</p>
              <p className="text-sm text-gray-500">sets</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{exercise.reps}</p>
              <p className="text-sm text-gray-500">reps</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">
                {exercise.restSeconds}
              </p>
              <p className="text-sm text-gray-500">sec rest</p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Active: Show current set and reps */}
          <p className="text-gray-500 text-base mb-2">
            Set {currentSet} of {exercise.sets}
          </p>

          <p className="text-green-500 text-8xl font-bold mb-8">
            {exercise.reps}{" "}
            <span className="text-gray-400 text-2xl font-normal">reps</span>
          </p>
        </>
      )}

      {/* Notes */}
      {(exercise.notes || exercise.description) && (
        <p className="text-gray-500 text-sm text-center max-w-md px-4">
          {exercise.notes || exercise.description}
        </p>
      )}
    </div>
  );
}
