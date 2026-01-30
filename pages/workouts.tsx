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
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-1">
        <div className="max-w-7xl mx-auto px-3">
          <h1 className="text-sm font-semibold">My Workouts</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-2 py-1 pb-4">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonWorkoutCard key={i} />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-3">No workouts yet</p>
            <Link
              href="/workout-builder"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              Create Your First Workout
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {workouts.map((workout) => {
              const totalExercises = workout.sections.reduce(
                (sum, section) => sum + section.exercises.length,
                0
              );

              return (
                <div
                  key={workout.id}
                  className="bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800 flex-1 truncate">
                      {workout.workoutName}
                    </h3>
                    <div className="flex">
                      <button
                        onClick={() =>
                          router.push(`/workout-builder?id=${workout.id}`)
                        }
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleDelete(workout.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 my-1 py-1 border-y text-center">
                    <div>
                      <p className="text-gray-500 text-[10px]">Exercises</p>
                      <p className="text-lg font-bold text-blue-600">{totalExercises}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px]">Sections</p>
                      <p className="text-lg font-bold text-blue-600">{workout.sections.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px]">Level</p>
                      <p className="text-xs font-bold text-blue-600">{workout.difficulty}</p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => router.push(`/workout-view?id=${workout.id}`)}
                      className="flex-1 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/workout-player?id=${workout.id}`)}
                      className="flex-1 py-1.5 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700"
                    >
                      Start
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating + Button */}
      <Link
        href="/workout-builder"
        className="fixed bottom-4 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center z-10"
      >
        <FontAwesomeIcon icon={faPlus} className="text-xl" />
      </Link>
    </div>
  );
}
