import Link from 'next/link';
import { prisma } from '@/app/_lib/prisma';
import { AdvisoryBadge, AdvisoryLegend } from '@/app/_components/safety/AdvisoryBadge';
import { formatDate } from '@/app/_lib/format';
import type { AdvisoryLevel } from '@travel/contracts';

export default async function TravelAdvisoriesPage() {
  const rawAdvisories = await prisma.travelAdvisory.findMany({
    orderBy: [{ advisoryLevel: 'desc' }, { lastUpdated: 'desc' }],
  });

  const advisories = rawAdvisories.map((advisory: (typeof rawAdvisories)[number]) => ({
    id: advisory.id,
    countryCode: advisory.countryCode,
    countryName: advisory.countryName,
    advisoryLevel: advisory.advisoryLevel as AdvisoryLevel,
    advisoryText: advisory.advisoryText,
    lastUpdated: advisory.lastUpdated.toISOString(),
    source: advisory.source,
    sourceUrl: advisory.sourceUrl,
  }));

  // Group advisories by country
  const byCountry = new Map<string, typeof advisories>();
  for (const advisory of advisories) {
    const existing = byCountry.get(advisory.countryCode) ?? [];
    existing.push(advisory);
    byCountry.set(advisory.countryCode, existing);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/safety"
          className="mb-2 block text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          &larr; Safety Center
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Travel Advisories
        </h1>
      </div>

      <div className="mb-6">
        <AdvisoryLegend />
      </div>

      {advisories.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-zinc-500">
            No travel advisories available. Check back for safety information
            about your upcoming destinations.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {Array.from(byCountry.entries()).map(([countryCode, countryAdvisories]) => {
            const primary = countryAdvisories[0];
            return (
              <li
                key={countryCode}
                className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h2 className="text-lg font-semibold">
                        {primary.countryName}
                      </h2>
                      <AdvisoryBadge
                        level={primary.advisoryLevel}
                        size="sm"
                      />
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {primary.advisoryText}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400">
                      <span>Source: {primary.source}</span>
                      <span>Updated: {formatDate(primary.lastUpdated)}</span>
                      {primary.sourceUrl && (
                        <a
                          href={primary.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
                        >
                          View source
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {countryAdvisories.length > 1 && (
                  <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Additional Sources
                    </p>
                    <ul className="space-y-2">
                      {countryAdvisories.slice(1).map((advisory: (typeof advisories)[number]) => (
                        <li
                          key={advisory.id}
                          className="flex items-center gap-2 text-sm text-zinc-500"
                        >
                          <AdvisoryBadge
                            level={advisory.advisoryLevel}
                            size="sm"
                            showLabel={false}
                          />
                          <span>{advisory.source}</span>
                          <span className="text-xs">
                            ({formatDate(advisory.lastUpdated)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
