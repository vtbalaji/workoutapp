"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Workout, Exercise } from "@/lib/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { v4 as uuidv4 } from "uuid";
import ExerciseFinder from "@/components/workout-builder/ExerciseFinder";
import WorkoutCanvas from "@/components/workout-builder/WorkoutCanvas";
import ExercisePreview from "@/components/workout-builder/ExercisePreview";
import WorkoutSummary from "@/components/workout-builder/WorkoutSummary";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSave } from "@fortawesome/free-solid-svg-icons";

export default function WorkoutBuilderPage() {
  return (
    <ProtectedRoute>
      <WorkoutBuilderContent />
    </ProtectedRoute>
  );
}

function WorkoutBuilderContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Initialize workout - load existing or create new
  useEffect(() => {
    const initializeWorkout = async () => {
      if (!user) return;

      try {
        // Check if there's an ID in the URL to load an existing workout
        const queryParams = new URLSearchParams(window.location.search);
        const workoutId = queryParams.get("id");

        if (workoutId) {
          // Load existing workout
          const token = await user.getIdToken();
          const response = await fetch(`/api/workouts/${workoutId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to load workout");
          }

          const loadedWorkout = await response.json();
          setWorkout(loadedWorkout);
        } else {
          // Create new workout
          const newWorkout: Workout = {
            id: "",
            userId: user.uid,
            workoutName: "New Workout",
            workoutDescription: "",
            difficulty: "Beginner",
            sections: [],
            targetMuscles: [],
            requiredEquipment: [],
            estimatedDuration: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setWorkout(newWorkout);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize workout");
        // Still set a blank workout so the page doesn't crash
        const newWorkout: Workout = {
          id: "",
          userId: user.uid,
          workoutName: "New Workout",
          workoutDescription: "",
          difficulty: "Beginner",
          sections: [],
          targetMuscles: [],
          requiredEquipment: [],
          estimatedDuration: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setWorkout(newWorkout);
      } finally {
        setLoading(false);
      }
    };

    initializeWorkout();
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

  const handleAddExerciseToSection = (
    sectionId: string,
    exercise: Exercise,
    sets: number,
    reps: number,
    rest: number
  ) => {
    if (!workout) return;


    const imageUrl = `/exercise-images/${exercise.slug}/male.svg`;

    const updatedSections = workout.sections.map((section) => {
      if (section.id === sectionId) {
        const newExercise = {
          id: uuidv4(),
          exerciseId: exercise.id,
          exerciseSlug: exercise.slug,
          exerciseName: exercise.title,
          sets,
          reps,
          restSeconds: rest,
          notes: "",
          order: section.exercises.length,
          imageUrl: imageUrl,
          primaryMuscles: exercise.primary_muscles || [],
          equipment: exercise.equipment || [],
          description: exercise.description,
        };
        return {
          ...section,
          exercises: [
            ...section.exercises,
            newExercise,
          ],
        };
      }
      return section;
    });

    setWorkout({ ...workout, sections: updatedSections });
    setHasUnsavedChanges(true);
  };

  const handleSaveWorkout = async () => {
    if (!workout || !user) return;

    // Validate
    if (!workout.workoutName.trim()) {
      setError("Workout name is required");
      return;
    }

    const totalExercises = workout.sections.reduce(
      (sum, section) => sum + section.exercises.length,
      0
    );
    if (totalExercises === 0) {
      setError("Add at least one exercise to the workout");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = await user.getIdToken();


      if (workout.id) {
        // Update existing
        const response = await fetch(`/api/workouts/${workout.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(workout),
        });

        if (!response.ok) throw new Error("Failed to update workout");
      } else {
        // Create new
        const response = await fetch("/api/workouts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(workout),
        });

        if (!response.ok) throw new Error("Failed to create workout");
        const savedWorkout = await response.json();
        setWorkout(savedWorkout);
      }

      setHasUnsavedChanges(false);
      setToast({ message: "Workout saved successfully!", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed to save workout", type: "error" });
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

  if (!workout) {
    return (
      <div className="min-h-screen bg-gray-50">
        <p className="text-center py-12 text-gray-600">Failed to load workout</p>
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
            router.push("/");
          }}
          onCancel={() => setShowDiscardConfirm(false)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Workout Builder</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (hasUnsavedChanges) {
                  setShowDiscardConfirm(true);
                } else {
                  router.push("/");
                }
              }}
              className="px-3 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm"
              title="Cancel"
            >
              <FontAwesomeIcon icon={faTimes} />
              Cancel
            </button>
            <button
              onClick={handleSaveWorkout}
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
              title="Save Workout"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  Save Workout
                </>
              )}
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel: Exercise Finder */}
          <div className="lg:col-span-1">
            <ExerciseFinder onExerciseSelect={setSelectedExercise} />
          </div>

          {/* Center Panel: Workout Builder */}
          <div className="lg:col-span-2">
            <WorkoutCanvas
              workout={workout}
              onWorkoutChange={setWorkout}
              hasUnsavedChanges={hasUnsavedChanges}
              onUnsavedChangesChange={setHasUnsavedChanges}
            />
          </div>

          {/* Right Panel: Exercise Preview or Summary */}
          <div className="lg:col-span-1">
            {selectedExercise ? (
              <ExercisePreview
                selectedExercise={selectedExercise}
                workout={workout}
                onAddExerciseToSection={handleAddExerciseToSection}
                onShowToast={(message, type) => setToast({ message, type: type || "success" })}
              />
            ) : (
              <WorkoutSummary workout={workout} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
