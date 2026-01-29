"use client";

import { useState, useEffect } from "react";

interface Exercise {
  id: string;
  slug: string;
  title: string;
  description: string;
  pose_description: string;
  pose_category: string;
}

// CSS for SVG display
const animationStyles = `
  .svg-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .svg-container svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  /* Hide paths by default, no transition for instant switching */
  .svg-container svg path {
    transition: none;
  }
`;


export default function TestExercisePage() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageGender, setImageGender] = useState<"male" | "female">("male");
  const [svgContent, setSvgContent] = useState<string>("");
  const [loadingSvg, setLoadingSvg] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<1 | 2 | 3>(1);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch("/api/exercises");
        if (!response.ok) throw new Error("Failed to fetch exercises");
        const data = await response.json();

        // Find the "180 / Twisting Jump Squats" exercise
        const twistingJumpSquats = data.find(
          (ex: Exercise) => ex.title === "180 / Twisting Jump Squats"
        );

        if (twistingJumpSquats) {
          setExercise(twistingJumpSquats);
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // Fetch SVG content when exercise or gender changes
  useEffect(() => {
    if (!exercise) return;

    const fetchSvg = async () => {
      setLoadingSvg(true);
      try {
        // Use local image path based on slug
        const imageUrl = `/exercise-images/${exercise.slug}/${imageGender}.svg`;
        const response = await fetch(imageUrl);
        if (response.ok) {
          const svgText = await response.text();
          setSvgContent(svgText);
        }
      } catch (error) {
        console.error("Error fetching SVG:", error);
      } finally {
        setLoadingSvg(false);
      }
    };

    fetchSvg();
  }, [exercise, imageGender]);

  // Group paths by frame and apply transform to center each person
  useEffect(() => {
    if (!svgContent) return;

    const container = document.querySelector('.svg-container');
    if (!container) return;

    const svg = container.querySelector('svg');
    if (!svg) return;

    // Check if we already created frame groups
    let frameGroups = svg.querySelectorAll('g.frame-group');

    if (frameGroups.length === 0) {
      // First time: organize paths into frame groups
      const paths = Array.from(svg.querySelectorAll('path'));

      // Create 3 groups for 3 frames
      const group1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const group2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const group3 = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      group1.setAttribute('class', 'frame-group frame-1');
      group2.setAttribute('class', 'frame-group frame-2');
      group3.setAttribute('class', 'frame-group frame-3');

      // Sort paths into groups based on X-coordinate
      paths.forEach((path) => {
        const d = path.getAttribute('d') || '';
        const match = d.match(/M([\d.]+)/);
        if (match) {
          const x = parseFloat(match[1]);

          // Clone the path
          const clonedPath = path.cloneNode(true) as SVGPathElement;

          if (x < 300) {
            // Frame 1 (left) - translate right by ~270 to center (from ~180 to ~450)
            group1.appendChild(clonedPath);
          } else if (x < 600) {
            // Frame 2 (center) - already centered around ~420, translate slightly to ~450
            group2.appendChild(clonedPath);
          } else {
            // Frame 3 (right) - translate left by ~270 to center (from ~720 to ~450)
            group3.appendChild(clonedPath);
          }
        }
      });

      // Apply transforms to move each group to the same position
      // Left person original range: ~102-261, center at ~180
      // Center person original range: ~304-534, center at ~420
      // Right person original range: ~641-802, center at ~720
      // Target: move all to center at ~450 (middle of 900)
      group1.setAttribute('transform', 'translate(270, 0)'); // 180 + 270 = 450
      group2.setAttribute('transform', 'translate(30, 0)');  // 420 + 30 = 450
      group3.setAttribute('transform', 'translate(-270, 0)'); // 720 - 270 = 450

      // Remove original paths and add groups
      paths.forEach(p => p.remove());
      svg.appendChild(group1);
      svg.appendChild(group2);
      svg.appendChild(group3);

      frameGroups = svg.querySelectorAll('g.frame-group');
    }

    // Show/hide frame groups
    frameGroups.forEach((group) => {
      const isCurrentFrame = group.classList.contains(`frame-${currentFrame}`);
      (group as HTMLElement).style.display = isCurrentFrame ? 'block' : 'none';
    });
  }, [currentFrame, svgContent]);

  // Animation loop - cycle through frames
  useEffect(() => {
    if (!isAnimating || !svgContent) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev === 3) return 1;
        return (prev + 1) as 1 | 2 | 3;
      });
    }, 3000); // Change frame every 3 seconds

    return () => clearInterval(interval);
  }, [isAnimating, svgContent]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading exercise...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600">Exercise not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <style>{animationStyles}</style>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Test Exercise Display with Animation
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Exercise Title */}
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            {exercise.title}
          </h2>

          {/* Image Gender Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setImageGender("male")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                imageGender === "male"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setImageGender("female")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                imageGender === "female"
                  ? "bg-pink-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Female
            </button>
          </div>

          {/* Animation Toggle */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isAnimating
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {isAnimating ? "Stop Animation" : "Start Animation"}
            </button>
            {!isAnimating && (
              <>
                <button
                  onClick={() => setCurrentFrame(1)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentFrame === 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Frame 1
                </button>
                <button
                  onClick={() => setCurrentFrame(2)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentFrame === 2
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Frame 2
                </button>
                <button
                  onClick={() => setCurrentFrame(3)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentFrame === 3
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Frame 3
                </button>
              </>
            )}
          </div>

          {/* Exercise Image */}
          <div className="mb-6 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center h-96">
            {loadingSvg ? (
              <p className="text-gray-600">Loading SVG...</p>
            ) : svgContent ? (
              <div className={`svg-container frame-${currentFrame}`}>
                <div dangerouslySetInnerHTML={{ __html: svgContent }} />
              </div>
            ) : (
              <p className="text-gray-600">SVG not available</p>
            )}
          </div>

          {/* Exercise Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Slug</h3>
              <p className="text-gray-900">{exercise.slug}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-1">ID</h3>
              <p className="text-gray-900">{exercise.id}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Category</h3>
              <p className="text-gray-900">{exercise.pose_category}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Image Path</h3>
              <p className="text-gray-700 text-sm break-all">
                /exercise-images/{exercise.slug}/{imageGender}.svg
              </p>
            </div>

            {exercise.description && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {exercise.description}
                </p>
              </div>
            )}

            {exercise.pose_description && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Pose Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {exercise.pose_description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
