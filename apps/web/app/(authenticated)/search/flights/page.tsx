import { PlaceholderTile } from '@travel/ui';
import { fetchFlightOffers } from '@/app/_lib/mock-data';
import { formatPrice, formatDateTime } from '@/app/_lib/format';

function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] ?? '0';
  const m = match[2] ?? '0';
  return `${h}h ${m}m`;
}

export default async function FlightSearchPage() {
  const offers = await fetchFlightOffers();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Flight Search</h1>

      {/* TODO: Add search form once search API exists */}

      {offers.length === 0 ? (
        <p className="text-zinc-500">No flight offers found.</p>
      ) : (
        <ul className="space-y-4">
          {offers.map((offer, i) => (
            <li
              key={`${offer.flightNumber}-${i}`}
              className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <PlaceholderTile name={offer.airline} size={48} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{offer.airline}</h2>
                  <span className="text-xs text-zinc-400">{offer.flightNumber}</span>
                  {offer.class && offer.class !== 'economy' && (
                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-700">
                      {offer.class.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-3 text-sm">
                  {/* Departure */}
                  <div className="text-center">
                    <p className="font-semibold">{offer.departure.airport}</p>
                    <p className="text-xs text-zinc-400">{formatDateTime(offer.departure.dateTime)}</p>
                  </div>

                  {/* Arrow + duration */}
                  <div className="flex flex-col items-center flex-1">
                    <p className="text-xs text-zinc-400">
                      {offer.duration ? formatDuration(offer.duration) : '—'}
                    </p>
                    <div className="w-full border-t border-zinc-300 dark:border-zinc-600" />
                    <p className="text-xs text-zinc-400">
                      {offer.stops === 0 ? 'Nonstop' : `${offer.stops} stop${offer.stops > 1 ? 's' : ''}`}
                    </p>
                  </div>

                  {/* Arrival */}
                  <div className="text-center">
                    <p className="font-semibold">{offer.arrival.airport}</p>
                    <p className="text-xs text-zinc-400">{formatDateTime(offer.arrival.dateTime)}</p>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                {offer.price && (
                  <p className="text-lg font-bold">
                    {formatPrice(offer.price.amount, offer.price.currency)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
