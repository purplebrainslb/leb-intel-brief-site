import type { VercelRequest, VercelResponse } from "@vercel/node";
import { searchAllSections } from "../../server/search/index.js";
import { synthesiseBrief } from "../../server/llm/anthropic.js";
import { publishBrief, logBuildRun } from "../../server/db.js";
import { notifySlack, buildFailureBlocks } from "../../server/notify/slack.js";

export const maxDuration = 300;

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

type AuthMethod = "vercel-cron-header" | "vercel-cron-bearer" | "brief-secret" | "none";

function classifyAuth(req: VercelRequest): AuthMethod {
  if (req.headers["x-vercel-cron"] === "1") return "vercel-cron-header";

  const authHeader = req.headers["authorization"];
  const cronSecret = process.env.CRON_SECRET;
  if (
    cronSecret &&
    typeof authHeader === "string" &&
    authHeader.startsWith("Bearer ") &&
    constantTimeEqual(authHeader.slice(7), cronSecret)
  ) {
    return "vercel-cron-bearer";
  }

  const briefSecret = req.headers["x-brief-secret"];
  const expectedBrief = process.env.BRIEF_UPDATE_SECRET;
  if (
    expectedBrief &&
    typeof briefSecret === "string" &&
    constantTimeEqual(briefSecret, expectedBrief)
  ) {
    return "brief-secret";
  }
  return "none";
}

function summariseHeaders(req: VercelRequest): string {
  const interesting = [
    "user-agent",
    "x-vercel-cron",
    "x-vercel-id",
    "x-forwarded-for",
    "x-vercel-deployment-url",
    "x-vercel-proxy-signature-ts",
  ];
  const seen: string[] = [];
  for (const k of interesting) {
    const v = req.headers[k];
    if (v) seen.push(`${k}=${String(v).slice(0, 80)}`);
  }
  const authHeader = req.headers["authorization"];
  if (typeof authHeader === "string") {
    seen.push(`authorization=${authHeader.split(" ")[0]} (length ${authHeader.length})`);
  }
  return seen.join(" | ");
}

function todayInBeirut(): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Beirut",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startedAt = new Date();

  // ALWAYS log the invocation upfront so we can audit every cron hit, even
  // ones that get rejected by auth. The previous version returned 401 silently
  // and we had no record of whether Vercel cron was firing at all.
  const auth = classifyAuth(req);
  const headerSummary = summariseHeaders(req);
  console.log(
    `[build-brief] invocation method=${req.method} auth=${auth} headers={${headerSummary}}`
  );

  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  if (auth === "none") {
    // Record auth failures in the same table so we can see them in build.recent
    try {
      await logBuildRun({
        status: "failed",
        searchProvider: null,
        errorMessage: `auth rejected (no valid header) | ${headerSummary.slice(0, 800)}`,
        startedAt,
      });
    } catch {
      /* don't let logging failure mask the auth failure */
    }
    res.status(401).json({ error: "unauthorized", method: req.method });
    return;
  }

  try {
    const date = todayInBeirut();
    const lastUpdated = new Date().toISOString();

    const { results, provider } = await searchAllSections();
    const payload = await synthesiseBrief({ date, lastUpdated, results });
    const briefId = await publishBrief(payload, "auto");

    await logBuildRun({
      status: "success",
      briefId,
      searchProvider: provider === "mixed" ? "exa" : provider,
      startedAt,
    });

    console.log(
      `[build-brief] published id=${briefId} date="${date}" provider=${provider} via auth=${auth}`
    );

    res.status(200).json({
      ok: true,
      briefId,
      date,
      authMethod: auth,
      searchProvider: provider,
      sectionCount: payload.sections.length,
      keyJudgmentCount: payload.keyJudgments.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[build-brief] failed:", err);
    const durationMs = Date.now() - startedAt.getTime();
    try {
      await logBuildRun({
        status: "failed",
        searchProvider: null,
        errorMessage: message.slice(0, 1000),
        startedAt,
      });
    } catch {
      /* swallow */
    }
    await notifySlack(
      `Lebanon Brief daily build failed: ${message.slice(0, 200)}`,
      buildFailureBlocks({ errorMessage: message, durationMs, startedAt })
    );
    res.status(500).json({
      ok: false,
      error: message,
      stack: process.env.NODE_ENV !== "production" ? stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}
