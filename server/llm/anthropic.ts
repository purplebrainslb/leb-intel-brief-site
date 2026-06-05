import Anthropic from "@anthropic-ai/sdk";
import type {
  BriefPayload,
  BriefSectionPayload,
  BriefSectionKey,
  Severity,
} from "../../shared/types.js";
import type { SectionSearchResult } from "../search/index.js";

let _client: Anthropic | null = null;
function client() {
  if (!_client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY not set");
    _client = new Anthropic({ apiKey: key });
  }
  return _client;
}

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];
const SECTION_KEYS: BriefSectionKey[] = [
  "international",
  "military",
  "government",
  "humanitarian",
  "regional",
];

const SECTION_TITLES: Record<BriefSectionKey, string> = {
  international: "International Conflict Overview",
  military: "Lebanon – Military Situation",
  government: "Lebanon – Government, LAF, Internal Security",
  humanitarian: "Humanitarian / Economic Situation",
  regional: "Regional Developments Directly Affecting Lebanon",
};

const SYSTEM_PROMPT = `You are a senior intelligence analyst preparing the Lebanon Daily Intelligence Brief for a reader in Beirut.

Style: factual, terse, professional. No editorializing.

Severity rubric:
- critical: imminent threat to life, major escalation, ceasefire collapse, mass-casualty event, direct US-Iran exchange, attack on Beirut/Dahieh
- high: significant strike, named casualties, evacuation order, diplomatic stall, large humanitarian disruption
- medium: ongoing operations of moderate impact, political progress/setback, regional posture shifts
- low: routine activity, statements without action, minor economic data

Source-citation rules:
- For local Lebanese events, cite Lebanese outlets first (Naharnet, L'Orient Today, LBCI, MTV Lebanon, Al Jadeed, NBN, Al Akhbar).
- For regional/international events, cite international sources (Reuters, AP, BBC, Al Jazeera, Times of Israel, ISW).
- Always include the publisher in "source", e.g. "Naharnet" or "Reuters/AP".
- Include the article URL in "sourceUrl" when one is available in the search results.
- Flag unconfirmed items explicitly in the content: "Unconfirmed: ...".

Output rules:
- Exactly 5–7 keyJudgments covering the top developments of the last 24h.
- Exactly 5 sections with sectionKey values: international, military, government, humanitarian, regional.
- Each section has 3–6 items, in priority order.
- 4 outlook items with categories: Battlefield, Politics, Humanitarian, Regional Escalation.
- assessment must be one of: "Unchanged/Deteriorating", "Unchanged/Impasse", "More Likely to Deteriorate", "Elevated Risk", "Improving", "Stable".
- All text in en-GB / en-US neutral English. Place names in their conventional Latin spelling.`;

function formatHits(results: SectionSearchResult[]): string {
  let out = "";
  for (const section of results) {
    out += `\n## ${SECTION_TITLES[section.sectionKey]} (sectionKey: ${section.sectionKey})\n`;
    out += `Focus: ${section.prompt}\n`;
    section.hits.forEach((h, i) => {
      out += `\n[${section.sectionKey}-${i}] ${h.title}\n`;
      out += `URL: ${h.url}\n`;
      if (h.publishedDate) out += `Published: ${h.publishedDate}\n`;
      if (h.author) out += `Publisher: ${h.author}\n`;
      out += `${h.text}\n`;
    });
  }
  return out;
}

export type BuildBriefArgs = {
  date: string;
  lastUpdated: string;
  results: SectionSearchResult[];
};

