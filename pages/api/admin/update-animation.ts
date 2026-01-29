import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { slug, animation_frames, animation_orientation } = req.body;

    if (!slug || !animation_frames || !animation_orientation) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Read exercises.json
    const exercisesPath = path.join(process.cwd(), "data", "exercises.json");
    const exercisesData = fs.readFileSync(exercisesPath, "utf-8");
    const exercises = JSON.parse(exercisesData);

    // Find and update the exercise
    const exerciseIndex = exercises.findIndex((ex: any) => ex.slug === slug);

    if (exerciseIndex === -1) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    exercises[exerciseIndex].animation_frames = animation_frames;
    exercises[exerciseIndex].animation_orientation = animation_orientation;

    // Write back to file
    fs.writeFileSync(exercisesPath, JSON.stringify(exercises, null, 2));

    return res.status(200).json({
      success: true,
      exercise: exercises[exerciseIndex],
    });
  } catch (error) {
    console.error("Error updating animation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
