import Link from 'next/link';

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Travel Documents
      </h1>

      <div className="py-12 text-center">
        <p className="mb-6 text-zinc-500">
          No documents uploaded yet. Store your passports, visas, and insurance
          documents securely.
        </p>
        <Link
          href="/documents/new"
          className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Upload Document
        </Link>
      </div>
    </div>
  );
}
