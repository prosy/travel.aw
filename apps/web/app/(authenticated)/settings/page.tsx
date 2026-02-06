'use client';

import { useEffect, useState, useCallback } from 'react';
import { ToggleSwitch, ToggleGroup } from '@/app/_components/settings/ToggleSwitch';
import { CalendarConnect } from '@/app/_components/settings/CalendarConnect';

interface Settings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  tripReminders: boolean;
  priceAlerts: boolean;
  timezone: string;
  dateFormat: string;
  currency: string;
  connectedApps: Array<{ id: string; connectedAt?: string }>;
}

const defaultSettings: Settings = {
  emailNotifications: true,
  pushNotifications: false,
  tripReminders: true,
  priceAlerts: true,
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  currency: 'USD',
  connectedApps: [],
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/user/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const patchSettings = useCallback(async (patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }, []);

  function handleCalendarConnect(providerId: string) {
    setCalendarLoading(providerId);
    const existing = settings.connectedApps || [];
    const updated = [...existing, { id: providerId, connectedAt: new Date().toISOString() }];
    patchSettings({ connectedApps: updated }).finally(() => setCalendarLoading(undefined));
  }

  function handleCalendarDisconnect(providerId: string) {
    setCalendarLoading(providerId);
    const existing = settings.connectedApps || [];
    const updated = existing.filter((app) => app.id !== providerId);
    patchSettings({ connectedApps: updated }).finally(() => setCalendarLoading(undefined));
  }

  const calendarProviders = [
    {
      id: 'google',
      name: 'Google Calendar',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      ),
      connected: (settings.connectedApps || []).some((a) => a.id === 'google'),
      connectedAt: (settings.connectedApps || []).find((a) => a.id === 'google')?.connectedAt,
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      icon: (
        <svg className="h-6 w-6 text-gray-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      ),
      connected: (settings.connectedApps || []).some((a) => a.id === 'apple'),
      connectedAt: (settings.connectedApps || []).find((a) => a.id === 'apple')?.connectedAt,
    },
    {
      id: 'outlook',
      name: 'Outlook Calendar',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24">
          <path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.576a.806.806 0 01-.588.234h-8.652v-6.55l.949.664c.095.047.19.047.285 0l7.481-5.105a.254.254 0 01.382.047c.238.19.38.428.38.656z" />
          <path fill="#0078D4" d="M15.47 8.375l.949.664c.095.047.19.047.285 0l7.481-5.105a.254.254 0 01.382.047c-.047-.38-.19-.71-.428-.949a1.31 1.31 0 00-.949-.38H14.52v5.723z" />
          <path fill="#0078D4" d="M14.52 2.652v18.696H.81a.806.806 0 01-.588-.234A.806.806 0 010 20.539V4.213c0-.238.08-.428.238-.58a.806.806 0 01.57-.234h13.71v-.747z" />
        </svg>
      ),
      connected: (settings.connectedApps || []).some((a) => a.id === 'outlook'),
      connectedAt: (settings.connectedApps || []).find((a) => a.id === 'outlook')?.connectedAt,
    },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Settings</h1>
        <div className="py-12 text-center text-zinc-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Settings</h1>

      <div className="space-y-8">
        {/* Notifications */}
        <ToggleGroup title="Notifications">
          <ToggleSwitch
            id="emailNotifications"
            label="Email notifications"
            description="Receive trip updates and alerts via email"
            checked={settings.emailNotifications}
            onChange={(checked) => patchSettings({ emailNotifications: checked })}
          />
          <ToggleSwitch
            id="pushNotifications"
            label="Push notifications"
            description="Receive push notifications in your browser"
            checked={settings.pushNotifications}
            onChange={(checked) => patchSettings({ pushNotifications: checked })}
          />
          <ToggleSwitch
            id="tripReminders"
            label="Trip reminders"
            description="Get reminded about upcoming trips"
            checked={settings.tripReminders}
            onChange={(checked) => patchSettings({ tripReminders: checked })}
          />
          <ToggleSwitch
            id="priceAlerts"
            label="Price alerts"
            description="Receive notifications when prices change"
            checked={settings.priceAlerts}
            onChange={(checked) => patchSettings({ priceAlerts: checked })}
          />
        </ToggleGroup>

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
                value={settings.timezone}
                onChange={(e) => patchSettings({ timezone: e.target.value })}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
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
                value={settings.currency}
                onChange={(e) => patchSettings({ currency: e.target.value })}
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
                value={settings.dateFormat}
                onChange={(e) => patchSettings({ dateFormat: e.target.value })}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </section>

        {/* Calendar Integration */}
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <CalendarConnect
            providers={calendarProviders}
            onConnect={handleCalendarConnect}
            onDisconnect={handleCalendarDisconnect}
            isLoading={calendarLoading}
          />
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
