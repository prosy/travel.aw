import { NextRequest, NextResponse } from "next/server";

const WIKI_SEARCH = "https://en.wikipedia.org/w/api.php";
const WIKI_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary";

interface WikiCard {
  title: string;
  description: string;
  imageUrl: string | null;
  thumbUrl: string | null;
  pageUrl: string;
  extract: string;
}

async function fetchSummary(title: string): Promise<WikiCard | null> {
  try {
    const res = await fetch(
      `${WIKI_SUMMARY}/${encodeURIComponent(title)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.type === "disambiguation") return null;

    return {
      title: data.titles?.normalized ?? title,
      description: data.description ?? "",
      imageUrl: data.originalimage?.source ?? data.thumbnail?.source ?? null,
      thumbUrl: data.thumbnail?.source ?? null,
      pageUrl: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      extract: data.extract ?? "",
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const limitParam = parseInt(searchParams.get("limit") ?? "20", 10);
  const limit = Math.min(Math.max(limitParam, 1), 40);

  if (!query) {
    return NextResponse.json({ error: "Missing ?q= parameter" }, { status: 400 });
  }

  try {
    const url = new URL(WIKI_SEARCH);
    url.searchParams.set("action", "query");
    url.searchParams.set("list", "search");
    url.searchParams.set("srsearch", query);
    url.searchParams.set("srlimit", String(limit + 10));
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*");

    const searchRes = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!searchRes.ok) {
      return NextResponse.json({ error: "Wikipedia search failed" }, { status: 502 });
    }

    const searchData = await searchRes.json();
    const titles: string[] = (searchData.query?.search ?? []).map(
      (r: { title: string }) => r.title
    );

    const summaries = await Promise.all(titles.map(fetchSummary));
    const cards = summaries
      .filter((s): s is WikiCard => s !== null && s.thumbUrl !== null)
      .slice(0, limit);

    return NextResponse.json({ query, cards });
  } catch (err) {
    console.error("GET /api/seattle/discover error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
