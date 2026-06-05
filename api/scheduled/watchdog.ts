import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRecentBuildRuns } from "../../server/db.js";
import { notifySlack, staleBriefBlocks } from "../../server/notify/slack.js";

export const maxDuration = 30;

const STALE_HOURS = 24;

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function isAuthorized(req: VercelRequest): boolean {
  if (req.headers["x-vercel-cron"] === "1") return true;
  const secret = req.headers["x-brief-secret"];
  const expected = process.env.BRIEF_UPDATE_SECRET;
  return (
    !!expected && typeof secret === "string" && constantTimeEqual(secret, expected)
  );
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

  try {
    const runs = await getRecentBuildRuns(10);
    const now = Date.now();
    const latestRun = runs[0] ?? null;
    const latestSuccess = runs.find((r) => r.status === "success") ?? null;

    const ageHours = latestSuccess
      ? (now - latestSuccess.startedAt.getTime()) / 1000 / 60 / 60
      : null;

    const isStale = !latestSuccess || (ageHours != null && ageHours > STALE_HOURS);

    if (isStale) {
      console.warn(
        `[watchdog] stale: ageHours=${ageHours?.toFixed(1) ?? "n/a"}, latestStatus=${latestRun?.status ?? "none"}`
      );
      await notifySlack(
        `Lebanon Brief daily update is stale (last success: ${
          latestSuccess?.startedAt.toISOString() ?? "never"
        })`,
        staleBriefBlocks({
          lastSuccessAt: latestSuccess?.startedAt ?? null,
          ageHours,
          recentStatus: latestRun?.status ?? null,
        })
      );
      res.status(200).json({ alerted: true, ageHours, latestStatus: latestRun?.status ?? null });
      return;
    }

    res.status(200).json({
      alerted: false,
      ageHours: ageHours,
      latestStatus: latestRun?.status ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[watchdog] failed:", err);
    res.status(500).json({ ok: false, error: message });
  }
}
