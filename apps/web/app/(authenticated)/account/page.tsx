import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Dashboard</h1>

      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Welcome back! Here&apos;s an overview of your travel account.
      </p>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 text-2xl">&#9992;</div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-zinc-500">Trips</p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 text-2xl">&#11088;</div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-zinc-500">Points Programs</p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 text-2xl">&#128101;</div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-zinc-500">Friends</p>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <p className="py-12 text-center text-zinc-500">No recent activity</p>
        </div>
      </section>
    </div>
  );
}
