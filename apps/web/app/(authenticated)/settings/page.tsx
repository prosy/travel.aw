export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Settings</h1>

      <div className="space-y-8">
        {/* Notifications */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold">Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Email notifications
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-zinc-300 transition-colors checked:bg-zinc-900 dark:bg-zinc-700 dark:checked:bg-zinc-100"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'5\' cy=\'8\' r=\'4\'/%3E%3C/svg%3E")',
                  backgroundPosition: 'left center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'contain',
                }}
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Push notifications
              </span>
              <input
                type="checkbox"
                className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-zinc-300 transition-colors checked:bg-zinc-900 dark:bg-zinc-700 dark:checked:bg-zinc-100"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'5\' cy=\'8\' r=\'4\'/%3E%3C/svg%3E")',
                  backgroundPosition: 'left center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'contain',
                }}
              />
            </label>
          </div>
        </section>

        {/* Preferences */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="timezone"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Timezone
              </label>
              <select
                id="timezone"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option>Select timezone...</option>
                <option value="America/New_York">Eastern Time (US)</option>
                <option value="America/Chicago">Central Time (US)</option>
                <option value="America/Denver">Mountain Time (US)</option>
                <option value="America/Los_Angeles">Pacific Time (US)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Central European Time</option>
                <option value="Asia/Tokyo">Japan Standard Time</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="currency"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Currency
              </label>
              <select
                id="currency"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="date-format"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Date Format
              </label>
              <select
                id="date-format"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-lg border-2 border-red-300 bg-white p-6 dark:border-red-900 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-red-600 dark:text-red-400">
            Danger Zone
          </h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Once you delete your account, there is no going back. This action is
            irreversible.
          </p>
          <button
            type="button"
            className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            Delete Account
          </button>
        </section>
      </div>
    </div>
  );
}
