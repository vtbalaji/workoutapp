"use client";

interface PlayerHeaderProps {
  progress: number;
  currentExercise: number;
  totalExercises: number;
  totalSeconds: number;
  onExit: () => void;
}

export default function PlayerHeader({
  progress,
  currentExercise,
  totalExercises,
  totalSeconds,
  onExit,
}: PlayerHeaderProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      {/* Thin progress bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header info */}
      <div className="flex justify-between items-center px-3 py-1.5">
        <button
          onClick={onExit}
          className="text-gray-500 text-base sm:text-lg hover:text-gray-700 px-1 py-0.5"
        >
          ← Exit
        </button>
        <span className="font-semibold text-gray-900 text-sm">
          {currentExercise}/{totalExercises}
        </span>
        <span className="text-gray-500 text-xs">{formatTime(totalSeconds)}</span>
      </div>
    </div>
  );
}
