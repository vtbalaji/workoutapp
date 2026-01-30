import { useState, useEffect } from "react";
import ExerciseCard from "@/components/ExerciseCard";
import DetailModal from "@/components/DetailModal";
import { SkeletonCard } from "@/components/Skeleton";
import { Exercise } from "@/lib/types";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/exercises");
      if (!response.ok) throw new Error("Failed to fetch exercises");
      const data = await response.json();
      setExercises(data);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map((ex: Exercise) => ex.pose_category))
      ) as string[];
      setCategories(["All", ...uniqueCategories]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || exercise.pose_category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-1">
        <div className="max-w-7xl mx-auto px-2">
          <h1 className="text-sm font-semibold">Exercises ({exercises.length})</h1>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-1 sm:px-2 py-1">
        <div className="bg-white rounded shadow p-2 mb-1">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex flex-wrap gap-1 mt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  filterCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-sm mb-1">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Grid of Exercises */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
              >
                <ExerciseCard exercise={exercise} />
              </div>
            ))}
          </div>
        )}

        {!loading && filteredExercises.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-600 text-sm">No exercises found.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        item={selectedExercise}
        type="exercise"
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
}
