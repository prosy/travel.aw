'use client';

export default function MapError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Map error:', error);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold text-zinc-900">Could not load map</h2>
        <p className="mb-4 text-sm text-zinc-500">There was a problem loading the map view.</p>
        <button
          onClick={reset}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
