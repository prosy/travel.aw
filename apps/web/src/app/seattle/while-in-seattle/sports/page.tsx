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
    <main className="page">
      <h1>Seattle Sports</h1>
      <p className="subtitle">
        Stored query fires on page open and renders deterministic Seattle sports context.
      </p>

      {loading && (
        <section className="section card">
          Loading stored query...
        </section>
      )}

      {error && (
        <section className="section card card-danger">
          <strong>Load failure:</strong> {error}
        </section>
      )}

      {!loading && payload && (
        <>
          <section className="section card card-soft">
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              trigger={payload.trigger?.id ?? "missing"} storedQuery={payload.trigger?.storedQueryName ?? "none"}
            </p>
            <p className="muted" style={{ margin: "6px 0 0 0", fontSize: 14 }}>
              phase={payload.trigger?.phaseId ?? "none"} intent={payload.trigger?.intentId ?? "none"} pageContext=
              {payload.trigger?.pageContext ?? "none"}
            </p>
          </section>

          {!validHtml ? (
            <section className="section card card-danger">
              <h2 style={{ margin: "0 0 8px 0" }}>Stored query unavailable</h2>
              <p style={{ margin: 0 }}>{resolved?.error ?? "Unknown error"}</p>
              <p style={{ margin: "10px 0 0 0", fontSize: 14 }}>
                Start Seattle wiki service at <code>http://127.0.0.1:8787</code> or set
                {" "}
                <code>SEATTLE_WIKI_API_BASE</code> for this web app.
              </p>
            </section>
          ) : (
            <section className="section grid">
              <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                source={resolved?.attribution?.source} page={resolved?.attribution?.page} section=
                {resolved?.attribution?.section} oldid={resolved?.attribution?.oldid}
              </p>

              <article className="card">
                <h2 style={{ margin: "0 0 8px 0", fontSize: 20 }}>Concise Summary</h2>
                <p className="muted" style={{ margin: 0 }}>
                  {parsed.summary || "Summary unavailable from current section payload."}
                </p>
              </article>

              <article className="card">
                <h2 style={{ margin: "0 0 10px 0", fontSize: 20 }}>Selected Clubs</h2>
                {parsed.rows.length === 0 ? (
                  <p className="muted" style={{ margin: 0 }}>
                    No table rows were parsed from the sports section.
                  </p>
                ) : (
                  <table className="sports-table">
                    <thead>
                      <tr>
                        <th>Club</th>
                        <th>Sport</th>
                        <th>League</th>
                        <th>Venue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.rows.map((row) => (
                        <tr key={`${row.club}-${row.league}`}>
                          <td>{row.club}</td>
                          <td>{row.sport}</td>
                          <td>{row.league}</td>
                          <td>{row.venue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </article>
            </section>
          )}
        </>
      )}
    </main>
  );
}
