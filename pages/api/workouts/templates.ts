import type { NextApiRequest, NextApiResponse } from "next";
import { sectionTemplates } from "@/lib/sectionTemplates";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return res.status(200).json(sectionTemplates);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
