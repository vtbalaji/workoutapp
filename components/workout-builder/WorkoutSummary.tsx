"use client";

import { Workout } from "@/lib/types";
import {
  calculateEstimatedDuration,
  getTargetMuscles,
  getRequiredEquipment,
  getTotalExercises,
  getTotalSets,
  getMuscleCoverage,
} from "@/lib/workoutUtils";

interface WorkoutSummaryProps {
  workout: Workout;
}

export default function WorkoutSummary({ workout }: WorkoutSummaryProps) {
  const estimatedDuration = calculateEstimatedDuration(workout);
  const targetMuscles = getTargetMuscles(workout);
  const requiredEquipment = getRequiredEquipment(workout);
  const totalExercises = getTotalExercises(workout);
  const totalSets = getTotalSets(workout);
  const muscleCoverage = getMuscleCoverage(workout);

  // Sort muscles by frequency
  const sortedMuscles = Object.entries(muscleCoverage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 sticky top-0 max-h-screen overflow-y-auto overflow-x-hidden">
      <h2 className="text-base sm:text-xl font-bold mb-3 sm:mb-6 text-gray-800 break-words">Workout Summary</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-6">
        <div className="bg-blue-50 p-2 sm:p-4 rounded-lg">
          <p className="text-gray-600 text-xs sm:text-sm truncate">Exercises</p>
          <p className="text-xl sm:text-3xl font-bold text-blue-600">{totalExercises}</p>
        </div>

        <div className="bg-blue-50 p-2 sm:p-4 rounded-lg">
          <p className="text-gray-600 text-xs sm:text-sm truncate">Total Sets</p>
          <p className="text-xl sm:text-3xl font-bold text-blue-600">{totalSets}</p>
        </div>

        <div className="bg-blue-50 p-2 sm:p-4 rounded-lg">
          <p className="text-gray-600 text-xs sm:text-sm truncate">Duration</p>
          <p className="text-xl sm:text-3xl font-bold text-blue-600 truncate">
            {estimatedDuration} min
          </p>
        </div>

        <div className="bg-blue-50 p-2 sm:p-4 rounded-lg">
          <p className="text-gray-600 text-xs sm:text-sm truncate">Sections</p>
          <p className="text-xl sm:text-3xl font-bold text-blue-600">
            {workout.sections.length}
          </p>
        </div>
      </div>

      {/* Target Muscles */}
      {targetMuscles.length > 0 && (
        <div className="mb-3 sm:mb-6">
          <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Target Muscles</h3>
          <div className="space-y-2">
            {sortedMuscles.map(([muscle, count]) => (
              <div key={muscle}>
                <div className="flex justify-between items-center mb-1 gap-2">
                  <span className="text-xs sm:text-sm text-gray-700 truncate">{muscle}</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">{count} ex</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(count / Math.max(...Object.values(muscleCoverage))) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipment */}
      {requiredEquipment.length > 0 && (
        <div className="mb-3 sm:mb-6">
          <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Equipment Needed</h3>
          <div className="space-y-1 sm:space-y-2">
            {requiredEquipment.map((equipment) => (
              <label key={equipment} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 flex-shrink-0"
                  defaultChecked={false}
                />
                <span className="text-xs sm:text-sm text-gray-700 break-words">{equipment}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty Badge */}
      <div className="mb-3 sm:mb-6 pb-3 sm:pb-6 border-b">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Difficulty</h3>
        <div
          className={`inline-block px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-medium text-white text-xs sm:text-base ${
            workout.difficulty === "Beginner"
              ? "bg-blue-500"
              : workout.difficulty === "Intermediate"
              ? "bg-blue-600"
              : "bg-blue-700"
          }`}
        >
          {workout.difficulty}
        </div>
      </div>

      {/* Sections Overview */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Sections</h3>
        <div className="space-y-1 sm:space-y-2">
          {workout.sections.map((section) => (
            <div key={section.id} className="flex justify-between items-center p-2 bg-gray-50 rounded gap-2">
              <span className="text-xs sm:text-sm text-gray-700 truncate">{section.name}</span>
              <span className="text-[10px] sm:text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                {section.exercises.length}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
