import Link from "next/link";
import { loadSeattleCatalog } from "@/app/_lib/seattle/catalog";
import { parseIntentId, parseLimit, runSeattleQuery } from "@/app/_lib/seattle/query";

const WIKI_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary";

type SearchProps = {
  searchParams?: Promise<{
    intent?: string;
    near?: string;
    limit?: string;
  }>;
};

const intents = [
  { id: "what_to_do", label: "What to Do" },
  { id: "whats_going_on", label: "What's Going On" },
  { id: "whats_around", label: "What's Around" },
] as const;

async function fetchThumb(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${WIKI_SUMMARY}/${encodeURIComponent(name + " Seattle")}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

export default async function WhileInSeattlePage({ searchParams }: SearchProps) {
  const params = searchParams ? await searchParams : undefined;
  const intentId = parseIntentId(params?.intent, "whats_around");
  const near = params?.near?.trim() || "downtown";
  const limit = parseLimit(params?.limit, 12);

  let catalog;
  let payload;
  let catalogError = false;

  try {
    [payload, catalog] = await Promise.all([
      runSeattleQuery({ phaseId: "while_in_seattle", intentId, near, limit }),
      loadSeattleCatalog(),
    ]);
  } catch {
    catalogError = true;
  }

  const neighborhoods = catalog
    ? [...new Set(catalog.places.map((p) => p.neighborhood))].sort()
    : [];

  const results = payload?.report.results ?? [];

  const thumbs = await Promise.all(
    results.map((r) => fetchThumb(r.name))
  );

  function buildHref(intent: string): string {
    const p = new URLSearchParams();
    p.set("intent", intent);
    p.set("near", near);
    p.set("limit", String(limit));
    return `/seattle/while-in-seattle?${p.toString()}`;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-6">
        {/* Header */}
        <div className="mb-2 flex items-center gap-3">
          <Link
            href="/seattle"
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </Link>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Explore</p>
            <h1 className="text-3xl font-bold">While You're Here</h1>
          </div>
        </div>

        <p className="mb-8 max-w-2xl text-sm text-zinc-400">
          In-city guide: what to do now, what's happening, and what's around your neighborhood.
        </p>

        {/* Sub-navigation */}
        <div className="mb-6 flex gap-4 border-b border-zinc-800 pb-3">
          <Link href="/seattle" className="text-sm text-zinc-500 hover:text-zinc-300 pb-3 -mb-3">
            Discover
          </Link>
          <Link href="/seattle/planning" className="text-sm text-zinc-500 hover:text-zinc-300 pb-3 -mb-3">
            Planning
          </Link>
          <Link href="/seattle/while-in-seattle" className="text-sm font-medium text-white border-b-2 border-white pb-3 -mb-3">
            While There
          </Link>
          <Link href="/seattle/while-in-seattle/sports" className="text-sm text-zinc-500 hover:text-zinc-300 pb-3 -mb-3">
            Sports
          </Link>
        </div>

        {catalogError && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
            Local catalog data unavailable. Showing limited results.
          </div>
        )}

        {/* Intent tabs + neighborhood filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {intents.map((intent) => (
            <a
              key={intent.id}
              href={buildHref(intent.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                intent.id === intentId
                  ? 'bg-white text-zinc-900'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {intent.label}
            </a>
          ))}

          {neighborhoods.length > 0 && (
            <form method="get" className="ml-auto flex items-center gap-2">
              <input type="hidden" name="intent" value={intentId} />
              <input type="hidden" name="limit" value={String(limit)} />
              <select
                name="near"
                defaultValue={near}
                className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300"
              >
                {neighborhoods.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-full bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
              >
                Filter
              </button>
            </form>
          )}
        </div>

        {/* Location badge */}
        <div className="mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-zinc-500">
            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433a19.695 19.695 0 002.683-2.006c1.9-1.7 3.945-4.286 3.945-7.843A7.5 7.5 0 002.5 8.5c0 3.557 2.045 6.143 3.945 7.843a19.695 19.695 0 002.683 2.006 12.335 12.335 0 001.038.573l.018.008.006.003zM10 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-zinc-500">
            Near {near} · {payload?.report.resultCount ?? 0} results
          </span>
        </div>

        {/* Image card grid */}
        {results.length === 0 ? (
          <p className="py-12 text-center text-zinc-500">No results found for this filter.</p>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {results.map((result, i) => {
              const thumb = thumbs[i];
              return (
                <div
                  key={result.id}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-zinc-900"
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={result.name}
                      className="w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-zinc-800 text-3xl">
                      {"cadence" in result ? "📅" : "📍"}
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white leading-snug">
                      {result.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                      {result.summary}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
                        {result.neighborhood}
                      </span>
                      {"tags" in result && result.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
                          {tag}
                        </span>
                      ))}
                      {"cadence" in result && (
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
                          {result.cadence}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
