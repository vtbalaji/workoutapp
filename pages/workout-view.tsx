"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Workout, WorkoutExercise } from "@/lib/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";
import ExerciseDetailModal from "@/components/ExerciseDetailModal";
import { useUserProfile } from "@/hooks/useUserProfile";


export default function WorkoutViewPage() {
  return (
    <ProtectedRoute>
      <WorkoutViewContent />
    </ProtectedRoute>
  );
}

function WorkoutViewContent() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const gender = profile.gender;
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-0.5 sm:py-2">
          <Link
            href="/workouts"
            className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-base"
          >
            ← Back to Workouts
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-0 sm:px-4 py-0 sm:py-2">
        {/* Workout Header */}
        <div className="mb-0.5 sm:mb-3 px-2 sm:px-0 pt-0 sm:pt-0">
          <h1 className="text-base sm:text-4xl font-bold text-gray-900 mb-0 sm:mb-2">
            {workout.workoutName}
          </h1>

          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-0.5 sm:mb-3">
            <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-sm font-semibold">
              {workout.estimatedDuration || Math.ceil(totalExercises * 3)} min
            </span>
            <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-sm font-semibold">
              {totalExercises} exercises
            </span>
            <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-sm font-semibold">
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
                  <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] sm:text-sm font-semibold">
                    No equipment
                  </span>
                );
              }

              return equipmentList.slice(0, 3).map(item => (
                <span key={item} className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-sm font-semibold">
                  {item}
                </span>
              ));
            })()}
          </div>

          {workout.workoutDescription && (
            <p className="text-xs sm:text-base text-gray-700 leading-tight sm:leading-normal mt-0.5 sm:mt-2">
              {workout.workoutDescription}
            </p>
          )}
        </div>

        {/* Exercises by Section */}
        <div className="space-y-0.5 sm:space-y-4">
          {workout.sections.map((section, sectionIndex) => (
            <div key={section.id}>
              {/* Section Header */}
              {section.name && (
                <div className="mb-0.5 sm:mb-2 pb-0 sm:pb-1 border-b px-2 sm:px-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-lg font-bold text-gray-900">
                      {section.name}
                    </h2>
                    {section.sets && section.sets > 1 && (
                      <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-xs font-semibold">
                        {section.sets} rounds
                      </span>
                    )}
                  </div>
                  {section.sets && section.sets > 1 && (
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-0.5">
                      Complete all exercises below {section.sets} times
                    </p>
                  )}
                </div>
              )}

              {/* Exercise Cards */}
              <div className="space-y-0 sm:space-y-2">
                {section.exercises.map((exercise, exerciseIndex) => (
                  <div key={exercise.id}>
                    <div
                      className="bg-white rounded-none sm:rounded-lg py-0 px-1 sm:py-0 sm:px-3 shadow-none sm:shadow-sm cursor-pointer sm:hover:shadow-md transition-shadow h-9 sm:h-32"
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      <div className="flex gap-0.5 sm:gap-2 items-center h-full">
                        {/* Exercise Image */}
                        <div className="flex-shrink-0 w-16 sm:w-32 h-8 sm:h-32 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                          {exercise.exerciseSlug ? (
                            <img
                              src={`/exercise-images/${exercise.exerciseSlug}/${gender}.svg`}
                              alt={exercise.exerciseName}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                              loading="lazy"
                            />
                          ) : exercise.imageUrl && exercise.imageUrl.trim() ? (
                            <img
                              src={exercise.imageUrl}
                              alt={exercise.exerciseName}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                              loading="lazy"
                            />
                          ) : (
                            <div className="text-center">
                              <div className="text-3xl sm:text-5xl mb-1 sm:mb-2">💪</div>
                              <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">{exercise.exerciseName}</p>
                            </div>
                          )}</div>

                        {/* Exercise Details */}
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <h3 className="text-xs sm:text-lg font-black text-gray-900 mb-0 sm:mb-1 leading-none line-clamp-1">
                            {exercise.exerciseName}
                          </h3>

                          {/* Sets, Reps, Rest */}
                          <div className="text-[10px] sm:text-sm mt-0">
                            {exercise.sets > 1 && (
                              <>
                                <span className="font-black text-gray-900">
                                  {exercise.sets}
                                </span>
                                <span className="text-gray-400 font-medium"> sets </span>
                              </>
                            )}
                            <span className="font-black text-gray-900">
                              {exercise.reps}
                            </span>
                            <span className="text-gray-400 font-medium"> reps </span>
                            <span className="font-black text-gray-900">
                              {formatTime(exercise.restSeconds)}
                            </span>
                            <span className="text-gray-400 font-medium"> sec rest</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rest between exercises */}
                    {exerciseIndex < section.exercises.length - 1 && (
                      <div className="text-[10px] sm:text-sm font-black text-gray-900 mt-0 sm:mt-1 mb-0 sm:mb-1 px-2">
                        {formatTime(exercise.restSeconds)} <span className="text-gray-400 font-medium">rest</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Rest between sections */}
              {sectionIndex < workout.sections.length - 1 && section.exercises.length > 0 && (
                <div className="text-center py-0.5 sm:py-2 text-gray-500 text-[10px] sm:text-sm">
                  <span>1:30 rest</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Workout Summary */}
        <div className="mt-2 sm:mt-6 pt-1 sm:pt-4 border-t px-2 sm:px-0">
          <h2 className="text-sm sm:text-xl font-bold text-gray-900 mb-1 sm:mb-3">Workout Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-3 mb-2 sm:mb-4">
            {/* Target Muscles */}
            <div className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow p-2 sm:p-6">
              <h3 className="text-xs sm:text-lg font-bold text-gray-900 mb-2 sm:mb-4">Target Muscles</h3>
              <div className="space-y-2 sm:space-y-3">
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
                      <span className="text-gray-900 font-medium text-sm sm:text-base">{muscle}</span>
                      <div className="flex items-center gap-2 flex-1 ml-4">
                        <span className="text-gray-500 text-xs sm:text-sm">{count} exercises</span>
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
            <div className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow p-2 sm:p-6">
              <h3 className="text-xs sm:text-lg font-bold text-gray-900 mb-2 sm:mb-4">Equipment Needed</h3>
              <div className="space-y-1 sm:space-y-2">
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
                    <div key={item} className="flex items-center gap-1 sm:gap-2">
                      <input type="checkbox" className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" readOnly />
                      <span className="text-gray-900 text-xs sm:text-base">{item}</span>
                    </div>
                  ));
                })()}
              </div>

              <div className="mt-2 sm:mt-6 pt-2 sm:pt-4 border-t">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2">Difficulty</h4>
                <span className="inline-block px-2 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg font-semibold text-xs sm:text-base">
                  {workout.difficulty || 'Beginner'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-1 sm:mt-4 pt-1 sm:pt-3 border-t mb-14 sm:mb-16 px-2 sm:px-0">
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <Link
              href="/workouts"
              className="flex-1 px-3 py-1.5 sm:py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center text-xs sm:text-base"
            >
              Back to Workouts
            </Link>
            <Link
              href={`/workout-builder?id=${workout.id}`}
              className="flex-1 px-3 py-1.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center text-xs sm:text-base"
            >
              Edit Workout
            </Link>
          </div>
        </div>
      </div>

      {/* Fixed Start Workout Button - Always at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-4 bg-white border-t shadow-lg z-10">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/workout-player?id=${workout.id}&autostart=true`}
            className="block w-full px-3 sm:px-6 py-2 sm:py-4 bg-blue-600 text-white text-sm sm:text-xl rounded-lg hover:bg-blue-700 transition-colors font-bold text-center"
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
