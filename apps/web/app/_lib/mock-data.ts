/**
 * TODO: Replace mock fetch helpers with real API calls once endpoints exist.
 */
import type { Trip, TripItem, OfferHotel, OfferFlight } from './types';

// ---------------------------------------------------------------------------
// Mock trips
// ---------------------------------------------------------------------------

const MOCK_TRIPS: Trip[] = [
  {
    id: 'trip-1',
    name: 'Tokyo Adventure',
    description: 'Spring cherry blossom trip',
    startDate: '2026-04-01',
    endDate: '2026-04-10',
    destination: 'Tokyo, Japan',
    status: 'planned',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'trip-2',
    name: 'Paris Getaway',
    description: 'Romantic weekend in Paris',
    startDate: '2026-06-14',
    endDate: '2026-06-18',
    destination: 'Paris, France',
    status: 'draft',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'trip-3',
    name: 'NYC Business Trip',
    description: 'Conference + sightseeing',
    startDate: '2026-03-10',
    endDate: '2026-03-14',
    destination: 'New York, USA',
    status: 'booked',
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-02-03T00:00:00Z',
  },
];

const MOCK_TRIP_ITEMS: Record<string, TripItem[]> = {
  'trip-1': [
    {
      id: 'item-1a',
      tripId: 'trip-1',
      type: 'flight',
      title: 'SFO → NRT',
      description: 'United Airlines UA837',
      startDateTime: '2026-04-01T10:30:00Z',
      endDateTime: '2026-04-02T14:00:00+09:00',
      location: { name: 'San Francisco International Airport' },
      confirmationNumber: 'UA-ABC123',
      price: { amount: 890, currency: 'USD' },
      status: 'confirmed',
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-01-15T00:00:00Z',
    },
    {
      id: 'item-1b',
      tripId: 'trip-1',
      type: 'hotel',
      title: 'Hotel Gracery Shinjuku',
      description: 'Superior Double Room',
      startDateTime: '2026-04-02T15:00:00+09:00',
      endDateTime: '2026-04-09T11:00:00+09:00',
      location: { name: 'Hotel Gracery Shinjuku', address: 'Kabukicho, Shinjuku' },
      confirmationNumber: 'GRC-789',
      price: { amount: 1050, currency: 'USD' },
      status: 'confirmed',
      createdAt: '2026-01-16T00:00:00Z',
      updatedAt: '2026-01-16T00:00:00Z',
    },
    {
      id: 'item-1c',
      tripId: 'trip-1',
      type: 'activity',
      title: 'Tsukiji Market Tour',
      description: 'Guided morning tour with sushi breakfast',
      startDateTime: '2026-04-04T06:00:00+09:00',
      endDateTime: '2026-04-04T09:00:00+09:00',
      location: { name: 'Tsukiji Outer Market' },
      price: { amount: 75, currency: 'USD' },
      status: 'pending',
      createdAt: '2026-01-17T00:00:00Z',
      updatedAt: '2026-01-17T00:00:00Z',
    },
    {
      id: 'item-1d',
      tripId: 'trip-1',
      type: 'flight',
      title: 'NRT → SFO',
      description: 'United Airlines UA838',
      startDateTime: '2026-04-10T17:00:00+09:00',
      endDateTime: '2026-04-10T11:00:00Z',
      location: { name: 'Narita International Airport' },
      confirmationNumber: 'UA-DEF456',
      price: { amount: 920, currency: 'USD' },
      status: 'confirmed',
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-01-15T00:00:00Z',
    },
  ],
  'trip-2': [
    {
      id: 'item-2a',
      tripId: 'trip-2',
      type: 'flight',
      title: 'SFO → CDG',
      description: 'Air France AF85',
      startDateTime: '2026-06-14T16:00:00Z',
      endDateTime: '2026-06-15T11:30:00+02:00',
      location: { name: 'San Francisco International Airport' },
      price: { amount: 650, currency: 'USD' },
      status: 'pending',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
    },
  ],
  'trip-3': [
    {
      id: 'item-3a',
      tripId: 'trip-3',
      type: 'flight',
      title: 'SFO → JFK',
      description: 'Delta DL178',
      startDateTime: '2026-03-10T07:00:00Z',
      endDateTime: '2026-03-10T15:30:00Z',
      location: { name: 'San Francisco International Airport' },
      confirmationNumber: 'DL-XYZ789',
      price: { amount: 340, currency: 'USD' },
      status: 'confirmed',
      createdAt: '2026-01-20T00:00:00Z',
      updatedAt: '2026-01-20T00:00:00Z',
    },
    {
      id: 'item-3b',
      tripId: 'trip-3',
      type: 'hotel',
      title: 'The Standard, High Line',
      description: 'Standard King Room',
      startDateTime: '2026-03-10T16:00:00Z',
      endDateTime: '2026-03-14T11:00:00Z',
      location: { name: 'The Standard, High Line', address: '848 Washington St, New York' },
      confirmationNumber: 'STD-456',
      price: { amount: 1200, currency: 'USD' },
      status: 'confirmed',
      createdAt: '2026-01-21T00:00:00Z',
      updatedAt: '2026-01-21T00:00:00Z',
    },
  ],
};

// ---------------------------------------------------------------------------
// Mock hotel offers
// ---------------------------------------------------------------------------

