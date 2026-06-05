export type Severity = "critical" | "high" | "medium" | "low";

export type BriefSectionKey =
  | "international"
  | "military"
  | "government"
  | "humanitarian"
  | "regional";

export type BriefKeyJudgment = {
  title: string;
  description: string;
  severity: Severity;
  region: string;
};

export type BriefSectionItem = {
  heading: string;
  content: string;
  source: string;
  sourceUrl?: string | null;
  severity?: Severity | null;
};

export type BriefSectionPayload = {
  sectionKey: BriefSectionKey;
  title: string;
  subtitle?: string;
  items: BriefSectionItem[];
};

export type BriefOutlookItem = {
  category: string;
  assessment: string;
  description: string;
};

export type BriefPayload = {
  date: string;
  location?: string;
  lastUpdated: string;
  keyJudgments: BriefKeyJudgment[];
  sections: BriefSectionPayload[];
  outlook30Days: BriefOutlookItem[];
};

export type LatestBriefResponse =
  | (BriefPayload & {
      id: number;
      source: "auto" | "manual" | "seed";
      createdAt: string;
    })
  | null;
