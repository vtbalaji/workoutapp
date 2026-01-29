import type { NextApiRequest, NextApiResponse } from "next";
import { Workout } from "@/lib/types";
import { duplicateWorkoutAdmin } from "@/lib/firestoreAdmin";
import { verifyIdToken } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Workout | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.substring(7);
  const { sourceWorkoutId, newName } = req.body;

  if (!sourceWorkoutId || !newName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Verify the token with Firebase Admin SDK
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;

    // Duplicate the workout
    const newWorkout = await duplicateWorkoutAdmin(userId, sourceWorkoutId, newName);

    return res.status(201).json(newWorkout);
  } catch (error) {
    console.error("Error duplicating workout:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
