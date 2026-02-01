/* eslint-disable @next/next/no-img-element */
import { Yoga } from "@/lib/types";
import { useState } from "react";

interface YogaCardProps {
  yoga: Yoga;
  onClick?: (yoga: Yoga) => void;
}

export default function YogaCard({ yoga, onClick }: YogaCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const localImagePath = `/yoga-images/${yoga.slug}/male.svg`;

  return (
    <div
      className="bg-white rounded shadow-sm p-1 cursor-pointer hover:shadow transition-shadow flex flex-col"
      onClick={() => onClick?.(yoga)}
    >
      <div className="w-full aspect-square flex-shrink-0 rounded overflow-hidden relative bg-gray-50">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
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
      <div className="pt-1">
        <h3 className="font-medium text-[11px] leading-tight line-clamp-2">{yoga.title}</h3>
        <p className="text-gray-400 text-[9px] truncate">{yoga.sanskrit_name}</p>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-gray-400 text-[9px]">{yoga.pose_category}</span>
          <span className="bg-green-100 text-green-700 text-[8px] px-1 py-0.5 rounded">
            {yoga.difficulty}
          </span>
        </div>
      </div>
    </div>
  );
}
