import Link from 'next/link';

export default function HelpCenterPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Help Center</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/help/faq"
          className="rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="mb-2 text-lg font-semibold">FAQ</h2>
          <p className="text-sm text-zinc-500">
            Find answers to frequently asked questions about using travel.aw.
          </p>
        </Link>

        <Link
          href="/help/tickets"
          className="rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="mb-2 text-lg font-semibold">Support Tickets</h2>
          <p className="text-sm text-zinc-500">
            Create and manage support tickets for issues that need our help.
          </p>
        </Link>
      </div>
    </div>
  );
}
