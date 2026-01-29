"use client";

import { useState, useCallback } from "react";
import { Exercise, Workout, WorkoutSection, WorkoutExercise } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import SectionCard from "./SectionCard";
import SectionTemplateModal from "./SectionTemplateModal";

interface WorkoutCanvasProps {
  workout: Workout;
  onWorkoutChange: (workout: Workout) => void;
  hasUnsavedChanges: boolean;
  onUnsavedChangesChange: (changed: boolean) => void;
}

const SECTION_TYPES = ["Warmup", "Main", "Core", "Cooldown", "Custom"];

export default function WorkoutCanvas({
  workout,
  onWorkoutChange,
  hasUnsavedChanges,
  onUnsavedChangesChange,
}: WorkoutCanvasProps) {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateSectionId, setTemplateSectionId] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [customSectionName, setCustomSectionName] = useState("");

  const updateWorkout = useCallback((updatedWorkout: Workout) => {
    onWorkoutChange(updatedWorkout);
    onUnsavedChangesChange(true);
  }, [onWorkoutChange, onUnsavedChangesChange]);

  const handleAddExerciseFromFinder = useCallback(
    (sectionId: string, exercise: Exercise, sets: number, reps: number, rest: number) => {
      const newExercise: WorkoutExercise = {
        id: uuidv4(),
        exerciseId: exercise.id,
        exerciseSlug: exercise.slug,
        exerciseName: exercise.title,
        sets,
        reps,
        restSeconds: rest,
        notes: "",
        order: 0,
        imageUrl: `/exercise-images/${exercise.slug}/male.svg`,
        primaryMuscles: exercise.primary_muscles || [],
        equipment: exercise.equipment || [],
        description: exercise.description,
        animation_frames: exercise.animation_frames,
        animation_orientation: exercise.animation_orientation,
      };

      const updatedSections = workout.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            exercises: [
              ...section.exercises,
              { ...newExercise, order: section.exercises.length },
            ],
          };
        }
        return section;
      });

      updateWorkout({ ...workout, sections: updatedSections });
    },
    [workout, updateWorkout]
  );

  const handleUpdateExercise = (
    sectionId: string,
    exerciseId: string,
    sets: number,
    reps: number,
    rest: number
  ) => {
    const updatedSections = workout.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          exercises: section.exercises.map((ex) =>
            ex.id === exerciseId
              ? { ...ex, sets, reps, restSeconds: rest }
              : ex
          ),
        };
      }
      return section;
    });

    updateWorkout({ ...workout, sections: updatedSections });
  };

  const handleDeleteExercise = (sectionId: string, exerciseId: string) => {
    const updatedSections = workout.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          exercises: section.exercises.filter((ex) => ex.id !== exerciseId),
        };
      }
      return section;
    });

    updateWorkout({ ...workout, sections: updatedSections });
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = workout.sections.filter(
      (section) => section.id !== sectionId
    );
    updateWorkout({ ...workout, sections: updatedSections });
  };

  const handleUpdateSectionName = (sectionId: string, newName: string) => {
    const updatedSections = workout.sections.map((section) =>
      section.id === sectionId ? { ...section, name: newName } : section
    );
    updateWorkout({ ...workout, sections: updatedSections });
  };

  const handleAddSection = (name: string) => {
    const newSection: WorkoutSection = {
      id: uuidv4(),
      name,
      exercises: [],
      order: workout.sections.length,
    };

    updateWorkout({ ...workout, sections: [...workout.sections, newSection] });
    setShowAddSection(false);
    setCustomSectionName("");
  };

  const handleApplyTemplate = (sectionId: string) => {
    setTemplateSectionId(sectionId);
    setShowTemplateModal(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Handle dragging from exercise finder to section
    if (
      active.data?.current?.type === "exercise" &&
      over.data?.current?.type === "section"
    ) {
      const exercise = active.data.current.exercise as Exercise;
      const sectionId = over.data.current.sectionId as string;

      handleAddExerciseFromFinder(sectionId, exercise, 3, 10, 60);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
        {/* Unsaved changes indicator */}
        {hasUnsavedChanges && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-yellow-800">You have unsaved changes</span>
          </div>
        )}

        {/* Workout Header */}
        <div className="mb-6 pb-6 border-b">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Workout Name</label>
            <input
              type="text"
              value={workout.workoutName}
              onChange={(e) =>
                updateWorkout({ ...workout, workoutName: e.target.value })
              }
              placeholder="Enter workout name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={workout.workoutDescription}
              onChange={(e) =>
                updateWorkout({
                  ...workout,
                  workoutDescription: e.target.value,
                })
              }
              placeholder="Optional description..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <div className="flex gap-2">
              {(["Beginner", "Intermediate", "Advanced"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => updateWorkout({ ...workout, difficulty: diff })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    workout.difficulty === diff
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Add Section Button - Moved here */}
          <div>
            {showAddSection ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Section Name
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {SECTION_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleAddSection(type)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <input
                      autoFocus
                      type="text"
                      value={customSectionName}
                      onChange={(e) => setCustomSectionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customSectionName.trim()) {
                          handleAddSection(customSectionName);
                        }
                      }}
                      placeholder="Or enter custom name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (customSectionName.trim()) {
                        handleAddSection(customSectionName);
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={!customSectionName.trim()}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddSection(false);
                      setCustomSectionName("");
                    }}
                    className="flex-1 px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddSection(true)}
                className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
              >
                + Add Section
              </button>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto mb-4">
          {workout.sections.length === 0 && !showAddSection ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">Start by adding a section</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workout.sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  onUpdateExercise={handleUpdateExercise}
                  onDeleteExercise={handleDeleteExercise}
                  onDeleteSection={handleDeleteSection}
                  onUpdateSectionName={handleUpdateSectionName}
                  onApplyTemplate={handleApplyTemplate}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Template Modal */}
      {showTemplateModal && templateSectionId && (
        <SectionTemplateModal
          sectionId={templateSectionId}
          onApply={(exercises) => {
            const updatedSections = workout.sections.map((section) => {
              if (section.id === templateSectionId) {
                return {
                  ...section,
                  exercises: exercises.map((ex, idx) => ({
                    ...ex,
                    order: idx,
                  })),
                };
              }
              return section;
            });

            updateWorkout({ ...workout, sections: updatedSections });
            setShowTemplateModal(false);
            setTemplateSectionId(null);
          }}
          onClose={() => {
            setShowTemplateModal(false);
            setTemplateSectionId(null);
          }}
        />
      )}
    </DndContext>
  );
}
