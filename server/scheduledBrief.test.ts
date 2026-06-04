import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  publishBrief: vi.fn().mockResolvedValue(1),
}));

// Mock the ENV
vi.mock("./_core/env", () => ({
  ENV: {
    briefUpdateSecret: "test-secret-key-abc123",
  },
}));

import { updateBriefHandler } from "./scheduledBrief";

const validPayload = {
  date: "June 4, 2026",
  lastUpdated: "2026-06-04T07:00:00Z",
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

function makeReq(secret: string | undefined, body = validPayload) {
  return {
    headers: { "x-brief-secret": secret },
    body,
    url: "/api/scheduled/update-brief",
  } as any;
}

function makeRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("updateBriefHandler", () => {
  it("returns 403 when secret is missing", async () => {
    const req = makeReq(undefined);
    const res = makeRes();
    await updateBriefHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining("Forbidden") }));
  });

  it("returns 403 when secret is wrong", async () => {
    const req = makeReq("wrong-secret");
    const res = makeRes();
    await updateBriefHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("returns ok:true when secret is correct and payload is valid", async () => {
    const req = makeReq("test-secret-key-abc123");
    const res = makeRes();
    await updateBriefHandler(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });

  it("returns 400 when keyJudgments is empty", async () => {
    const req = makeReq("test-secret-key-abc123", { ...validPayload, keyJudgments: [] });
    const res = makeRes();
    await updateBriefHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