const MOCK_HOTEL_OFFERS: OfferHotel[] = [
  {
    type: 'hotel',
    hotelName: 'Hotel Gracery Shinjuku',
    hotelChain: 'Fujita Kanko',
    starRating: 4,
    roomType: 'Superior Double',
    checkIn: '2026-04-02',
    checkOut: '2026-04-09',
    address: 'Kabukicho, Shinjuku, Tokyo',
    amenities: ['Wi-Fi', 'Restaurant', 'Gym'],
    pricePerNight: { amount: 150, currency: 'USD' },
    totalPrice: { amount: 1050, currency: 'USD' },
    cancellationPolicy: 'Free cancellation until 48h before check-in',
    sourceProvider: 'mock',
  },
  {
    type: 'hotel',
    hotelName: 'Park Hyatt Tokyo',
    hotelChain: 'Hyatt',
    starRating: 5,
    roomType: 'Park King',
    checkIn: '2026-04-02',
    checkOut: '2026-04-09',
    address: 'Nishi-Shinjuku, Tokyo',
    amenities: ['Pool', 'Spa', 'Wi-Fi', 'Restaurant', 'Bar'],
    pricePerNight: { amount: 420, currency: 'USD' },
    totalPrice: { amount: 2940, currency: 'USD' },
    cancellationPolicy: 'Non-refundable',
    sourceProvider: 'mock',
  },
  {
    type: 'hotel',
    hotelName: 'Citadines Shinjuku',
    starRating: 3,
    roomType: 'Studio Deluxe',
    checkIn: '2026-04-02',
    checkOut: '2026-04-09',
    address: 'Shinjuku, Tokyo',
    amenities: ['Wi-Fi', 'Kitchenette', 'Laundry'],
    pricePerNight: { amount: 95, currency: 'USD' },
    totalPrice: { amount: 665, currency: 'USD' },
    cancellationPolicy: 'Free cancellation until 24h before check-in',
    sourceProvider: 'mock',
  },
];

// ---------------------------------------------------------------------------
// Mock flight offers
// ---------------------------------------------------------------------------

const MOCK_FLIGHT_OFFERS: OfferFlight[] = [
  {
    type: 'flight',
    airline: 'United Airlines',
    flightNumber: 'UA837',
    departure: { airport: 'SFO', city: 'San Francisco', dateTime: '2026-04-01T10:30:00Z' },
    arrival: { airport: 'NRT', city: 'Tokyo', dateTime: '2026-04-02T14:00:00+09:00' },
    class: 'economy',
    duration: 'PT11H30M',
    stops: 0,
    price: { amount: 890, currency: 'USD' },
    sourceProvider: 'mock',
  },
  {
    type: 'flight',
    airline: 'ANA',
    flightNumber: 'NH107',
    departure: { airport: 'SFO', city: 'San Francisco', dateTime: '2026-04-01T12:00:00Z' },
    arrival: { airport: 'HND', city: 'Tokyo', dateTime: '2026-04-02T15:30:00+09:00' },
    class: 'economy',
    duration: 'PT11H30M',
    stops: 0,
    price: { amount: 950, currency: 'USD' },
    sourceProvider: 'mock',
  },
  {
    type: 'flight',
    airline: 'Delta',
    flightNumber: 'DL275',
    departure: { airport: 'SFO', city: 'San Francisco', dateTime: '2026-04-01T08:00:00Z' },
    arrival: { airport: 'NRT', city: 'Tokyo', dateTime: '2026-04-02T16:45:00+09:00' },
    class: 'economy',
    duration: 'PT15H45M',
    stops: 1,
    price: { amount: 720, currency: 'USD' },
    sourceProvider: 'mock',
  },
  {
    type: 'flight',
    airline: 'JAL',
    flightNumber: 'JL1',
    departure: { airport: 'SFO', city: 'San Francisco', dateTime: '2026-04-01T17:00:00Z' },
    arrival: { airport: 'HND', city: 'Tokyo', dateTime: '2026-04-02T21:30:00+09:00' },
    class: 'business',
    duration: 'PT11H30M',
    stops: 0,
    price: { amount: 3200, currency: 'USD' },
    sourceProvider: 'mock',
  },
];

// ---------------------------------------------------------------------------
// Mock fetch helpers
// ---------------------------------------------------------------------------

/** TODO: Replace with fetch('/api/trips') once API endpoints exist */
export async function fetchTrips(): Promise<Trip[]> {
  return MOCK_TRIPS;
}

/** TODO: Replace with fetch(`/api/trips/${id}`) once API endpoints exist */
export async function fetchTrip(id: string): Promise<Trip | null> {
  const trip = MOCK_TRIPS.find((t) => t.id === id) ?? null;
  if (trip) {
    return { ...trip, items: MOCK_TRIP_ITEMS[id] ?? [] };
  }
  return trip;
}

/** TODO: Replace with fetch('/api/search/hotels?...') once API endpoints exist */
export async function fetchHotelOffers(): Promise<OfferHotel[]> {
  return MOCK_HOTEL_OFFERS;
}

/** TODO: Replace with fetch('/api/search/flights?...') once API endpoints exist */
export async function fetchFlightOffers(): Promise<OfferFlight[]> {
  return MOCK_FLIGHT_OFFERS;
}
