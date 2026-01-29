import { useState, useEffect } from "react";
import YogaCard from "@/components/YogaCard";
import DetailModal from "@/components/DetailModal";
import { Yoga } from "@/lib/types";

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

      // Extract unique categories and difficulties
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">🧘 Yoga Poses</h1>
          <p className="text-green-100">
            Explore {yogaPoses.length} yoga asanas and poses
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
              placeholder="Search by pose name or Sanskrit name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filterCategory === cat
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setFilterDifficulty(diff)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filterDifficulty === diff
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {diff}
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
            <div className="text-xl text-gray-600">Loading yoga poses...</div>
          </div>
        )}

        {/* Grid of Yoga Poses */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPoses.map((pose) => (
              <div key={pose.id} onClick={() => setSelectedYoga(pose)}>
                <YogaCard yoga={pose} />
              </div>
            ))}
          </div>
        )}

        {!loading && filteredPoses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No yoga poses found. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        item={selectedYoga}
        type="yoga"
        onClose={() => setSelectedYoga(null)}
      />
    </div>
  );
}
