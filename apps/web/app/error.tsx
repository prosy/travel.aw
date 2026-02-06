'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Unhandled error:', error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold text-zinc-900">Something went wrong</h2>
        <p className="mb-4 text-sm text-zinc-500">An unexpected error occurred.</p>
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
