import Link from 'next/link';

export default function SafetyCenterPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Safety Center</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/safety/contacts"
          className="rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="mb-2 text-lg font-semibold">Emergency Contacts</h2>
          <p className="text-sm text-zinc-500">
            Manage your emergency contacts for quick access while traveling.
          </p>
        </Link>

        <Link
          href="/safety/advisories"
          className="rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="mb-2 text-lg font-semibold">Travel Advisories</h2>
          <p className="text-sm text-zinc-500">
            View safety advisories and alerts for your upcoming destinations.
          </p>
        </Link>
      </div>
    </div>
  );
}
