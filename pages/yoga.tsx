import { useState, useEffect, useCallback, useRef } from "react";
import YogaCard from "@/components/YogaCard";
import DetailModal from "@/components/DetailModal";
import { SkeletonCard } from "@/components/Skeleton";
import { Yoga } from "@/lib/types";

const ITEMS_PER_PAGE = 24;

export default function YogaPage() {
  const [yogaPoses, setYogaPoses] = useState<Yoga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYoga, setSelectedYoga] = useState<Yoga | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    fetchYogaPoses();
  }, []);

  const fetchYogaPoses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/yoga");
      if (!response.ok) throw new Error("Failed to fetch yoga poses");
      const data = await response.json();
      setYogaPoses(data);

      const uniqueCategories = Array.from(
        new Set(data.map((pose: Yoga) => pose.pose_category))
      ) as string[];
      const uniqueDifficulties = Array.from(
        new Set(data.map((pose: Yoga) => pose.difficulty))
      ) as string[];

      setCategories(["All", ...uniqueCategories]);
      setDifficulties(["All", ...uniqueDifficulties]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredPoses = yogaPoses.filter((pose) => {
    const matchesSearch =
      pose.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pose.sanskrit_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || pose.pose_category === filterCategory;
    const matchesDifficulty =
      filterDifficulty === "All" || pose.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchTerm, filterCategory, filterDifficulty]);

  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      }
    }, { rootMargin: "200px" });
    if (node) observerRef.current.observe(node);
  }, []);

  const visiblePoses = filteredPoses.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPoses.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-1">
        <div className="max-w-7xl mx-auto px-2">
          <h1 className="text-sm font-semibold">Yoga Poses ({filteredPoses.length})</h1>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-1 sm:px-2 py-1">
        <div className="bg-white rounded shadow p-2 mb-1">
          <input
            type="text"
            placeholder="Search poses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          
          <div className="mt-1.5">
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    filterCategory === cat
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-1.5 pt-1.5 border-t">
            <div className="flex flex-wrap gap-1">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setFilterDifficulty(diff)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    filterDifficulty === diff
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs mb-1">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
              {visiblePoses.map((pose, index) => (
                <div 
                  key={pose.id} 
                  ref={index === visiblePoses.length - 1 ? lastItemRef : null}
                  onClick={() => setSelectedYoga(pose)}
                >
                  <YogaCard yoga={pose} />
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center py-3">
                <div className="text-[10px] text-gray-400">
                  Showing {visibleCount} of {filteredPoses.length}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && filteredPoses.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-600 text-sm">No yoga poses found.</p>
          </div>
        )}
      </div>

      <DetailModal
        item={selectedYoga}
        type="yoga"
        onClose={() => setSelectedYoga(null)}
      />
    </div>
  );
}
