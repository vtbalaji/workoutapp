"use client";

import { useState, useEffect } from "react";
import { WorkoutExercise } from "@/lib/types";

interface ExerciseDetailModalProps {
  exercise: WorkoutExercise;
  onClose: () => void;
}

export default function ExerciseDetailModal({
  exercise,
  onClose,
}: ExerciseDetailModalProps) {
  const [imageGender, setImageGender] = useState<"male" | "female">("male");
  const [svgContent, setSvgContent] = useState<string>("");
  const [loadingSvg, setLoadingSvg] = useState(false);
  const [showMuscleOverlay, setShowMuscleOverlay] = useState(false);

  // Fetch SVG when modal opens or gender changes
  useEffect(() => {
    const fetchSvg = async () => {
      if (!exercise.exerciseSlug) return;

      setLoadingSvg(true);
      try {
        // Use local SVG from public/exercise-images/{slug}/{gender}.svg
        const localImagePath = `/exercise-images/${exercise.exerciseSlug}/${imageGender}.svg`;
        const response = await fetch(localImagePath);
        if (response.ok) {
          const svgText = await response.text();
          setSvgContent(svgText);
        }
      } catch (error) {
        console.error("Error fetching SVG:", error);
      } finally {
        setLoadingSvg(false);
      }
    };

    fetchSvg();
  }, [exercise.exerciseSlug, imageGender]);

  // Muscle overlay is now a static image that we'll style with CSS to highlight muscles
  // We'll use the muscle names from exercise.primaryMuscles to determine what to highlight

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {exercise.exerciseName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Toggle between animation and muscle overlay */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setShowMuscleOverlay(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showMuscleOverlay
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Animation
            </button>
            <button
              onClick={() => setShowMuscleOverlay(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showMuscleOverlay
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Muscles
            </button>
          </div>

          {/* Exercise Image/Animation or Muscle Overlay */}
          <div className="bg-white rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
            {showMuscleOverlay ? (
              // Layered muscle diagram with highlighted muscles
              <div className="w-full max-w-md mx-auto p-4 relative">
                {/* Base muscle diagram */}
                <img
                  src="/muscle-groups/master.png"
                  alt="Muscle Groups"
                  className="w-full h-auto block"
                />

                {/* Overlay highlighted muscles */}
                {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    {exercise.primaryMuscles.map((muscle, idx) => {
                      // Map muscle names to actual file names
                      const muscleMap: { [key: string]: string } = {
                        'ankles': 'ankles-p',
                        'abs': 'abs-p',
                        'abdominals': 'abs-p',
                        'biceps': 'biceps-p',
                        'calves': 'calves-p',
                        'chest': 'chest-p',
                        'forearms': 'forearms-p',
                        'glutes': 'glutes-hip-flexors-p',
                        'gluteus': 'glutes-hip-flexors-p',
                        'hip flexors': 'glutes-hip-flexors-p',
                        'hamstrings': 'hamstrings-p',
                        'lower back': 'lower-back-p',
                        'lower-back': 'lower-back-p',
                        'neck': 'neck-upper-traps-p',
                        'neck & upper traps': 'neck-upper-traps-p',
                        'neck and upper traps': 'neck-upper-traps-p',
                        'traps': 'neck-upper-traps-p',
                        'trapezius': 'neck-upper-traps-p',
                        'upper traps': 'neck-upper-traps-p',
                        'obliques': 'obliques-p',
                        'quadriceps': 'quadriceps-p',
                        'quads': 'quadriceps-p',
                        'shoulders': 'shoulders-p',
                        'deltoids': 'shoulders-p',
                        'triceps': 'triceps-p',
                      };

                      const muscleLower = muscle.toLowerCase();
                      const fileName = muscleMap[muscleLower] || `${muscleLower.replace(/\s+/g, '-').replace(/&/g, 'and')}-p`;

                      return (
                        <img
                          key={idx}
                          src={`/muscle-groups/${fileName}.png`}
                          alt={muscle}
                          className="absolute inset-0 w-full h-auto"
                          style={{ mixBlendMode: 'multiply' }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                <p className="text-center text-sm text-gray-600 mt-4">
                  Primary: {exercise.primaryMuscles?.join(", ") || "Various muscles"}
                </p>
              </div>
            ) : loadingSvg ? (
              <p className="text-gray-600">Loading animation...</p>
            ) : svgContent ? (
              <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
            ) : exercise.exerciseSlug ? (
              <img
                src={`/exercise-images/${exercise.exerciseSlug}/male.svg`}
                alt={exercise.exerciseName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-2">💪</div>
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>

          {/* Exercise Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{exercise.sets}</div>
              <div className="text-sm text-gray-600 font-medium">Sets</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{exercise.reps}</div>
              <div className="text-sm text-gray-600 font-medium">Reps</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{exercise.restSeconds}s</div>
              <div className="text-sm text-gray-600 font-medium">Rest</div>
            </div>
          </div>

          {/* Description */}
          {exercise.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{exercise.description}</p>
            </div>
          )}

          {/* Primary Muscles */}
          {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Primary Muscles</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.primaryMuscles.map((muscle, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.equipment.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {exercise.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-700 leading-relaxed">{exercise.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
