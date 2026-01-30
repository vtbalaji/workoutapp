"use client";

interface BottomControlsProps {
  playerState: "preview" | "active" | "rest" | "complete";
  isPaused: boolean;
  onPauseToggle: () => void;
  onNext: () => void;
}

export default function BottomControls({
  playerState,
  isPaused,
  onPauseToggle,
  onNext,
}: BottomControlsProps) {
  const getButtonText = () => {
    if (playerState === "preview") return "Start";
    if (playerState === "rest") return "Skip Rest";
    return "Next";
  };

  return (
    <div className="w-full bg-white border-t shadow-lg px-3 py-2">
      <div className="flex gap-2">
        <button
          onClick={onPauseToggle}
          className="w-12 h-10 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center"
        >
          {isPaused ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          )}
        </button>

        <button
          onClick={onNext}
          className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center justify-center gap-1 font-semibold text-sm"
        >
          {getButtonText()}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
