import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { publishBrief, type BriefPayload } from "./db";

/**
 * POST /api/scheduled/update-brief
 *
 * Called by the AGENT cron each morning. The agent researches Lebanon news
 * and POSTs a fully-structured brief payload. This handler authenticates the
 * cron session, validates the payload shape, and publishes it to the database.
 */
export async function updateBriefHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);

    if (!user.isCron) {
      return res.status(403).json({ error: "cron-only endpoint" });
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
