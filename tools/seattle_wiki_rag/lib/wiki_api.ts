const WIKI_API = "https://en.wikipedia.org/w/api.php";

type QueryRevisionsResponse = {
  query?: {
    pages?: Array<{
      pageid?: number;
      title?: string;
      revisions?: Array<{
        revid: number;
        timestamp: string;
      }>;
    }>;
  };
};

type ParseSectionsResponse = {
  parse?: {
    pageid: number;
    title: string;
    revid: number;
    sections: Array<{
      index: string;
      line: string;
      anchor: string;
      number: string;
      level: string;
      toclevel: number;
    }>;
  };
};

type ParseTextResponse = {
  parse?: {
    pageid: number;
    title: string;
    revid: number;
    text: string;
  };
};

async function fetchJson<T>(url: URL): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "user-agent": "travel.aw seattle_wiki_rag/1.0 (local dev)",
      accept: "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Wikipedia API error: ${res.status} ${res.statusText} ${body}`);
  }
  return (await res.json()) as T;
}

export type LatestRevision = { pageid: number; oldid: number; timestamp: string };

export async function getLatestRevision(title: string): Promise<LatestRevision> {
  const url = new URL(WIKI_API);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("prop", "revisions");
  url.searchParams.set("rvprop", "ids|timestamp");
  url.searchParams.set("rvlimit", "1");
  url.searchParams.set("titles", title);

  const data = await fetchJson<QueryRevisionsResponse>(url);
  const page = data.query?.pages?.[0];
  const rev = page?.revisions?.[0];
  const pageid = page?.pageid;
  if (!rev || typeof pageid !== "number") {
    throw new Error(`Could not resolve latest revision for title=${title}`);
  }
  return { pageid, oldid: rev.revid, timestamp: rev.timestamp };
}

export async function getRevisionById(oldid: number): Promise<{
  pageid: number;
  title: string;
  oldid: number;
  timestamp: string;
}> {
  const url = new URL(WIKI_API);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("prop", "revisions");
  url.searchParams.set("rvprop", "ids|timestamp");
  url.searchParams.set("revids", String(oldid));

  const data = await fetchJson<QueryRevisionsResponse>(url);
  const page = data.query?.pages?.[0];
  const rev = page?.revisions?.[0];
  const pageid = page?.pageid;
  const title = page?.title;
  if (!rev || typeof pageid !== "number" || typeof title !== "string") {
    throw new Error(`Could not resolve revision oldid=${oldid}`);
  }
  return { pageid, title, oldid: rev.revid, timestamp: rev.timestamp };
}

export type WikiSectionMeta = NonNullable<ParseSectionsResponse["parse"]>["sections"][number];

export async function getSections(title: string, oldid: number): Promise<{
  pageid: number;
  revid: number;
  sections: WikiSectionMeta[];
}> {
  const url = new URL(WIKI_API);
  url.searchParams.set("action", "parse");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("page", title);
  url.searchParams.set("oldid", String(oldid));
  url.searchParams.set("prop", "sections");

  const data = await fetchJson<ParseSectionsResponse>(url);
  if (!data.parse) throw new Error(`Could not parse sections for title=${title} oldid=${oldid}`);
  return { pageid: data.parse.pageid, revid: data.parse.revid, sections: data.parse.sections };
}

export async function getSectionHtml(
  title: string,
  oldid: number,
  sectionIndex: string,
): Promise<{ pageid: number; revid: number; html: string }> {
  const url = new URL(WIKI_API);
  url.searchParams.set("action", "parse");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("page", title);
  url.searchParams.set("oldid", String(oldid));
  url.searchParams.set("prop", "text");
  url.searchParams.set("section", sectionIndex);

  const data = await fetchJson<ParseTextResponse>(url);
  if (!data.parse) {
    throw new Error(
      `Could not parse text for title=${title} oldid=${oldid} section=${sectionIndex}`,
    );
  }
  return { pageid: data.parse.pageid, revid: data.parse.revid, html: data.parse.text };
}

export function wikiApiEndpoint(): string {
  return WIKI_API;
}
