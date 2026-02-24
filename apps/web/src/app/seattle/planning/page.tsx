import { loadSeattleCatalog } from "../../../features/seattle/server/catalog";
import { parseIntentId, parseLimit, runSeattleQuery } from "../../../features/seattle/server/query";

type SearchProps = {
  searchParams?:
    | {
        intent?: string;
        near?: string;
        limit?: string;
      }
    | Promise<{
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
  const params = searchParams ? await Promise.resolve(searchParams) : undefined;
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
    <main className="page">
      <h1>Seattle Planning</h1>
      <p className="subtitle">Upfront planning phase for activities, events, and nearby context.</p>

      <section className="section page-grid">
        <div>
          <section className="tabs">
            {intents.map((intent) => (
              <a
                key={intent.id}
                className={`tab${intent.id === intentId ? " tab-active" : ""}`}
                href={buildHref(intent.id, near, limit)}
              >
                {intent.label}
              </a>
            ))}
          </section>

          <form method="get" className="section form-grid">
            <select name="intent" defaultValue={intentId} className="control">
              {intents.map((intent) => (
                <option key={intent.id} value={intent.id}>
                  {intent.label}
                </option>
              ))}
            </select>

            <select name="near" defaultValue={near ?? ""} className="control">
              <option value="">Any neighborhood</option>
              {neighborhoods.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <input type="hidden" name="limit" value={String(limit)} />
            <button type="submit" className="btn">Apply</button>
          </form>

          <section className="section stats muted">
            <span className="pill">phase={payload.report.phaseId}</span>
            <span className="pill">intent={payload.report.intentId}</span>
            <span className="pill">near={fmt(payload.report.near)}</span>
            <span className="pill">results={payload.report.resultCount}</span>
          </section>

          <section className="section grid">
            {payload.report.results.map((result) => {
              if ("cadence" in result) {
                return (
                  <article key={result.id} className="card">
                    <h3 style={{ margin: "0 0 8px 0" }}>{result.name}</h3>
                    <p className="muted" style={{ margin: 0 }}>{result.summary}</p>
                    <p className="muted" style={{ margin: "8px 0 0 0", fontSize: 13 }}>
                      cadence={result.cadence} neighborhood={result.neighborhood}
                    </p>
                  </article>
                );
              }

              return (
                <article key={result.id} className="card">
                  <h3 style={{ margin: "0 0 8px 0" }}>{result.name}</h3>
                  <p className="muted" style={{ margin: 0 }}>{result.summary}</p>
                  <p className="muted" style={{ margin: "8px 0 0 0", fontSize: 13 }}>
                    neighborhood={result.neighborhood} tags={result.tags.join(", ")}
                  </p>
                </article>
              );
            })}
          </section>

          <p className="section">
            <a href="/seattle/while-in-seattle/sports">Open Sports auto-fire page</a>
          </p>
        </div>

        <aside className="card card-soft sticky-panel">
          <h2 style={{ margin: "0 0 8px 0", fontSize: 18 }}>Query State</h2>
          <p className="muted" style={{ margin: 0 }}>
            Current planning query context for this page.
          </p>
          <div className="section grid" style={{ gap: 8 }}>
            <span className="pill">phase=planning_upfront</span>
            <span className="pill">intent={intentId}</span>
            <span className="pill">near={fmt(near)}</span>
            <span className="pill">limit={limit}</span>
            <span className="pill">results={payload.report.resultCount}</span>
          </div>
          <div className="section grid" style={{ gap: 8 }}>
            <a href={buildApiHref(intentId, near, limit)}>Open JSON API result</a>
            {activeTrigger ? (
              <a href="/seattle/while-in-seattle/sports">
                Trigger: {activeTrigger.storedQueryName}
              </a>
            ) : (
              <span className="muted">No sports trigger found.</span>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
