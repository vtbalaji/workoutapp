"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Workout, WorkoutExercise } from "@/lib/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";
import ExerciseDetailModal from "@/components/ExerciseDetailModal";


export default function WorkoutViewPage() {
  return (
    <ProtectedRoute>
      <WorkoutViewContent />
    </ProtectedRoute>
  );
}

function WorkoutViewContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<WorkoutExercise | null>(null);

  useEffect(() => {
    const loadWorkout = async () => {
      if (!user) return;

      try {
        const queryParams = new URLSearchParams(window.location.search);
        const workoutId = queryParams.get("id");

        if (!workoutId) {
          throw new Error("No workout ID provided");
        }

        const token = await user.getIdToken();
        const response = await fetch(`/api/workouts/${workoutId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load workout");
        }

        const data = await response.json();
        setWorkout(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workout");
      } finally {
        setLoading(false);
      }
    };

    loadWorkout();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Failed to load workout"}</p>
            <Link href="/workouts" className="text-blue-600 hover:underline">
              Back to My Workouts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total exercises
  const totalExercises = workout.sections.reduce(
    (sum, section) => sum + section.exercises.length,
    0
  );

  // Helper function to get first 2 lines of description
  const getFirstTwoLines = (text?: string): string => {
    if (!text) return "";
    const lines = text.split("\n");
    return lines.slice(0, 2).join("\n");
  };

  // Helper function to format time (seconds to minutes)
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Calculate duration per exercise
  const getExerciseDuration = (sets: number, reps: number, restSeconds: number): string => {
    // Approximate: 3 seconds per rep
    const workTime = sets * reps * 3;
    const totalTime = workTime + restSeconds;
    const minutes = Math.ceil(totalTime / 60);
    return `${minutes} min`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <Link
            href="/workouts"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
          >
            ← Back to Workouts
          </Link>
          <Link
            href={`/workout-builder?id=${workout.id}`}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12">
        {/* Workout Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            {workout.workoutName}
          </h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            <span className="text-green-600 font-semibold">
              {workout.estimatedDuration || Math.ceil(totalExercises * 3)} min
            </span>
            <span>•</span>
            <span>{totalExercises} exercises</span>
          </div>

          {workout.workoutDescription && (
            <p className="text-lg text-gray-700 leading-relaxed">
              {workout.workoutDescription}
            </p>
          )}
        </div>

        {/* Exercises by Section */}
        <div className="space-y-8">
          {workout.sections.map((section, sectionIndex) => (
            <div key={section.id}>
              {/* Section Header */}
              {section.name && (
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">
                  {section.name}
                </h2>
              )}

              {/* Exercise Cards */}
              <div className="space-y-4">
                {section.exercises.map((exercise, exerciseIndex) => (
                  <div key={exercise.id}>
                    <div
                      className="bg-white rounded-lg p-4 sm:p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        {/* Exercise Image */}
                        <div className="flex-shrink-0 w-full sm:w-40 h-32 sm:h-40 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                          {exercise.imageUrl && exercise.imageUrl.trim() ? (
                            <img
                              src={exercise.imageUrl}
                              alt={exercise.exerciseName}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                              loading="lazy"
                            />
                          ) : null}
                          {!exercise.imageUrl || !exercise.imageUrl.trim() ? (
                            <div className="text-center">
                              <div className="text-5xl mb-2">💪</div>
                              <p className="text-gray-500 text-sm">{exercise.exerciseName}</p>
                            </div>
                          ) : null}
                        </div>

                        {/* Exercise Details */}
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 leading-tight">
                            {exercise.exerciseName}
                          </h3>

                          <div className="text-gray-400 mb-3 text-sm sm:text-base font-medium">
                            {getExerciseDuration(exercise.sets, exercise.reps, exercise.restSeconds)}
                          </div>

                          {/* Sets, Reps, Rest */}
                          <div className="text-sm sm:text-base">
                            <span className="font-black text-gray-900">
                              {exercise.sets}
                            </span>
                            <span className="text-gray-400 font-medium"> sets </span>
                            <span className="font-black text-gray-900">
                              {exercise.reps}
                            </span>
                            <span className="text-gray-400 font-medium"> reps </span>
                            <span className="font-black text-gray-900">
                              {formatTime(exercise.restSeconds)}
                            </span>
                            <span className="text-gray-400 font-medium"> rest</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rest between exercises */}
                    {exerciseIndex < section.exercises.length - 1 && (
                      <div className="text-lg font-black text-gray-900 mt-3 mb-3 px-2">
                        {formatTime(exercise.restSeconds)} <span className="text-gray-400 font-medium">rest</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Rest between sections */}
              {sectionIndex < workout.sections.length - 1 && section.exercises.length > 0 && (
                <div className="text-center py-4 text-gray-500 text-lg">
                  <span>1:30 rest</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/workouts"
              className="flex-1 px-4 py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center text-sm sm:text-base"
            >
              Back to Workouts
            </Link>
            <Link
              href={`/workout-builder?id=${workout.id}`}
              className="flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center text-sm sm:text-base"
            >
              Edit Workout
            </Link>
          </div>
        </div>
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}
