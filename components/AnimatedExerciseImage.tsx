"use client";

import { useEffect, useRef } from "react";
import { WorkoutExercise } from "@/lib/types";
import { useUserProfile } from "@/hooks/useUserProfile";

interface AnimatedExerciseImageProps {
  exercise: WorkoutExercise;
  isPlaying?: boolean;
  opacity?: number;
  containerId?: string;
  overrideGender?: "male" | "female";
}

export default function AnimatedExerciseImage({
  exercise,
  isPlaying = true,
  opacity = 1,
  overrideGender,
}: AnimatedExerciseImageProps) {
  const { profile, loading } = useUserProfile();
  const gender = overrideGender || profile.gender;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastPlayingRef = useRef(isPlaying);
  const lastGenderRef = useRef(gender);

  // Send play/pause message to iframe when isPlaying changes
  useEffect(() => {
    if (lastPlayingRef.current !== isPlaying && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'setPlaying', playing: isPlaying },
        '*'
      );
      lastPlayingRef.current = isPlaying;
    }
  }, [isPlaying]);

  // Reload iframe when gender changes
  useEffect(() => {
    if (!loading && lastGenderRef.current !== gender && iframeRef.current) {
      const newSrc = `/svg-animator.html?slug=${encodeURIComponent(exercise.exerciseSlug || '')}&playing=${isPlaying}&gender=${gender}`;
      iframeRef.current.src = newSrc;
      lastGenderRef.current = gender;
    }
  }, [gender, loading, exercise.exerciseSlug, isPlaying]);

  if (!exercise.exerciseSlug) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4">💪</div>
          <p className="text-gray-400">{exercise.exerciseName}</p>
        </div>
      </div>
    );
  }

  const iframeSrc = `/svg-animator.html?slug=${encodeURIComponent(exercise.exerciseSlug)}&playing=${isPlaying}&gender=${gender}`;

  return (
    <iframe
      ref={iframeRef}
      src={iframeSrc}
      className="w-full h-full border-0"
      style={{ opacity, background: 'transparent' }}
      title={exercise.exerciseName}
      loading="eager"
    />
  );
}
