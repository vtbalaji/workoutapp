import type { NextApiRequest, NextApiResponse } from "next";
import { Workout } from "@/lib/types";
import { getWorkoutByIdAdmin, saveWorkoutAdmin, deleteWorkoutByIdAdmin } from "@/lib/firestoreAdmin";
import { verifyIdToken } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Workout | { error: string }>
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.substring(7);
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid workout ID" });
  }

  try {
    // Verify the token with Firebase Admin SDK
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;

    if (req.method === "GET") {
      // Get the workout
      const workout = await getWorkoutByIdAdmin(userId, id);
      if (!workout) {
        return res.status(404).json({ error: "Workout not found" });
      }

      return res.status(200).json(workout);
    } else if (req.method === "PUT") {
      // Update the workout
      const workout = await getWorkoutByIdAdmin(userId, id);
      if (!workout) {
        return res.status(404).json({ error: "Workout not found" });
      }

      const updatedWorkout: Workout = {
        ...workout,
        ...req.body,
        id,
        userId,
        updatedAt: new Date(),
      };

      await saveWorkoutAdmin(userId, updatedWorkout);
      return res.status(200).json(updatedWorkout);
    } else if (req.method === "DELETE") {
      // Delete the workout
      const workout = await getWorkoutByIdAdmin(userId, id);
      if (!workout) {
        return res.status(404).json({ error: "Workout not found" });
      }

      await deleteWorkoutByIdAdmin(userId, id);
      return res.status(204).json({} as any);
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in workout API:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
