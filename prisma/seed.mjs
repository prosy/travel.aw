import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.tripItem.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.cachedMedia.deleteMany();
  await prisma.inboundEmail.deleteMany();
  await prisma.offerCache.deleteMany();

  // ============================================================================
  // Trip 1: Tokyo Adventure
  // ============================================================================
  const tokyoTrip = await prisma.trip.create({
    data: {
      name: 'Tokyo Adventure 2026',
      description: 'A week exploring Tokyo, from ancient temples to modern tech districts',
      startDate: '2026-04-10',
      endDate: '2026-04-17',
      destination: 'Tokyo, Japan',
      status: 'planned',
      items: {
        create: [
          {
            type: 'flight',
            title: 'SFO → NRT (United Airlines)',
            description: 'Outbound flight to Tokyo Narita',
            startDateTime: new Date('2026-04-10T10:30:00Z'),
            endDateTime: new Date('2026-04-11T14:45:00Z'),
            locationName: 'San Francisco International Airport',
            confirmationNumber: 'UA8834521',
            priceAmount: 1250.00,
            priceCurrency: 'USD',
            status: 'confirmed',
            offerData: JSON.stringify({
              type: 'flight',
              airline: 'United Airlines',
              flightNumber: 'UA837',
              departure: {
                airport: 'SFO',
                city: 'San Francisco',
                dateTime: '2026-04-10T10:30:00Z',
                terminal: 'International G'
              },
              arrival: {
                airport: 'NRT',
                city: 'Tokyo',
                dateTime: '2026-04-11T14:45:00+09:00',
                terminal: '1'
              },
              class: 'economy',
              duration: 'PT11H15M',
              stops: 0
            })
          },
          {
            type: 'hotel',
            title: 'Park Hyatt Tokyo',
            description: 'Luxury hotel in Shinjuku with stunning city views',
            startDateTime: new Date('2026-04-11T15:00:00+09:00'),
            endDateTime: new Date('2026-04-17T11:00:00+09:00'),
            locationName: 'Park Hyatt Tokyo',
            locationAddress: '3-7-1-2 Nishi Shinjuku, Shinjuku City, Tokyo 163-1055',
            locationLat: 35.6855,
            locationLng: 139.6906,
            confirmationNumber: 'PHT-2026-88421',
            priceAmount: 2100.00,
            priceCurrency: 'USD',
            status: 'confirmed',
            offerData: JSON.stringify({
              type: 'hotel',
              hotelName: 'Park Hyatt Tokyo',
              hotelChain: 'Hyatt',
              starRating: 5,
              roomType: 'Park Deluxe King',
              checkIn: '2026-04-11',
              checkOut: '2026-04-17',
              amenities: ['spa', 'pool', 'gym', 'restaurant', 'bar'],
              pricePerNight: { amount: 350, currency: 'USD' },
              totalPrice: { amount: 2100, currency: 'USD' }
            })
          },
          {
            type: 'activity',
            title: 'Senso-ji Temple & Asakusa Tour',
            description: 'Guided walking tour of historic Asakusa district',
            startDateTime: new Date('2026-04-12T09:00:00+09:00'),
            endDateTime: new Date('2026-04-12T13:00:00+09:00'),
            locationName: 'Senso-ji Temple',
            locationAddress: '2-3-1 Asakusa, Taito City, Tokyo',
            locationLat: 35.7148,
            locationLng: 139.7967,
            priceAmount: 85.00,
            priceCurrency: 'USD',
            status: 'confirmed'
          },
          {
            type: 'flight',
            title: 'NRT → SFO (United Airlines)',
            description: 'Return flight from Tokyo',
            startDateTime: new Date('2026-04-17T17:00:00+09:00'),
            endDateTime: new Date('2026-04-17T20:30:00Z'),
            locationName: 'Tokyo Narita Airport',
            confirmationNumber: 'UA8834522',
            priceAmount: 1180.00,
            priceCurrency: 'USD',
            status: 'confirmed',
            offerData: JSON.stringify({
              type: 'flight',
              airline: 'United Airlines',
              flightNumber: 'UA838',
              departure: {
                airport: 'NRT',
                city: 'Tokyo',
                dateTime: '2026-04-17T17:00:00+09:00',
                terminal: '1'
              },
              arrival: {
                airport: 'SFO',
                city: 'San Francisco',
                dateTime: '2026-04-17T20:30:00Z',
                terminal: 'International G'
              },
              class: 'economy',
              duration: 'PT9H30M',
              stops: 0
            })
          }
        ]
      }
    }
  });

  console.log(`Created trip: ${tokyoTrip.name} with ${4} items`);

  // ============================================================================
  // Trip 2: Italian Summer
  // ============================================================================
  const italyTrip = await prisma.trip.create({
    data: {
      name: 'Italian Summer 2026',
      description: 'Rome, Florence, and the Amalfi Coast',
      startDate: '2026-06-15',
      endDate: '2026-06-25',
      destination: 'Italy',
      status: 'draft',
      items: {
        create: [
          {
            type: 'flight',
            title: 'JFK → FCO (Alitalia)',
            description: 'Flight to Rome Fiumicino',
            startDateTime: new Date('2026-06-15T18:00:00Z'),
            endDateTime: new Date('2026-06-16T08:30:00+02:00'),
            locationName: 'JFK International Airport',
            priceAmount: 890.00,
            priceCurrency: 'USD',
            status: 'pending',
            offerData: JSON.stringify({
              type: 'flight',
              airline: 'ITA Airways',
              flightNumber: 'AZ611',
              departure: {
                airport: 'JFK',
                city: 'New York',
                dateTime: '2026-06-15T18:00:00Z',
                terminal: '1'
              },
              arrival: {
                airport: 'FCO',
                city: 'Rome',
                dateTime: '2026-06-16T08:30:00+02:00',
                terminal: '3'
              },
              class: 'economy',
              duration: 'PT8H30M',
              stops: 0
            })
          },
          {
            type: 'hotel',
            title: 'Hotel de Russie, Rome',
            description: 'Luxury hotel near Piazza del Popolo',
            startDateTime: new Date('2026-06-16T14:00:00+02:00'),
            endDateTime: new Date('2026-06-19T11:00:00+02:00'),
            locationName: 'Hotel de Russie',
            locationAddress: 'Via del Babuino, 9, 00187 Roma RM, Italy',
            locationLat: 41.9097,
            locationLng: 12.4769,
            priceAmount: 1350.00,
            priceCurrency: 'EUR',
            status: 'pending',
            offerData: JSON.stringify({
              type: 'hotel',
              hotelName: 'Hotel de Russie',
              hotelChain: 'Rocco Forte Hotels',
              starRating: 5,
              roomType: 'Deluxe Room with Garden View',
              checkIn: '2026-06-16',
              checkOut: '2026-06-19',
              amenities: ['spa', 'garden', 'restaurant', 'bar', 'gym'],
              pricePerNight: { amount: 450, currency: 'EUR' },
              totalPrice: { amount: 1350, currency: 'EUR' }
            })
          },
          {
            type: 'transport',
            title: 'Rome → Florence (High-speed train)',
            description: 'Frecciarossa high-speed train',
            startDateTime: new Date('2026-06-19T11:30:00+02:00'),
            endDateTime: new Date('2026-06-19T13:00:00+02:00'),
            locationName: 'Roma Termini',
            priceAmount: 55.00,
            priceCurrency: 'EUR',
            confirmationNumber: 'TI7723901',
            status: 'pending'
          },
          {
            type: 'hotel',
            title: 'Portrait Firenze',
            description: 'Boutique hotel on the Arno River',
            startDateTime: new Date('2026-06-19T14:00:00+02:00'),
            endDateTime: new Date('2026-06-22T11:00:00+02:00'),
            locationName: 'Portrait Firenze',
            locationAddress: 'Lungarno degli Acciaiuoli, 4, 50123 Firenze FI, Italy',
            locationLat: 43.7696,
            locationLng: 11.2530,
            priceAmount: 1200.00,
            priceCurrency: 'EUR',
            status: 'pending'
          },
          {
            type: 'activity',
            title: 'Uffizi Gallery Tour',
            description: 'Skip-the-line guided tour of the Uffizi',
            startDateTime: new Date('2026-06-20T10:00:00+02:00'),
            endDateTime: new Date('2026-06-20T13:00:00+02:00'),
            locationName: 'Uffizi Gallery',
            locationAddress: 'Piazzale degli Uffizi, 6, 50122 Firenze FI, Italy',
            locationLat: 43.7677,
            locationLng: 11.2553,
            priceAmount: 75.00,
            priceCurrency: 'EUR',
            status: 'pending'
          },
          {
            type: 'restaurant',
            title: 'Dinner at Enoteca Pinchiorri',
            description: '3-Michelin star restaurant experience',
            startDateTime: new Date('2026-06-21T20:00:00+02:00'),
            endDateTime: new Date('2026-06-21T23:00:00+02:00'),
            locationName: 'Enoteca Pinchiorri',
            locationAddress: 'Via Ghibellina, 87, 50122 Firenze FI, Italy',
            locationLat: 43.7706,
            locationLng: 11.2610,
            priceAmount: 350.00,
            priceCurrency: 'EUR',
            status: 'pending'
          }
        ]
      }
    }
  });

  console.log(`Created trip: ${italyTrip.name} with ${6} items`);

  // ============================================================================
  // Sample Cached Media
  // ============================================================================
  await prisma.cachedMedia.create({
    data: {
      type: 'image',
      source: 'wikimedia',
      originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg',
      title: 'Tokyo Shinjuku Skyline',
      alt: 'Aerial view of Shinjuku skyscrapers in Tokyo',
      attribution: JSON.stringify({
        author: 'Morio',
        license: 'CC BY-SA 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Skyscrapers_of_Shinjuku_2009_January.jpg'
      }),
      width: 4000,
      height: 2667,
      mimeType: 'image/jpeg'
    }
  });

  await prisma.cachedMedia.create({
    data: {
      type: 'image',
      source: 'wikimedia',
      originalUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Colosseum_in_Rome-April_2007-1-_copie_2B.jpg',
      title: 'Colosseum, Rome',
      alt: 'The Roman Colosseum at sunset',
      attribution: JSON.stringify({
        author: 'Diliff',
        license: 'CC BY-SA 2.5',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.5/',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Colosseum_in_Rome-April_2007-1-_copie_2B.jpg'
      }),
      width: 3888,
      height: 2592,
      mimeType: 'image/jpeg'
    }
  });

  console.log('Created 2 cached media entries');

  // ============================================================================
  // Sample Inbound Email
  // ============================================================================
  await prisma.inboundEmail.create({
    data: {
      messageId: '<confirmation-123456@united.com>',
      from: 'confirmations@united.com',
      to: 'traveler@example.com',
      subject: 'Your United Airlines Flight Confirmation - UA837',
      bodyText: 'Thank you for booking with United Airlines. Your confirmation number is UA8834521...',
      extractionStatus: 'completed',
      receivedAt: new Date('2026-03-15T10:30:00Z'),
      processedAt: new Date('2026-03-15T10:31:00Z'),
      linkedTripId: tokyoTrip.id,
      extractedData: JSON.stringify({
        type: 'flight',
        airline: 'United Airlines',
        flightNumber: 'UA837',
        confirmationNumber: 'UA8834521'
      })
    }
  });

  console.log('Created 1 inbound email entry');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
