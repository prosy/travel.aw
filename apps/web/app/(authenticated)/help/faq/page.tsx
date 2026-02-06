export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Frequently Asked Questions
      </h1>

      <div className="space-y-3">
        <details className="group rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <summary className="cursor-pointer px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            How do I add a trip?
          </summary>
          <div className="border-t border-zinc-200 px-6 py-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            Navigate to the Trips page and click the &quot;New Trip&quot; button.
            Fill in your destination, dates, and any notes, then save your trip.
            You can always edit it later.
          </div>
        </details>

        <details className="group rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <summary className="cursor-pointer px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            How do I share trips with friends?
          </summary>
          <div className="border-t border-zinc-200 px-6 py-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            First, add friends through the Friends page. Once connected, open any
            trip and use the &quot;Share&quot; option to invite friends to view or
            collaborate on your trip itinerary.
          </div>
        </details>

        <details className="group rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <summary className="cursor-pointer px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Is my data secure?
          </summary>
          <div className="border-t border-zinc-200 px-6 py-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            Yes. All data is encrypted at rest and in transit. Your travel
            documents and personal information are stored securely. We never share
            your data with third parties without your explicit consent.
          </div>
        </details>

        <details className="group rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <summary className="cursor-pointer px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            How do I contact support?
          </summary>
          <div className="border-t border-zinc-200 px-6 py-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            You can create a support ticket from the Help Center. Navigate to
            Support Tickets and click &quot;New Ticket&quot; to describe your issue.
            Our team typically responds within 24 hours.
          </div>
        </details>
      </div>
    </div>
  );
}
