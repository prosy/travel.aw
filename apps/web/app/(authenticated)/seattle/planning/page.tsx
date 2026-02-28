import Link from "next/link";
import { loadSeattleCatalog } from "@/app/_lib/seattle/catalog";
import { parseIntentId, parseLimit, runSeattleQuery } from "@/app/_lib/seattle/query";

type SearchProps = {
  searchParams?: Promise<{
    intent?: string;
    near?: string;
    limit?: string;
  }>;
};

const intents = [
  { id: "what_to_do", label: "What to do" },
  { id: "whats_going_on", label: "What's going on" },
  { id: "whats_around", label: "What's around" },
] as const;

function fmt(value?: string): string {
  return value && value.trim() ? value : "none";
}

function buildHref(intent: (typeof intents)[number]["id"], near: string | undefined, limit: number): string {
  const params = new URLSearchParams();
  params.set("intent", intent);
  if (near) params.set("near", near);
  params.set("limit", String(limit));
  return `/seattle/planning?${params.toString()}`;
}

function buildApiHref(intent: (typeof intents)[number]["id"], near: string | undefined, limit: number): string {
  const params = new URLSearchParams();
  params.set("phase", "planning_upfront");
  params.set("intent", intent);
  if (near) params.set("near", near);
  params.set("limit", String(limit));
  return `/api/seattle/query?${params.toString()}`;
}

export default async function SeattlePlanningPage({ searchParams }: SearchProps) {
  const params = searchParams ? await searchParams : undefined;
  const intentId = parseIntentId(params?.intent, "what_to_do");
  const near = params?.near?.trim() || undefined;
  const limit = parseLimit(params?.limit, 8);

  const [payload, catalog] = await Promise.all([
    runSeattleQuery({
      phaseId: "planning_upfront",
      intentId,
      near,
      limit,
    }),
    loadSeattleCatalog(),
  ]);

  const neighborhoods = [...new Set(catalog.places.map((p) => p.neighborhood))].sort();
  const activeTrigger = payload.triggers.find((item) => item.pageContext === "seattle_sports") ?? null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Seattle Planning</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Upfront planning phase for activities, events, and nearby context.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
            {intents.map((intent) => (
              <a
                key={intent.id}
                className={`px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200${
                  intent.id === intentId
                    ? " border-b-2 border-zinc-900 font-medium text-zinc-900 dark:border-white dark:text-white"
                    : ""
                }`}
                href={buildHref(intent.id, near, limit)}
              >
                {intent.label}
              </a>
            ))}
          </div>

          <form method="get" className="mt-4 flex flex-wrap items-end gap-3">
            <select name="intent" defaultValue={intentId} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {intents.map((intent) => (
                <option key={intent.id} value={intent.id}>
                  {intent.label}
                </option>
              ))}
            </select>

            <select name="near" defaultValue={near ?? ""} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <option value="">Any neighborhood</option>
              {neighborhoods.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <input type="hidden" name="limit" value={String(limit)} />
            <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700">
              Apply
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">phase={payload.report.phaseId}</span>
            <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">intent={payload.report.intentId}</span>
            <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">near={fmt(payload.report.near)}</span>
            <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">results={payload.report.resultCount}</span>
          </div>

          <div className="mt-6 grid gap-4">
            {payload.report.results.map((result) => {
              if ("cadence" in result) {
                return (
                  <article key={result.id} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-2 font-semibold">{result.name}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{result.summary}</p>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      cadence={result.cadence} neighborhood={result.neighborhood}
                    </p>
                  </article>
                );
              }

              return (
                <article key={result.id} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="mb-2 font-semibold">{result.name}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{result.summary}</p>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    neighborhood={result.neighborhood} tags={result.tags.join(", ")}
                  </p>
                </article>
              );
            })}
          </div>

          <p className="mt-6">
            <Link href="/seattle/while-in-seattle/sports" className="text-sm underline">
              Open Sports auto-fire page
            </Link>
          </p>
        </div>

        <aside className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 lg:sticky lg:top-6 lg:self-start">
          <h2 className="mb-2 text-lg font-semibold">Query State</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Current planning query context for this page.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">phase=planning_upfront</span>
            <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">intent={intentId}</span>
            <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">near={fmt(near)}</span>
            <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">limit={limit}</span>
            <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">results={payload.report.resultCount}</span>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <a href={buildApiHref(intentId, near, limit)} className="text-sm underline">
              Open JSON API result
            </a>
            {activeTrigger ? (
              <Link href="/seattle/while-in-seattle/sports" className="text-sm underline">
                Trigger: {activeTrigger.storedQueryName}
              </Link>
            ) : (
              <span className="text-sm text-zinc-500 dark:text-zinc-400">No sports trigger found.</span>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
