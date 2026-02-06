/**
 * Data fetch helpers using Prisma + mappers.
 * Function signatures preserved for backward compatibility with page components.
 */
import type { Trip, OfferHotel, OfferFlight } from './types';
import { prisma } from '@/app/_lib/prisma';
import { mapTrip, mapTripItem } from '@/app/_lib/mappers';

/**
 * Fetch all trips (without items), ordered by start date.
 */
export async function fetchTrips(): Promise<Trip[]> {
  const trips = await prisma.trip.findMany({
    orderBy: { startDate: 'asc' },
  });
  return trips.map(mapTrip);
}

/**
 * Fetch a single trip by ID with all its items.
 */
export async function fetchTrip(id: string): Promise<Trip | null> {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { items: { orderBy: { startDateTime: 'asc' } } },
  });
  if (!trip) return null;
  return mapTrip(trip);
}

/**
 * Fetch hotel offers from trip items.
 * Temporary implementation until real search API exists.
 */
export async function fetchHotelOffers(): Promise<OfferHotel[]> {
  const items = await prisma.tripItem.findMany({
    where: {
      offerData: { not: null },
    },
  });

  const hotelOffers: OfferHotel[] = [];
  for (const item of items) {
    if (!item.offerData) continue;
    try {
      const offer = JSON.parse(item.offerData);
      if (offer.type === 'hotel') {
        hotelOffers.push(offer as OfferHotel);
      }
    } catch (e) {
      console.error(`Malformed offerData for TripItem ${item.id}:`, e);
    }
  }
  return hotelOffers;
}

/**
 * Fetch flight offers from trip items.
 * Temporary implementation until real search API exists.
 */
export async function fetchFlightOffers(): Promise<OfferFlight[]> {
  const items = await prisma.tripItem.findMany({
    where: {
      offerData: { not: null },
    },
  });

  const flightOffers: OfferFlight[] = [];
  for (const item of items) {
    if (!item.offerData) continue;
    try {
      const offer = JSON.parse(item.offerData);
      if (offer.type === 'flight') {
        flightOffers.push(offer as OfferFlight);
      }
    } catch (e) {
      console.error(`Malformed offerData for TripItem ${item.id}:`, e);
    }
  }
  return flightOffers;
}
