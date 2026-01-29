"use client";

import { useState, useEffect, useRef } from "react";
import { WorkoutExercise } from "@/lib/types";

interface AnimatedExerciseImageProps {
  exercise: WorkoutExercise;
  isPlaying?: boolean;
  opacity?: number;
  containerId?: string;
}

export default function AnimatedExerciseImage({
  exercise,
  isPlaying = true,
  opacity = 1,
  containerId = "svg-animation-container",
}: AnimatedExerciseImageProps) {
  const [processedSvg, setProcessedSvg] = useState<string>("");
  const [loadingSvg, setLoadingSvg] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState(exercise.animation_frames || 2);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(
    exercise.animation_orientation || 'horizontal'
  );

  // Fetch animation metadata from API if not present
  useEffect(() => {
    if (exercise.animation_frames !== undefined) return;
    if (!exercise.exerciseId && !exercise.exerciseSlug) return;

    const fetchMetadata = async () => {
      try {
        const response = await fetch('/api/exercises');
        const allExercises = await response.json();
        const fullExercise = allExercises.find((ex: any) =>
          ex.id === exercise.exerciseId || ex.slug === exercise.exerciseSlug
        );

        if (fullExercise) {
          setFrames(fullExercise.animation_frames || 2);
          setOrientation(fullExercise.animation_orientation || 'horizontal');
        }
      } catch (error) {
        console.error('Error fetching animation metadata:', error);
      }
    };

    fetchMetadata();
  }, [exercise.exerciseId, exercise.exerciseSlug, exercise.animation_frames]);

  // Fetch and process SVG
  useEffect(() => {
    const fetchAndProcessSvg = async () => {
      if (!exercise.exerciseSlug) return;

      setLoadingSvg(true);
      try {
        const localImagePath = `/exercise-images/${exercise.exerciseSlug}/male.svg`;
        const response = await fetch(localImagePath);
        if (!response.ok) {
          setLoadingSvg(false);
          return;
        }

        const svgText = await response.text();

        // If only 1 frame, no processing needed
        if (frames === 1) {
          setProcessedSvg(svgText);
          setLoadingSvg(false);
          return;
        }

        // Process SVG to create frame groups BEFORE rendering
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svg = doc.querySelector('svg');

        if (!svg) {
          setProcessedSvg(svgText);
          setLoadingSvg(false);
          return;
        }

        const paths = Array.from(svg.querySelectorAll('path'));

        // Extract coordinates
        const coords = paths.map(path => {
          const d = path.getAttribute('d') || '';
          const xMatch = d.match(/M([\d.]+)/);
          const yMatch = d.match(/M[\d.]+[,\s]+([\d.]+)/);
          return {
            path,
            x: xMatch ? parseFloat(xMatch[1]) : 0,
            y: yMatch ? parseFloat(yMatch[1]) : 0
          };
        }).filter(c => c.x > 0 || c.y > 0);

        if (coords.length === 0) {
          setProcessedSvg(svgText);
          setLoadingSvg(false);
          return;
        }

        const useCoord = orientation === 'horizontal' ? 'x' : 'y';
        const values = coords.map(c => c[useCoord]).sort((a, b) => a - b);
        const min = values[0];
        const max = values[values.length - 1];
        const range = max - min;

        // Create groups
        const groups: SVGGElement[] = [];
        for (let i = 0; i < frames; i++) {
          const group = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.setAttribute('class', `frame-group frame-${i + 1}`);
          group.setAttribute('style', i === 0 ? 'display: block' : 'display: none');
          groups.push(group);
        }

        // Distribute paths to frames
        coords.forEach(({ path, x, y }) => {
          const value = orientation === 'horizontal' ? x : y;
          const normalizedPos = (value - min) / range;

          let frameIndex = 0;
          if (frames === 2) {
            frameIndex = normalizedPos < 0.5 ? 0 : 1;
          } else if (frames === 3) {
            if (normalizedPos < 0.33) frameIndex = 0;
            else if (normalizedPos < 0.67) frameIndex = 1;
            else frameIndex = 2;
          }

          const clonedPath = path.cloneNode(true) as SVGPathElement;
          groups[frameIndex].appendChild(clonedPath);
        });

        // Calculate centers and apply transforms
        const frameCenters: number[] = [];
        groups.forEach((group) => {
          const groupPaths = Array.from(group.querySelectorAll('path'));
          const groupCoords = groupPaths.map(p => {
            const d = p.getAttribute('d') || '';
            const match = d.match(/M([\d.]+)[,\s]+([\d.]+)/);
            if (!match) return null;
            return {
              x: parseFloat(match[1]),
              y: parseFloat(match[2])
            };
          }).filter(c => c !== null);

          if (groupCoords.length > 0) {
            const coordValues = groupCoords.map(c => orientation === 'horizontal' ? c!.x : c!.y);
            const avg = coordValues.reduce((a, b) => a + b, 0) / coordValues.length;
            frameCenters.push(avg);
          } else {
            frameCenters.push(0);
          }
        });

        const targetCenter = (min + max) / 2;

        groups.forEach((group, index) => {
          const offset = targetCenter - frameCenters[index];
          if (orientation === 'horizontal') {
            group.setAttribute('transform', `translate(${offset.toFixed(0)}, 0)`);
          } else {
            group.setAttribute('transform', `translate(0, ${offset.toFixed(0)})`);
          }
        });

        // Remove original paths and add groups
        paths.forEach(p => p.remove());
        groups.forEach(g => svg.appendChild(g));

        // Serialize back to string
        const serializer = new XMLSerializer();
        const processedSvgString = serializer.serializeToString(svg);

        setProcessedSvg(processedSvgString);
        setLoadingSvg(false);
      } catch (error) {
        console.error("Error processing SVG:", error);
        setLoadingSvg(false);
      }
    };

    fetchAndProcessSvg();
  }, [exercise.exerciseSlug, frames, orientation]);

  // Show/hide frames based on currentFrame
  useEffect(() => {
    if (!containerRef.current || frames === 1) return;

    const frameGroups = containerRef.current.querySelectorAll('g.frame-group');
    frameGroups.forEach((group, index) => {
      const isCurrentFrame = (index + 1) === currentFrame;
      (group as HTMLElement).style.display = isCurrentFrame ? 'block' : 'none';
    });
  }, [currentFrame, frames]);

  // Auto-cycle animation frames
  useEffect(() => {
    if (!processedSvg || frames === 1 || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= frames) return 1;
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [processedSvg, frames, isPlaying]);

  if (loadingSvg) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!processedSvg) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4">💪</div>
          <p className="text-gray-400">{exercise.exerciseName}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id={containerId}
      className="svg-animation-container w-full h-full"
      style={{ opacity }}
      dangerouslySetInnerHTML={{ __html: processedSvg }}
    />
  );
}
