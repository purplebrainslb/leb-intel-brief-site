import type { BriefSectionKey } from "../../shared/types";
import { exaSearch, type SearchHit } from "./exa";
import { braveSearch } from "./brave";

const LEBANESE_OUTLETS = [
  "lorientlejour.com",
  "naharnet.com",
  "aljoumhouria.com",
  "lbcgroup.tv",
  "lbci.tv",
  "aljadeed.tv",
  "lebanondebate.com",
  "al-akhbar.com",
  "mtv.com.lb",
  "nbn.com.lb",
  "annahar.com",
];

const INTL_OUTLETS = [
  "aljazeera.com",
  "reuters.com",
  "bbc.com",
  "bbc.co.uk",
  "apnews.com",
  "ap.org",
  "un.org",
  "longwarjournal.org",
  "timesofisrael.com",
  "understandingwar.org",
  "france24.com",
];

export type SectionSearchKey = BriefSectionKey;

export type SectionSearchSpec = {
  sectionKey: SectionSearchKey;
  prompt: string;
  query: string;
  domains: string[];
};

export const SECTION_SEARCHES: SectionSearchSpec[] = [
  {
    sectionKey: "international",
    prompt:
      "International conflict overview affecting Lebanon — Iran, US, Israel, Gaza, Red Sea, Iraq, diplomacy.",
    query:
      "Iran US Israel Lebanon Gaza conflict diplomacy Red Sea Iraq last 24 hours",
    domains: INTL_OUTLETS,
  },
  {
    sectionKey: "military",
    prompt:
      "Lebanon military situation — named towns, strikes, ground movements, evacuations, Hezbollah activity, Beirut/Dahieh/Mount Lebanon status.",
    query:
      "Lebanon Israeli strikes Hezbollah Dahieh South Lebanon Beirut last 24 hours",
    domains: [...LEBANESE_OUTLETS, "timesofisrael.com", "reuters.com", "apnews.com"],
  },
  {
    sectionKey: "government",
    prompt:
      "Lebanon government, LAF, internal security — cabinet, LAF redeployments, UNIFIL, arrests, checkpoints.",
    query:
      "Lebanon government cabinet Salam LAF UNIFIL internal security arrests last 24 hours",
    domains: [...LEBANESE_OUTLETS, "france24.com", "reuters.com"],
  },
  {
    sectionKey: "humanitarian",
    prompt:
      "Humanitarian / economic situation in Lebanon — displacement, casualties, hospitals, fuel, roads, airport, border, economy.",
    query:
      "Lebanon humanitarian displacement casualties hospitals economy fuel airport border last 24 hours",
    domains: [...LEBANESE_OUTLETS, "un.org", "reliefweb.int", "reuters.com"],
  },
  {
    sectionKey: "regional",
    prompt:
      "Regional developments directly affecting Lebanon — Iran, Iraqi militias, Yemen / Houthi, Syria spillover.",
    query:
      "Lebanon regional Iran Iraqi militias Houthi Yemen Syria spillover last 24 hours",
    domains: [...INTL_OUTLETS, "understandingwar.org"],
  },
];

export type SectionSearchResult = {
  sectionKey: SectionSearchKey;
  prompt: string;
  hits: SearchHit[];
  provider: "exa" | "brave";
};

function startPublishedDateIso(hoursBack = 48): string {
  return new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  backoffMs = 600
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, backoffMs * Math.pow(2, attempt)));
      }
    }
  }
  throw lastErr;
}

export async function searchAllSections(): Promise<{
  results: SectionSearchResult[];
  provider: "exa" | "brave" | "mixed";
}> {
  const startIso = startPublishedDateIso(36);

  const settled = await Promise.allSettled(
    SECTION_SEARCHES.map(async (spec): Promise<SectionSearchResult> => {
      try {
        const hits = await withRetry(() =>
          exaSearch({
            query: spec.query,
            numResults: 6,
            startPublishedDate: startIso,
            includeDomains: spec.domains,
          })
        );
        if (hits.length === 0) throw new Error("Exa returned 0 results");
        return { sectionKey: spec.sectionKey, prompt: spec.prompt, hits, provider: "exa" };
      } catch (exaErr) {
        const hits = await withRetry(() =>
          braveSearch({ query: spec.query, numResults: 6, freshness: "pd" })
        );
        return { sectionKey: spec.sectionKey, prompt: spec.prompt, hits, provider: "brave" };
      }
    })
  );

  const results: SectionSearchResult[] = [];
  for (const s of settled) {
    if (s.status === "fulfilled") results.push(s.value);
  }
  if (results.length === 0) {
    throw new Error("All section searches failed (Exa + Brave both unavailable)");
  }

  const providers = new Set(results.map((r) => r.provider));
  const provider: "exa" | "brave" | "mixed" =
    providers.size === 1 ? (results[0].provider) : "mixed";

  return { results, provider };
}
