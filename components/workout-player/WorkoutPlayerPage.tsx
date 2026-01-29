"use client";

import { useState, useEffect } from "react";
import { Workout } from "@/lib/types";
import PlayerHeader from "./PlayerHeader";
import ExerciseView from "./ExerciseView";
import RestView from "./RestView";
import BottomControls from "./BottomControls";
import CompletionModal from "./CompletionModal";
import { useRouter } from "next/navigation";

interface WorkoutPlayerPageProps {
  workout: Workout;
}

type PlayerState = "preview" | "active" | "rest" | "complete";

export default function WorkoutPlayerPage({ workout }: WorkoutPlayerPageProps) {
  const router = useRouter();

  // Flatten all exercises from sections
  const allExercises = workout.sections.flatMap(section => section.exercises);
  const totalExercises = allExercises.length;

  // Player state
  const [playerState, setPlayerState] = useState<PlayerState>("preview");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentExercise = allExercises[currentExerciseIndex];

  // Total elapsed timer
  useEffect(() => {
    if (isPaused || playerState === "complete") return;

    const timer = setInterval(() => {
      setTotalSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, playerState]);

  // Rest timer countdown
  useEffect(() => {
    if (playerState !== "rest" || isPaused || restSecondsLeft <= 0) return;

    const timer = setInterval(() => {
      setRestSecondsLeft(prev => {
        if (prev <= 1) {
          // Rest complete, move to next set
          handleRestComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [playerState, isPaused, restSecondsLeft]);

  const handleRestComplete = () => {
    setCurrentSet(prev => prev + 1);
    setPlayerState("active");
  };

  const handleNext = () => {
    if (playerState === "preview") {
      // Start first set
      setPlayerState("active");
    } else if (playerState === "active") {
      // Check if more sets remaining
      if (currentSet < currentExercise.sets) {
        // Start rest timer
        setRestSecondsLeft(currentExercise.restSeconds);
        setPlayerState("rest");
      } else {
        // Move to next exercise
        moveToNextExercise();
      }
    } else if (playerState === "rest") {
      // Skip rest, go to next set
      setCurrentSet(prev => prev + 1);
      setPlayerState("active");
    }
  };

  const moveToNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setPlayerState("active"); // Auto-start next exercise instead of preview
    } else {
      // Workout complete
      setPlayerState("complete");
    }
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleExit = () => {
    if (confirm("Are you sure you want to exit the workout?")) {
      router.push("/workouts");
    }
  };

  const calculateProgress = () => {
    const exerciseProgress = currentExerciseIndex / totalExercises;
    const setProgress = (currentSet - 1) / currentExercise.sets / totalExercises;
    return Math.round((exerciseProgress + setProgress) * 100);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <PlayerHeader
        progress={calculateProgress()}
        currentExercise={currentExerciseIndex + 1}
        totalExercises={totalExercises}
        totalSeconds={totalSeconds}
        onExit={handleExit}
      />

      {/* Main content - scrollable if needed, with bottom padding for fixed controls */}
      <div className="flex-1 overflow-y-auto pb-32">
        {playerState === "rest" ? (
          <RestView
            exercise={currentExercise}
            restSecondsLeft={restSecondsLeft}
          />
        ) : (
          <ExerciseView
            exercise={currentExercise}
            currentSet={currentSet}
            playerState={playerState}
          />
        )}
      </div>

      {/* Bottom controls - fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <BottomControls
          playerState={playerState}
          isPaused={isPaused}
          onPauseToggle={handlePauseToggle}
          onNext={handleNext}
          onExit={handleExit}
        />
      </div>

      {/* Completion modal */}
      {playerState === "complete" && (
        <CompletionModal
          workout={workout}
          totalSeconds={totalSeconds}
          onClose={() => router.push("/workouts")}
          onViewWorkout={() => router.push(`/workout-view?id=${workout.id}`)}
        />
      )}
    </div>
  );
}
