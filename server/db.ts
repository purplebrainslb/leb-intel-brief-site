import { drizzle } from "drizzle-orm/postgres-js";
import { eq, desc } from "drizzle-orm";
import postgres from "postgres";
import {
  briefs,
  keyJudgments,
  briefSections,
  sectionItems,
  outlookItems,
  buildRuns,
  type InsertKeyJudgment,
  type InsertBriefSection,
  type InsertSectionItem,
  type InsertOutlookItem,
} from "../drizzle/schema";
import type {
  BriefPayload,
  LatestBriefResponse,
  Severity,
  BriefSectionKey,
} from "../shared/types";

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    _client = postgres(url, {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    _db = drizzle(_client);
  }
  return _db;
}

export async function getLatestBrief(): Promise<LatestBriefResponse> {
  const db = getDb();
  const rows = await db.select().from(briefs).where(eq(briefs.isLatest, true)).limit(1);
  if (rows.length === 0) return null;
  const brief = rows[0];

  const [judgments, sections, outlook] = await Promise.all([
    db
      .select()
      .from(keyJudgments)
      .where(eq(keyJudgments.briefId, brief.id))
      .orderBy(keyJudgments.sortOrder),
    db
      .select()
      .from(briefSections)
      .where(eq(briefSections.briefId, brief.id))
      .orderBy(briefSections.sortOrder),
    db
      .select()
      .from(outlookItems)
      .where(eq(outlookItems.briefId, brief.id))
      .orderBy(outlookItems.sortOrder),
  ]);

  const sectionsWithItems = await Promise.all(
    sections.map(async (s) => {
      const items = await db
        .select()
        .from(sectionItems)
        .where(eq(sectionItems.sectionId, s.id))
        .orderBy(sectionItems.sortOrder);
      return {
        sectionKey: s.sectionKey as BriefSectionKey,
        title: s.title,
        subtitle: s.subtitle ?? undefined,
        items: items.map((i) => ({
          heading: i.heading,
          content: i.content,
          source: i.source,
          sourceUrl: i.sourceUrl,
          severity: i.severity,
        })),
      };
    })
  );

  return {
    id: brief.id,
    date: brief.date,
    location: brief.location,
    lastUpdated: brief.lastUpdated,
    source: brief.source as "auto" | "manual" | "seed",
    createdAt: brief.createdAt.toISOString(),
    keyJudgments: judgments.map((j) => ({
      title: j.title,
      description: j.description,
      severity: j.severity as Severity,
      region: j.region,
    })),
    sections: sectionsWithItems,
    outlook30Days: outlook.map((o) => ({
      category: o.category,
      assessment: o.assessment,
      description: o.description,
    })),
  };
}

export async function publishBrief(
  payload: BriefPayload,
  source: "auto" | "manual" | "seed" = "auto"
): Promise<number> {
  const db = getDb();

  return await db.transaction(async (tx) => {
    await tx.update(briefs).set({ isLatest: false }).where(eq(briefs.isLatest, true));

    const [inserted] = await tx
      .insert(briefs)
      .values({
        date: payload.date,
        location: payload.location ?? "Beirut, Lebanon",
        lastUpdated: payload.lastUpdated,
        isLatest: true,
        source,
      })
      .returning({ id: briefs.id });
    const briefId = inserted.id;

    if (payload.keyJudgments.length > 0) {
      await tx.insert(keyJudgments).values(
        payload.keyJudgments.map((j, i) => ({
          briefId,
          sortOrder: i,
          title: j.title,
          description: j.description,
          severity: j.severity,
          region: j.region,
        } satisfies InsertKeyJudgment))
      );
    }

    for (let si = 0; si < payload.sections.length; si++) {
      const section = payload.sections[si];
      const [insertedSection] = await tx
        .insert(briefSections)
        .values({
          briefId,
          sectionKey: section.sectionKey,
          title: section.title,
          subtitle: section.subtitle ?? null,
          sortOrder: si,
        } satisfies InsertBriefSection)
        .returning({ id: briefSections.id });
      const sectionId = insertedSection.id;

      if (section.items.length > 0) {
        await tx.insert(sectionItems).values(
          section.items.map((item, ii) => ({
            sectionId,
            sortOrder: ii,
            heading: item.heading,
            content: item.content,
            source: item.source,
            sourceUrl: item.sourceUrl ?? null,
            severity: item.severity ?? null,
          } satisfies InsertSectionItem))
        );
      }
    }

    if (payload.outlook30Days.length > 0) {
      await tx.insert(outlookItems).values(
        payload.outlook30Days.map((o, i) => ({
          briefId,
          sortOrder: i,
          category: o.category,
          assessment: o.assessment,
          description: o.description,
        } satisfies InsertOutlookItem))
      );
    }

    return briefId;
  });
}

export async function logBuildRun(args: {
  status: "success" | "failed";
  briefId?: number | null;
  searchProvider?: "exa" | "brave" | "none" | null;
  errorMessage?: string | null;
  startedAt: Date;
}): Promise<void> {
  const db = getDb();
  const finishedAt = new Date();
  await db.insert(buildRuns).values({
    briefId: args.briefId ?? null,
    startedAt: args.startedAt,
    finishedAt,
    status: args.status,
    searchProvider: args.searchProvider ?? null,
    errorMessage: args.errorMessage ?? null,
    durationMs: finishedAt.getTime() - args.startedAt.getTime(),
  });
}

export async function getRecentBuildRuns(limit = 20) {
  const db = getDb();
  return await db.select().from(buildRuns).orderBy(desc(buildRuns.startedAt)).limit(limit);
}
