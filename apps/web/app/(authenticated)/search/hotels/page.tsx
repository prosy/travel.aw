'use client';

import { useState } from 'react';
import { PlaceholderTile } from '@travel/ui';
import { formatPrice, formatDate } from '@/app/_lib/format';
import { useSearchParams, useRouter } from 'next/navigation';

interface HotelResult {
  hotelName: string;
  hotelChain?: string;
  starRating?: number;
  roomType?: string;
  address?: string;
  checkIn: string;
  checkOut: string;
  pricePerNight?: { amount: number; currency: string };
  totalPrice?: { amount: number; currency: string };
  amenities?: string[];
  cancellationPolicy?: string;
  booking_url?: string;
}

const INPUT_CLASSES =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white';

export default function HotelSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [form, setForm] = useState({
    city_code: searchParams.get('city_code') || '',
    check_in: searchParams.get('check_in') || '',
    check_out: searchParams.get('check_out') || '',
    guests: searchParams.get('guests') || '2',
    rooms: searchParams.get('rooms') || '1',
  });

  const [results, setResults] = useState<HotelResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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
          skill: 'hotel-search',
          action: 'search_hotels',
          params: {
            city_code: form.city_code.toUpperCase(),
            check_in: form.check_in,
            check_out: form.check_out,
            guests: parseInt(form.guests, 10),
            rooms: parseInt(form.rooms, 10),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error?.message || data.error || 'Search failed';
        throw new Error(msg);
      }

      const hotels: HotelResult[] = Array.isArray(data.results?.hotels)
        ? data.results.hotels
        : Array.isArray(data.results)
          ? data.results
          : [];
      setResults(hotels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Hotel Search</h1>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="city_code" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Destination (city code)
            </label>
            <input
              id="city_code"
              name="city_code"
              type="text"
              placeholder="TYO"
              maxLength={4}
              required
              value={form.city_code}
              onChange={handleChange}
              className={INPUT_CLASSES}
            />
          </div>
          <div>
            <label htmlFor="check_in" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Check-in
            </label>
            <input
              id="check_in"
              name="check_in"
              type="date"
              required
              value={form.check_in}
              onChange={handleChange}
              className={INPUT_CLASSES}
            />
          </div>
          <div>
            <label htmlFor="check_out" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Check-out
            </label>
            <input
              id="check_out"
              name="check_out"
              type="date"
              required
              value={form.check_out}
              onChange={handleChange}
              className={INPUT_CLASSES}
            />
          </div>
          <div>
            <label htmlFor="guests" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Guests
            </label>
            <input
              id="guests"
              name="guests"
              type="number"
              min={1}
              max={10}
              value={form.guests}
              onChange={handleChange}
              className={INPUT_CLASSES}
            />
          </div>
          <div>
            <label htmlFor="rooms" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Rooms
            </label>
            <input
              id="rooms"
              name="rooms"
              type="number"
              min={1}
              max={5}
              value={form.rooms}
              onChange={handleChange}
              className={INPUT_CLASSES}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching hotels...' : 'Search Hotels'}
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
          Searching hotels... This may take a moment.
        </div>
      )}

      {/* Results */}
      {!loading && searched && results.length === 0 && !error && (
        <p className="text-zinc-500">No hotels found for these dates.</p>
      )}

      {results.length > 0 && (
        <ul className="space-y-4">
          {results.map((offer, i) => (
            <li
              key={`${offer.hotelName}-${i}`}
              className="flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <PlaceholderTile name={offer.hotelName} size={56} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold truncate">{offer.hotelName}</h2>
                  {offer.starRating && (
                    <span className="text-xs text-amber-500">
                      {'★'.repeat(offer.starRating)}
                    </span>
                  )}
                </div>

                {offer.hotelChain && (
                  <p className="text-xs text-zinc-400">{offer.hotelChain}</p>
                )}

                {offer.roomType && (
                  <p className="text-sm text-zinc-500">{offer.roomType}</p>
                )}

                {offer.address && (
                  <p className="text-xs text-zinc-400">{offer.address}</p>
                )}

                <p className="mt-1 text-xs text-zinc-400">
                  {formatDate(offer.checkIn)} &ndash; {formatDate(offer.checkOut)}
                </p>

                {offer.amenities && offer.amenities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {offer.amenities.map((a) => (
                      <span
                        key={a}
                        className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                {offer.cancellationPolicy && (
                  <p className="mt-1 text-xs text-emerald-600">{offer.cancellationPolicy}</p>
                )}
              </div>

              <div className="text-right shrink-0">
                {offer.pricePerNight && (
                  <p className="text-lg font-bold">
                    {formatPrice(offer.pricePerNight.amount, offer.pricePerNight.currency)}
                  </p>
                )}
                <p className="text-xs text-zinc-400">per night</p>
                {offer.totalPrice && (
                  <p className="text-xs text-zinc-500">
                    {formatPrice(offer.totalPrice.amount, offer.totalPrice.currency)} total
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
