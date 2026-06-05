import type { SearchHit } from "./exa";

const BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/news/search";

export async function braveSearch(opts: {
  query: string;
  numResults?: number;
  freshness?: "pd" | "pw" | "pm" | "py";
}): Promise<SearchHit[]> {
  const key = process.env.BRAVE_API_KEY;
  if (!key) throw new Error("BRAVE_API_KEY not set");

  const params = new URLSearchParams({
    q: opts.query,
    count: String(opts.numResults ?? 6),
    freshness: opts.freshness ?? "pd",
    safesearch: "moderate",
  });

  const res = await fetch(`${BRAVE_ENDPOINT}?${params.toString()}`, {
    headers: {
      "Accept": "application/json",
      "X-Subscription-Token": key,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brave search failed: ${res.status} ${res.statusText} ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    results?: Array<{
      title?: string;
      url?: string;
      description?: string;
      age?: string;
      page_age?: string;
      meta_url?: { hostname?: string };
    }>;
  };

  return (data.results ?? []).slice(0, opts.numResults ?? 6).map((r) => ({
    title: r.title ?? "",
    url: r.url ?? "",
    publishedDate: r.page_age ?? r.age ?? null,
    author: r.meta_url?.hostname ?? null,
    text: stripHtml(r.description ?? "").slice(0, 1500),
  }));
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
