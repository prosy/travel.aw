'use client';

import type { UserAlert, AlertSeverity } from '@travel/contracts';

interface AlertBannerProps {
  alert: UserAlert;
  onDismiss?: () => void;
  onAction?: () => void;
}

const severityConfig: Record<AlertSeverity, { icon: React.ReactNode; bgColor: string; borderColor: string; textColor: string; iconColor: string }> = {
  info: {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  warning: {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    iconColor: 'text-yellow-500 dark:text-yellow-400',
  },
  urgent: {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-200',
    iconColor: 'text-red-500 dark:text-red-400',
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function AlertBanner({ alert, onDismiss, onAction }: AlertBannerProps) {
  const config = severityConfig[alert.severity];

  return (
    <div
      className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}
      role="alert"
    >
      <div className="flex">
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          {config.icon}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`text-sm font-medium ${config.textColor}`}>
                {alert.title}
              </h3>
              <p className={`mt-1 text-sm ${config.textColor} opacity-90`}>
                {alert.message}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {formatDate(alert.createdAt)}
              </p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`ml-4 rounded p-1 hover:bg-white/50 dark:hover:bg-black/20 ${config.textColor}`}
                aria-label="Dismiss alert"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {alert.actionUrl && (
            <div className="mt-3">
              <button
                onClick={onAction}
                className={`text-sm font-medium underline hover:no-underline ${config.textColor}`}
              >
                View Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AlertListProps {
  alerts: UserAlert[];
  onDismiss?: (alertId: string) => void;
  onAction?: (alert: UserAlert) => void;
  emptyMessage?: string;
}

export function AlertList({ alerts, onDismiss, onAction, emptyMessage = 'No alerts' }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertBanner
          key={alert.id}
          alert={alert}
          onDismiss={onDismiss ? () => onDismiss(alert.id) : undefined}
          onAction={onAction ? () => onAction(alert) : undefined}
        />
      ))}
    </div>
  );
}
