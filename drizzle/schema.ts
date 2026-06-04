import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Daily intelligence briefs — one row per published brief.
 * The agent cron inserts a new row each day.
 */
export const briefs = mysqlTable("briefs", {
  id: int("id").autoincrement().primaryKey(),
  /** Human-readable date string, e.g. "June 4, 2026" */
  date: varchar("date", { length: 64 }).notNull(),
  location: varchar("location", { length: 128 }).notNull().default("Beirut, Lebanon"),
  /** ISO 8601 timestamp of when the brief was compiled */
  lastUpdated: varchar("lastUpdated", { length: 64 }).notNull(),
  /** Whether this brief is the one shown on the homepage */
  isLatest: boolean("isLatest").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Brief = typeof briefs.$inferSelect;
export type InsertBrief = typeof briefs.$inferInsert;

/**
 * Key judgment cards shown in the hero section.
 */
export const keyJudgments = mysqlTable("key_judgments", {
  id: int("id").autoincrement().primaryKey(),
  briefId: int("briefId").notNull(),
  sortOrder: int("sortOrder").notNull().default(0),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).notNull(),
  region: varchar("region", { length: 128 }).notNull(),
});

export type KeyJudgment = typeof keyJudgments.$inferSelect;
export type InsertKeyJudgment = typeof keyJudgments.$inferInsert;

/**
 * Tabbed sections (International, Military, Government, Humanitarian, Regional).
 */
export const briefSections = mysqlTable("brief_sections", {
  id: int("id").autoincrement().primaryKey(),
  briefId: int("briefId").notNull(),
  /** Stable identifier used to match to a tab, e.g. "international" */
  sectionKey: varchar("sectionKey", { length: 64 }).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  subtitle: varchar("subtitle", { length: 256 }),
  sortOrder: int("sortOrder").notNull().default(0),
});

export type BriefSection = typeof briefSections.$inferSelect;
export type InsertBriefSection = typeof briefSections.$inferInsert;

/**
 * Individual news items within a section.
 */
export const sectionItems = mysqlTable("section_items", {
  id: int("id").autoincrement().primaryKey(),
  sectionId: int("sectionId").notNull(),
  sortOrder: int("sortOrder").notNull().default(0),
  heading: text("heading").notNull(),
  content: text("content").notNull(),
  source: varchar("source", { length: 256 }).notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]),
});

export type SectionItem = typeof sectionItems.$inferSelect;
export type InsertSectionItem = typeof sectionItems.$inferInsert;

/**
 * 30-day outlook cards.
 */
export const outlookItems = mysqlTable("outlook_items", {
  id: int("id").autoincrement().primaryKey(),
  briefId: int("briefId").notNull(),
  sortOrder: int("sortOrder").notNull().default(0),
  category: varchar("category", { length: 128 }).notNull(),
  assessment: varchar("assessment", { length: 256 }).notNull(),
  description: text("description").notNull(),
});

export type OutlookItem = typeof outlookItems.$inferSelect;
export type InsertOutlookItem = typeof outlookItems.$inferInsert;
