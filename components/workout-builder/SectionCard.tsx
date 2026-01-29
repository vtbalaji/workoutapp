"use client";

import { useState } from "react";
import { WorkoutSection } from "@/lib/types";
import { useDroppable } from "@dnd-kit/core";
import ExerciseItemCard from "./ExerciseItem";

interface SectionCardProps {
  section: WorkoutSection;
  onUpdateExercise: (
    sectionId: string,
    exerciseId: string,
    sets: number,
    reps: number,
    rest: number
  ) => void;
  onDeleteExercise: (sectionId: string, exerciseId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateSectionName: (sectionId: string, newName: string) => void;
  onApplyTemplate: (sectionId: string) => void;
}

export default function SectionCard({
  section,
  onUpdateExercise,
  onDeleteExercise,
  onDeleteSection,
  onUpdateSectionName,
  onApplyTemplate,
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(section.name);
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${section.id}`,
    data: {
      type: "section",
      sectionId: section.id,
    },
  });

  const handleSaveName = () => {
    if (newName.trim()) {
      onUpdateSectionName(section.id, newName);
      setIsEditingName(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`border-2 rounded-lg overflow-hidden transition-all ${
        isOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b flex justify-between items-center cursor-pointer hover:bg-gray-100">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800"
          >
            {isExpanded ? "▼" : "▶"}
          </button>

          {isEditingName ? (
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") {
                  setNewName(section.name);
                  setIsEditingName(false);
                }
              }}
              className="flex-1 px-2 py-1 border border-blue-500 rounded font-semibold"
            />
          ) : (
            <h3
              onClick={() => setIsEditingName(true)}
              className="font-semibold text-gray-800 hover:text-blue-600 flex-1"
            >
              {section.name}
            </h3>
          )}

          <span className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded">
            {section.exercises.length}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onApplyTemplate(section.id)}
            className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            Template
          </button>
          <button
            onClick={() => onDeleteSection(section.id)}
            className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Exercises */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {section.exercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded">
              Drag exercises here or select from the left panel
            </div>
          ) : (
            section.exercises.map((exercise) => (
              <ExerciseItemCard
                key={exercise.id}
                exercise={exercise}
                onUpdate={(sets, reps, rest) =>
                  onUpdateExercise(section.id, exercise.id, sets, reps, rest)
                }
                onDelete={() => onDeleteExercise(section.id, exercise.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
