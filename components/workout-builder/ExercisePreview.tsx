/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Exercise, Workout } from "@/lib/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMars, faVenus } from "@fortawesome/free-solid-svg-icons";

interface ExercisePreviewProps {
  selectedExercise: Exercise | null;
  workout: Workout | null;
  onAddExerciseToSection: (
    sectionId: string,
    exercise: Exercise,
    sets: number,
    reps: number,
    rest: number
  ) => void;
  onShowToast?: (message: string, type?: "success" | "error" | "info") => void;
}

export default function ExercisePreview({
  selectedExercise,
  workout,
  onAddExerciseToSection,
  onShowToast,
}: ExercisePreviewProps) {
  const [imageGender, setImageGender] = useState<"male" | "female">("male");
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    workout?.sections?.[0]?.id || ""
  );
  const [customSets, setCustomSets] = useState(3);
  const [customReps, setCustomReps] = useState(10);
  const [customRest, setCustomRest] = useState(60);

  // For template builder (no workout/sections)
  const isTemplateMode = !workout;

  if (!selectedExercise) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-0 h-screen flex flex-col">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Exercise Preview</h2>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p className="text-center">
            Select an exercise from the left panel to see details
          </p>
        </div>
      </div>
    );
  }

  const handleAddExercise = () => {
    // For template mode, just add exercise without section
    if (isTemplateMode) {
      onAddExerciseToSection(
        "", // No section ID for templates
        selectedExercise,
        customSets,
        customReps,
        customRest
      );
      if (onShowToast) {
        onShowToast("Exercise added to template", "success");
      }
      return;
    }

    if (!selectedSectionId) {
      if (onShowToast) {
        onShowToast("Please create a section first", "error");
      }
      return;
    }

    onAddExerciseToSection(
      selectedSectionId,
      selectedExercise,
      customSets,
      customReps,
      customRest
    );

    const sectionName = workout?.sections.find(s => s.id === selectedSectionId)?.name;
    if (onShowToast) {
      onShowToast(`Exercise added to ${sectionName}`, "success");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-0 max-h-screen overflow-y-auto flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Exercise Details</h2>

      {/* Image */}
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setImageGender("male")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
              imageGender === "male"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <FontAwesomeIcon icon={faMars} />
            Male
          </button>
          <button
            onClick={() => setImageGender("female")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
              imageGender === "female"
                ? "bg-pink-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <FontAwesomeIcon icon={faVenus} />
            Female
          </button>
        </div>
        <div className="bg-gray-100 rounded-lg overflow-hidden h-48 mb-4">
          <img
            key={imageGender}
            src={`/exercise-images/${selectedExercise.slug}/${imageGender}.svg`}
            alt={`${selectedExercise.title} - ${imageGender}`}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/300?text=Exercise";
            }}
          />
        </div>
      </div>

      {/* Description */}
      {selectedExercise.description && (
        <div className="mb-4">
          <h3 className="font-semibold text-sm mb-2">Description</h3>
          <p className="text-gray-700 text-sm">{selectedExercise.description}</p>
        </div>
      )}

      {/* Muscles */}
      {selectedExercise.primary_muscles && selectedExercise.primary_muscles.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-sm mb-2">Primary Muscles</h3>
          <div className="flex flex-wrap gap-2">
            {selectedExercise.primary_muscles.map((muscle, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Equipment */}
      {selectedExercise.equipment && selectedExercise.equipment.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-sm mb-2">Equipment</h3>
          <div className="flex flex-wrap gap-2">
            {selectedExercise.equipment.map((eq, idx) => (
              <span
                key={idx}
                className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs"
              >
                {eq}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Presets */}
      <div className="mb-4 pb-4 border-b">
        <h3 className="font-semibold text-sm mb-2">Quick Presets</h3>
        <div className="space-y-2">
          <button
            onClick={() => {
              setCustomSets(3);
              setCustomReps(10);
            }}
            className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
          >
            3x10
          </button>
          <button
            onClick={() => {
              setCustomSets(4);
              setCustomReps(8);
            }}
            className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
          >
            4x8
          </button>
          <button
            onClick={() => {
              setCustomSets(5);
              setCustomReps(5);
            }}
            className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
          >
            5x5
          </button>
        </div>
      </div>

      {/* Custom Sets/Reps/Rest */}
      <div className="mb-4 space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Sets</label>
          <input
            type="number"
            min="1"
            max="10"
            value={customSets}
            onChange={(e) => setCustomSets(Number(e.target.value))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reps</label>
          <input
            type="number"
            min="1"
            max="50"
            value={customReps}
            onChange={(e) => setCustomReps(Number(e.target.value))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Rest (seconds)</label>
          <input
            type="number"
            min="0"
            max="300"
            step="15"
            value={customRest}
            onChange={(e) => setCustomRest(Number(e.target.value))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>

      {/* Section Selector - Only show for workout mode */}
      {!isTemplateMode && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Add to section</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a section...</option>
            {workout?.sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={handleAddExercise}
        disabled={!isTemplateMode && !selectedSectionId}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isTemplateMode ? "Add to Template" : "Add to Workout"}
      </button>
    </div>
  );
}
