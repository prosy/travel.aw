import type { Media } from './media';
import type { Price } from './trip';

/**
 * Flight class types
 */
export type FlightClass = 'economy' | 'premium_economy' | 'business' | 'first';

/**
 * Airport/location for flights
 */
export interface FlightLocation {
  airport: string;
  city?: string | null;
  dateTime: string; // ISO 8601
  terminal?: string | null;
}

/**
 * Hotel offer details
 */
export interface OfferHotel {
  type: 'hotel';
  hotelName: string;
  hotelChain?: string | null;
  starRating?: number | null; // 1-5
  roomType?: string | null;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  address?: string | null;
  amenities?: string[];
  pricePerNight?: Price | null;
  totalPrice?: Price | null;
  cancellationPolicy?: string | null;
  sourceUrl?: string | null;
  sourceProvider?: string | null;
  media?: Media[];
}

/**
 * Flight offer details
 */
export interface OfferFlight {
  type: 'flight';
  airline: string;
  flightNumber: string;
  departure: FlightLocation;
  arrival: FlightLocation;
  class?: FlightClass;
  aircraft?: string | null;
  duration?: string | null; // ISO 8601 duration
  stops: number;
  price?: Price | null;
  baggageAllowance?: string | null;
  sourceUrl?: string | null;
  sourceProvider?: string | null;
}

/**
 * Union type for all offers
 */
export type Offer = OfferHotel | OfferFlight;
