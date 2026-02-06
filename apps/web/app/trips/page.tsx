import Link from 'next/link';
import { PlaceholderTile } from '@travel/ui';
import { fetchTrips } from '@/app/_lib/mock-data';
import { formatDate, statusColor } from '@/app/_lib/format';

export default async function TripsPage() {
  const trips = await fetchTrips();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">My Trips</h1>

      {trips.length === 0 ? (
        <p className="text-zinc-500">No trips yet. Start planning!</p>
      ) : (
        <ul className="space-y-3">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link
                href={`/trips/${trip.id}`}
                className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <PlaceholderTile name={trip.destination} size={52} />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{trip.name}</p>
                  <p className="text-sm text-zinc-500 truncate">{trip.destination}</p>
                  <p className="text-xs text-zinc-400">
                    {formatDate(trip.startDate)} &ndash; {formatDate(trip.endDate)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(trip.status)}`}
                >
                  {trip.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
