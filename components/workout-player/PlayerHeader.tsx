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
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header info */}
      <div className="flex justify-between items-center px-6 py-4">
        <button
          onClick={onExit}
          className="text-gray-500 text-sm hover:text-gray-700"
        >
          Workout
        </button>
        <span className="font-semibold text-gray-900">
          {currentExercise} of {totalExercises}
        </span>
        <span className="text-gray-500 text-sm">{formatTime(totalSeconds)}</span>
      </div>
    </div>
  );
}
