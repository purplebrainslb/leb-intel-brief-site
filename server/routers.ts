import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getLatestBrief } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  briefs: router({
    /**
     * Returns the latest published brief from the database.
     * Returns null if no brief has been published yet (falls back to static data on the frontend).
     */
    latest: publicProcedure.query(async () => {
      return getLatestBrief();
    }),
  }),
});

export type AppRouter = typeof appRouter;
