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
  const [customSets, setCustomSets] = useState(1);
  const [customReps, setCustomReps] = useState("10");
  const [customRest, setCustomRest] = useState(60);

  // For template builder (no workout/sections)
  const isTemplateMode = !workout;

  if (!selectedExercise) {
    return (
      <div className="bg-white rounded-lg shadow-md p-3 sticky top-0 h-screen flex flex-col">
        <h2 className="text-sm font-bold mb-2 text-gray-800">Exercise Preview</h2>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p className="text-center text-xs">
            Select an exercise to see details
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
        parseInt(customReps) || 10,
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
      parseInt(customReps) || 10,
      customRest
    );

    const sectionName = workout?.sections.find(s => s.id === selectedSectionId)?.name;
    if (onShowToast) {
      onShowToast(`Exercise added to ${sectionName}`, "success");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sticky top-0 max-h-screen overflow-y-auto flex flex-col">
      <h2 className="text-sm font-bold mb-2 text-gray-800">Exercise Details</h2>

      {/* Image */}
      <div className="mb-2">
        <div className="flex gap-1 mb-1">
          <button
            onClick={() => setImageGender("male")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
              imageGender === "male"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <FontAwesomeIcon icon={faMars} className="text-[10px]" />
            Male
          </button>
          <button
            onClick={() => setImageGender("female")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
              imageGender === "female"
                ? "bg-pink-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <FontAwesomeIcon icon={faVenus} className="text-[10px]" />
            Female
          </button>
        </div>
        <div className="bg-gray-100 rounded overflow-hidden h-32">
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
        <div className="mb-2">
          <h3 className="font-semibold text-xs mb-0.5">Description</h3>
          <p className="text-gray-700 text-xs leading-tight">{selectedExercise.description}</p>
        </div>
      )}

      {/* Muscles */}
      {selectedExercise.primary_muscles && selectedExercise.primary_muscles.length > 0 && (
        <div className="mb-2">
          <h3 className="font-semibold text-xs mb-0.5">Primary Muscles</h3>
          <div className="flex flex-wrap gap-1">
            {selectedExercise.primary_muscles.map((muscle, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px]"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Equipment */}
      {selectedExercise.equipment && selectedExercise.equipment.length > 0 && (
        <div className="mb-2">
          <h3 className="font-semibold text-xs mb-0.5">Equipment</h3>
          <div className="flex flex-wrap gap-1">
            {selectedExercise.equipment.map((eq, idx) => (
              <span
                key={idx}
                className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded text-[10px]"
              >
                {eq}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Custom Sets/Reps/Rest - Inline */}
      <div className="mb-2">
        <div className="grid grid-cols-3 gap-1.5">
          <div>
            <label className="block text-[10px] font-medium mb-0.5">Sets</label>
            <input
              type="number"
              min="1"
              max="10"
              value={customSets}
              onChange={(e) => setCustomSets(Number(e.target.value))}
              className="w-full px-1.5 py-0.5 border border-gray-300 rounded text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium mb-0.5">Reps</label>
            <input
              type="text"
              value={customReps}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setCustomReps(value);
              }}
              placeholder="10"
              className="w-full px-1.5 py-0.5 border border-gray-300 rounded text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium mb-0.5">Rest(s)</label>
            <input
              type="number"
              min="0"
              max="300"
              step="15"
              value={customRest}
              onChange={(e) => setCustomRest(Number(e.target.value))}
              className="w-full px-1.5 py-0.5 border border-gray-300 rounded text-xs"
            />
          </div>
        </div>
      </div>

      {/* Section Selector - Only show for workout mode */}
      {!isTemplateMode && (
        <div className="mb-2">
          <label className="block text-[10px] font-medium mb-0.5">Add to section</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="w-full px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select section...</option>
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
        className="w-full bg-blue-600 text-white py-1 rounded text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isTemplateMode ? "Add to Template" : "Add to Workout"}
      </button>
    </div>
  );
}
