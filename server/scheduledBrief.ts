import type { Request, Response } from "express";
import { publishBrief, type BriefPayload } from "./db";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";

/**
 * POST /api/scheduled/update-brief
 *
 * Called by the scheduled AGENT task each morning. Accepts two auth methods:
 *
 * 1. Manus platform cron cookie (app_session_id JWT) — used when the Manus
 *    scheduler calls the endpoint directly via $SCHEDULED_TASK_COOKIE.
 *
 * 2. X-Brief-Secret header — used by the AGENT cron when it cannot reliably
 *    inject the cron cookie. The secret is stored in BRIEF_UPDATE_SECRET env var.
 */
export async function updateBriefHandler(req: Request, res: Response) {
  try {
    let authenticated = false;

    // Method 1: Manus platform cron cookie
    try {
      const user = await sdk.authenticateRequest(req);
      if (user.isCron) {
        authenticated = true;
      }
    } catch {
      // Not a valid cron session — fall through to secret check
    }

    // Method 2: X-Brief-Secret header (fallback for AGENT cron)
    if (!authenticated) {
      const providedSecret = req.headers["x-brief-secret"];
      const expectedSecret = ENV.briefUpdateSecret;

      if (expectedSecret && providedSecret === expectedSecret) {
        authenticated = true;
      }
    }

    if (!authenticated) {
      console.warn("[Scheduled] update-brief: authentication failed");
      return res.status(403).json({ error: "Forbidden: invalid credentials" });
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
