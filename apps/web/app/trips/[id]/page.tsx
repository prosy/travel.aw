import Link from 'next/link';
import { fetchTrip } from '@/app/_lib/mock-data';
import { fetchWikiImage } from '@/app/_lib/wikipedia-image';
import { notFound } from 'next/navigation';
import { QuickSearchChips } from './QuickSearchChips';
import type { TripItem } from '@travel/contracts';

interface Props {
  params: Promise<{ id: string }>;
}

/** "January 2026" from YYYY-MM-DD */
function titleMonth(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** "Fri, Jan 30 – Sun, Feb 1, 2026" */
function dateRangeSubtitle(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  };
  const s = new Date(start + 'T00:00:00Z').toLocaleDateString('en-US', opts);
  const e = new Date(end + 'T00:00:00Z').toLocaleDateString('en-US', {
    ...opts,
    year: 'numeric',
  });
  return `${s}\u2009–\u2009${e}`;
}

/** "FRIDAY, JANUARY 30, 2026" section header */
function daySectionHeader(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).toUpperCase();
}

/** "7:18 AM" time only */
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

/** Get date key "2026-04-10" from ISO datetime */
function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

/** Group items by date */
function groupByDay(items: TripItem[]): Map<string, TripItem[]> {
  const groups = new Map<string, TripItem[]>();
  for (const item of items) {
    const key = dateKey(item.startDateTime);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

/** Type icon for timeline (clean SVG-style symbols) */
function itemIcon(type: string): string {
  switch (type) {
    case 'flight': return '\u2708\uFE0F';
    case 'hotel': return '\u{1F3E8}';
    case 'activity': return '\u{1F3AF}';
    case 'transport': return '\u{1F698}';
    case 'restaurant': return '\u{1F37D}\uFE0F';
    default: return '\u{1F4CC}';
  }
}

/** Build subtitle lines for an item */
function itemSubtitle(item: TripItem): string[] {
  const lines: string[] = [];

  if (item.offer?.type === 'flight') {
    lines.push(`${item.offer.flightNumber} (${item.offer.airline})`);
  } else if (item.offer?.type === 'hotel') {
    if (item.offer.checkIn && item.offer.checkOut) {
      const checkIn = new Date(item.offer.checkIn + 'T00:00:00Z').toLocaleDateString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
      });
      lines.push(`Check in: ${formatTime(item.startDateTime)} UTC`);
    }
    if (item.offer.address) lines.push(item.offer.address);
  } else if (item.description) {
    lines.push(item.description);
  }

  if (item.location?.address) {
    if (!lines.includes(item.location.address)) lines.push(item.location.address);
  } else if (item.location?.name && item.type !== 'flight') {
    if (!lines.includes(item.location.name)) lines.push(item.location.name);
  }

  return lines;
}

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params;
  const trip = await fetchTrip(id);

  if (!trip) {
    notFound();
  }

  const items = trip.items ?? [];
  const heroImage = await fetchWikiImage(trip.destination);
  const dayGroups = groupByDay(items);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-lg px-4 pb-20 pt-6">
        {/* Top nav */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/trips" className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </Link>
          <div className="flex flex-1 justify-center">
            <QuickSearchChips query={trip.destination} />
          </div>
          {/* Spacer to balance the back button */}
          <div className="w-10" />
        </div>

        {/* Header: title + image */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex-1">
            <h1 className="text-[1.65rem] font-bold leading-tight">
              {trip.destination},<br />
              {titleMonth(trip.startDate)}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              {dateRangeSubtitle(trip.startDate, trip.endDate)}
            </p>
          </div>
          {heroImage && (
            <img
              src={heroImage.thumbUrl}
              alt={heroImage.alt}
              className="h-20 w-20 shrink-0 rounded-lg object-cover"
            />
          )}
        </div>

        {/* Day-grouped timeline */}
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">No items yet.</p>
        ) : (
          <div>
            {Array.from(dayGroups.entries()).map(([day, dayItems]) => (
              <div key={day}>
                {/* Day section header */}
                <div className="border-t border-zinc-700 py-3">
                  <h2 className="text-[11px] font-semibold tracking-wider text-zinc-400">
                    {daySectionHeader(day + 'T00:00:00Z')}
                  </h2>
                </div>

                {/* Items for this day */}
                <div className="relative ml-[72px] border-l border-zinc-700">
                  {dayItems.map((item, idx) => {
                    const subtitle = itemSubtitle(item);
                    return (
                      <div key={item.id} className="relative pb-6">
                        {/* Time label - positioned left of the timeline */}
                        <div className="absolute -left-[72px] top-0 w-[56px] text-right">
                          <span className="text-sm font-medium text-zinc-300">
                            {formatTime(item.startDateTime)}
                          </span>
                        </div>

                        {/* Timeline icon */}
                        <div className="absolute -left-[14px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-sm ring-4 ring-zinc-950">
                          {itemIcon(item.type)}
                        </div>

                        {/* Content */}
                        <div className="pl-6">
                          <h3 className="font-semibold leading-snug text-white">
                            {item.title}
                          </h3>
                          {subtitle.map((line, i) => (
                            <p key={i} className="text-sm leading-snug text-zinc-400">
                              {line}
                            </p>
                          ))}
                          {item.price && (
                            <p className="mt-1 text-xs text-zinc-500">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.price.currency }).format(item.price.amount)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
