import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  publishBrief: vi.fn().mockResolvedValue(1),
}));

// Mock the sdk module
vi.mock("./_core/sdk", () => ({
  sdk: {
    authenticateRequest: vi.fn(),
  },
}));

// Mock the ENV
vi.mock("./_core/env", () => ({
  ENV: {
    briefUpdateSecret: "test-secret-key-abc123",
  },
}));

import { updateBriefHandler } from "./scheduledBrief";
import { sdk } from "./_core/sdk";
import { publishBrief } from "./db";

const validPayload = {
  date: "June 5, 2026",
  lastUpdated: "2026-06-05T07:00:00Z",
  keyJudgments: [
    { title: "Test", description: "Desc", severity: "high", region: "Beirut" },
  ],
  sections: [
    {
      sectionKey: "international",
      title: "International",
      subtitle: "Last 24h",
      items: [{ heading: "h", content: "c", source: "s", severity: "high" }],
    },
  ],
  outlook30Days: [
    { category: "Battlefield", assessment: "Unchanged/Deteriorating", description: "d" },
  ],
};

function makeReq(body = validPayload, opts: { secret?: string; cookie?: string } = {}) {
  const headers: Record<string, string> = {};
  if (opts.secret) headers["x-brief-secret"] = opts.secret;
  if (opts.cookie) headers["cookie"] = opts.cookie;
  return { headers, body, url: "/api/scheduled/update-brief" } as any;
}

function makeRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("updateBriefHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: sdk throws (no valid cron cookie)
    (sdk.authenticateRequest as any).mockRejectedValue(new Error("Invalid session"));
  });

  it("returns 403 when no auth is provided", async () => {
    const res = makeRes();
    await updateBriefHandler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining("Forbidden") }));
  });

  it("returns 403 when X-Brief-Secret is wrong", async () => {
    const res = makeRes();
    await updateBriefHandler(makeReq(validPayload, { secret: "wrong-secret" }), res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("returns ok:true when X-Brief-Secret is correct", async () => {
    const res = makeRes();
    await updateBriefHandler(makeReq(validPayload, { secret: "test-secret-key-abc123" }), res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, briefId: 1 }));
    expect(publishBrief).toHaveBeenCalledWith(validPayload);
  });

  it("returns ok:true when Manus cron cookie is valid", async () => {
    (sdk.authenticateRequest as any).mockResolvedValue({ isCron: true, taskUid: "task_123" });
    const res = makeRes();
    await updateBriefHandler(makeReq(validPayload, { cookie: "app_session_id=valid-jwt" }), res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, briefId: 1 }));
  });

  it("returns 403 when cron cookie belongs to a regular user (not cron)", async () => {
    (sdk.authenticateRequest as any).mockResolvedValue({ isCron: false, id: 1 });
    const res = makeRes();
    await updateBriefHandler(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("returns 400 when keyJudgments is empty", async () => {
    const res = makeRes();
    await updateBriefHandler(makeReq({ ...validPayload, keyJudgments: [] }, { secret: "test-secret-key-abc123" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
