"use client";

import { useEffect, useMemo, useState } from "react";

type SportsApiPayload = {
  ok: boolean;
  trigger: {
    id: string;
    phaseId: string;
    intentId: string;
    pageContext: string;
    storedQueryName: string;
    description: string;
  } | null;
  wikiResponse: {
    ok?: boolean;
    html?: string;
    text?: string;
    error?: string;
    attribution?: {
      source: string;
      page: string;
      section: string;
      oldid: number;
    };
  };
};

type SportsTableRow = {
  club: string;
  sport: string;
  league: string;
  venue: string;
};

function stripTags(value: string): string {
  return value.replace(/\s+/g, " ").replace(/\[[^\]]+\]/g, "").trim();
}

function parseSummaryAndRows(html: string): {
  summary: string;
  rows: SportsTableRow[];
} {
  if (!html) return { summary: "", rows: [] };

  const parser = new DOMParser();
  const documentFragment = parser.parseFromString(html, "text/html");

  const summary =
    Array.from(documentFragment.querySelectorAll("p"))
      .map((p) => stripTags(p.textContent ?? ""))
      .find((line) => line.length > 120) ?? "";

  const table = documentFragment.querySelector("table.wikitable");
  if (!table) return { summary, rows: [] };

  const rows = Array.from(table.querySelectorAll("tr"))
    .slice(1)
    .map((row) => {
      const cells = Array.from(row.querySelectorAll("th,td")).map((cell) =>
        stripTags(cell.textContent ?? ""),
      );
      return {
        club: cells[0] ?? "",
        sport: cells[1] ?? "",
        league: cells[2] ?? "",
        venue: cells[3] ?? "",
      };
    })
    .filter((row) => row.club.length > 0)
    .slice(0, 8);

  return { summary, rows };
}

export default function SeattleSportsPage() {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<SportsApiPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function run(): Promise<void> {
      try {
        const response = await fetch("/api/seattle/sports", { cache: "no-store" });
        const data = (await response.json()) as SportsApiPayload;
        if (!mounted) return;
        setPayload(data);
      } catch (err) {
        if (!mounted) return;
        setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void run();
    return () => {
      mounted = false;
    };
  }, []);

  const resolved = useMemo(() => payload?.wikiResponse, [payload]);
  const parsed = useMemo(
    () => parseSummaryAndRows(resolved?.html ?? ""),
    [resolved?.html],
  );
  const validHtml = Boolean(resolved?.ok && resolved?.html);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Seattle Sports</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Stored query fires on page open and renders deterministic Seattle sports context.
      </p>

      {loading && (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          Loading stored query...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <strong>Load failure:</strong> {error}
        </div>
      )}

      {!loading && payload && (
        <>
          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              trigger={payload.trigger?.id ?? "missing"} storedQuery={payload.trigger?.storedQueryName ?? "none"}
            </p>
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              phase={payload.trigger?.phaseId ?? "none"} intent={payload.trigger?.intentId ?? "none"} pageContext=
              {payload.trigger?.pageContext ?? "none"}
            </p>
          </div>

          {!validHtml ? (
            <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <h2 className="mb-2 text-lg font-semibold">Stored query unavailable</h2>
              <p>{resolved?.error ?? "Unknown error"}</p>
              <p className="mt-2.5 text-sm">
                Start Seattle wiki service at <code>http://127.0.0.1:8787</code> or set
                {" "}
                <code>SEATTLE_WIKI_API_BASE</code> for this web app.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                source={resolved?.attribution?.source} page={resolved?.attribution?.page} section=
                {resolved?.attribution?.section} oldid={resolved?.attribution?.oldid}
              </p>

              <article className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-2 text-xl font-semibold">Concise Summary</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {parsed.summary || "Summary unavailable from current section payload."}
                </p>
              </article>

              <article className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-2.5 text-xl font-semibold">Selected Clubs</h2>
                {parsed.rows.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No table rows were parsed from the sports section.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium uppercase text-zinc-500">
                        <th className="pb-2">Club</th>
                        <th className="pb-2">Sport</th>
                        <th className="pb-2">League</th>
                        <th className="pb-2">Venue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.rows.map((row) => (
                        <tr key={`${row.club}-${row.league}`} className="border-t border-zinc-100 dark:border-zinc-800">
                          <td className="py-2">{row.club}</td>
                          <td className="py-2">{row.sport}</td>
                          <td className="py-2">{row.league}</td>
                          <td className="py-2">{row.venue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </article>
            </div>
          )}
        </>
      )}
    </div>
  );
}
