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
      {/* Exercise name and reps */}
      <div className="text-center py-0.5 px-2 bg-white border-b">
        <h1 className="text-xs font-bold text-gray-900 truncate leading-tight">
          {exercise.exerciseName}
        </h1>
        {exercise.sectionName && exercise.sectionSets && exercise.sectionSets > 1 && (
          <p className="text-[8px] text-indigo-600 leading-tight">
            {exercise.sectionName} • Round {exercise.currentSectionRound}/{exercise.sectionSets}
          </p>
        )}
        {/* Reps display */}
        <div className="mt-0">
          <span className="text-lg font-bold text-blue-600">{exercise.reps}</span>
          <span className="text-[10px] text-gray-500 ml-0.5">reps</span>
        </div>
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
      <div className="py-1 px-4 text-center bg-white border-t mb-14">
        {playerState === "preview" ? (
          <div className="flex items-center justify-center gap-2 text-sm font-semibold">
            <span>{exercise.sets} sets</span>
            <span className="text-gray-400">•</span>
            <span>{exercise.restSeconds}s rest</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <span className="text-base font-bold text-gray-700">{currentSet}/{exercise.sets} <span className="text-xs text-gray-500 font-normal">set</span></span>
            <span className="text-gray-300">|</span>
            <span className="text-base font-bold text-gray-700">{exercise.restSeconds}s <span className="text-xs text-gray-500 font-normal">rest</span></span>
          </div>
        )}
      </div>
    </div>
  );
}
