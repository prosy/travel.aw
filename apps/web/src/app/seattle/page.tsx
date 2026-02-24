export default function SeattleIndexPage() {
  return (
    <main className="page">
      <h1>Seattle in TRAVEL.aw</h1>
      <p className="subtitle">First-pass feature entrypoint for Planning and While in Seattle decisions.</p>

      <section className="section grid">
        <a href="/seattle/planning" className="card">
          <strong>Planning</strong>
          <p className="muted" style={{ marginBottom: 0 }}>
            What to do, what&apos;s going on, and what&apos;s around for pre-trip planning.
          </p>
        </a>
        <a href="/seattle/while-in-seattle" className="card">
          <strong>While in Seattle</strong>
          <p className="muted" style={{ marginBottom: 0 }}>
            Neighborhood-aware in-city guidance and quick context pivots.
          </p>
        </a>
        <a href="/seattle/while-in-seattle/sports" className="card">
          <strong>Sports</strong>
          <p className="muted" style={{ marginBottom: 0 }}>
            Auto-fires deterministic stored query <code>seattle_sports</code>.
          </p>
        </a>
      </section>
    </main>
  );
}
