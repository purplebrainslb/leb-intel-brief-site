import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "../../server/routers.js";

export const maxDuration = 10;

let app: ReturnType<typeof express> | null = null;
function getApp() {
  if (!app) {
    app = express();
    app.use(express.json({ limit: "1mb" }));
    app.use(
      "/api/trpc",
      createExpressMiddleware({
        router: appRouter,
        createContext: () => ({}),
        onError({ error, path }) {
          console.error(`[tRPC] ${path ?? "?"}:`, error);
        },
      })
    );
  }
  return app;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  return getApp()(req, res);
}
