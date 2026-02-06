import Link from 'next/link';

export default function PointsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Points &amp; Loyalty Programs
      </h1>

      <div className="py-12 text-center">
        <p className="mb-6 text-zinc-500">
          No loyalty programs added yet. Add your first program to start
          tracking.
        </p>
        <Link
          href="/points/new"
          className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Add Program
        </Link>
      </div>
    </div>
  );
}
