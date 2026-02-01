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
    <div className="bg-white rounded-lg shadow-md p-3 sticky top-0 max-h-screen overflow-y-auto overflow-x-hidden">
      <h2 className="text-sm font-bold mb-2 text-gray-800">Workout Summary</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        <div className="bg-blue-50 p-1.5 rounded">
          <p className="text-gray-600 text-[10px]">Exercises</p>
          <p className="text-lg font-bold text-blue-600">{totalExercises}</p>
        </div>

        <div className="bg-blue-50 p-1.5 rounded">
          <p className="text-gray-600 text-[10px]">Total Sets</p>
          <p className="text-lg font-bold text-blue-600">{totalSets}</p>
        </div>

        <div className="bg-blue-50 p-1.5 rounded">
          <p className="text-gray-600 text-[10px]">Duration</p>
          <p className="text-lg font-bold text-blue-600">{estimatedDuration}m</p>
        </div>

        <div className="bg-blue-50 p-1.5 rounded">
          <p className="text-gray-600 text-[10px]">Sections</p>
          <p className="text-lg font-bold text-blue-600">{workout.sections.length}</p>
        </div>
      </div>

      {/* Target Muscles */}
      {targetMuscles.length > 0 && (
        <div className="mb-2">
          <h3 className="font-semibold text-gray-800 mb-1 text-xs">Target Muscles</h3>
          <div className="space-y-1">
            {sortedMuscles.map(([muscle, count]) => (
              <div key={muscle}>
                <div className="flex justify-between items-center mb-0.5 gap-1">
                  <span className="text-[10px] text-gray-700 truncate">{muscle}</span>
                  <span className="text-[10px] text-gray-500">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
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
        <div className="mb-2">
          <h3 className="font-semibold text-gray-800 mb-1 text-xs">Equipment</h3>
          <div className="space-y-0.5">
            {requiredEquipment.map((equipment) => (
              <label key={equipment} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  className="w-3 h-3 rounded border-gray-300 flex-shrink-0"
                  defaultChecked={false}
                />
                <span className="text-[10px] text-gray-700">{equipment}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty Badge */}
      <div className="mb-2 pb-2 border-b">
        <h3 className="font-semibold text-gray-800 mb-1 text-xs">Difficulty</h3>
        <div
          className={`inline-block px-2 py-0.5 rounded font-medium text-white text-[10px] ${
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
        <h3 className="font-semibold text-gray-800 mb-1 text-xs">Sections</h3>
        <div className="space-y-1">
          {workout.sections.map((section) => (
            <div key={section.id} className="flex justify-between items-center px-1.5 py-1 bg-gray-50 rounded gap-1">
              <span className="text-[10px] text-gray-700 truncate">{section.name}</span>
              <span className="text-[10px] font-medium bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                {section.exercises.length}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
