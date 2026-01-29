import type { NextApiRequest, NextApiResponse } from "next";
import { Template } from "@/lib/types";
import { verifyIdToken } from "@/lib/firebaseAdmin";
import {
  getTemplateByIdAdmin,
  updateTemplateAdmin,
  deleteTemplateAdmin
} from "@/lib/firestoreAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Template | { error: string } | { message: string }>
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.substring(7);
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid template ID" });
  }

  try {
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;

    if (req.method === "GET") {
      // Get specific template
      const template = await getTemplateByIdAdmin(userId, id);

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      return res.status(200).json(template);
    } else if (req.method === "PUT") {
      // Update template
      const { name, description, category, exercises } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Template name is required" });
      }

      if (!exercises || exercises.length === 0) {
        return res.status(400).json({ error: "At least one exercise is required" });
      }

      const updatedTemplate: Template = {
        id,
        userId,
        name,
        description: description || "",
        category: category || "custom",
        exercises,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const saved = await updateTemplateAdmin(userId, id, updatedTemplate);

      if (!saved) {
        return res.status(404).json({ error: "Template not found" });
      }

      return res.status(200).json(saved);
    } else if (req.method === "DELETE") {
      // Delete template
      const success = await deleteTemplateAdmin(userId, id);

      if (!success) {
        return res.status(404).json({ error: "Template not found" });
      }

      return res.status(200).json({ message: "Template deleted successfully" });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in template [id] API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
