import { useState, useEffect } from "react";
import ExerciseCard from "@/components/ExerciseCard";
import DetailModal from "@/components/DetailModal";
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">💪 Exercises</h1>
          <p className="text-blue-100">
            Explore {exercises.length} strength and conditioning exercises
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold mb-3">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filterCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-xl text-gray-600">Loading exercises...</div>
          </div>
        )}

        {/* Grid of Exercises */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No exercises found. Try adjusting your filters.
            </p>
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
