import type { NextApiRequest, NextApiResponse } from "next";
import { Exercise } from "@/lib/types";
import * as fs from "fs";
import * as path from "path";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Exercise | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    const exerciseFile = path.join(process.cwd(), "data", "exercises.json");

    if (!fs.existsSync(exerciseFile)) {
      return res.status(404).json({ error: "Exercises file not found" });
    }

    const data = fs.readFileSync(exerciseFile, "utf-8");
    const exercises: Exercise[] = JSON.parse(data);

    const exercise = exercises.find((ex) => ex.id === id);

    if (!exercise) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    res.status(200).json(exercise);
  } catch (error) {
    console.error("Error fetching exercise:", error);
    res.status(500).json({ error: "Failed to fetch exercise" });
  }
}
