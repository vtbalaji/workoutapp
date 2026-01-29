/* eslint-disable @next/next/no-img-element */
"use client";

interface ExerciseCardImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
  style?: "silhouette" | "normal";
}

/**
 * Component to display exercise images as card-style silhouettes or normal images
 *
 * Uses CSS filters to convert colored SVG to black silhouette:
 * - brightness(0) makes everything black
 * - Works similar to WorkoutLabs' card images
 */
export default function ExerciseCardImage({
  imageUrl,
  alt,
  className = "",
  style = "silhouette"
}: ExerciseCardImageProps) {
  const filterStyle = style === "silhouette"
    ? { filter: "brightness(0) saturate(100%)", background: "white" }
    : {};

  return (
    <div className={`${className} flex items-center justify-center`}>
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-contain"
        style={filterStyle}
        onError={(e) => {
          e.currentTarget.src = "https://via.placeholder.com/400?text=Exercise";
        }}
      />
    </div>
  );
}
