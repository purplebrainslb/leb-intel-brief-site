import { searchAllSections } from "../../server/search";
import { synthesiseBrief } from "../../server/llm/anthropic";
import { publishBrief, logBuildRun } from "../../server/db";

export const config = {
  runtime: "nodejs",
  maxDuration: 120,
};

function isAuthorized(req: Request): boolean {
  // Vercel Cron Jobs add this header automatically when triggering /api/scheduled/*
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  if (isVercelCron) return true;

  // Manual override / external trigger
  const headerSecret = req.headers.get("x-brief-secret");
  const expected = process.env.BRIEF_UPDATE_SECRET;
  if (expected && headerSecret && constantTimeEqual(headerSecret, expected)) {
    return true;
  }
  return false;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function todayInBeirut(): string {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Beirut",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return fmt.format(new Date());
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST" && req.method !== "GET") {
    return json({ error: "method not allowed" }, 405);
  }
  if (!isAuthorized(req)) {
    return json({ error: "unauthorized" }, 401);
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

    return json({
      ok: true,
      briefId,
      date,
      searchProvider: provider,
      sectionCount: payload.sections.length,
      keyJudgmentCount: payload.keyJudgments.length,
    });
  } catch (err: any) {
    const message = err?.message ?? "unknown error";
    console.error("[build-brief] failed:", err);
    try {
      await logBuildRun({
        status: "failed",
        searchProvider: null,
        errorMessage: message.slice(0, 1000),
        startedAt,
      });
    } catch {
      /* swallow secondary failure */
    }
    return json(
      {
        ok: false,
        error: message,
        stack: process.env.NODE_ENV !== "production" ? err?.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      500
    );
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
