"use client";

import { useState, useEffect, useMemo } from "react";
import { Exercise } from "@/lib/types";
import { useDraggable } from "@dnd-kit/core";

interface ExerciseFinderProps {
  onExerciseSelect: (exercise: Exercise) => void;
}

export default function ExerciseFinder({
  onExerciseSelect,
}: ExerciseFinderProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [muscles, setMuscles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch("/api/exercises");
        if (!response.ok) throw new Error("Failed to fetch exercises");
        const data = await response.json();
        setExercises(data);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map((ex: Exercise) => ex.pose_category))
        ) as string[];
        setCategories(["All", ...uniqueCategories.sort()]);

        // Extract unique equipment (excluding "Resistance Bands" and "Full gym")
        const uniqueEquipment = Array.from(
          new Set(data.flatMap((ex: Exercise) => ex.equipment || []))
        ).filter((eq) => eq !== "Resistance Bands" && eq !== "Full gym") as string[];

        // Sort equipment with "No Equipment" first, then alphabetically
        const sortedEquipment = uniqueEquipment.sort((a, b) => {
          if (a === "NO EQUIPMENT") return -1;
          if (b === "NO EQUIPMENT") return 1;
          return a.localeCompare(b);
        });

        setEquipment(["All", ...sortedEquipment]);

        // Extract unique primary muscles
        const uniqueMuscles = Array.from(
          new Set(data.flatMap((ex: Exercise) => ex.primary_muscles || []))
        ) as string[];
        setMuscles(["All", ...uniqueMuscles.sort()]);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" ||
        exercise.pose_category === selectedCategory;
      const matchesEquipment =
        selectedEquipment === "All" ||
        (exercise.equipment && exercise.equipment.includes(selectedEquipment));
      const matchesMuscle =
        selectedMuscle === "All" ||
        (exercise.primary_muscles && exercise.primary_muscles.includes(selectedMuscle));
      return matchesSearch && matchesCategory && matchesEquipment && matchesMuscle;
    });
  }, [exercises, searchTerm, selectedCategory, selectedEquipment, selectedMuscle]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
      {/* Header */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">Exercises</h2>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Category Tabs */}
      <div className="mb-3 pb-3 border-b">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Filter */}
      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Equipment</label>
        <select
          value={selectedEquipment}
          onChange={(e) => setSelectedEquipment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        >
          {equipment.map((eq) => (
            <option key={eq} value={eq}>
              {eq}
            </option>
          ))}
        </select>
      </div>

      {/* Primary Muscle Filter */}
      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Muscle</label>
        <select
          value={selectedMuscle}
          onChange={(e) => setSelectedMuscle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        >
          {muscles.map((muscle) => (
            <option key={muscle} value={muscle}>
              {muscle}
            </option>
          ))}
        </select>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading exercises...
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No exercises found. Try adjusting your filters.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExercises.map((exercise) => (
              <ExerciseFinderCard
                key={exercise.id}
                exercise={exercise}
                onSelect={onExerciseSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ExerciseFinderCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
}

function ExerciseFinderCard({ exercise, onSelect }: ExerciseFinderCardProps) {
  const { setNodeRef, isDragging } = useDraggable({
    id: `exercise-finder-${exercise.id}`,
    data: {
      type: "exercise",
      exercise,
    },
  });

  const handleSelect = () => {
    onSelect(exercise);
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleSelect}
      className={`p-3 rounded-lg border-2 cursor-move transition-all ${
        isDragging
          ? "border-blue-500 bg-blue-50 opacity-50"
          : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
      }`}
    >
      <p className="font-medium text-sm text-gray-800">{exercise.title}</p>
      {exercise.primary_muscles && exercise.primary_muscles.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {exercise.primary_muscles.slice(0, 2).map((muscle, idx) => (
            <span
              key={idx}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
            >
              {muscle}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
