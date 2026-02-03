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

  // Back/Lats
  Back: "middle-back-lats",
  Lats: "middle-back-lats",
  "Latissimus Dorsi": "middle-back-lats",
  "Middle Back": "middle-back-lats",
  "Middle Back / Lats": "middle-back-lats",
  "Upper Back": "middle-back-lats",
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
      {/* Base anatomy image with overlays */}
      <div className="relative w-full bg-gray-50 rounded overflow-hidden flex items-center justify-center" style={{ minHeight: '180px' }}>
        {/* Master anatomy image */}
        <img
          src="/muscle-groups/master.png"
          alt="Muscle Groups"
          className="w-auto h-[180px] sm:h-[200px] block"
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
            className="absolute w-auto h-[180px] sm:h-[200px]"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
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
            className="absolute w-auto h-[180px] sm:h-[200px] opacity-60"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ))}
      </div>

      {/* Legend - Below Image */}
      <div className="mt-2 space-y-1.5">
        {(exercise.primary_muscles || []).length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-medium text-gray-700 text-[10px]">Primary:</p>
            {exercise.primary_muscles.map((muscle, idx) => (
              <span
                key={idx}
                className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium"
              >
                {muscle}
              </span>
            ))}
          </div>
        )}

        {(exercise.secondary_muscles || []).length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-medium text-gray-700 text-[10px]">Secondary:</p>
            {exercise.secondary_muscles.map((muscle, idx) => (
              <span
                key={idx}
                className="bg-green-300 text-green-800 text-[10px] px-1.5 py-0.5 rounded font-medium"
              >
                {muscle}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
