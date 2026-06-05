import type { VercelRequest, VercelResponse } from "@vercel/node";
import { publishBrief, logBuildRun } from "../../server/db";
import type { BriefPayload } from "../../shared/types";

export const maxDuration = 30;

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function isAuthorized(req: VercelRequest): boolean {
  const secret = req.headers["x-brief-secret"];
  const expected = process.env.BRIEF_UPDATE_SECRET;
  if (!expected || typeof secret !== "string") return false;
  return constantTimeEqual(secret, expected);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }
  if (!isAuthorized(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const startedAt = new Date();
  const payload = req.body as BriefPayload;

  if (!payload?.date || !payload?.lastUpdated) {
    res.status(400).json({ error: "missing required fields: date, lastUpdated" });
    return;
  }
  if (!Array.isArray(payload.keyJudgments) || payload.keyJudgments.length === 0) {
    res.status(400).json({ error: "keyJudgments must be a non-empty array" });
    return;
  }
  if (!Array.isArray(payload.sections) || payload.sections.length === 0) {
    res.status(400).json({ error: "sections must be a non-empty array" });
    return;
  }
  if (!Array.isArray(payload.outlook30Days) || payload.outlook30Days.length === 0) {
    res.status(400).json({ error: "outlook30Days must be a non-empty array" });
    return;
  }

  try {
    const briefId = await publishBrief(payload, "manual");
    await logBuildRun({ status: "success", briefId, searchProvider: "none", startedAt });
    res.status(200).json({ ok: true, briefId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[update-brief] failed:", err);
    try {
      await logBuildRun({
        status: "failed",
        errorMessage: message.slice(0, 1000),
        startedAt,
      });
    } catch {
      /* ignore */
    }
    res.status(500).json({ ok: false, error: message });
  }
}
