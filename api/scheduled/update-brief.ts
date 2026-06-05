import { publishBrief, logBuildRun } from "../../server/db";
import type { BriefPayload } from "../../shared/types";

export const maxDuration = 30;

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function isAuthorized(req: Request): boolean {
  const provided = req.headers.get("x-brief-secret");
  const expected = process.env.BRIEF_UPDATE_SECRET;
  if (!expected || !provided) return false;
  return constantTimeEqual(provided, expected);
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }
  if (!isAuthorized(req)) {
    return json({ error: "unauthorized" }, 401);
  }

  const startedAt = new Date();
  let payload: BriefPayload;
  try {
    payload = (await req.json()) as BriefPayload;
  } catch {
    return json({ error: "invalid json body" }, 400);
  }

  if (!payload?.date || !payload?.lastUpdated) {
    return json({ error: "missing required fields: date, lastUpdated" }, 400);
  }
  if (!Array.isArray(payload.keyJudgments) || payload.keyJudgments.length === 0) {
    return json({ error: "keyJudgments must be a non-empty array" }, 400);
  }
  if (!Array.isArray(payload.sections) || payload.sections.length === 0) {
    return json({ error: "sections must be a non-empty array" }, 400);
  }
  if (!Array.isArray(payload.outlook30Days) || payload.outlook30Days.length === 0) {
    return json({ error: "outlook30Days must be a non-empty array" }, 400);
  }

  try {
    const briefId = await publishBrief(payload, "manual");
    await logBuildRun({ status: "success", briefId, searchProvider: "none", startedAt });
    console.log(`[update-brief] manual publish id=${briefId} date="${payload.date}"`);
    return json({ ok: true, briefId });
  } catch (err: any) {
    const message = err?.message ?? "unknown error";
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
    return json({ ok: false, error: message }, 500);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
