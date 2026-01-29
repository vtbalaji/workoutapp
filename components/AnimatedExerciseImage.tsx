/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";

interface AnimatedExerciseImageProps {
  baseImageUrl: string;
  alt: string;
  frameCount?: number;
  interval?: number;
}

export default function AnimatedExerciseImage({
  baseImageUrl,
  alt,
  frameCount = 2,
  interval = 1000,
}: AnimatedExerciseImageProps) {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    if (frameCount <= 1) return;

    const timer = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameCount);
    }, interval);

    return () => clearInterval(timer);
  }, [frameCount, interval]);

  // Extract the ID from the URL and increment it for each frame
  let imageUrl = baseImageUrl;
  if (baseImageUrl.includes("svg.php?id=")) {
    const baseId = parseInt(baseImageUrl.split("id=")[1]);
    const frameId = baseId + currentFrame;
    imageUrl = baseImageUrl.replace(/id=\d+/, `id=${frameId}`);
  }

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={(e) => {
          e.currentTarget.src = "https://via.placeholder.com/400?text=Exercise";
        }}
      />

      {/* Frame counter */}
      {frameCount > 1 && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-semibold">
          {currentFrame + 1}/{frameCount}
        </div>
      )}

      {/* Animation indicator */}
      {frameCount > 1 && (
        <div className="absolute top-2 right-2 bg-blue-500 bg-opacity-80 text-white px-2 py-1 rounded text-xs font-semibold">
          🔄 Animated
        </div>
      )}
    </div>
  );
}
