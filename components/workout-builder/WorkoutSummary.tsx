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
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-0 max-h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Workout Summary</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Exercises</p>
          <p className="text-3xl font-bold text-blue-600">{totalExercises}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Total Sets</p>
          <p className="text-3xl font-bold text-blue-600">{totalSets}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Duration</p>
          <p className="text-3xl font-bold text-blue-600">
            {estimatedDuration} min
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Sections</p>
          <p className="text-3xl font-bold text-blue-600">
            {workout.sections.length}
          </p>
        </div>
      </div>

      {/* Target Muscles */}
      {targetMuscles.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Target Muscles</h3>
          <div className="space-y-2">
            {sortedMuscles.map(([muscle, count]) => (
              <div key={muscle}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{muscle}</span>
                  <span className="text-xs text-gray-500">{count} exercises</span>
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
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Equipment Needed</h3>
          <div className="space-y-2">
            {requiredEquipment.map((equipment) => (
              <label key={equipment} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                  defaultChecked={false}
                />
                <span className="text-sm text-gray-700">{equipment}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty Badge */}
      <div className="mb-6 pb-6 border-b">
        <h3 className="font-semibold text-gray-800 mb-2">Difficulty</h3>
        <div
          className={`inline-block px-4 py-2 rounded-lg font-medium text-white ${
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
        <h3 className="font-semibold text-gray-800 mb-3">Sections</h3>
        <div className="space-y-2">
          {workout.sections.map((section) => (
            <div key={section.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">{section.name}</span>
              <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded">
                {section.exercises.length}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
