import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchTrip, fetchTripItem } from '@/app/_lib/mock-data';
import type { OfferFlight, OfferHotel, TripItem as TripItemType } from '@travel/contracts';
import { ItemActions } from './ItemActions';

interface Props {
  params: Promise<{ id: string; itemId: string }>;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return isoDuration;
  const h = match[1] ? `${match[1]}h` : '';
  const m = match[2] ? ` ${match[2]}m` : '';
  return (h + m).trim();
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function statusColor(status: string): string {
  switch (status) {
    case 'confirmed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  }
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2.5 border-b border-zinc-800 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-medium text-zinc-200 text-right">{value}</span>
    </div>
  );
}

function FlightDetail({ item, offer }: { item: any; offer: OfferFlight }) {
  const dep = offer.departure;
  const arr = offer.arrival;

  return (
    <>
      {/* Route header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{dep?.airport ?? '---'}</p>
            <p className="text-xs text-zinc-500">{dep?.city ?? ''}</p>
          </div>
          <div className="flex flex-col items-center px-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-zinc-500">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
            {offer.stops === 0 ? (
              <span className="mt-1 text-[10px] text-zinc-600">NONSTOP</span>
            ) : (
              <span className="mt-1 text-[10px] text-zinc-600">{offer.stops} STOP{offer.stops > 1 ? 'S' : ''}</span>
            )}
          </div>
          <div className="text-left">
            <p className="text-3xl font-bold text-white">{arr?.airport ?? '---'}</p>
            <p className="text-xs text-zinc-500">{arr?.city ?? ''}</p>
          </div>
        </div>
        {offer.duration && (
          <p className="mt-2 text-sm text-zinc-500">{formatDuration(offer.duration)}</p>
        )}
      </div>

      {/* Departure card */}
      <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Departure</h3>
        <DetailRow label="Airport" value={dep?.airport ? `${dep.airport}${dep.city ? ` — ${dep.city}` : ''}` : null} />
        <DetailRow label="Terminal" value={dep?.terminal} />
        <DetailRow label="Date & Time" value={dep?.dateTime ? formatDateTime(dep.dateTime) : null} />
      </div>

      {/* Layover(s) */}
      {offer.layovers && offer.layovers.length > 0 && offer.layovers.map((layover, i) => (
        <div key={i} className="relative mb-4 flex items-center gap-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300">
              {formatDuration(layover.duration)} layover in {layover.city ?? layover.airport}
            </p>
            <p className="text-xs text-zinc-500">{layover.airport}</p>
          </div>
        </div>
      ))}

      {/* Arrival card */}
      <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Arrival</h3>
        <DetailRow label="Airport" value={arr?.airport ? `${arr.airport}${arr.city ? ` — ${arr.city}` : ''}` : null} />
        <DetailRow label="Terminal" value={arr?.terminal} />
        <DetailRow label="Date & Time" value={arr?.dateTime ? formatDateTime(arr.dateTime) : null} />
      </div>

      {/* Flight info card */}
      <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Flight Info</h3>
        <DetailRow label="Airline" value={offer.airline} />
        <DetailRow label="Flight Number" value={offer.flightNumber} />
        <DetailRow label="Seat" value={offer.seatNumber} />
        <DetailRow label="Aircraft" value={offer.aircraft} />
        <DetailRow label="Class" value={offer.class ? offer.class.charAt(0).toUpperCase() + offer.class.slice(1).replace('_', ' ') : null} />
        <DetailRow label="Duration" value={offer.duration ? formatDuration(offer.duration) : null} />
        <DetailRow label="Stops" value={offer.stops === 0 ? 'Nonstop' : `${offer.stops}`} />
        <DetailRow label="Baggage" value={offer.baggageAllowance} />
      </div>
    </>
  );
}

function HotelDetail({ item, offer }: { item: any; offer: OfferHotel }) {
  return (
    <>
      <div className="mb-6 text-center">
        <p className="text-2xl font-bold text-white">{offer.hotelName}</p>
        {offer.hotelChain && <p className="text-sm text-zinc-500">{offer.hotelChain}</p>}
        {offer.starRating && (
          <p className="mt-1 text-sm text-amber-400">{'★'.repeat(offer.starRating)}{'☆'.repeat(5 - offer.starRating)}</p>
        )}
      </div>

      <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Stay Details</h3>
        <DetailRow label="Check In" value={offer.checkIn} />
        <DetailRow label="Check Out" value={offer.checkOut} />
        <DetailRow label="Room Type" value={offer.roomType} />
        <DetailRow label="Address" value={offer.address ?? item.location?.address} />
      </div>

      {offer.amenities && offer.amenities.length > 0 && (
        <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {offer.amenities.map((a, i) => (
              <span key={i} className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {offer.cancellationPolicy && (
        <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Cancellation Policy</h3>
          <p className="text-sm text-zinc-300">{offer.cancellationPolicy}</p>
        </div>
      )}
    </>
  );
}

function LinkedHotel({ tripId, hotel }: { tripId: string; hotel: TripItemType }) {
  const offer = hotel.offer as OfferHotel | null;
  const name = offer?.hotelName ?? hotel.title;
  const address = offer?.address ?? hotel.location?.address;
  const checkInTime = hotel.startDateTime ? formatTime(hotel.startDateTime) : null;

  return (
    <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Lodging</h3>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-base">
          🏨
        </div>
        <div className="min-w-0">
          <Link
            href={`/trips/${tripId}/items/${hotel.id}`}
            className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            {name}
          </Link>
          {checkInTime && (
            <p className="text-sm text-zinc-400">Check in {checkInTime} UTC</p>
          )}
          {address && (
            <p className="text-sm text-zinc-500">{address}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function GenericDetail({ item }: { item: any }) {
  return (
    <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Details</h3>
      <DetailRow label="Start" value={formatDateTime(item.startDateTime)} />
      <DetailRow label="End" value={item.endDateTime ? formatDateTime(item.endDateTime) : null} />
      {item.description && <DetailRow label="Description" value={item.description} />}
      <DetailRow label="Location" value={item.location?.name} />
      <DetailRow label="Address" value={item.location?.address} />
    </div>
  );
}

export default async function TripItemDetailPage({ params }: Props) {
  const { id, itemId } = await params;
  const [trip, item] = await Promise.all([
    fetchTrip(id),
    fetchTripItem(id, itemId),
  ]);

  if (!trip || !item) {
    notFound();
  }

  const offer = item.offer;
  const isFlight = offer?.type === 'flight';
  const isHotel = offer?.type === 'hotel';

  const linkedHotel = isFlight && trip.items
    ? trip.items.find(i =>
        i.id !== item.id &&
        i.type === 'hotel' &&
        i.startDateTime <= (item.endDateTime ?? item.startDateTime) &&
        (i.endDateTime ?? i.startDateTime) >= item.startDateTime
      )
    : null;

  const typeLabels: Record<string, string> = {
    flight: 'Flight',
    hotel: 'Hotel',
    activity: 'Activity',
    transport: 'Transport',
    restaurant: 'Restaurant',
    other: 'Item',
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-lg px-4 pb-20 pt-6">
        {/* Top nav */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/trips/${id}`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </Link>
          <h2 className="text-sm font-medium text-zinc-400">
            {typeLabels[item.type] ?? 'Item'} Details
          </h2>
          <div className="w-10" />
        </div>

        {/* Title + status */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{item.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-medium capitalize ${statusColor(item.status)}`}>
              {item.status}
            </span>
            <span className="text-xs text-zinc-500">{trip.destination}</span>
          </div>
        </div>

        {/* Type-specific detail sections */}
        {isFlight && <FlightDetail item={item} offer={offer as OfferFlight} />}
        {isHotel && <HotelDetail item={item} offer={offer as OfferHotel} />}
        {!isFlight && !isHotel && <GenericDetail item={item} />}

        {/* Linked hotel for flights */}
        {linkedHotel && <LinkedHotel tripId={id} hotel={linkedHotel} />}

        {/* Booking info (shared across types) */}
        <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Booking</h3>
          <DetailRow label="Confirmation" value={item.confirmationNumber} />
          <DetailRow
            label="Price"
            value={item.price ? formatPrice(item.price.amount, item.price.currency) : null}
          />
          {isHotel && (offer as OfferHotel).pricePerNight && (
            <DetailRow
              label="Per Night"
              value={formatPrice(
                Number((offer as OfferHotel).pricePerNight!.amount),
                (offer as OfferHotel).pricePerNight!.currency
              )}
            />
          )}
          <DetailRow label="Status" value={item.status.charAt(0).toUpperCase() + item.status.slice(1)} />
        </div>

        {/* Actions */}
        <ItemActions tripId={id} itemId={itemId} />
      </div>
    </div>
  );
}
