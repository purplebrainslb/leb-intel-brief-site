import Exa from "exa-js";

export type SearchHit = {
  title: string;
  url: string;
  publishedDate?: string | null;
  author?: string | null;
  text: string;
};

let _client: Exa | null = null;
function client() {
  if (!_client) {
    const key = process.env.EXA_API_KEY;
    if (!key) throw new Error("EXA_API_KEY not set");
    _client = new Exa(key);
  }
  return _client;
}

export async function exaSearch(opts: {
  query: string;
  numResults?: number;
  startPublishedDate?: string;
  includeDomains?: string[];
}): Promise<SearchHit[]> {
  const res = await client().searchAndContents(opts.query, {
    numResults: opts.numResults ?? 6,
    type: "auto",
    startPublishedDate: opts.startPublishedDate,
    includeDomains: opts.includeDomains,
    text: { maxCharacters: 1500 },
    livecrawl: "fallback",
  });

  return (res.results ?? []).map((r) => ({
    title: r.title ?? "",
    url: r.url,
    publishedDate: r.publishedDate ?? null,
    author: r.author ?? null,
    text: (r.text ?? "").trim().slice(0, 1500),
  }));
}
