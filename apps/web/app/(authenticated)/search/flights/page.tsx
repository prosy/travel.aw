'use client';

import { useState } from 'react';
import { PlaceholderTile } from '@travel/ui';
import { formatPrice, formatDateTime } from '@/app/_lib/format';
import { useSearchParams, useRouter } from 'next/navigation';

function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] ?? '0';
  const m = match[2] ?? '0';
  return `${h}h ${m}m`;
}

interface FlightResult {
  airline: string;
  flightNumber: string;
  class?: string;
  departure: { airport: string; dateTime: string };
  arrival: { airport: string; dateTime: string };
  duration?: string;
  stops: number;
  price?: { amount: number; currency: string };
  booking_url?: string;
}

const INPUT_CLASSES =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white';

export default function FlightSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [form, setForm] = useState({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') || '',
    passengers: searchParams.get('passengers') || '1',
    cabin: searchParams.get('cabin') || 'economy',
  });

  const [results, setResults] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function updateUrl(formData: typeof form) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(formData)) {
      if (v) params.set(k, v);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(true);
    updateUrl(form);

    try {
      const res = await fetch('/api/skills/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: 'flight-search',
          action: 'search_flights',
          params: {
            origin: form.origin.toUpperCase(),
            destination: form.destination.toUpperCase(),
            date: form.date,
            passengers: parseInt(form.passengers, 10),
            cabin: form.cabin,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error?.message || data.error || 'Search failed';
        throw new Error(msg);
      }

      const flights: FlightResult[] = Array.isArray(data.results?.flights)
        ? data.results.flights
        : Array.isArray(data.results)
          ? data.results
          : [];
      setResults(flights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Flight Search</h1>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="origin" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Origin (IATA)
            </label>
            <input
              id="origin"
              name="origin"
              type="text"
              placeholder="SEA"
              maxLength={4}
              required
              value={form.origin}
              onChange={handleChange}
              className={INPUT_CLASSES}
            />
          </div>
          <div>
            <label htmlFor="destination" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Destination (IATA)
            </label>
            <input
              id="destination"
              name="destination"
              type="text"
              placeholder="NRT"
              maxLength={4}
              required
              value={form.destination}
              onChange={handleChange}
              className={INPUT_CLASSES}
            />
          </div>
          <div>
            <label htmlFor="date" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              value={form.date}
              onChange={handleChange}
              className={INPUT_CLASSES}
            />
          </div>
          <div>
            <label htmlFor="passengers" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Passengers
            </label>
            <input
              id="passengers"
              name="passengers"
              type="number"
              min={1}
              max={9}
              value={form.passengers}
              onChange={handleChange}
              className={INPUT_CLASSES}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="cabin" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Cabin Class
            </label>
            <select
              id="cabin"
              name="cabin"
              value={form.cabin}
              onChange={handleChange}
              className={INPUT_CLASSES}
            >
              <option value="economy">Economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching flights...' : 'Search Flights'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-zinc-500">
          <svg className="mr-3 h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Searching flights... This may take a moment.
        </div>
      )}

      {/* Results */}
      {!loading && searched && results.length === 0 && !error && (
        <p className="text-zinc-500">No flights found for these dates.</p>
      )}

      {results.length > 0 && (
        <ul className="space-y-4">
          {results.map((offer, i) => (
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
                  <div className="text-center">
                    <p className="font-semibold">{offer.departure.airport}</p>
                    <p className="text-xs text-zinc-400">{formatDateTime(offer.departure.dateTime)}</p>
                  </div>

                  <div className="flex flex-col items-center flex-1">
                    <p className="text-xs text-zinc-400">
                      {offer.duration ? formatDuration(offer.duration) : '—'}
                    </p>
                    <div className="w-full border-t border-zinc-300 dark:border-zinc-600" />
                    <p className="text-xs text-zinc-400">
                      {offer.stops === 0 ? 'Nonstop' : `${offer.stops} stop${offer.stops > 1 ? 's' : ''}`}
                    </p>
                  </div>

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
                {offer.booking_url && (
                  <a
                    href={offer.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    View deal
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
