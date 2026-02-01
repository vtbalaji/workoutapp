/* eslint-disable @next/next/no-img-element */
import { Exercise } from "@/lib/types";
import { useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: (exercise: Exercise) => void;
}

export default function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { profile, loading: profileLoading } = useUserProfile();
  const gender = profile.gender;

  // Use local images from public/exercise-images/{slug}/{gender}.svg
  const localImagePath = `/exercise-images/${exercise.slug}/${gender}.svg`;

  return (
    <div
      className="bg-white rounded shadow-sm p-1 cursor-pointer hover:shadow transition-shadow flex flex-col"
      onClick={() => onClick?.(exercise)}
    >
      <div className="w-full aspect-square flex-shrink-0 rounded overflow-hidden relative bg-gray-50">
        {(isLoading || profileLoading) && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
        )}
        {!profileLoading && (
          <img
            src={localImagePath}
            alt={exercise.title}
            className="w-full h-full object-contain"
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={(e) => {
              setIsLoading(false);
              e.currentTarget.src = "https://via.placeholder.com/400?text=Exercise";
            }}
          />
        )}
      </div>
      <div className="pt-1">
        <h3 className="font-medium text-[11px] leading-tight line-clamp-2">{exercise.title}</h3>
        <p className="text-gray-400 text-[9px] truncate">{exercise.pose_category}</p>
      </div>
    </div>
  );
}
