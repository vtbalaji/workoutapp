"use client";

import { useState, useEffect } from "react";

export default function DebugExerciseAPI() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch("/api/exercises");
        if (!response.ok) {
          throw new Error("Failed to fetch exercises");
        }
        const result = await response.json();
        setData({
          totalExercises: result.length,
          firstExercise: result[0],
          armCircles: result.find((ex: any) => ex.title === "Arm Circles"),
          sample3Exercises: result.slice(0, 3),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Debug: Exercise API Response</h1>

      {loading && <p className="text-gray-600">Loading...</p>}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {data && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Total Exercises: {data.totalExercises}</h2>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">First Exercise:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(data.firstExercise, null, 2)}
            </pre>
          </div>

          {data.armCircles && (
            <div>
              <h2 className="text-xl font-bold mb-2">Arm Circles Exercise:</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(data.armCircles, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold mb-2">Sample 3 Exercises:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(data.sample3Exercises, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
