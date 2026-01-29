"use client";

import { useState, useEffect } from "react";
import { Template, WorkoutExercise, Exercise } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";

interface SectionTemplateModalProps {
  sectionId: string;
  onApply: (exercises: WorkoutExercise[]) => void;
  onClose: () => void;
}

export default function SectionTemplateModal({
  onApply,
  onClose,
}: SectionTemplateModalProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"replace" | "append">("replace");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const token = await user.getIdToken();

        // Fetch both user templates and exercises
        const [templatesRes, exercisesRes] = await Promise.all([
          fetch("/api/templates", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/api/exercises"),
        ]);

        if (!templatesRes.ok) throw new Error("Failed to fetch templates");
        if (!exercisesRes.ok) throw new Error("Failed to fetch exercises");

        const templatesData = await templatesRes.json();
        const exercisesData = await exercisesRes.json();

        setTemplates(templatesData);
        setExercises(exercisesData);
        if (templatesData.length > 0) {
          setSelectedTemplate(templatesData[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleApply = () => {
    if (!selectedTemplate) return;

    const workoutExercises: WorkoutExercise[] = selectedTemplate.exercises.map(
      (ex, idx) => {
        // Find the actual exercise from the exercises API to get full details
        const fullExercise = exercises.find((e) => e.id === ex.exerciseId);

        return {
          id: uuidv4(),
          exerciseId: ex.exerciseId,
          exerciseSlug: ex.exerciseSlug || fullExercise?.slug,
          exerciseName: ex.exerciseName,
          sets: ex.sets,
          reps: ex.reps,
          restSeconds: ex.restSeconds,
          notes: ex.notes || "",
          order: idx,
          imageUrl: ex.imageUrl || `/exercise-images/${ex.exerciseSlug || fullExercise?.slug}/male.svg`,
          primaryMuscles: ex.primaryMuscles || fullExercise?.primary_muscles || [],
          equipment: ex.equipment || fullExercise?.equipment || [],
          description: ex.description || fullExercise?.description,
          animation_frames: ex.animation_frames || fullExercise?.animation_frames,
          animation_orientation: ex.animation_orientation || fullExercise?.animation_orientation,
        };
      }
    );

    onApply(workoutExercises);
  };

  const groupedTemplates = templates.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    },
    {} as Record<string, Template[]>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Select Template</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No templates found</p>
              <p className="text-sm text-gray-500">
                Create templates first in the Template Builder
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Category tabs and templates */}
              {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                <div key={category}>
                  <h3 className="font-semibold text-lg mb-3 capitalize">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {categoryTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTemplate?.id === template.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 bg-gray-50 hover:border-blue-300"
                        }`}
                      >
                        <p className="font-semibold text-gray-800">
                          {template.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {template.exercises.length} exercises • ~
                          {Math.ceil(
                            template.exercises.reduce(
                              (sum, ex) => sum + (ex.sets * ex.reps * 3 + ex.restSeconds),
                              0
                            ) / 60
                          )} min
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Selected template preview */}
              {selectedTemplate && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Preview</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {selectedTemplate.exercises.map((ex, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <p className="text-gray-800">{ex.exerciseName}</p>
                        <p className="text-sm text-gray-600">
                          {ex.sets}x{ex.reps}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Apply mode */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      How to apply?
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMode("replace")}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                          mode === "replace"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        Replace exercises
                      </button>
                      <button
                        onClick={() => setMode("append")}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                          mode === "append"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        Append exercises
                      </button>
                    </div>
                  </div>

                  {/* Apply button */}
                  <button
                    onClick={handleApply}
                    className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Apply Template
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
