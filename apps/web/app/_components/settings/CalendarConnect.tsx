'use client';

interface CalendarProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  connectedAt?: string;
}

interface CalendarConnectProps {
  providers: CalendarProvider[];
  onConnect: (providerId: string) => void;
  onDisconnect: (providerId: string) => void;
  isLoading?: string; // ID of provider currently loading
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const defaultProviders: CalendarProvider[] = [
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
    connected: false,
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    icon: (
      <svg className="h-6 w-6 text-gray-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    connected: false,
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24">
        <path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.576a.806.806 0 01-.588.234h-8.652v-6.55l.949.664c.095.047.19.047.285 0l7.481-5.105a.254.254 0 01.382.047c.238.19.38.428.38.656z" />
        <path fill="#0078D4" d="M15.47 8.375l.949.664c.095.047.19.047.285 0l7.481-5.105a.254.254 0 01.382.047c-.047-.38-.19-.71-.428-.949a1.31 1.31 0 00-.949-.38H14.52v5.723z" />
        <path fill="#28A8EA" d="M6.12 12.525c-.19-.095-.38-.143-.57-.143h-.095c-.238 0-.475.048-.713.143a1.615 1.615 0 00-.618.428 1.997 1.997 0 00-.428.665 2.374 2.374 0 00-.143.855c0 .285.048.57.143.808.095.285.238.522.428.712.19.19.38.333.618.428.238.095.475.143.713.143h.095c.19 0 .38-.048.57-.143.19-.095.38-.238.523-.428.142-.19.285-.427.38-.712.095-.238.142-.523.142-.808a2.374 2.374 0 00-.142-.855 1.997 1.997 0 00-.38-.665 1.615 1.615 0 00-.523-.428z" />
        <path fill="#0078D4" d="M14.52 2.652v18.696H.81a.806.806 0 01-.588-.234A.806.806 0 010 20.539V4.213c0-.238.08-.428.238-.58a.806.806 0 01.57-.234h13.71v-.747zM9.5 13.664c0 .475-.095.902-.285 1.282a2.95 2.95 0 01-.76 1.045c-.333.285-.713.523-1.14.665-.428.143-.902.238-1.378.238-.475 0-.95-.095-1.378-.238a3.614 3.614 0 01-1.14-.665 2.95 2.95 0 01-.76-1.045c-.19-.38-.285-.807-.285-1.282 0-.475.095-.902.285-1.283.19-.38.428-.712.76-1.045.333-.285.713-.522 1.14-.665.428-.142.903-.237 1.378-.237.476 0 .95.095 1.378.237.427.143.807.38 1.14.665.333.333.57.665.76 1.045.19.38.285.808.285 1.283z" />
      </svg>
    ),
    connected: false,
  },
];

export function CalendarConnect({
  providers = defaultProviders,
  onConnect,
  onDisconnect,
  isLoading,
}: CalendarConnectProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Calendar Integration
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Sync your trips to your favorite calendar app
        </p>
      </div>

      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700">
                {provider.icon}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{provider.name}</p>
                {provider.connected && provider.connectedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Connected on {formatDate(provider.connectedAt)}
                  </p>
                )}
              </div>
            </div>

            {provider.connected ? (
              <button
                onClick={() => onDisconnect(provider.id)}
                disabled={isLoading === provider.id}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                {isLoading === provider.id ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Disconnect'
                )}
              </button>
            ) : (
              <button
                onClick={() => onConnect(provider.id)}
                disabled={isLoading === provider.id}
                className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading === provider.id ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Connect'
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
