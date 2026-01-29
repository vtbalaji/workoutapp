import type { NextApiRequest, NextApiResponse } from "next";
import { verifyIdToken } from "@/lib/firebaseAdmin";
import admin from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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

    // Get all workouts for this user from Firestore
    const db = admin.firestore();
    const snapshot = await db
      .collection("workouts")
      .doc(userId)
      .collection("userWorkouts")
      .get();

    const workouts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Show what's in sections[0].exercises[0]
        firstExerciseDebug: data?.sections?.[0]?.exercises?.[0]
          ? {
              exerciseName: data.sections[0].exercises[0].exerciseName,
              imageUrl: data.sections[0].exercises[0].imageUrl,
              imageUrlExists: !!data.sections[0].exercises[0].imageUrl,
              imageUrlType: typeof data.sections[0].exercises[0].imageUrl,
            }
          : "No exercise found",
      };
    });

    return res.status(200).json({
      userId,
      workoutCount: workouts.length,
      workouts,
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
