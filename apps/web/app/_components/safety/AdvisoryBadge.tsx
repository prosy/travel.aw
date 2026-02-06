'use client';

import type { AdvisoryLevel } from '@travel/contracts';

interface AdvisoryBadgeProps {
  level: AdvisoryLevel;
  countryName?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
}

const levelConfig: Record<AdvisoryLevel, { label: string; description: string; color: string; bgColor: string }> = {
  1: {
    label: 'Level 1',
    description: 'Exercise Normal Precautions',
    color: 'text-green-800 dark:text-green-200',
    bgColor: 'bg-green-100 dark:bg-green-900',
  },
  2: {
    label: 'Level 2',
    description: 'Exercise Increased Caution',
    color: 'text-yellow-800 dark:text-yellow-200',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
  },
  3: {
    label: 'Level 3',
    description: 'Reconsider Travel',
    color: 'text-orange-800 dark:text-orange-200',
    bgColor: 'bg-orange-100 dark:bg-orange-900',
  },
  4: {
    label: 'Level 4',
    description: 'Do Not Travel',
    color: 'text-red-800 dark:text-red-200',
    bgColor: 'bg-red-100 dark:bg-red-900',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function AdvisoryBadge({
  level,
  countryName,
  size = 'md',
  showLabel = true,
  onClick,
}: AdvisoryBadgeProps) {
  const config = levelConfig[level];
  const sizeClass = sizeClasses[size];

  const badge = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClass} ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <span className="flex h-2 w-2 items-center justify-center">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            level === 1
              ? 'bg-green-500'
              : level === 2
              ? 'bg-yellow-500'
              : level === 3
              ? 'bg-orange-500'
              : 'bg-red-500'
          }`}
        />
      </span>
      {showLabel && (
        <span>
          {countryName && `${countryName}: `}
          {config.label}
        </span>
      )}
    </span>
  );

  if (!showLabel && countryName) {
    return (
      <div className="group relative inline-block">
        {badge}
        <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block dark:bg-gray-700">
          {countryName}: {config.description}
          <div className="absolute left-1/2 top-full -translate-x-1/2 transform border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      </div>
    );
  }

  return badge;
}

interface AdvisoryLegendProps {
  className?: string;
}

export function AdvisoryLegend({ className }: AdvisoryLegendProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Advisory Levels
      </p>
      <div className="flex flex-wrap gap-2">
        {([1, 2, 3, 4] as AdvisoryLevel[]).map((level) => (
          <div key={level} className="flex items-center gap-2">
            <AdvisoryBadge level={level} size="sm" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {levelConfig[level].description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
