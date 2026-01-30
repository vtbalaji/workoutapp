"use client";

interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular";
  width?: string;
  height?: string;
  className?: string;
}

export default function Skeleton({
  variant = "rectangular",
  width,
  height,
  className = "",
}: SkeletonProps) {
  const baseStyles = "animate-pulse bg-gray-200";

  const variantStyles = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style: React.CSSProperties = {
    width: width || (variant === "text" ? "100%" : undefined),
    height: height || (variant === "text" ? "1rem" : undefined),
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    />
  );
}

// Preset skeleton components for common use cases
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <Skeleton variant="text" width="60%" height="24px" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="rectangular" width="100%" height="160px" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width="100%" height="40px" />
        <Skeleton variant="rectangular" width="100%" height="40px" />
      </div>
    </div>
  );
}

export function SkeletonWorkoutCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <Skeleton variant="text" width="70%" height="24px" />
      <Skeleton variant="text" width="90%" height="16px" />
      <div className="grid grid-cols-3 gap-3 py-3 border-y">
        <div>
          <Skeleton variant="text" width="60%" height="12px" className="mb-2" />
          <Skeleton variant="text" width="40%" height="28px" />
        </div>
        <div>
          <Skeleton variant="text" width="60%" height="12px" className="mb-2" />
          <Skeleton variant="text" width="40%" height="28px" />
        </div>
        <div>
          <Skeleton variant="text" width="60%" height="12px" className="mb-2" />
          <Skeleton variant="text" width="40%" height="28px" />
        </div>
      </div>
      <Skeleton variant="rectangular" width="100%" height="48px" />
    </div>
  );
}

export function SkeletonExerciseCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4">
      <Skeleton variant="rectangular" width="160px" height="160px" />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" width="80%" height="24px" />
        <Skeleton variant="text" width="40%" height="16px" />
        <Skeleton variant="text" width="60%" height="16px" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <Skeleton variant="text" width="30%" height="20px" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b flex gap-4">
          <Skeleton variant="text" width="20%" />
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="25%" />
          <Skeleton variant="text" width="15%" />
        </div>
      ))}
    </div>
  );
}
