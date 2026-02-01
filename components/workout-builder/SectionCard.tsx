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
  onUpdateSectionSets: (sectionId: string, sets: number) => void;
  onApplyTemplate: (sectionId: string) => void;
}

export default function SectionCard({
  section,
  onUpdateExercise,
  onDeleteExercise,
  onDeleteSection,
  onUpdateSectionName,
  onUpdateSectionSets,
  onApplyTemplate,
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(section.name);
  const [sectionSets, setSectionSets] = useState(section.sets || 1);
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
      className={`border rounded overflow-hidden transition-all ${
        isOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-2 py-1.5 border-b flex justify-between items-center cursor-pointer hover:bg-gray-100">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800 text-xs"
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
              className="flex-1 px-1.5 py-0.5 border border-blue-500 rounded text-xs font-semibold"
            />
          ) : (
            <h3
              onClick={() => setIsEditingName(true)}
              className="font-semibold text-xs text-gray-800 hover:text-blue-600 truncate"
            >
              {section.name}
            </h3>
          )}

          <span className="text-[10px] text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded">
            {section.exercises.length}
          </span>

          {/* Section Sets Input */}
          <div className="flex items-center gap-1">
            <label className="text-[10px] font-medium text-gray-700">Rnd:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={sectionSets}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setSectionSets(value);
                onUpdateSectionSets(section.id, value);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-10 px-1 py-0.5 border border-gray-300 rounded text-center text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onApplyTemplate(section.id)}
            className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            Template
          </button>
          <button
            onClick={() => onDeleteSection(section.id)}
            className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Exercises */}
      {isExpanded && (
        <div className="p-2 space-y-1.5">
          {section.exercises.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-xs border border-dashed border-gray-300 rounded">
              Drag exercises here or select from left
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
