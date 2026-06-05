import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

export const severityEnum = pgEnum("severity", ["critical", "high", "medium", "low"]);

export const briefs = pgTable("briefs", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 64 }).notNull(),
  location: varchar("location", { length: 128 }).notNull().default("Beirut, Lebanon"),
  lastUpdated: varchar("last_updated", { length: 64 }).notNull(),
  isLatest: boolean("is_latest").notNull().default(false),
  source: varchar("source", { length: 32 }).notNull().default("auto"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Brief = typeof briefs.$inferSelect;
export type InsertBrief = typeof briefs.$inferInsert;

export const keyJudgments = pgTable("key_judgments", {
  id: serial("id").primaryKey(),
  briefId: integer("brief_id").notNull().references(() => briefs.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: severityEnum("severity").notNull(),
  region: varchar("region", { length: 128 }).notNull(),
});

export type KeyJudgment = typeof keyJudgments.$inferSelect;
export type InsertKeyJudgment = typeof keyJudgments.$inferInsert;

export const briefSections = pgTable("brief_sections", {
  id: serial("id").primaryKey(),
  briefId: integer("brief_id").notNull().references(() => briefs.id, { onDelete: "cascade" }),
  sectionKey: varchar("section_key", { length: 64 }).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  subtitle: varchar("subtitle", { length: 256 }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type BriefSection = typeof briefSections.$inferSelect;
export type InsertBriefSection = typeof briefSections.$inferInsert;

export const sectionItems = pgTable("section_items", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").notNull().references(() => briefSections.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  heading: text("heading").notNull(),
  content: text("content").notNull(),
  source: varchar("source", { length: 256 }).notNull(),
  sourceUrl: varchar("source_url", { length: 1024 }),
  severity: severityEnum("severity"),
});

export type SectionItem = typeof sectionItems.$inferSelect;
export type InsertSectionItem = typeof sectionItems.$inferInsert;

export const outlookItems = pgTable("outlook_items", {
  id: serial("id").primaryKey(),
  briefId: integer("brief_id").notNull().references(() => briefs.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  category: varchar("category", { length: 128 }).notNull(),
  assessment: varchar("assessment", { length: 256 }).notNull(),
  description: text("description").notNull(),
});

export type OutlookItem = typeof outlookItems.$inferSelect;
export type InsertOutlookItem = typeof outlookItems.$inferInsert;

export const buildRuns = pgTable("build_runs", {
  id: serial("id").primaryKey(),
  briefId: integer("brief_id").references(() => briefs.id, { onDelete: "set null" }),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: varchar("status", { length: 32 }).notNull(),
  searchProvider: varchar("search_provider", { length: 32 }),
  errorMessage: text("error_message"),
  durationMs: integer("duration_ms"),
});

export type BuildRun = typeof buildRuns.$inferSelect;
export type InsertBuildRun = typeof buildRuns.$inferInsert;
