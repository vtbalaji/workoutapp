"use client";

import { useState } from "react";
import { WorkoutExercise } from "@/lib/types";
import { useDraggable } from "@dnd-kit/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTimes, faCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useUserProfile } from "@/hooks/useUserProfile";

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
  const { profile } = useUserProfile();
  const gender = profile.gender;
  const [isEditing, setIsEditing] = useState(false);
  const [sets, setSets] = useState(exercise.sets);
  const [reps, setReps] = useState(exercise.reps);
  const [rest, setRest] = useState(exercise.restSeconds);

  const { setNodeRef, isDragging } = useDraggable({
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
      className={`px-2 py-1.5 border rounded transition-all ${
        isDragging
          ? "opacity-50 border-blue-500 bg-blue-50"
          : "border-gray-200 bg-gray-50 hover:border-gray-400"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Exercise Image */}
        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
          {exercise.exerciseSlug ? (
            <img
              src={`/exercise-images/${exercise.exerciseSlug}/${gender}.svg`}
              alt={exercise.exerciseName}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : exercise.imageUrl && exercise.imageUrl.trim() ? (
            <img
              src={exercise.imageUrl}
              alt={exercise.exerciseName}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="text-sm">💪</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-xs text-gray-800 leading-tight truncate">
            {exercise.exerciseName}
          </p>
          {!isEditing && (
            <p className="text-[10px] text-gray-600">
              {sets}x{reps} • {rest}s rest
            </p>
          )}
        </div>
        <div className="flex gap-1.5">
          {!isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="text-blue-600 hover:text-blue-800 transition-colors text-xs"
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
            className="text-red-600 hover:text-red-800 transition-colors text-xs"
            title="Delete"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mt-2 p-2 bg-white border border-gray-300 rounded space-y-1.5">
          <div className="grid grid-cols-3 gap-1.5">
            <div>
              <label className="text-[10px] font-medium">Sets</label>
              <input
                type="number"
                min="1"
                max="10"
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
                className="w-full px-1.5 py-0.5 border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium">Reps</label>
              <input
                type="number"
                min="1"
                max="50"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full px-1.5 py-0.5 border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium">Rest(s)</label>
              <input
                type="number"
                min="0"
                max="300"
                step="15"
                value={rest}
                onChange={(e) => setRest(Number(e.target.value))}
                className="w-full px-1.5 py-0.5 border border-gray-300 rounded text-xs"
              />
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleSave}
              className="flex-1 px-1.5 py-0.5 bg-green-600 text-white text-[10px] font-medium rounded hover:bg-green-700 flex items-center justify-center gap-0.5"
            >
              <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
              Save
            </button>
            <button
              onClick={() => {
                setSets(exercise.sets);
                setReps(exercise.reps);
                setRest(exercise.restSeconds);
                setIsEditing(false);
              }}
              className="flex-1 px-1.5 py-0.5 bg-gray-300 text-gray-800 text-[10px] font-medium rounded hover:bg-gray-400 flex items-center justify-center gap-0.5"
            >
              <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
