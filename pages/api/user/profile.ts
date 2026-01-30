import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import { verifyIdToken } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;

    if (req.method === "GET") {
      // Get user profile
      const db = admin.firestore();
      const userDoc = await db.collection("users").doc(userId).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const userData = userDoc.data();
      return res.status(200).json({
        displayName: userData?.displayName,
        weight: userData?.weight,
        height: userData?.height,
        gender: userData?.gender || "male",
      });
    } else if (req.method === "PUT") {
      // Update user profile
      const { displayName, weight, height, gender } = req.body;

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (displayName !== undefined) updateData.displayName = displayName;
      if (weight !== undefined) updateData.weight = weight;
      if (height !== undefined) updateData.height = height;
      if (gender !== undefined) updateData.gender = gender;

      const db = admin.firestore();
      await db.collection("users").doc(userId).set(updateData, { merge: true });

      return res.status(200).json({ success: true });
    } else {
      res.setHeader("Allow", ["GET", "PUT"]);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Profile API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
