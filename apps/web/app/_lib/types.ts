/**
 * Re-export all types from @travel/contracts.
 * This allows existing imports from '@/app/_lib/types' to continue working.
 */
export type {
  Trip,
  TripStatus,
  TripItem,
  TripItemType,
  TripItemStatus,
  Location,
  Price,
  FlightLocation,
  FlightClass,
  OfferHotel,
  OfferFlight,
  Offer,
  Media,
  MediaType,
  MediaSource,
  MediaAttribution,
  Citation,
  CitationType,
} from '@travel/contracts';
