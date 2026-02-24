export default function HomePage() {
  return (
    <main className="page">
      <h1>TRAVEL.aw Web</h1>
      <p className="subtitle">Seattle first-pass feature scaffold is available now.</p>
      <section className="section grid">
        <a className="card" href="/seattle">
          <strong>Open Seattle feature</strong>
          <p className="muted" style={{ marginBottom: 0 }}>
            Planning and in-city flows with deterministic category queries.
          </p>
        </a>
      </section>
    </main>
  );
}
