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
    <div className="h-full flex flex-col">
      {/* Exercise name */}
      <div className="text-center py-1 px-2">
        <h1 className="text-sm font-bold text-gray-900 truncate">
          {exercise.exerciseName}
        </h1>
        {exercise.sectionName && exercise.sectionSets && exercise.sectionSets > 1 && (
          <p className="text-[10px] text-indigo-600">
            {exercise.sectionName} • Round {exercise.currentSectionRound}/{exercise.sectionSets}
          </p>
        )}
      </div>

      {/* Large exercise image - takes all available space */}
      <div className="flex-1 min-h-0">
        <AnimatedExerciseImage
          exercise={exercise}
          isPlaying={playerState === "active"}
          containerId="player-exercise-view"
        />
      </div>

      {/* Info bar - fixed above bottom controls */}
      <div className="py-2 px-4 text-center bg-white border-t mb-14">
        {playerState === "preview" ? (
          <div className="flex items-center justify-center gap-3 text-base font-semibold">
            <span>{exercise.sets} sets</span>
            <span className="text-gray-400">•</span>
            <span>{exercise.reps} reps</span>
            <span className="text-gray-400">•</span>
            <span>{exercise.restSeconds}s rest</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <span className="text-3xl font-bold text-blue-600">{exercise.reps} <span className="text-sm text-gray-500 font-normal">reps</span></span>
            <span className="text-gray-300">|</span>
            <span className="text-lg font-bold text-gray-700">{currentSet}/{exercise.sets} <span className="text-sm text-gray-500 font-normal">set</span></span>
            <span className="text-gray-300">|</span>
            <span className="text-lg font-bold text-gray-700">{exercise.restSeconds}s <span className="text-sm text-gray-500 font-normal">rest</span></span>
          </div>
        )}
      </div>
    </div>
  );
}
