/* eslint-disable @next/next/no-img-element */
"use client";

import { Exercise } from "@/lib/types";
import { useState, useEffect } from "react";

interface MuscleGroupImageProps {
  exercise: Exercise;
}

// Map exercise muscles to local muscle group image names
const MUSCLE_NAME_MAP: Record<string, string> = {
  // Ankles
  Ankles: "ankles",
  Ankle: "ankles",

  // Chest
  Chest: "chest",
  Pectorals: "chest",
  Pecs: "chest",

  // Back/Lats (we don't have these, fallback to shoulders or lower-back)
  Back: "lower-back",
  Lats: "lower-back",
  "Latissimus Dorsi": "lower-back",
  "Middle Back": "lower-back",
  "Middle Back / Lats": "lower-back",
  "Upper Back": "lower-back",
  "Upper Back & Lower Traps": "neck-upper-traps",
  "Lower Back": "lower-back",

  // Shoulders/Traps
  Shoulders: "shoulders",
  Shoulder: "shoulders",
  Deltoids: "shoulders",
  Delts: "shoulders",
  Traps: "neck-upper-traps",
  Trapezius: "neck-upper-traps",
  "Neck & Upper Traps": "neck-upper-traps",
  Neck: "neck-upper-traps",

  // Biceps
  Biceps: "biceps",
  Bicep: "biceps",

  // Triceps
  Triceps: "triceps",
  Tricep: "triceps",

  // Forearms
  Forearms: "forearms",
  Forearm: "forearms",

  // Abs/Core
  Abs: "abs",
  Abdominals: "abs",
  Core: "abs",
  Obliques: "obliques",
  "Obliques (Love Handles)": "obliques",

  // Legs
  Quadriceps: "quadriceps",
  Quads: "quadriceps",
  Quad: "quadriceps",
  Hamstrings: "hamstrings",
  Hamstring: "hamstrings",
  Glutes: "glutes-hip-flexors",
  Glute: "glutes-hip-flexors",
  "Glutes & Hip Flexors": "glutes-hip-flexors",
  Calves: "calves",
  Calf: "calves",
};

function getMuscleGroupName(muscleName: string): string | null {
  return MUSCLE_NAME_MAP[muscleName] || null;
}

export default function MuscleGroupImage({ exercise }: MuscleGroupImageProps) {
  const [primaryImages, setPrimaryImages] = useState<string[]>([]);
  const [secondaryImages, setSecondaryImages] = useState<string[]>([]);

  useEffect(() => {
    // Get unique muscle group names
    const primaryGroups = new Set(
      (exercise.primary_muscles || [])
        .map(getMuscleGroupName)
        .filter(Boolean) as string[]
    );
    const secondaryGroups = new Set(
      (exercise.secondary_muscles || [])
        .map(getMuscleGroupName)
        .filter(Boolean) as string[]
    );

    // Build image URLs - using local images
    const primaryUrls = Array.from(primaryGroups).map(
      (group) => `/muscle-groups/${group}-p.png`
    );
    const secondaryUrls = Array.from(secondaryGroups).map(
      (group) => `/muscle-groups/${group}-s.png`
    );

    setPrimaryImages(primaryUrls);
    setSecondaryImages(secondaryUrls);
  }, [exercise]);

  return (
    <div className="w-full">
      {/* Image and Legend Side by Side */}
      <div className="flex gap-4 items-start">
        {/* Base anatomy image with overlays */}
        <div className="relative flex-shrink-0 w-32 sm:w-48 bg-gray-100 rounded-lg overflow-hidden">
          {/* Master anatomy image */}
          <img
            src="/muscle-groups/master.png"
            alt="Muscle Groups"
            className="w-full h-auto block"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          {/* Primary muscle overlays */}
          {primaryImages.map((url, idx) => (
            <img
              key={`primary-${idx}`}
              src={url}
              alt="Primary muscle"
              className="absolute inset-0 w-full h-auto"
              style={{ top: 0, left: 0 }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ))}

          {/* Secondary muscle overlays (lighter) */}
          {secondaryImages.map((url, idx) => (
            <img
              key={`secondary-${idx}`}
              src={url}
              alt="Secondary muscle"
              className="absolute inset-0 w-full h-auto opacity-60"
              style={{ top: 0, left: 0 }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 text-sm">
          {(exercise.primary_muscles || []).length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">Primary Muscles:</p>
              <div className="flex flex-wrap gap-2">
                {exercise.primary_muscles.map((muscle, idx) => (
                  <span
                    key={idx}
                    className="bg-green-500 text-white text-xs px-2 py-1 rounded"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(exercise.secondary_muscles || []).length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-1">
                Secondary Muscles:
              </p>
              <div className="flex flex-wrap gap-2">
                {exercise.secondary_muscles.map((muscle, idx) => (
                  <span
                    key={idx}
                    className="bg-green-400 text-white text-xs px-2 py-1 rounded"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
