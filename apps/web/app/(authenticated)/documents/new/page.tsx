import Link from 'next/link';

export default function UploadDocumentPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Upload Document
      </h1>

      <form className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <label
            htmlFor="doc-type"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Document Type
          </label>
          <select
            id="doc-type"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="passport">Passport</option>
            <option value="visa">Visa</option>
            <option value="insurance">Insurance</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="doc-name"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Document Name
          </label>
          <input
            id="doc-name"
            type="text"
            placeholder="e.g. US Passport"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div>
          <label
            htmlFor="expiry-date"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Expiry Date
          </label>
          <input
            id="expiry-date"
            type="date"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            File Upload
          </label>
          <div className="flex items-center justify-center rounded-md border-2 border-dashed border-zinc-300 px-6 py-10 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">
              Drag and drop a file here, or click to browse
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Upload Document
          </button>
          <Link
            href="/documents"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
