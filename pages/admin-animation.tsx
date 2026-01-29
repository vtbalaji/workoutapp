"use client";

import { useState, useEffect } from "react";
import { Exercise } from "@/lib/types";

export default function AdminAnimationPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "configured" | "unconfigured">("unconfigured");
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch("/api/exercises");
      if (!response.ok) throw new Error("Failed to fetch exercises");
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAnimation = async (slug: string, frames: number, orientation: "horizontal" | "vertical") => {
    setSaving(slug);
    try {
      const response = await fetch("/api/admin/update-animation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, animation_frames: frames, animation_orientation: orientation }),
      });

      if (!response.ok) throw new Error("Failed to update");

      // Update local state
      setExercises(exercises.map(ex =>
        ex.slug === slug
          ? { ...ex, animation_frames: frames, animation_orientation: orientation }
          : ex
      ));

      setMessage({ text: `Updated ${slug}`, type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: "Failed to save", type: "error" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(null);
    }
  };

  const filteredExercises = exercises
    .filter(ex => {
      const matchesSearch = ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ex.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "configured" && ex.animation_frames) ||
        (filter === "unconfigured" && !ex.animation_frames);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const stats = {
    total: exercises.length,
    configured: exercises.filter(ex => ex.animation_frames).length,
    unconfigured: exercises.filter(ex => !ex.animation_frames).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-3">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-1">Animation Metadata Editor</h1>
          <p className="text-indigo-100 text-sm">
            Configure animation frames for exercises
          </p>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          message.type === "success" ? "bg-green-600" : "bg-red-600"
        } text-white`}>
          {message.text}
        </div>
      )}

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Exercises</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.configured}</div>
            <div className="text-sm text-gray-600">Configured</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.unconfigured}</div>
            <div className="text-sm text-gray-600">Needs Config</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("configured")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "configured"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Configured
              </button>
              <button
                onClick={() => setFilter("unconfigured")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "unconfigured"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Unconfigured
              </button>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Image</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Exercise</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Frames</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Orientation</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExercises.map((exercise) => (
                <ExerciseRow
                  key={exercise.slug}
                  exercise={exercise}
                  onUpdate={updateAnimation}
                  isSaving={saving === exercise.slug}
                />
              ))}
            </tbody>
          </table>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No exercises found
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p className="mb-2">Showing {filteredExercises.length} of {exercises.length} exercises</p>
        </div>
      </div>
    </div>
  );
}

function ExerciseRow({
  exercise,
  onUpdate,
  isSaving,
}: {
  exercise: Exercise;
  onUpdate: (slug: string, frames: number, orientation: "horizontal" | "vertical") => void;
  isSaving: boolean;
}) {
  const [frames, setFrames] = useState(exercise.animation_frames || 2);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
    exercise.animation_orientation || "horizontal"
  );

  const hasChanges =
    frames !== (exercise.animation_frames || 2) ||
    orientation !== (exercise.animation_orientation || "horizontal");

  return (
    <>
      <tr className={`hover:bg-gray-50 ${!exercise.animation_frames ? "bg-orange-50" : ""}`}>
        <td className="px-4 py-3">
          <div className="w-32 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
            <img
              src={`/exercise-images/${exercise.slug}/male.svg`}
              alt={exercise.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </td>
        <td className="px-4 py-3">
          <div>
            <div className="font-medium text-gray-900">{exercise.title}</div>
            <div className="text-sm text-gray-500">{exercise.slug}</div>
          </div>
        </td>
        <td className="px-4 py-3">
          <select
            value={frames}
            onChange={(e) => setFrames(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={1}>1 (Static)</option>
            <option value={2}>2 Frames</option>
            <option value={3}>3 Frames</option>
          </select>
        </td>
        <td className="px-4 py-3">
          <select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as "horizontal" | "vertical")}
            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={frames === 1}
          >
            <option value="horizontal">Horizontal (L/R)</option>
            <option value="vertical">Vertical (T/B)</option>
          </select>
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            {hasChanges && (
              <button
                onClick={() => onUpdate(exercise.slug, frames, orientation)}
                disabled={isSaving}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}
