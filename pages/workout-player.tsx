"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Workout } from "@/lib/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import WorkoutPlayerPage from "@/components/workout-player/WorkoutPlayerPage";
import Link from "next/link";

export default function WorkoutPlayer() {
  return (
    <ProtectedRoute>
      <WorkoutPlayerContent />
    </ProtectedRoute>
  );
}

function WorkoutPlayerContent() {
  const { user } = useAuth();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkout = async () => {
      if (!user) return;

      try {
        const queryParams = new URLSearchParams(window.location.search);
        const workoutId = queryParams.get("id");

        if (!workoutId) {
          throw new Error("No workout ID provided");
        }

        const token = await user.getIdToken();
        const response = await fetch(`/api/workouts/${workoutId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load workout");
        }

        const data = await response.json();
        setWorkout(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workout");
      } finally {
        setLoading(false);
      }
    };

    loadWorkout();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Failed to load workout"}</p>
          <Link href="/workouts" className="text-blue-600 hover:underline">
            Back to My Workouts
          </Link>
        </div>
      </div>
    );
  }

  return <WorkoutPlayerPage workout={workout} />;
}
