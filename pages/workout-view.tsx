"use client";

import { useState, useEffect } from "react";
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
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
          <Link
            href="/workouts"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
          >
            ← Back to Workouts
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

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              {workout.estimatedDuration || Math.ceil(totalExercises * 3)} min
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {totalExercises} exercises
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              {workout.difficulty || 'Beginner'}
            </span>
            {(() => {
              // Aggregate unique equipment
              const equipmentSet = new Set<string>();
              workout.sections.forEach(section => {
                section.exercises.forEach(ex => {
                  (ex.equipment || []).forEach(item => equipmentSet.add(item));
                });
              });

              const equipmentList = Array.from(equipmentSet);

              if (equipmentList.length === 0) {
                return (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                    No equipment
                  </span>
                );
              }

              return equipmentList.slice(0, 3).map(item => (
                <span key={item} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                  {item}
                </span>
              ));
            })()}
          </div>

          {workout.workoutDescription && (
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
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
                <div className="mb-4 pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                      {section.name}
                    </h2>
                    {section.sets && section.sets > 1 && (
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                        {section.sets} rounds
                      </span>
                    )}
                  </div>
                  {section.sets && section.sets > 1 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Complete all exercises below {section.sets} times
                    </p>
                  )}
                </div>
              )}

              {/* Exercise Cards */}
              <div className="space-y-4">
                {section.exercises.map((exercise, exerciseIndex) => (
                  <div key={exercise.id}>
                    <div
                      className="bg-white rounded-lg p-4 sm:p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      <div className="flex gap-4">
                        {/* Exercise Image */}
                        <div className="flex-shrink-0 w-24 sm:w-40 h-24 sm:h-40 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
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
                              <div className="text-3xl sm:text-5xl mb-1 sm:mb-2">💪</div>
                              <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">{exercise.exerciseName}</p>
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

        {/* Workout Summary */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Workout Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Target Muscles */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Target Muscles</h3>
              <div className="space-y-3">
                {(() => {
                  // Aggregate all muscles from all exercises
                  const muscleCounts: { [key: string]: number } = {};
                  workout.sections.forEach(section => {
                    section.exercises.forEach(ex => {
                      (ex.primaryMuscles || []).forEach(muscle => {
                        muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
                      });
                    });
                  });

                  // Sort by frequency
                  const sortedMuscles = Object.entries(muscleCounts).sort((a, b) => b[1] - a[1]);

                  return sortedMuscles.map(([muscle, count]) => (
                    <div key={muscle} className="flex items-center justify-between">
                      <span className="text-gray-900 font-medium">{muscle}</span>
                      <div className="flex items-center gap-2 flex-1 ml-4">
                        <span className="text-gray-500 text-sm">{count} exercises</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[200px]">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / totalExercises) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Equipment Needed */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Equipment Needed</h3>
              <div className="space-y-2">
                {(() => {
                  // Aggregate unique equipment
                  const equipmentSet = new Set<string>();
                  workout.sections.forEach(section => {
                    section.exercises.forEach(ex => {
                      (ex.equipment || []).forEach(item => equipmentSet.add(item));
                    });
                  });

                  const equipmentList = Array.from(equipmentSet);

                  if (equipmentList.length === 0) {
                    return <p className="text-gray-500">No equipment needed</p>;
                  }

                  return equipmentList.map(item => (
                    <div key={item} className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 text-blue-600" readOnly />
                      <span className="text-gray-900">{item}</span>
                    </div>
                  ));
                })()}
              </div>

              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Difficulty</h4>
                <span className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg font-semibold">
                  {workout.difficulty || 'Beginner'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t mb-24">
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

      {/* Fixed Start Workout Button - Always at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-10">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/workout-player?id=${workout.id}`}
            className="block w-full px-6 py-4 bg-indigo-600 text-white text-xl rounded-lg hover:bg-indigo-700 transition-colors font-bold text-center"
          >
            Let&apos;s do this! →
          </Link>
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
