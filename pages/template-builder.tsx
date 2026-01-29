"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Template, Exercise } from "@/lib/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { v4 as uuidv4 } from "uuid";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import ExerciseFinder from "@/components/workout-builder/ExerciseFinder";
import TemplateCanvas from "@/components/template-builder/TemplateCanvas";
import ExercisePreview from "@/components/workout-builder/ExercisePreview";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSave } from "@fortawesome/free-solid-svg-icons";

export default function TemplateBuilderPage() {
  return (
    <ProtectedRoute>
      <TemplateBuilderContent />
    </ProtectedRoute>
  );
}

function TemplateBuilderContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Initialize template - load existing or create new
  useEffect(() => {
    const initializeTemplate = async () => {
      if (!user) return;

      try {
        // Check if there's an ID in the URL to load an existing template
        const queryParams = new URLSearchParams(window.location.search);
        const templateId = queryParams.get("id");

        if (templateId) {
          // Load existing template
          const token = await user.getIdToken();
          const response = await fetch(`/api/templates/${templateId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to load template");
          }

          const loadedTemplate = await response.json();
          setTemplate(loadedTemplate);
        } else {
          // Create new template
          const newTemplate: Template = {
            id: "",
            userId: user.uid,
            name: "New Template",
            description: "",
            category: "warmup",
            exercises: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setTemplate(newTemplate);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize template");
        // Still set a blank template so the page doesn't crash
        const newTemplate: Template = {
          id: "",
          userId: user.uid,
          name: "New Template",
          description: "",
          category: "warmup",
          exercises: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setTemplate(newTemplate);
      } finally {
        setLoading(false);
      }
    };

    initializeTemplate();
  }, [user]);

  // Handle before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleAddExercise = (
    exercise: Exercise,
    sets: number,
    reps: number,
    rest: number
  ) => {
    if (!template) return;

    const imageUrl = `/exercise-images/${exercise.slug}/male.svg`;

    const newExercise = {
      id: uuidv4(),
      exerciseId: exercise.id,
      exerciseSlug: exercise.slug,
      exerciseName: exercise.title,
      sets,
      reps,
      restSeconds: rest,
      notes: "",
      order: template.exercises.length,
      imageUrl: imageUrl,
      primaryMuscles: exercise.primary_muscles || [],
      equipment: exercise.equipment || [],
      description: exercise.description,
    };

    setTemplate({
      ...template,
      exercises: [...template.exercises, newExercise],
    });
    setHasUnsavedChanges(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;

    // Handle dragging from exercise finder to template
    if (active.data?.current?.type === "exercise") {
      const exercise = active.data.current.exercise as Exercise;
      handleAddExercise(exercise, 3, 10, 60);
    }
  };

  const handleSaveTemplate = async () => {
    if (!template || !user) return;

    // Validate
    if (!template.name.trim()) {
      setError("Template name is required");
      return;
    }

    if (template.exercises.length === 0) {
      setError("Add at least one exercise to the template");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = await user.getIdToken();

      if (template.id) {
        // Update existing
        const response = await fetch(`/api/templates/${template.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(template),
        });

        if (!response.ok) throw new Error("Failed to update template");
      } else {
        // Create new
        const response = await fetch("/api/templates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(template),
        });

        if (!response.ok) throw new Error("Failed to create template");
        const savedTemplate = await response.json();
        setTemplate(savedTemplate);
      }

      setHasUnsavedChanges(false);
      setToast({ message: "Template saved successfully!", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed to save template", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50">
        <p className="text-center py-12 text-gray-600">Failed to load template</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Discard Changes Confirmation */}
      {showDiscardConfirm && (
        <ConfirmModal
          title="Discard Changes?"
          message="You have unsaved changes. Are you sure you want to leave without saving?"
          confirmText="Discard"
          cancelText="Stay"
          confirmColor="red"
          onConfirm={() => {
            setShowDiscardConfirm(false);
            router.push("/templates");
          }}
          onCancel={() => setShowDiscardConfirm(false)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Template Builder</h1>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (hasUnsavedChanges) {
                  setShowDiscardConfirm(true);
                } else {
                  router.push("/templates");
                }
              }}
              className="px-4 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faTimes} />
              Cancel
            </button>
            <button
              onClick={handleSaveTemplate}
              disabled={saving}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faSave} />
              {saving ? "Saving..." : "Save Template"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel: Exercise Finder */}
            <div className="lg:col-span-1">
              <ExerciseFinder onExerciseSelect={setSelectedExercise} />
            </div>

            {/* Center Panel: Template Builder */}
            <div className="lg:col-span-2">
              <TemplateCanvas
                template={template}
                onTemplateChange={setTemplate}
                hasUnsavedChanges={hasUnsavedChanges}
                onUnsavedChangesChange={setHasUnsavedChanges}
              />
            </div>

            {/* Right Panel: Exercise Preview */}
            <div className="lg:col-span-1">
              {selectedExercise && (
                <ExercisePreview
                  selectedExercise={selectedExercise}
                  workout={null}
                  onAddExerciseToSection={(sectionId, exercise, sets, reps, rest) => {
                    handleAddExercise(exercise, sets, reps, rest);
                  }}
                  onShowToast={(message, type) => setToast({ message, type: type || "success" })}
                />
              )}
            </div>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
