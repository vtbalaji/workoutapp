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
      className="bg-white rounded shadow p-2 cursor-pointer hover:shadow-md transition-shadow flex gap-2 items-center"
      onClick={() => onClick?.(exercise)}
    >
      <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden relative bg-gray-100">
        {(isLoading || profileLoading) && (
          <div className="absolute inset-0 bg-gray-300 animate-pulse z-10" />
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
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">{exercise.title}</h3>
        <p className="text-gray-500 text-xs truncate">{exercise.pose_category}</p>
      </div>
    </div>
  );
}