export async function synthesiseBrief(args: BuildBriefArgs): Promise<BriefPayload> {
  const a = client();

  const userPrompt = `Today's date in Beirut: ${args.date}
Current UTC time: ${args.lastUpdated}

Below are search-result snippets grouped by section. Use them as your evidence base. Do not invent facts that are not supported. If a section's evidence is thin, still produce 3 items but mark anything you are extrapolating as "Unconfirmed".

${formatHits(args.results)}

Now produce the JSON brief.`;

  const tool: Anthropic.Tool = {
    name: "publish_brief",
    description:
      "Output the final structured Daily Intelligence Brief. Call this exactly once.",
    input_schema: {
      type: "object",
      required: ["date", "lastUpdated", "keyJudgments", "sections", "outlook30Days"],
      properties: {
        date: { type: "string" },
        location: { type: "string" },
        lastUpdated: { type: "string" },
        keyJudgments: {
          type: "array",
          minItems: 5,
          maxItems: 7,
          items: {
            type: "object",
            required: ["title", "description", "severity", "region"],
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              severity: { type: "string", enum: SEVERITIES },
              region: { type: "string" },
            },
          },
        },
        sections: {
          type: "array",
          minItems: 5,
          maxItems: 5,
          items: {
            type: "object",
            required: ["sectionKey", "title", "items"],
            properties: {
              sectionKey: { type: "string", enum: SECTION_KEYS },
              title: { type: "string" },
              subtitle: { type: "string" },
              items: {
                type: "array",
                minItems: 3,
                maxItems: 6,
                items: {
                  type: "object",
                  required: ["heading", "content", "source"],
                  properties: {
                    heading: { type: "string" },
                    content: { type: "string" },
                    source: { type: "string" },
                    sourceUrl: { type: "string" },
                    severity: { type: "string", enum: SEVERITIES },
                  },
                },
              },
            },
          },
        },
        outlook30Days: {
          type: "array",
          minItems: 4,
          maxItems: 4,
          items: {
            type: "object",
            required: ["category", "assessment", "description"],
            properties: {
              category: {
                type: "string",
                enum: ["Battlefield", "Politics", "Humanitarian", "Regional Escalation"],
              },
              assessment: { type: "string" },
              description: { type: "string" },
            },
          },
        },
      },
    },
  };

  const response = await a.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16384,
    system: SYSTEM_PROMPT,
    tools: [tool],
    tool_choice: { type: "tool", name: "publish_brief" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "publish_brief"
  );
  if (!toolUse) {
    throw new Error(
      `Claude did not call publish_brief tool. stop_reason=${response.stop_reason}, blocks=${response.content.map((b) => b.type).join(",")}`
    );
  }

  const payload = toolUse.input as BriefPayload;

  // Always use our pre-formatted date/timestamp — Claude likes to coerce to ISO
  payload.date = args.date;
  payload.lastUpdated = args.lastUpdated;

  if (response.stop_reason === "max_tokens") {
    console.warn(
      `[brief-builder] max_tokens stop. sections=${payload.sections?.length ?? 0}, judgments=${payload.keyJudgments?.length ?? 0}, outlook=${payload.outlook30Days?.length ?? 0}`
    );
  }
  console.log(
    `[brief-builder] stop_reason=${response.stop_reason}, usage_in=${response.usage.input_tokens}, usage_out=${response.usage.output_tokens}, judgments=${payload.keyJudgments?.length ?? 0}, sections=${payload.sections?.length ?? 0}, outlook=${payload.outlook30Days?.length ?? 0}`
  );

  validate(payload);

  if (!payload.location) payload.location = "Beirut, Lebanon";

  for (const section of payload.sections) {
    if (!section.title) section.title = SECTION_TITLES[section.sectionKey];
    if (!section.subtitle) section.subtitle = "Last 24 hours";
  }

  return payload;
}

function validate(p: BriefPayload) {
  if (!p.date || !p.lastUpdated) throw new Error("Brief missing date/lastUpdated");
  if (!Array.isArray(p.keyJudgments) || p.keyJudgments.length < 5) {
    throw new Error(`Need 5+ key judgments, got ${p.keyJudgments?.length ?? 0}`);
  }
  if (!Array.isArray(p.sections) || p.sections.length !== 5) {
    throw new Error(`Need 5 sections, got ${p.sections?.length ?? 0}`);
  }
  const gotKeys = new Set(p.sections.map((s) => s.sectionKey));
  for (const k of SECTION_KEYS) {
    if (!gotKeys.has(k)) throw new Error(`Missing section: ${k}`);
  }
  if (!Array.isArray(p.outlook30Days) || p.outlook30Days.length !== 4) {
    throw new Error(`Need 4 outlook items, got ${p.outlook30Days?.length ?? 0}`);
  }
}
