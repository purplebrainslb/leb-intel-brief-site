import { initTRPC } from "@trpc/server";
import { getLatestBrief, getRecentBuildRuns } from "./db";

const t = initTRPC.create();

export const appRouter = t.router({
  briefs: t.router({
    latest: t.procedure.query(async () => {
      return await getLatestBrief();
    }),
  }),
  build: t.router({
    recent: t.procedure.query(async () => {
      return await getRecentBuildRuns(10);
    }),
  }),
});

export type AppRouter = typeof appRouter;
