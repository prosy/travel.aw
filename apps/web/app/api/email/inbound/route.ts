import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * SendGrid-style inbound email payload (subset of fields we care about).
 * See: https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook
 */
interface InboundPayload {
  headers?: string;
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
  envelope?: string;
  /** Attached files metadata as JSON */
  attachments?: string;
  /** Number of attachments */
  attachments_count?: string;
  /** Spam score */
  spam_score?: string;
  /** Raw payload for passthrough */
  [key: string]: unknown;
}

/** Extract a clean email address from a "Name <email>" string */
function extractEmail(raw: string | undefined): string {
  if (!raw) return '';
  const match = raw.match(/<([^>]+)>/);
  return match ? match[1] : raw.trim();
}

/** Extract display name from a "Name <email>" string */
function extractName(raw: string | undefined): string {
  if (!raw) return '';
  const match = raw.match(/^(.+?)\s*</);
  return match ? match[1].replace(/^["']|["']$/g, '').trim() : '';
}

/**
 * POST /api/email/inbound
 *
 * Accepts a SendGrid-style inbound email payload:
 * 1. Stores the raw payload in InboundEmail
 * 2. Creates a TripItem (type="note") with evidence.kind=email
 *    linked to the first available trip (or none if no trips exist)
 */
export async function POST(request: NextRequest) {
  let body: InboundPayload;

  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      // SendGrid sends multipart/form-data
      const formData = await request.formData();
      body = {} as InboundPayload;
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          (body as Record<string, unknown>)[key] = value;
        }
      }
    }
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const fromRaw = typeof body.from === 'string' ? body.from : '';
  const toRaw = typeof body.to === 'string' ? body.to : '';
  const subject = typeof body.subject === 'string' ? body.subject : null;
  const textBody = typeof body.text === 'string' ? body.text : null;
  const htmlBody = typeof body.html === 'string' ? body.html : null;
  const rawHeaders = typeof body.headers === 'string' ? body.headers : null;
  const attachments = typeof body.attachments === 'string' ? body.attachments : null;

  const fromEmail = extractEmail(fromRaw) || 'unknown@unknown';
  const fromName = extractName(fromRaw);

  // Generate a deterministic message ID if not present in headers
  const messageId = extractMessageId(rawHeaders) || `<inbound-${Date.now()}@travel.aw>`;

  const receivedAt = new Date();

  try {
    // 1. Store raw inbound email
    const inboundEmail = await prisma.inboundEmail.create({
      data: {
        messageId,
        from: fromEmail,
        to: extractEmail(toRaw) || 'inbox@travel.aw',
        subject,
        bodyText: textBody,
        bodyHtml: htmlBody,
        rawHeaders,
        attachments,
        extractionStatus: 'completed',
        receivedAt,
        processedAt: new Date(),
        extractedData: JSON.stringify({
          from: fromEmail,
          fromName,
          subject,
          receivedAt: receivedAt.toISOString(),
        }),
      },
    });

    // 2. Find the first trip to link to (safe default)
    const trip = await prisma.trip.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    let tripItemId: string | null = null;

    if (trip) {
      // 3. Create a TripItem (type=note) with evidence.kind=email
      const tripItem = await prisma.tripItem.create({
        data: {
          tripId: trip.id,
          type: 'note',
          title: subject || `Email from ${fromName || fromEmail}`,
          description: textBody ? textBody.slice(0, 500) : null,
          startDateTime: receivedAt,
          status: 'pending',
          // Store evidence reference in offerData as JSON
          offerData: JSON.stringify({
            evidence: {
              kind: 'email',
              inboundEmailId: inboundEmail.id,
              from: fromEmail,
              fromName,
              subject,
              receivedAt: receivedAt.toISOString(),
            },
          }),
        },
      });

      tripItemId = tripItem.id;

      // Update the inbound email with the linked trip
      await prisma.inboundEmail.update({
        where: { id: inboundEmail.id },
        data: { linkedTripId: trip.id },
      });
    }

    return NextResponse.json({
      ok: true,
      inboundEmailId: inboundEmail.id,
      tripItemId,
      linkedTripId: trip?.id ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    // If it's a unique constraint violation (duplicate messageId), return 409
    if (message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Duplicate email (messageId already exists)' },
        { status: 409 }
      );
    }

    console.error('Email ingest error:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** Extract Message-ID from raw email headers */
function extractMessageId(rawHeaders: string | null): string | null {
  if (!rawHeaders) return null;
  const match = rawHeaders.match(/^Message-ID:\s*(.+)$/im);
  return match ? match[1].trim() : null;
}
