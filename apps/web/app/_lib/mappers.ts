import type {
  Trip,
  TripItem,
  TripStatus,
  TripItemType,
  TripItemStatus,
  Location,
  Price,
  Citation,
  Media,
  MediaType,
  MediaSource,
  MediaAttribution,
} from '@travel/contracts';
import type {
  Trip as PrismaTrip,
  TripItem as PrismaTripItem,
  CachedMedia as PrismaCachedMedia,
} from '@prisma/client';

type PrismaTripWithItems = PrismaTrip & { items?: PrismaTripItem[] };

export function mapTrip(prismaTrip: PrismaTripWithItems): Trip {
  return {
    id: prismaTrip.id,
    name: prismaTrip.name,
    description: prismaTrip.description,
    startDate: prismaTrip.startDate,
    endDate: prismaTrip.endDate,
    destination: prismaTrip.destination,
    status: prismaTrip.status as TripStatus,
    items: prismaTrip.items?.map(mapTripItem),
    createdAt: prismaTrip.createdAt.toISOString(),
    updatedAt: prismaTrip.updatedAt.toISOString(),
  };
}

export function mapTripItem(item: PrismaTripItem): TripItem {
  const location: Location | null = item.locationName
    ? {
        name: item.locationName,
        address: item.locationAddress ?? null,
        lat: item.locationLat ?? null,
        lng: item.locationLng ?? null,
      }
    : null;

  const price: Price | null =
    item.priceAmount != null
      ? { amount: item.priceAmount, currency: item.priceCurrency ?? 'USD' }
      : null;

  let offer = null;
  if (item.offerData) {
    try {
      offer = JSON.parse(item.offerData);
    } catch (e) {
      console.error(`Malformed offerData for TripItem ${item.id}:`, e);
    }
  }

  let citations: Citation[] | undefined;
  if (item.citationsData) {
    try {
      citations = JSON.parse(item.citationsData);
    } catch (e) {
      console.error(`Malformed citationsData for TripItem ${item.id}:`, e);
    }
  }

  return {
    id: item.id,
    tripId: item.tripId,
    type: item.type as TripItemType,
    title: item.title,
    description: item.description,
    startDateTime: item.startDateTime.toISOString(),
    endDateTime: item.endDateTime?.toISOString() ?? null,
    location,
    confirmationNumber: item.confirmationNumber,
    price,
    status: item.status as TripItemStatus,
    offer,
    citations,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function mapMedia(m: PrismaCachedMedia): Media {
  let attribution: MediaAttribution | null = null;
  if (m.attribution) {
    try {
      attribution = JSON.parse(m.attribution);
    } catch (e) {
      console.error(`Malformed attribution for CachedMedia ${m.id}:`, e);
    }
  }

  const dimensions =
    m.width != null && m.height != null
      ? { width: m.width, height: m.height }
      : null;

  return {
    id: m.id,
    type: m.type as MediaType,
    source: m.source as MediaSource,
    url: m.cachedUrl ?? m.originalUrl,
    thumbnailUrl: m.thumbnailUrl ?? null,
    title: m.title ?? null,
    alt: m.alt ?? null,
    attribution,
    dimensions,
    mimeType: m.mimeType ?? null,
    cachedAt: m.cachedAt.toISOString(),
  };
}
