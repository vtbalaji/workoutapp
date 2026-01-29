"use client";

import { useState, useEffect } from "react";
import { WorkoutExercise } from "@/lib/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMars, faVenus } from "@fortawesome/free-solid-svg-icons";
import MuscleGroupImage from "./MuscleGroupImage";

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
  const [currentFrame, setCurrentFrame] = useState(1);
  const [frames, setFrames] = useState(exercise.animation_frames || 2);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(exercise.animation_orientation || 'horizontal');

  // Fetch animation metadata from API if not present in exercise
  useEffect(() => {
    if (exercise.animation_frames !== undefined) return;
    if (!exercise.exerciseId && !exercise.exerciseSlug) return;

    const fetchMetadata = async () => {
      try {
        const response = await fetch('/api/exercises');
        const allExercises = await response.json();
        const fullExercise = allExercises.find((ex: any) =>
          ex.id === exercise.exerciseId || ex.slug === exercise.exerciseSlug
        );

        if (fullExercise) {
          setFrames(fullExercise.animation_frames || 2);
          setOrientation(fullExercise.animation_orientation || 'horizontal');
        }
      } catch (error) {
        console.error('Error fetching animation metadata:', error);
      }
    };

    fetchMetadata();
  }, [exercise.exerciseId, exercise.exerciseSlug, exercise.animation_frames]);

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

  // Group paths by frame and apply transform to center each person
  useEffect(() => {
    if (!svgContent || frames === 1) return;

    const container = document.querySelector('.svg-animation-container');
    if (!container) return;

    const svg = container.querySelector('svg');
    if (!svg) return;

    // Check if we already created frame groups
    let frameGroups = svg.querySelectorAll('g.frame-group');

    if (frameGroups.length === 0) {
      const paths = Array.from(svg.querySelectorAll('path'));

      // Extract coordinates
      const coords = paths.map(path => {
        const d = path.getAttribute('d') || '';
        const xMatch = d.match(/M([\d.]+)/);
        const yMatch = d.match(/M[\d.]+[,\s]+([\d.]+)/);
        return {
          path,
          x: xMatch ? parseFloat(xMatch[1]) : 0,
          y: yMatch ? parseFloat(yMatch[1]) : 0
        };
      }).filter(c => c.x > 0 || c.y > 0);

      if (coords.length === 0) return;

      const useCoord = orientation === 'horizontal' ? 'x' : 'y';
      const values = coords.map(c => c[useCoord]).sort((a, b) => a - b);
      const min = values[0];
      const max = values[values.length - 1];
      const range = max - min;

      // Create groups
      const groups: SVGGElement[] = [];
      for (let i = 0; i < frames; i++) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', `frame-group frame-${i + 1}`);
        groups.push(group);
      }

      // Distribute paths to frames based on coordinate position
      coords.forEach(({ path, x, y }) => {
        const value = orientation === 'horizontal' ? x : y;
        const normalizedPos = (value - min) / range;

        let frameIndex = 0;
        if (frames === 2) {
          frameIndex = normalizedPos < 0.5 ? 0 : 1;
        } else if (frames === 3) {
          if (normalizedPos < 0.33) frameIndex = 0;
          else if (normalizedPos < 0.67) frameIndex = 1;
          else frameIndex = 2;
        }

        const clonedPath = path.cloneNode(true) as SVGPathElement;
        groups[frameIndex].appendChild(clonedPath);
      });

      // Calculate actual centers of each frame for better centering
      const frameCenters: number[] = [];
      groups.forEach((group) => {
        const groupPaths = Array.from(group.querySelectorAll('path'));
        const groupCoords = groupPaths.map(p => {
          const d = p.getAttribute('d') || '';
          const match = d.match(/M([\d.]+)[,\s]+([\d.]+)/);
          if (!match) return null;
          return {
            x: parseFloat(match[1]),
            y: parseFloat(match[2])
          };
        }).filter(c => c !== null);

        if (groupCoords.length > 0) {
          const coordValues = groupCoords.map(c => orientation === 'horizontal' ? c!.x : c!.y);
          const avg = coordValues.reduce((a, b) => a + b, 0) / coordValues.length;
          frameCenters.push(avg);
        } else {
          frameCenters.push(0);
        }
      });

      // Target center (middle of range)
      const targetCenter = (min + max) / 2;

      // Apply transforms to center each frame
      groups.forEach((group, index) => {
        const offset = targetCenter - frameCenters[index];
        if (orientation === 'horizontal') {
          group.setAttribute('transform', `translate(${offset.toFixed(0)}, 0)`);
        } else {
          group.setAttribute('transform', `translate(0, ${offset.toFixed(0)})`);
        }
      });

      // Remove original paths and add groups
      paths.forEach(p => p.remove());
      groups.forEach(g => svg.appendChild(g));

      frameGroups = svg.querySelectorAll('g.frame-group');
    }

    // Show/hide frame groups
    frameGroups.forEach((group, index) => {
      const isCurrentFrame = (index + 1) === currentFrame;
      (group as HTMLElement).style.display = isCurrentFrame ? 'block' : 'none';
    });
  }, [currentFrame, svgContent, frames, orientation]);

  // Auto-start animation when SVG loads and cycle through frames
  useEffect(() => {
    if (!svgContent || frames === 1) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= frames) return 1;
        return prev + 1;
      });
    }, 1000); // Change frame every 1 second

    return () => clearInterval(interval);
  }, [svgContent, frames]);

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
          {/* Gender Toggle */}
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => setImageGender("male")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                imageGender === "female"
                  ? "bg-pink-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faVenus} />
              Female
            </button>
          </div>

          {/* Exercise Animation */}
          <div className="bg-white rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
            {loadingSvg ? (
              <p className="text-gray-600">Loading animation...</p>
            ) : svgContent ? (
              <div className="svg-animation-container w-full h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
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

          {/* Muscle Diagram */}
          {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
            <div>
              <MuscleGroupImage
                exercise={{
                  primary_muscles: exercise.primaryMuscles,
                  secondary_muscles: [],
                } as any}
              />
            </div>
          )}

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
      </div>
    </div>
  );
}
