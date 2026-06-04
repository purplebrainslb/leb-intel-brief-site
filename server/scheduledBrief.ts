import type { Request, Response } from "express";
import { publishBrief, type BriefPayload } from "./db";
import { ENV } from "./_core/env";

/**
 * POST /api/scheduled/update-brief
 *
 * Called by the scheduled agent task each morning. The agent researches
 * Lebanon news and POSTs a fully-structured brief payload.
 *
 * Authentication: static secret key via X-Brief-Secret header.
 * The key is stored in the BRIEF_UPDATE_SECRET environment variable.
 */
export async function updateBriefHandler(req: Request, res: Response) {
  try {
    // Authenticate via static secret key
    const providedSecret = req.headers["x-brief-secret"];
    const expectedSecret = ENV.briefUpdateSecret;

    if (!expectedSecret) {
      console.error("[Scheduled] BRIEF_UPDATE_SECRET env var not configured");
      return res.status(500).json({ error: "Server misconfiguration: secret not set" });
    }

    if (!providedSecret || providedSecret !== expectedSecret) {
      console.warn("[Scheduled] update-brief: invalid or missing X-Brief-Secret header");
      return res.status(403).json({ error: "Forbidden: invalid secret" });
    }

    const payload = req.body as BriefPayload;

    // Basic validation
    if (!payload.date || !payload.lastUpdated) {
      return res.status(400).json({ error: "Missing required fields: date, lastUpdated" });
    }
    if (!Array.isArray(payload.keyJudgments) || payload.keyJudgments.length === 0) {
      return res.status(400).json({ error: "keyJudgments must be a non-empty array" });
    }
    if (!Array.isArray(payload.sections) || payload.sections.length === 0) {
      return res.status(400).json({ error: "sections must be a non-empty array" });
    }
    if (!Array.isArray(payload.outlook30Days) || payload.outlook30Days.length === 0) {
      return res.status(400).json({ error: "outlook30Days must be a non-empty array" });
    }

    const briefId = await publishBrief(payload);

    console.log(`[Scheduled] Brief published: id=${briefId}, date=${payload.date}`);
    return res.json({ ok: true, briefId });
  } catch (error: any) {
    console.error("[Scheduled] update-brief error:", error);
    return res.status(500).json({
      error: error?.message ?? "Internal error",
      stack: error?.stack,
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}
