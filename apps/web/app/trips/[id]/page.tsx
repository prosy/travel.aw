import Link from 'next/link';
import { PlaceholderTile } from '@travel/ui';
import { fetchTrip } from '@/app/_lib/mock-data';
import { formatDate, formatDateTime, formatPrice, statusColor, typeIcon } from '@/app/_lib/format';
import { notFound } from 'next/navigation';
import { QuickSearchChips } from './QuickSearchChips';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params;
  const trip = await fetchTrip(id);

  if (!trip) {
    notFound();
  }

  const items = trip.items ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Back link */}
      <Link href="/trips" className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-800">
        &larr; All trips
      </Link>

      {/* Trip header */}
      <div className="mb-8 flex items-start gap-4">
        <PlaceholderTile name={trip.destination} size={64} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{trip.name}</h1>
          <p className="text-sm text-zinc-500">{trip.destination}</p>
          <p className="text-xs text-zinc-400">
            {formatDate(trip.startDate)} &ndash; {formatDate(trip.endDate)}
          </p>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(trip.status)}`}
          >
            {trip.status}
          </span>
        </div>
      </div>

      {trip.description && (
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">{trip.description}</p>
      )}

      {/* Quick searches */}
      <div className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-zinc-600">Quick searches</h2>
        <QuickSearchChips query={trip.destination} />
      </div>

      {/* Timeline */}
      <h2 className="mb-4 text-lg font-semibold">Itinerary</h2>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">No items yet.</p>
      ) : (
        <ol className="relative border-l border-zinc-200 dark:border-zinc-700">
          {items.map((item) => (
            <li key={item.id} className="mb-6 ml-6">
              {/* Timeline dot */}
              <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs ring-4 ring-white dark:bg-zinc-900 dark:ring-zinc-900">
                {typeIcon(item.type)}
              </span>

              <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">{item.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(item.status)}`}
                  >
                    {item.status}
                  </span>
                </div>

                {item.description && (
                  <p className="mt-1 text-sm text-zinc-500">{item.description}</p>
                )}

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                  <span>{formatDateTime(item.startDateTime)}</span>
                  {item.endDateTime && <span>&ndash; {formatDateTime(item.endDateTime)}</span>}
                  {item.price && (
                    <span className="font-medium text-zinc-600 dark:text-zinc-300">
                      {formatPrice(item.price.amount, item.price.currency)}
                    </span>
                  )}
                  {item.confirmationNumber && <span>Conf: {item.confirmationNumber}</span>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
