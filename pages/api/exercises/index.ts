import type { NextApiRequest, NextApiResponse } from "next";
import { Exercise } from "@/lib/types";
import exercisesData from "@/data/exercises.json";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Exercise[] | { error: string }>
) {
  if (req.method === "GET") {
    return res.status(200).json(exercisesData as Exercise[]);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
