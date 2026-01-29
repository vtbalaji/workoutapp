"use client";

import { useState } from "react";
import { WorkoutExercise } from "@/lib/types";
import { useDraggable } from "@dnd-kit/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTimes, faCheck, faTrash } from "@fortawesome/free-solid-svg-icons";

interface ExerciseItemCardProps {
  exercise: WorkoutExercise;
  onUpdate: (sets: number, reps: number, rest: number) => void;
  onDelete: () => void;
}

export default function ExerciseItemCard({
  exercise,
  onUpdate,
  onDelete,
}: ExerciseItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [sets, setSets] = useState(exercise.sets);
  const [reps, setReps] = useState(exercise.reps);
  const [rest, setRest] = useState(exercise.restSeconds);

  const { setNodeRef, isDragging, attributes, listeners } = useDraggable({
    id: `exercise-${exercise.id}`,
    data: {
      type: "exercise-in-workout",
      exercise,
    },
  });

  const handleSave = () => {
    onUpdate(sets, reps, rest);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`p-3 border rounded-lg transition-all ${
        isDragging
          ? "opacity-50 border-blue-500 bg-blue-50"
          : "border-gray-200 bg-gray-50 hover:border-gray-400"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-medium text-sm text-gray-800">
            {exercise.exerciseName}
          </p>
          {!isEditing && (
            <p className="text-xs text-gray-600 mt-1">
              {sets}x{reps} • Rest: {rest}s
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="Edit"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Delete"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mt-3 p-3 bg-white border border-gray-300 rounded space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium">Sets</label>
              <input
                type="number"
                min="1"
                max="10"
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Reps</label>
              <input
                type="number"
                min="1"
                max="50"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Rest (s)</label>
              <input
                type="number"
                min="0"
                max="300"
                step="15"
                value={rest}
                onChange={(e) => setRest(Number(e.target.value))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 flex items-center justify-center gap-1"
            >
              <FontAwesomeIcon icon={faCheck} />
              Save
            </button>
            <button
              onClick={() => {
                setSets(exercise.sets);
                setReps(exercise.reps);
                setRest(exercise.restSeconds);
                setIsEditing(false);
              }}
              className="flex-1 px-2 py-1 bg-gray-300 text-gray-800 text-xs font-medium rounded hover:bg-gray-400 flex items-center justify-center gap-1"
            >
              <FontAwesomeIcon icon={faTimes} />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
