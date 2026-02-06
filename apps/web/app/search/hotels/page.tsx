import { PlaceholderTile } from '@travel/ui';
import { fetchHotelOffers } from '@/app/_lib/mock-data';
import { formatPrice, formatDate } from '@/app/_lib/format';

export default async function HotelSearchPage() {
  const offers = await fetchHotelOffers();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Hotel Search</h1>

      {/* TODO: Add search form once search API exists */}

      {offers.length === 0 ? (
        <p className="text-zinc-500">No hotel offers found.</p>
      ) : (
        <ul className="space-y-4">
          {offers.map((offer, i) => (
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
