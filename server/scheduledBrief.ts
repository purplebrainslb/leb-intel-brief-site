import type { Request, Response } from "express";
import { publishBrief, type BriefPayload } from "./db";
import { sdk } from "./_core/sdk";

/**
 * POST /api/scheduled/update-brief
 *
 * Called by the scheduled agent task each morning. The agent researches
 * Lebanon news and POSTs a fully-structured brief payload.
 *
 * Authentication: Manus platform cron cookie (app_session_id JWT).
 * The sdk.authenticateRequest() verifies the cookie and sets user.isCron = true.
 * The agent injects $SCHEDULED_TASK_COOKIE as the app_session_id cookie.
 */
export async function updateBriefHandler(req: Request, res: Response) {
  try {
    // Authenticate via Manus platform cron cookie
    let user;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      return res.status(403).json({ error: "Forbidden: invalid or missing cron session" });
    }

    if (!user.isCron) {
      return res.status(403).json({ error: "Forbidden: cron-only endpoint" });
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
