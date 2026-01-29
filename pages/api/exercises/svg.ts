import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL parameter required" });
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    const response = await fetch(decodedUrl);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch SVG" });
    }

    const svgContent = await response.text();

    // Set appropriate headers for SVG content
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=3600");

    return res.status(200).send(svgContent);
  } catch (error) {
    console.error("Error fetching SVG:", error);
    return res.status(500).json({ error: "Failed to fetch SVG" });
  }
}
