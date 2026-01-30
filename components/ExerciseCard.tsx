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
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick?.(exercise)}
    >
      <div className="aspect-[3/2] rounded-md mb-4 overflow-hidden relative bg-gray-100">
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
      <h3 className="font-semibold text-lg mb-2">{exercise.title}</h3>
      <p className="text-gray-600 text-sm mb-2">{exercise.pose_category}</p>
      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{exercise.description}</p>
      <div className="flex gap-2 flex-wrap">
        {exercise.primary_muscles && exercise.primary_muscles.length > 0 ? (
          exercise.primary_muscles.slice(0, 2).map((muscle, idx) => (
            <span
              key={idx}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
            >
              {muscle}
            </span>
          ))
        ) : (
          <span className="text-gray-500 text-xs">No muscles listed</span>
        )}
      </div>
    </div>
  );
}
