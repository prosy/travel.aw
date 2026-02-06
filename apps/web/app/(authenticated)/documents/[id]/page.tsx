export default function DocumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Document Details
      </h1>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="py-12 text-center text-zinc-500">Loading document...</p>
      </div>
    </div>
  );
}
