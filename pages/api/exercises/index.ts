import type { NextApiRequest, NextApiResponse } from "next";
import { Exercise } from "@/lib/types";
import * as fs from "fs";
import * as path from "path";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Exercise[] | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const exerciseFile = path.join(process.cwd(), "data", "exercises.json");

    if (!fs.existsSync(exerciseFile)) {
      return res.status(404).json({ error: "Exercises file not found" });
    }

    const data = fs.readFileSync(exerciseFile, "utf-8");
    const exercises: Exercise[] = JSON.parse(data);

    res.status(200).json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
}
