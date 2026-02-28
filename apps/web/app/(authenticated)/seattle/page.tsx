import Link from "next/link";

export default function SeattleIndexPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Seattle in TRAVEL.aw</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        First-pass feature entrypoint for Planning and While in Seattle decisions.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/seattle/planning"
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <strong>Planning</strong>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            What to do, what&apos;s going on, and what&apos;s around for pre-trip planning.
          </p>
        </Link>
        <Link
          href="/seattle/while-in-seattle"
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <strong>While in Seattle</strong>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Neighborhood-aware in-city guidance and quick context pivots.
          </p>
        </Link>
        <Link
          href="/seattle/while-in-seattle/sports"
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <strong>Sports</strong>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Auto-fires deterministic stored query <code>seattle_sports</code>.
          </p>
        </Link>
      </div>
    </div>
  );
}
