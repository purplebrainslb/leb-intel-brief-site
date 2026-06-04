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

import { updateBriefHandler } from "./scheduledBrief";
import { sdk } from "./_core/sdk";
import { publishBrief } from "./db";

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

function makeReq(body = validPayload, cookie?: string) {
  return {
    headers: cookie ? { cookie } : {},
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when sdk.authenticateRequest throws (no valid cookie)", async () => {
    (sdk.authenticateRequest as any).mockRejectedValue(new Error("Invalid session cookie"));
    const req = makeReq();
    const res = makeRes();
    await updateBriefHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining("Forbidden") }));
  });

  it("returns 403 when user is not a cron (regular user session)", async () => {
    (sdk.authenticateRequest as any).mockResolvedValue({ isCron: false, id: 1 });
    const req = makeReq();
    const res = makeRes();
    await updateBriefHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining("cron-only") }));
  });

  it("returns ok:true when cron auth succeeds and payload is valid", async () => {
    (sdk.authenticateRequest as any).mockResolvedValue({ isCron: true, taskUid: "task_123" });
    const req = makeReq();
    const res = makeRes();
    await updateBriefHandler(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, briefId: 1 }));
    expect(publishBrief).toHaveBeenCalledWith(validPayload);
  });

  it("returns 400 when keyJudgments is empty", async () => {
    (sdk.authenticateRequest as any).mockResolvedValue({ isCron: true, taskUid: "task_123" });
    const req = makeReq({ ...validPayload, keyJudgments: [] });
    const res = makeRes();
    await updateBriefHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
