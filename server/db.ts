import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  briefs,
  keyJudgments,
  briefSections,
  sectionItems,
  outlookItems,
  type InsertBrief,
  type InsertKeyJudgment,
  type InsertBriefSection,
  type InsertSectionItem,
  type InsertOutlookItem,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Briefing helpers ────────────────────────────────────────────────────────

/**
 * Fetch the latest brief with all its nested data.
 * Returns null if no brief has been published yet.
 */
export async function getLatestBrief() {
  const db = await getDb();
  if (!db) return null;

  const briefRows = await db
    .select()
    .from(briefs)
    .where(eq(briefs.isLatest, true))
    .limit(1);

  if (briefRows.length === 0) return null;
  const brief = briefRows[0];

  const [judgments, sections, outlook] = await Promise.all([
    db.select().from(keyJudgments).where(eq(keyJudgments.briefId, brief.id)),
    db.select().from(briefSections).where(eq(briefSections.briefId, brief.id)),
    db.select().from(outlookItems).where(eq(outlookItems.briefId, brief.id)),
  ]);

  // Sort by sortOrder
  judgments.sort((a, b) => a.sortOrder - b.sortOrder);
  sections.sort((a, b) => a.sortOrder - b.sortOrder);
  outlook.sort((a, b) => a.sortOrder - b.sortOrder);

  // Fetch items for each section
  const sectionsWithItems = await Promise.all(
    sections.map(async (section) => {
      const items = await db
        .select()
        .from(sectionItems)
        .where(eq(sectionItems.sectionId, section.id));
      items.sort((a, b) => a.sortOrder - b.sortOrder);
      return { ...section, items };
    })
  );

  return {
    ...brief,
    keyJudgments: judgments,
    sections: sectionsWithItems,
    outlook30Days: outlook,
  };
}

export type BriefPayload = {
  date: string;
  location: string;
  lastUpdated: string;
  keyJudgments: Array<{
    title: string;
    description: string;
    severity: "critical" | "high" | "medium" | "low";
    region: string;
  }>;
  sections: Array<{
    sectionKey: string;
    title: string;
    subtitle?: string;
    items: Array<{
      heading: string;
      content: string;
      source: string;
      severity?: "critical" | "high" | "medium" | "low";
    }>;
  }>;
  outlook30Days: Array<{
    category: string;
    assessment: string;
    description: string;
  }>;
};

/**
 * Atomically replace the current latest brief with a new one.
 * Marks the previous latest as not-latest, inserts the new brief and all
 * its nested rows, then marks the new brief as latest.
 */
export async function publishBrief(payload: BriefPayload): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Clear the current latest flag
  await db.update(briefs).set({ isLatest: false }).where(eq(briefs.isLatest, true));

  // Insert the new brief
  const [briefResult] = await db.insert(briefs).values({
    date: payload.date,
    location: payload.location || "Beirut, Lebanon",
    lastUpdated: payload.lastUpdated,
    isLatest: true,
  });
  const briefId = (briefResult as any).insertId as number;

  // Insert key judgments
  if (payload.keyJudgments.length > 0) {
    await db.insert(keyJudgments).values(
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

  // Insert sections and their items
  for (let si = 0; si < payload.sections.length; si++) {
    const section = payload.sections[si];
    const [secResult] = await db.insert(briefSections).values({
      briefId,
      sectionKey: section.sectionKey,
      title: section.title,
      subtitle: section.subtitle ?? null,
      sortOrder: si,
    } satisfies InsertBriefSection);
    const sectionId = (secResult as any).insertId as number;

    if (section.items.length > 0) {
      await db.insert(sectionItems).values(
        section.items.map((item, ii) => ({
          sectionId,
          sortOrder: ii,
          heading: item.heading,
          content: item.content,
          source: item.source,
          severity: item.severity ?? null,
        } satisfies InsertSectionItem))
      );
    }
  }

  // Insert outlook items
  if (payload.outlook30Days.length > 0) {
    await db.insert(outlookItems).values(
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
}
