import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const results: Record<string, string> = {};
  const tries: Array<[string, () => Promise<unknown>]> = [
    ["postgres", async () => (await import("postgres")).default],
    ["drizzle-orm/postgres-js", async () => (await import("drizzle-orm/postgres-js")).drizzle],
    ["drizzle-orm", async () => (await import("drizzle-orm")).eq],
    ["@anthropic-ai/sdk", async () => (await import("@anthropic-ai/sdk")).default],
    ["exa-js", async () => (await import("exa-js")).default],
    ["@trpc/server", async () => (await import("@trpc/server")).initTRPC],
    [
      "@trpc/server/adapters/express",
      async () => (await import("@trpc/server/adapters/express")).createExpressMiddleware,
    ],
    ["express", async () => (await import("express")).default],
    ["../drizzle/schema", async () => (await import("../drizzle/schema")).briefs],
    ["../server/db", async () => (await import("../server/db")).getLatestBrief],
    ["../server/routers", async () => (await import("../server/routers")).appRouter],
    ["../server/search", async () => (await import("../server/search")).searchAllSections],
    ["../server/llm/anthropic", async () => (await import("../server/llm/anthropic")).synthesiseBrief],
  ];

  for (const [name, fn] of tries) {
    try {
      const v = await fn();
      results[name] = v ? "ok" : "loaded-null";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results[name] = `FAIL: ${msg.slice(0, 200)}`;
    }
  }

  res.status(200).json({ ok: true, results });
}
