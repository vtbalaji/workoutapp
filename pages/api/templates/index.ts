import type { NextApiRequest, NextApiResponse } from "next";
import { Template } from "@/lib/types";
import { verifyIdToken } from "@/lib/firebaseAdmin";
import {
  getTemplatesAdmin,
  saveTemplateAdmin
} from "@/lib/firestoreAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Template[] | Template | { error: string }>
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.substring(7);

  try {
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;

    if (req.method === "GET") {
      // Get all templates for user
      const templates = await getTemplatesAdmin(userId);
      return res.status(200).json(templates);
    } else if (req.method === "POST") {
      // Create new template
      const { name, description, category, exercises } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Template name is required" });
      }

      if (!exercises || exercises.length === 0) {
        return res.status(400).json({ error: "At least one exercise is required" });
      }

      const newTemplate: Template = {
        id: Date.now().toString(),
        userId,
        name,
        description: description || "",
        category: category || "custom",
        exercises,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedTemplate = await saveTemplateAdmin(userId, newTemplate);
      return res.status(201).json(savedTemplate);
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in templates API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
