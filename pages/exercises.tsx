import { useState, useEffect, useRef, useCallback } from "react";
import ExerciseCard from "@/components/ExerciseCard";
import DetailModal from "@/components/DetailModal";
import { SkeletonCard } from "@/components/Skeleton";
import { Exercise } from "@/lib/types";

const ITEMS_PER_PAGE = 24;

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterEquipment, setFilterEquipment] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [equipmentList, setEquipmentList] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observerRef = useRef<IntersectionObserver | null>(null);

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

      // Set predefined equipment categories
      setEquipmentList([
        "All",
        "No Equipment",
        "Dumbbells",
        "Full gym",
        "Kettlebells",
        "Barbell / EZ-Bar",
        "Resistance Bands"
      ]);
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

    const matchesEquipment =
      filterEquipment === "All" ||
      (filterEquipment === "No Equipment"
        ? (!exercise.equipment || exercise.equipment.length === 0 || exercise.equipment.includes("NO EQUIPMENT"))
        : exercise.equipment && exercise.equipment.some((item: string) =>
            item.toLowerCase().includes(filterEquipment.toLowerCase()) ||
            filterEquipment.toLowerCase().includes(item.toLowerCase())
          ));

    return matchesSearch && matchesCategory && matchesEquipment;
  });

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchTerm, filterCategory, filterEquipment]);

  // Infinite scroll - using callback ref
  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      }
    }, {
      root: null,
      rootMargin: "200px",
      threshold: 0,
    });

    if (node) observerRef.current.observe(node);
  }, []);

  const visibleExercises = filteredExercises.slice(0, visibleCount);
  const hasMore = visibleCount < filteredExercises.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-1">
        <div className="max-w-7xl mx-auto px-2">
          <h1 className="text-sm font-semibold">
            Exercises ({filteredExercises.length})
          </h1>
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
          <div className="mt-1">
            <label className="text-xs font-medium text-gray-700 mb-0.5 block">Category</label>
            <div className="flex flex-wrap gap-1">
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

          <div className="mt-2">
            <label className="text-xs font-medium text-gray-700 mb-0.5 block">Equipment</label>
            <div className="flex flex-wrap gap-1">
              {equipmentList.map((equip) => (
                <button
                  key={equip}
                  onClick={() => setFilterEquipment(equip)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    filterEquipment === equip
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {equip}
                </button>
              ))}
            </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Grid of Exercises - Lazy loaded */}
        {!loading && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
              {visibleExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  ref={index === visibleExercises.length - 1 ? lastItemRef : null}
                  onClick={() => setSelectedExercise(exercise)}
                >
                  <ExerciseCard exercise={exercise} />
                </div>
              ))}
            </div>

            {/* Loading indicator */}
            {hasMore && (
              <div className="flex justify-center py-3">
                <div className="text-[10px] text-gray-400">
                  Showing {visibleCount} of {filteredExercises.length}
                </div>
              </div>
            )}
          </>
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
