import type { NextApiRequest, NextApiResponse } from "next";
import { Workout } from "@/lib/types";
import { getUserWorkoutsAdmin, saveWorkoutAdmin } from "@/lib/firestoreAdmin";
import { verifyIdToken } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Workout[] | Workout | { error: string }>
) {
  // Get the authorization token from the request headers
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    // Verify the token with Firebase Admin SDK
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;

    if (req.method === "GET") {
      // Get all workouts for the user
      const workouts = await getUserWorkoutsAdmin(userId);
      return res.status(200).json(workouts);
    } else if (req.method === "POST") {
      // Create a new workout
      const { workoutName, workoutDescription, difficulty, sections } = req.body;

      if (!workoutName || !sections) {
        return res.status(400).json({ error: "Missing required fields" });
      }


      const newWorkout: Workout = {
        id: Date.now().toString(),
        userId,
        workoutName,
        workoutDescription: workoutDescription || "",
        difficulty: difficulty || "Beginner",
        sections,
        targetMuscles: [],
        requiredEquipment: [],
        estimatedDuration: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };


      await saveWorkoutAdmin(userId, newWorkout);

      return res.status(201).json(newWorkout);
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in workouts API:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
