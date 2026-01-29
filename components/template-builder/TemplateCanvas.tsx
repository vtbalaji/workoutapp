"use client";

import { useState } from "react";
import { Template, WorkoutExercise } from "@/lib/types";
import { useDroppable } from "@dnd-kit/core";
import ExerciseItemCard from "../workout-builder/ExerciseItem";

interface TemplateCanvasProps {
  template: Template;
  onTemplateChange: (template: Template) => void;
  hasUnsavedChanges: boolean;
  onUnsavedChangesChange: (changed: boolean) => void;
}

const CATEGORIES = ["warmup", "core", "cooldown", "cardio", "strength", "custom"] as const;

export default function TemplateCanvas({
  template,
  onTemplateChange,
  hasUnsavedChanges,
  onUnsavedChangesChange,
}: TemplateCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "template-drop-zone",
    data: {
      type: "template",
    },
  });

  const updateTemplate = (updatedTemplate: Template) => {
    onTemplateChange(updatedTemplate);
    onUnsavedChangesChange(true);
  };

  const handleUpdateExercise = (
    exerciseId: string,
    sets: number,
    reps: number,
    rest: number
  ) => {
    const updatedExercises = template.exercises.map((ex) =>
      ex.id === exerciseId
        ? { ...ex, sets, reps, restSeconds: rest }
        : ex
    );

    updateTemplate({ ...template, exercises: updatedExercises });
  };

  const handleDeleteExercise = (exerciseId: string) => {
    const updatedExercises = template.exercises.filter((ex) => ex.id !== exerciseId);
    updateTemplate({ ...template, exercises: updatedExercises });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-yellow-800">You have unsaved changes</span>
        </div>
      )}

      {/* Template Header */}
      <div className="mb-6 pb-6 border-b space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Template Name</label>
          <input
            type="text"
            value={template.name}
            onChange={(e) =>
              updateTemplate({ ...template, name: e.target.value })
            }
            placeholder="Enter template name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={template.description}
            onChange={(e) =>
              updateTemplate({
                ...template,
                description: e.target.value,
              })
            }
            placeholder="Optional description..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => updateTemplate({ ...template, category: cat })}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  template.category === cat
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="flex-1 overflow-y-auto" ref={setNodeRef}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Exercises ({template.exercises.length})
        </h3>

        {template.exercises.length === 0 ? (
          <div className={`text-center py-12 text-gray-500 border-2 border-dashed rounded transition-colors ${
            isOver ? "border-green-500 bg-green-50" : "border-gray-300"
          }`}>
            <p className="mb-2">No exercises yet</p>
            <p className="text-sm">Drag exercises here or select from the left panel</p>
          </div>
        ) : (
          <div className="space-y-3">
            {template.exercises.map((exercise) => (
              <ExerciseItemCard
                key={exercise.id}
                exercise={exercise}
                onUpdate={(sets, reps, rest) =>
                  handleUpdateExercise(exercise.id, sets, reps, rest)
                }
                onDelete={() => handleDeleteExercise(exercise.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {template.exercises.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {template.exercises.length}
              </div>
              <div className="text-xs text-gray-600">Exercises</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {template.exercises.reduce((sum, ex) => sum + ex.sets, 0)}
              </div>
              <div className="text-xs text-gray-600">Total Sets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.ceil(
                  template.exercises.reduce(
                    (sum, ex) => sum + (ex.sets * ex.reps * 3 + ex.restSeconds),
                    0
                  ) / 60
                )}m
              </div>
              <div className="text-xs text-gray-600">Est. Duration</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
