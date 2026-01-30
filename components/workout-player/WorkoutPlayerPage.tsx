"use client";

import { useState, useEffect, useCallback } from "react";
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

  // Check if autostart is enabled
  const [autostart] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('autostart') === 'true';
    }
    return false;
  });

  // Flatten all exercises from sections, accounting for section sets
  // If a section has sets=3, include each exercise 3 times
  const allExercises = workout.sections.flatMap(section => {
    const sectionSets = section.sets || 1;
    const exercisesWithMetadata = section.exercises.map(ex => ({
      ...ex,
      sectionName: section.name,
      sectionSets: sectionSets,
    }));

    // Repeat exercises for each section set
    return Array.from({ length: sectionSets }, (_, setIndex) =>
      exercisesWithMetadata.map(ex => ({
        ...ex,
        currentSectionRound: setIndex + 1,
      }))
    ).flat();
  });

  const totalExercises = allExercises.length;

  // Player state - start active if autostart is true
  const [playerState, setPlayerState] = useState<PlayerState>(autostart ? "active" : "preview");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentExercise = allExercises[currentExerciseIndex];

  const handleRestComplete = () => {
    setCurrentSet(prev => prev + 1);
    setPlayerState("active");
  };

  const moveToNextExercise = useCallback(() => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setPlayerState("active"); // Auto-start next exercise instead of preview
    } else {
      // Workout complete
      setPlayerState("complete");
    }
  }, [currentExerciseIndex, totalExercises]);

  const handleNext = useCallback(() => {
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
  }, [playerState, currentSet, currentExercise.sets, currentExercise.restSeconds, moveToNextExercise]);

  const handlePauseToggle = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  const handleExit = useCallback(() => {
    if (confirm("Are you sure you want to exit the workout?")) {
      router.push("/workouts");
    }
  }, [router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case " ": // Space - pause/play
        case "k":
          e.preventDefault();
          handlePauseToggle();
          break;
        case "ArrowRight": // Next
        case "n":
          e.preventDefault();
          handleNext();
          break;
        case "Escape": // Exit
          e.preventDefault();
          handleExit();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleExit, handleNext, handlePauseToggle]);

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

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
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
