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
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical' | 'random'>(
    exercise.animation_orientation || 'horizontal'
  );

  // Fetch animation metadata from API (always fetch to get latest data)
  useEffect(() => {
    if (!exercise.exerciseId && !exercise.exerciseSlug) return;

    const fetchMetadata = async () => {
      try {
        const response = await fetch('/api/exercises');
        const allExercises = await response.json();
        const fullExercise = allExercises.find((ex: any) =>
          ex.id === exercise.exerciseId || ex.slug === exercise.exerciseSlug
        );

        if (fullExercise) {
          // Use API data (latest) over cached workout data
          setFrames(fullExercise.animation_frames || exercise.animation_frames || 2);
          setOrientation(fullExercise.animation_orientation || exercise.animation_orientation || 'horizontal');
          console.log(`Loaded metadata for ${exercise.exerciseName}: frames=${fullExercise.animation_frames}, orientation=${fullExercise.animation_orientation}`);
        } else {
          // Fallback to workout data if not found in API
          setFrames(exercise.animation_frames || 2);
          setOrientation(exercise.animation_orientation || 'horizontal');
        }
      } catch (error) {
        console.error('Error fetching animation metadata:', error);
        // Fallback to workout data on error
        setFrames(exercise.animation_frames || 2);
        setOrientation(exercise.animation_orientation || 'horizontal');
      }
    };

    fetchMetadata();
  }, [exercise.exerciseId, exercise.exerciseSlug, exercise.animation_frames, exercise.animation_orientation, exercise.exerciseName]);

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

        // Check for pre-organized groups (WorkoutLabs format: <g id="a"> with nested children)
        const groupA = svg.querySelector('g[id="a"]');

        // Always log to see if groups exist
        if (groupA) {
          console.log(`Found group "a" with ${groupA.children.length} children for ${exercise.exerciseName} (frames needed: ${frames})`);
        }

        // Try to use pre-organized groups for ANY orientation if structure matches
        let framesToUse: Element[] = [];

        if (groupA && groupA.children.length >= frames) {
          // Use nested children of group "a" as frames
          const nestedGroups = Array.from(groupA.children).filter(child => child.tagName.toLowerCase() === 'g');
          if (nestedGroups.length >= frames) {
            framesToUse = nestedGroups;
            console.log(`✓ Using ${framesToUse.length} nested groups from group "a" (matches frames: ${frames})`);
          } else {
            console.log(`✗ Group "a" has ${nestedGroups.length} nested groups, but need ${frames} frames - using clustering`);
          }
        } else if (groupA) {
          console.log(`✗ Group "a" has ${groupA.children.length} children, need ${frames} - using clustering`);
        }

        // Only use pre-organized groups for horizontal/random (NOT vertical - those need clustering)
        if (framesToUse.length >= frames && orientation !== 'vertical') {

          const groupInfo = framesToUse.map((g, i) => ({
            index: i,
            childCount: g.children.length,
            pathCount: g.querySelectorAll('path').length
          }));
          console.log(`Frame details:`, groupInfo);

          // Use these groups - add frame-group class and show/hide
          console.log(`Using ${framesToUse.length} nested frames for ${exercise.exerciseName}`);

            // Calculate centers for centering transforms
            const viewBox = svg.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 900, 600];
            const [vbX, vbY, vbWidth, vbHeight] = viewBox;
            const targetCenterX = vbX + vbWidth / 2;
            const targetCenterY = vbY + vbHeight / 2;

            const frameCenters: { x: number; y: number }[] = [];
            framesToUse.forEach((group) => {
              const paths = group.querySelectorAll('path');
              const coords: { x: number; y: number }[] = [];

              paths.forEach(path => {
                const d = path.getAttribute('d') || '';
                const matches = d.match(/M([\d.]+)[,\s]+([\d.]+)/g) || [];
                matches.forEach(match => {
                  const [_, x, y] = match.match(/M([\d.]+)[,\s]+([\d.]+)/) || [];
                  if (x && y) coords.push({ x: parseFloat(x), y: parseFloat(y) });
                });
              });

              if (coords.length > 0) {
                const avgX = coords.reduce((sum, c) => sum + c.x, 0) / coords.length;
                const avgY = coords.reduce((sum, c) => sum + c.y, 0) / coords.length;
                frameCenters.push({ x: avgX, y: avgY });
              } else {
                frameCenters.push({ x: targetCenterX, y: targetCenterY });
              }
            });

            framesToUse.forEach((group, index) => {
              if (index < frames) {
                const offsetX = targetCenterX - frameCenters[index].x;
                const offsetY = targetCenterY - frameCenters[index].y;

                group.setAttribute('class', `frame-group frame-${index + 1}`);
                group.setAttribute('transform', `translate(${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);
                group.setAttribute('style', index === 0 ? 'display: block' : 'display: none');

                console.log(`Frame ${index + 1}: center=(${frameCenters[index].x.toFixed(1)},${frameCenters[index].y.toFixed(1)}), offset=(${offsetX.toFixed(1)},${offsetY.toFixed(1)})`);
              }
            });

            const serializer = new XMLSerializer();
            const processedSvgString = serializer.serializeToString(svg);
          setProcessedSvg(processedSvgString);
          setLoadingSvg(false);
          return;
        }

        // Use coordinate-based clustering for horizontal/vertical orientations
        console.log(`Using coordinate clustering for ${exercise.exerciseName} (orientation: ${orientation})`);

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
    console.log(`Showing frame ${currentFrame} of ${frames}, found ${frameGroups.length} frame groups`);

    frameGroups.forEach((group, index) => {
      const isCurrentFrame = (index + 1) === currentFrame;
      (group as HTMLElement).style.display = isCurrentFrame ? 'block' : 'none';
      if (isCurrentFrame) {
        console.log(`  - Frame ${index + 1} (${group.getAttribute('class')}) is visible`);
      }
    });
  }, [currentFrame, frames]);

  // Auto-cycle animation frames
  useEffect(() => {
    if (!processedSvg || frames === 1 || !isPlaying) return;

    console.log(`🔄 Animation effect started (frames=${frames})`);

    // Wait 1.5 seconds, then start cycling
    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = (prev % frames) + 1;
        console.log(`⏱️ Timer: ${prev} → ${next}`);
        return next;
      });
    }, 1500); // 1.5 seconds per frame

    return () => {
      console.log(`🛑 Animation cleanup`);
      clearInterval(interval);
    };
  }, [frames, isPlaying]); // REMOVED processedSvg and exerciseName - only depend on frames and isPlaying

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
