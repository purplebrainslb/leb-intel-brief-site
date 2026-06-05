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

function isAuthorized(req: VercelRequest): boolean {
  const cronHeader = req.headers["x-vercel-cron"];
  if (cronHeader === "1") return true;

  const secret = req.headers["x-brief-secret"];
  const expected = process.env.BRIEF_UPDATE_SECRET;
  if (expected && typeof secret === "string" && constantTimeEqual(secret, expected)) {
    return true;
  }
  return false;
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
  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }
  if (!isAuthorized(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const startedAt = new Date();
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
      `[build-brief] published id=${briefId} date="${date}" provider=${provider}`
    );

    res.status(200).json({
      ok: true,
      briefId,
      date,
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
