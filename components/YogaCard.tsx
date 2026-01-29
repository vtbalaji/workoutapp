/* eslint-disable @next/next/no-img-element */
import { Yoga } from "@/lib/types";
import { useState } from "react";

interface YogaCardProps {
  yoga: Yoga;
  onClick?: (yoga: Yoga) => void;
}

export default function YogaCard({ yoga, onClick }: YogaCardProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Use local images from public/yoga-images/{slug}/male.svg
  const localImagePath = `/yoga-images/${yoga.slug}/male.svg`;

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick?.(yoga)}
    >
      <div className="aspect-[3/2] bg-gray-100 rounded-md mb-4 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-300 animate-pulse z-10" />
        )}
        <img
          src={localImagePath}
          alt={yoga.title}
          className="w-full h-full object-contain"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={(e) => {
            setIsLoading(false);
            e.currentTarget.src = "https://via.placeholder.com/300?text=Yoga";
          }}
        />
      </div>
      <p className="text-xs text-gray-500 mb-2">Male</p>
      <h3 className="font-semibold text-lg mb-1">{yoga.title}</h3>
      <p className="text-gray-500 text-sm mb-1">{yoga.sanskrit_name}</p>
      <p className="text-gray-600 text-sm mb-2">{yoga.pose_category}</p>
      <p className="text-gray-700 text-xs mb-3 line-clamp-2">{yoga.description}</p>
      <div className="flex items-center justify-between">
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
          {yoga.difficulty}
        </span>
      </div>
    </div>
  );
}
