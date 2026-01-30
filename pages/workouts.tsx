"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Workout } from "@/lib/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import { SkeletonWorkoutCard } from "@/components/Skeleton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

export default function WorkoutsPage() {
  return (
    <ProtectedRoute>
      <WorkoutsContent />
    </ProtectedRoute>
  );
}

function WorkoutsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/workouts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch workouts");
        const data = await response.json();
        setWorkouts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workouts");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [user]);

  const handleDelete = (workoutId: string) => {
    setShowDeleteConfirm(workoutId);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/workouts/${showDeleteConfirm}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete workout");
      setWorkouts(workouts.filter((w) => w.id !== showDeleteConfirm));
      setToast({ message: "Workout deleted successfully", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed to delete workout", type: "error" });
    } finally {
      setShowDeleteConfirm(null);
    }
  };

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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Workout?"
          message="Are you sure you want to delete this workout? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="red"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-1">My Workouts</h1>
          <p className="text-blue-100 text-sm">
            Manage your custom workout plans
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 pb-32">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonWorkoutCard key={i} />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No workouts yet</p>
            <Link
              href="/workout-builder"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Your First Workout
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => {
              const totalExercises = workout.sections.reduce(
                (sum, section) => sum + section.exercises.length,
                0
              );

              return (
                <div
                  key={workout.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800 flex-1">
                      {workout.workoutName}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          router.push(`/workout-builder?id=${workout.id}`)
                        }
                        className="p-3 min-w-[44px] min-h-[44px] text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
                        title="Edit workout"
                        aria-label="Edit workout"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDelete(workout.id)}
                        className="p-3 min-w-[44px] min-h-[44px] text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
                        title="Delete workout"
                        aria-label="Delete workout"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-lg" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {workout.workoutDescription || "No description"}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-y">
                    <div>
                      <p className="text-gray-600 text-xs">Exercises</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {totalExercises}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Sections</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {workout.sections.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Level</p>
                      <p className="text-sm font-bold text-blue-600">
                        {workout.difficulty}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      router.push(`/workout-view?id=${workout.id}`)
                    }
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-200"
                  >
                    Let's Start
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Create Workout Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-10">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/workout-builder"
            className="block w-full px-6 py-4 bg-blue-600 text-white text-xl rounded-lg hover:bg-blue-700 transition-colors font-bold text-center flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create New Workout
          </Link>
        </div>
      </div>
    </div>
  );
}
