"use client";

import { Template } from "@/lib/types";
import { useDroppable } from "@dnd-kit/core";
import ExerciseItemCard from "../workout-builder/ExerciseItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell } from "@fortawesome/free-solid-svg-icons";

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
    <div className="bg-white rounded-lg shadow-md p-3 flex flex-col h-full">
      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="mb-2 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-yellow-800">Unsaved changes</span>
        </div>
      )}

      {/* Template Header */}
      <div className="mb-3 pb-3 border-b space-y-2">
        <div>
          <label className="block text-xs font-medium mb-0.5">Template Name</label>
          <input
            type="text"
            value={template.name}
            onChange={(e) =>
              updateTemplate({ ...template, name: e.target.value })
            }
            placeholder="Enter template name..."
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-0.5">Description</label>
          <textarea
            value={template.description}
            onChange={(e) =>
              updateTemplate({
                ...template,
                description: e.target.value,
              })
            }
            placeholder="Optional description..."
            rows={2}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-0.5">Category</label>
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => updateTemplate({ ...template, category: cat })}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all capitalize ${
                  template.category === cat
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
          <FontAwesomeIcon icon={faDumbbell} className="text-blue-600 text-xs" />
          Exercises ({template.exercises.length})
        </h3>

        {template.exercises.length === 0 ? (
          <div className={`text-center py-6 text-gray-500 text-sm border-2 border-dashed rounded transition-colors ${
            isOver ? "border-green-500 bg-green-50" : "border-gray-300"
          }`}>
            <p className="mb-1">No exercises yet</p>
            <p className="text-xs">Drag or select from left panel</p>
          </div>
        ) : (
          <div className="space-y-1.5">
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
        <div className="mt-3 pt-2 border-t">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                {template.exercises.length}
              </div>
              <div className="text-[10px] text-gray-600">Exercises</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {template.exercises.reduce((sum, ex) => sum + ex.sets, 0)}
              </div>
              <div className="text-[10px] text-gray-600">Total Sets</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {Math.ceil(
                  template.exercises.reduce(
                    (sum, ex) => sum + (ex.sets * ex.reps * 3 + ex.restSeconds),
                    0
                  ) / 60
                )}m
              </div>
              <div className="text-[10px] text-gray-600">Est. Duration</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
