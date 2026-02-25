import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/app/_lib/prisma';

const MAX_PAYLOAD_BYTES = parseInt(
  process.env.WEBHOOK_MAX_PAYLOAD_BYTES || '10485760',
  10
); // default 10MB
const MAX_FIELD_BYTES = 1_048_576; // 1MB per text field

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

/** Truncate a string field to maxBytes, logging if truncation occurs */
function truncateField(value: string | null, fieldName: string): string | null {
  if (!value) return null;
  if (value.length <= MAX_FIELD_BYTES) return value;
  console.warn(
    `Webhook: truncating ${fieldName} from ${value.length} to ${MAX_FIELD_BYTES} bytes`
  );
  return value.slice(0, MAX_FIELD_BYTES);
}

/**
 * POST /api/email/inbound
 *
 * Accepts a SendGrid-style inbound email payload.
 * Requires WEBHOOK_EMAIL_SECRET via Authorization: Bearer header.
 * Stores the raw payload in InboundEmail (no auto-linking to trips).
 */
export async function POST(request: NextRequest) {
  // FIX-1: Shared secret authentication (before any payload parsing)
  const secret = process.env.WEBHOOK_EMAIL_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : '';

  if (!token || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // FIX-3: Payload size check via Content-Length header
  const contentLength = parseInt(
    request.headers.get('content-length') ?? '0',
    10
  );
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return NextResponse.json(
      { error: 'Payload too large' },
      { status: 413 }
    );
  }

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

  // Generate a unique message ID if not present in headers
  const messageId = extractMessageId(rawHeaders) || `<${crypto.randomUUID()}@travel.aw>`;

  const receivedAt = new Date();

  try {
    // Store raw inbound email (no auto-linking — linkedTripId stays null)
    const inboundEmail = await prisma.inboundEmail.create({
      data: {
        messageId,
        from: fromEmail,
        to: extractEmail(toRaw) || 'inbox@travel.aw',
        subject,
        bodyText: truncateField(textBody, 'bodyText'),
        bodyHtml: truncateField(htmlBody, 'bodyHtml'),
        rawHeaders: truncateField(rawHeaders, 'rawHeaders'),
        attachments: truncateField(attachments, 'attachments'),
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

    // TODO: implement user-initiated trip linking (requires sender→user resolution)

    return NextResponse.json({
      ok: true,
      inboundEmailId: inboundEmail.id,
    });
  } catch (err) {
    // Unique constraint violation (duplicate messageId) → 409
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Duplicate email (messageId already exists)' },
        { status: 409 }
      );
    }

    console.error('Email ingest error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** Extract Message-ID from raw email headers */
function extractMessageId(rawHeaders: string | null): string | null {
  if (!rawHeaders) return null;
  const match = rawHeaders.match(/^Message-ID:\s*(.+)$/im);
  return match ? match[1].trim() : null;
}
