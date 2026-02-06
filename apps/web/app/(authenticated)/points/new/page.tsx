import Link from 'next/link';

export default function NewPointsProgramPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Add Loyalty Program
      </h1>

      <form className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <label
            htmlFor="program-name"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Program Name
          </label>
          <input
            id="program-name"
            type="text"
            placeholder="e.g. Delta SkyMiles"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div>
          <label
            htmlFor="account-number"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Account Number
          </label>
          <input
            id="account-number"
            type="text"
            placeholder="Enter your account number"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div>
          <label
            htmlFor="balance"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Current Balance
          </label>
          <input
            id="balance"
            type="number"
            placeholder="0"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Save Program
          </button>
          <Link
            href="/points"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
