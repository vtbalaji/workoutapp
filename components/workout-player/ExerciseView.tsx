"use client";

import { WorkoutExercise } from "@/lib/types";
import AnimatedExerciseImage from "../AnimatedExerciseImage";

interface ExerciseViewProps {
  exercise: WorkoutExercise & {
    sectionName?: string;
    sectionSets?: number;
    currentSectionRound?: number;
  };
  currentSet: number;
  playerState: "preview" | "active" | "rest" | "complete";
}

export default function ExerciseView({
  exercise,
  currentSet,
  playerState,
}: ExerciseViewProps) {
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
          {/* Preview: Show sets, reps, rest in a line */}
          <div className="flex items-center justify-center gap-2 mb-8 text-lg font-semibold">
            <span className="text-gray-900">{exercise.sets} sets</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-900">{exercise.reps} reps</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-900">{exercise.restSeconds}s rest</span>
          </div>
        </>
      ) : (
        <>
          {/* Active: Show current set info */}
          <div className="mb-4">
            <p className="text-gray-500 text-lg text-center mb-2">
              Set {currentSet} of {exercise.sets}
            </p>
            <p className="text-green-500 text-7xl font-bold text-center mb-4">
              {exercise.reps}
            </p>
            <p className="text-gray-400 text-xl text-center font-semibold">reps</p>
          </div>

          {/* Show full workout info below */}
          <div className="flex items-center justify-center gap-2 text-base font-medium mb-4">
            <span className="text-gray-700">{exercise.sets} sets</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-700">{exercise.reps} reps</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-700">{exercise.restSeconds}s rest</span>
          </div>
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
