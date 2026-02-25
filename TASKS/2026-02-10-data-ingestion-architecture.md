---
title: Travel Data Ingestion System - Architecture & Authorities
date: 2026-02-10
branch: feature/data-ingestion-pipeline
scope: apps/web, packages/contracts, prisma
estimate: 4-5 weeks
owner: claude
status: planning
phase: architecture
---

# Travel Data Ingestion System - Architecture & Authorities

## Overview

Comprehensive multi-source data ingestion pipeline that automatically extracts, parses, and populates structured travel data from emails, PDFs, images, and APIs using Claude's vision capabilities.

## Authority Compliance

| Authority | Applicable | Compliance Status |
|-----------|------------|-------------------|
| CODEOWNERS | ✅ | Changes to apps/web owned by @blackcat |
| SECURITY.md | ✅ | File uploads, temporary storage, data retention - requires security review |
| authz.yml | ✅ | API endpoints require user authentication |
| CI/CD | ✅ | Must pass build + type checks after changes |
| Data Privacy | ✅ | PII in travel confirmations - must follow encryption patterns |
| Rate Limiting | ✅ | Claude API calls - implement rate limits and quotas |
| Storage Limits | ✅ | 24hr TTL on temporary files, cleanup jobs required |

## Data Contracts

### 1. Audit Log Contract

**Location:** `prisma/schema.prisma` (AuditLog model) - See "Auditing & Traceability" section above for full schema

**Purpose:** Track all parsing operations for security, debugging, and cost accounting

### 2. Attachment Parse Job Contract

**Location:** `prisma/schema.prisma` (AttachmentParseJob model)

**Purpose:** Track parsing status of individual attachments from emails or file uploads

**Schema:**
```prisma
model AttachmentParseJob {
  id              String   @id @default(cuid())

  // Source linkage
  inboundEmailId  String?  // Link to InboundEmail if from email
  uploadJobId     String?  // Link to UploadParseJob if from file upload

  // File metadata
  fileName        String
  contentType     String   // image/jpeg, application/pdf, etc.
  fileSize        Int      // in bytes
  filePath        String   // Temporary storage path

  // Parsing status
  status          String   @default("pending") // pending, processing, completed, failed
  error           String?

  // Parsed result
  parsedData      String?  // JSON of ParsedTripItem
  confidence      Float?   // 0-1 confidence score

  // Processing metadata
  queuedAt        DateTime @default(now())
  processedAt     DateTime?
  expiresAt       DateTime // 24hr TTL

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status])
  @@index([inboundEmailId])
  @@index([uploadJobId])
  @@index([expiresAt])
}
```

**Validation Rules:**
- `contentType` must be one of: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- `fileSize` max: 10MB (10,485,760 bytes)
- `expiresAt` must be within 24 hours of `queuedAt`
- At least one of `inboundEmailId` or `uploadJobId` must be non-null

### 3. Upload Parse Job Contract

**Location:** `prisma/schema.prisma` (UploadParseJob model)

**Purpose:** Track batch file upload operations

**Schema:**
```prisma
model UploadParseJob {
  id              String   @id @default(cuid())

  userId          String   // User who uploaded files

  // Batch metadata
  fileCount       Int
  totalSize       Int      // Total bytes of all files

  // Processing status
  status          String   @default("pending") // pending, processing, completed, failed
  error           String?

  // Progress tracking
  processedCount  Int      @default(0)
  failedCount     Int      @default(0)

  // Results
  results         String?  // JSON array of ParsedTripItem results

  // Timestamps
  queuedAt        DateTime @default(now())
  completedAt     DateTime?
  expiresAt       DateTime // 24hr TTL

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([expiresAt])
}
```

**Validation Rules:**
- `fileCount` max: 10 files per batch
- `totalSize` max: 50MB (52,428,800 bytes) per batch
- `processedCount + failedCount <= fileCount`

### 4. ParsedTripItem Contract

**Location:** `packages/contracts/src/types/parsing.ts` (NEW)

**Purpose:** Standardized format for parsed travel data before database insertion

**TypeScript Definition:**
```typescript
export interface ParsedTripItem {
  // Core fields (map to TripItem)
  type: 'flight' | 'hotel' | 'rental_car' | 'event' | 'weather' | 'note';
  title: string;
  description?: string;
  startDateTime: string; // ISO 8601
  endDateTime?: string; // ISO 8601

  // Location
  locationName?: string;
  locationAddress?: string;
  locationLat?: number;
  locationLng?: number;

  // Booking details
  confirmationNumber?: string;
  priceAmount?: number;
  priceCurrency?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';

  // Offer data (type-specific structured data)
  offerData?: OfferFlight | OfferHotel | OfferRentalCar | OfferEvent;

  // Citations (provenance tracking)
  citationsData: Citation[];

  // Parsing metadata
  confidence: number; // 0-1, overall confidence score
  warnings?: string[]; // Non-fatal parsing issues
}

export interface Citation {
  type: 'email' | 'pdf' | 'image' | 'api' | 'manual';
  source: string; // Filename, email subject, or API endpoint
  confidence: number; // 0-1 score from Claude parsing
  extractedAt: string; // ISO 8601
  extractedBy: string; // 'claude-sonnet-4-5' or agent ID
  excerpt?: string; // Text snippet showing source of extraction
}
```

### 5. Document Orchestrator Contract

**Location:** `apps/web/app/_lib/parsers/orchestrator.ts` (NEW)

**Purpose:** Route documents to specialist parsers and coordinate multi-item extraction

**TypeScript Interface:**
```typescript
export interface DocumentOrchestrator {
  /**
   * Parse a document and return structured trip items
   * @param input Document to parse (image buffer, PDF, or text)
   * @param metadata Source metadata for citations
   * @returns Parsed trip items with citations and confidence scores
   */
  parse(
    input: Buffer | string,
    metadata: {
      fileName: string;
      contentType: string;
      source: 'email' | 'upload' | 'api';
      sourceId?: string;
    }
  ): Promise<ParseResult>;
}

export interface ParseResult {
  items: ParsedTripItem[];
  citations: Citation[];
  confidence: number; // Overall confidence (min of all items)
  errors: string[]; // Fatal errors
  warnings: string[]; // Non-fatal issues
}
```

## API Pathways

### Pathway 1: Email Attachment Processing

```
[SendGrid Webhook]
  → POST /api/email/inbound
    → Parse multipart/form-data
    → Extract attachments from email
    → Store InboundEmail record
    → Create AttachmentParseJob records
    → Queue attachments for processing
    → Return { ok: true, emailId, jobIds }

[Background Worker]
  → Process AttachmentParseJob
    → Read file from temporary storage
    → Call DocumentOrchestrator.parse()
    → Store parsed result
    → Update job status
    → Delete temp file after 24hr TTL
```

**Authentication:** SendGrid webhook secret validation
**Rate Limit:** 100 emails/hour per user
**Storage:** `/tmp/travel-aw/attachments/{emailId}/{filename}`

### Pathway 2: Manual File Upload

```
[Web UI]
  → POST /api/parse/upload
    → Validate auth (getCurrentUser)
    → Validate file types and sizes
    → Create UploadParseJob record
    → Create AttachmentParseJob for each file
    → Store files in temporary storage
    → Return { jobId }

  → GET /api/parse/upload/[jobId]
    → Validate auth + ownership
    → Return job status + results
    → { status, processedCount, results }

[Background Worker]
  → Process AttachmentParseJob (same as Pathway 1)
```

**Authentication:** Auth0 JWT (getCurrentUser)
**Rate Limit:** 10 uploads/hour per user
**Storage:** `/tmp/travel-aw/uploads/{userId}/{jobId}/{filename}`

### Pathway 3: Parsing Review & Validation

```
[Web UI - Review Modal]
  → GET /api/parse/review/[jobId]
    → Validate auth + ownership
    → Fetch UploadParseJob + parsed results
    → Return ParsedTripItem[] with confidence scores

  → POST /api/parse/review/[jobId]/approve
    → Validate auth + ownership
    → Validate edited ParsedTripItem data
    → Create TripItem records with offerData and citationsData
    → Update job status to 'completed'
    → Return { tripItemIds }

  → POST /api/parse/review/[jobId]/reject
    → Validate auth + ownership
    → Update job status to 'rejected'
    → Delete temporary files
    → Return { ok: true }
```

**Authentication:** Auth0 JWT (getCurrentUser)
**Authorization:** User must own the UploadParseJob

## Specialist Parser Manifests

### Parser 1: Airline Confirmation Parser

**File:** `apps/web/app/_lib/parsers/airline.ts`

**Supports:**
- Email confirmations (text/html)
- PDF boarding passes
- Screenshots from airline apps

**Claude Prompt:** `AIRLINE_PARSE_PROMPT` in `apps/web/app/_lib/prompts/airline.ts`

**Output Contract:** `ParsedTripItem` with `offerData: OfferFlight`

**Confidence Thresholds:**
- Flight number match: Required (fail if not found)
- Departure/arrival airports: Required
- Date/time: Required
- Seat, gate, baggage: Optional (low confidence acceptable)

### Parser 2: Hotel Confirmation Parser

**File:** `apps/web/app/_lib/parsers/hotel.ts`

**Supports:**
- Email confirmations from major brands
- PDF vouchers
- Airbnb/Vrbo confirmations

**Claude Prompt:** `HOTEL_PARSE_PROMPT` in `apps/web/app/_lib/prompts/hotel.ts`

**Output Contract:** `ParsedTripItem` with `offerData: OfferHotel`

**Confidence Thresholds:**
- Hotel name: Required
- Check-in/check-out dates: Required
- Room type, address: High confidence preferred
- Amenities, policies: Optional

### Parser 3: Rental Car Parser

**File:** `apps/web/app/_lib/parsers/rental-car.ts`

**Supports:**
- Email confirmations from major rental companies
- PDF vouchers

**Claude Prompt:** `RENTAL_CAR_PARSE_PROMPT` in `apps/web/app/_lib/prompts/rental-car.ts`

**Output Contract:** `ParsedTripItem` with `offerData: OfferRentalCar` (NEW type)

**New Type Definition:** `packages/contracts/src/types/offer-rental-car.ts`

### Parser 4: Event/Activity Parser

**File:** `apps/web/app/_lib/parsers/event.ts`

**Supports:**
- Ticketmaster/Eventbrite confirmations
- Restaurant reservations (OpenTable, Resy)
- Calendar invites (.ics files)

**Claude Prompt:** `EVENT_PARSE_PROMPT` in `apps/web/app/_lib/prompts/event.ts`

**Output Contract:** `ParsedTripItem` with `offerData: OfferEvent` (NEW type)

**New Type Definition:** `packages/contracts/src/types/offer-event.ts`

## Auditing & Traceability

### Production Requirements

**All operations must be auditable with complete traceability for:**
- Security compliance (SOC 2, GDPR)
- Debugging parsing failures
- User trust and transparency
- Cost accounting (Claude API usage)
- Performance optimization

### Audit Log Contract

**Location:** `prisma/schema.prisma` (AuditLog model)

**Schema:**
```prisma
model AuditLog {
  id            String   @id @default(cuid())

  // Who
  userId        String?  // User who triggered action (null for system)
  user          User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  // What
  action        String   // parse_upload, parse_email, parse_complete, parse_fail, review_approve, review_reject, file_upload, file_delete
  resource      String   // AttachmentParseJob, UploadParseJob, TripItem
  resourceId    String   // ID of the resource

  // Context
  metadata      String?  // JSON with action-specific details
  ipAddress     String?
  userAgent     String?

  // Result
  status        String   // success, failure, partial
  error         String?

  // Cost tracking
  apiCalls      Int?     // Number of Claude API calls
  apiCost       Float?   // Estimated cost in USD
  tokensUsed    Int?     // Total tokens (prompt + completion)

  // Timestamps
  startedAt     DateTime @default(now())
  completedAt   DateTime?
  duration      Int?     // milliseconds

  createdAt     DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([resource, resourceId])
  @@index([startedAt])
  @@index([status])
}
```

### Audit Events to Log

| Action | Trigger | Metadata |
|--------|---------|----------|
| `file_upload` | User uploads files via `/api/parse/upload` | `{ fileCount, totalSize, fileNames, jobId }` |
| `parse_start` | Background worker starts parsing attachment | `{ jobId, fileName, contentType, parser }` |
| `parse_complete` | Parsing succeeds | `{ jobId, confidence, itemsExtracted, fieldsExtracted }` |
| `parse_fail` | Parsing fails | `{ jobId, error, retryCount }` |
| `review_approve` | User approves parsed data | `{ jobId, tripItemIds, editsApplied }` |
| `review_reject` | User rejects parsed data | `{ jobId, reason }` |
| `email_inbound` | Email received via webhook | `{ emailId, from, subject, attachmentCount }` |
| `file_delete` | Temporary file deleted | `{ jobId, fileName, reason: 'expired' or 'user_deleted' }` |
| `api_call` | Claude API called for parsing | `{ jobId, model, promptTokens, completionTokens, cost }` |

### Citation Chain (Provenance Tracking)

**Every TripItem must maintain full lineage:**

```typescript
interface Citation {
  // Source document
  type: 'email' | 'pdf' | 'image' | 'api' | 'manual' | 'edited';
  source: string; // Original filename or email subject
  sourceId?: string; // AttachmentParseJob.id or InboundEmail.id

  // Extraction metadata
  confidence: number; // 0-1 from Claude
  extractedAt: string; // ISO 8601
  extractedBy: string; // 'claude-sonnet-4-5-20250929'

  // Field-level provenance
  fields?: Record<string, {
    value: string;
    confidence: number;
    excerpt?: string; // Text snippet from source
  }>;

  // Chain of custody
  editedBy?: string; // userId if manually edited
  editedAt?: string; // ISO 8601
  previousValue?: string; // For audit trail
}
```

**Example Citation Chain:**
```json
{
  "citationsData": [
    {
      "type": "pdf",
      "source": "delta-confirmation-12345.pdf",
      "sourceId": "apj_abc123",
      "confidence": 0.95,
      "extractedAt": "2026-02-10T14:30:00Z",
      "extractedBy": "claude-sonnet-4-5-20250929",
      "fields": {
        "flightNumber": {
          "value": "DL1234",
          "confidence": 1.0,
          "excerpt": "Flight DL1234"
        },
        "departureTime": {
          "value": "2026-03-15T08:00:00Z",
          "confidence": 0.92,
          "excerpt": "Departs: 8:00 AM EST"
        }
      }
    },
    {
      "type": "edited",
      "editedBy": "user_xyz",
      "editedAt": "2026-02-10T14:35:00Z",
      "fields": {
        "seatNumber": {
          "value": "12A",
          "previousValue": "12B",
          "confidence": 1.0
        }
      }
    }
  ]
}
```

### Monitoring & Alerting

**Metrics to Track:**
- Parse success rate (by document type)
- Average confidence scores (flag if dropping)
- API error rates (Claude, weather, etc.)
- Average processing time per document
- User approval vs rejection rate
- Cost per parse operation

**Alerts to Configure:**
- Parse failure rate > 10% (5 min window)
- Average confidence < 0.7 (15 min window)
- Claude API rate limit approaching (80% of quota)
- Temporary file storage > 1GB (cleanup job failing?)
- Processing time > 30s per document (performance degradation)

**Implementation:**
- Store metrics in `AuditLog` aggregations
- Daily rollup job for analytics
- Vercel Analytics or custom dashboard
- Slack/email alerts for critical thresholds

### GDPR & Data Retention

**User Rights:**
- Right to access: Export all AuditLog entries for userId
- Right to deletion: Cascade delete all parse jobs, temp files, and audit logs
- Right to rectification: Edit parsed TripItem data, tracked in citation chain

**Data Retention Policy:**
- Temporary files: 24 hours (enforced by cleanup job)
- AttachmentParseJob/UploadParseJob: 7 days after expiry
- AuditLog: 90 days (configurable per compliance needs)
- TripItem citationsData: Permanent (user can manually delete trip items)

**Implementation:**
- `apps/web/app/api/user/export-data/route.ts` - GDPR export
- `apps/web/app/api/user/delete-account/route.ts` - Right to deletion
- Update cleanup job to respect retention periods

## Security Considerations

### 1. File Upload Security

**Threats:**
- Malicious file uploads (malware, zip bombs)
- Path traversal attacks
- MIME type spoofing

**Mitigations:**
- Whitelist content types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf` only
- Validate file signatures (magic bytes), not just extensions
- Store uploads outside webroot in temporary directory
- Generate random filenames (prevent path traversal)
- Scan PDFs for embedded scripts before processing
- 10MB per file limit, 50MB per batch limit
- 24-hour TTL with automatic cleanup job

### 2. PII Handling

**Sensitive Data in Confirmations:**
- Full names, passport numbers (hotels)
- Credit card last 4 digits (receipts)
- Addresses, phone numbers (contact info)
- Known traveler numbers (TSA PreCheck)

**Mitigations:**
- Store raw attachments encrypted at rest (AES-256-GCM)
- Redact PII from ParsedTripItem before review UI
- Follow existing encryption pattern: `apps/web/app/_lib/encryption.ts`
- Delete temporary files after 24 hours
- Audit log all file access

### 3. Claude API Security

**Threats:**
- Prompt injection via document content
- API key exposure
- Rate limit exhaustion

**Mitigations:**
- Sandbox document content in Claude prompts (use delimiters)
- Never echo raw document content in prompts
- API key in environment variable (not committed)
- Rate limiting: 100 API calls/hour per user
- Cost monitoring: Track Claude API usage per user
- Graceful degradation if API rate limit hit

### 4. Error Handling & Resilience

**Production systems must gracefully handle failures:**

**Retry Strategy:**
```typescript
interface RetryConfig {
  maxAttempts: 3;
  backoff: 'exponential'; // 1s, 2s, 4s
  retryableErrors: [
    'RATE_LIMIT_EXCEEDED',
    'NETWORK_ERROR',
    'TIMEOUT',
    'SERVICE_UNAVAILABLE'
  ];
  nonRetryableErrors: [
    'INVALID_FILE_TYPE',
    'FILE_TOO_LARGE',
    'MALFORMED_DOCUMENT',
    'AUTHENTICATION_FAILED'
  ];
}
```

**Circuit Breaker:**
- If Claude API fails 5 times in 1 minute, stop processing for 5 minutes
- Return graceful error to user: "Parsing service temporarily unavailable"
- Log to AuditLog with `status='circuit_breaker_open'`
- Auto-retry queued jobs when circuit closes

**Partial Success Handling:**
- Multi-page PDF with 3 pages: if page 1 succeeds, pages 2-3 fail → still return page 1 result
- Multi-item document (flight + hotel): if flight parses, hotel fails → return flight with warning
- Store partial results in `AttachmentParseJob.parsedData` with warnings array

**Graceful Degradation:**
- If weather API fails, don't block trip creation
- If geocoding fails for hotel address, use address string without lat/lng
- If confidence < 0.5 for a field, mark as "needs review" but don't fail entire parse

**Dead Letter Queue:**
- Failed jobs after 3 retries move to `status='permanently_failed'`
- Admin dashboard shows dead letter queue for manual review
- User notified: "We couldn't parse this document. Please try uploading again or contact support."

### 5. Authentication & Authorization

**Requirements:**
- All API routes require authenticated user (`getCurrentUser`)
- Users can only access their own parse jobs
- SendGrid webhook validates secret token
- No public access to uploaded files

**Implementation:**
- Reuse Auth0 pattern from `apps/web/app/_lib/auth.ts`
- Add `userId` to `UploadParseJob` model
- Check `job.userId === currentUser.id` before returning results
- SendGrid webhook secret in `.env.local`

## Cost Control & Budgeting

### Claude API Cost Management

**Pricing (as of Feb 2026):**
- Claude Sonnet 4.5: $3/M input tokens, $15/M output tokens
- Average document parse: ~2000 input tokens + 500 output tokens
- Estimated cost per document: $0.01 - $0.03

**Monthly Budget Targets:**
- Free tier: 100 parses/month per user (~$2/month)
- Pro tier: 1000 parses/month per user (~$20/month)
- Enterprise: Unlimited (cost tracking only)

**Cost Control Mechanisms:**

1. **User Quotas:**
```prisma
model User {
  // ... existing fields
  parseQuotaUsed     Int      @default(0)
  parseQuotaLimit    Int      @default(100) // Free tier
  parseQuotaResetAt  DateTime
}
```

2. **Rate Limiting:**
- 10 uploads/hour per user (prevent abuse)
- 100 parses/hour per user (prevent runaway costs)
- Circuit breaker if API costs spike unexpectedly

3. **Smart Caching:**
- Cache parsed results by file hash (SHA-256)
- If user uploads same PDF twice, return cached result
- Implement in `DocumentOrchestrator.parse()` before calling Claude

4. **Cost Tracking:**
- Log every API call in AuditLog with `apiCost`, `tokensUsed`
- Daily rollup to User.parseQuotaUsed
- Email user at 80% and 100% of quota
- Block further parses if quota exceeded (graceful error)

5. **Optimization Strategies:**
- Use smaller model (Haiku) for initial document classification
- Use Sonnet only for specialist parsing
- Compress images before sending to Claude (reduce token count)
- Extract text from PDFs with pdfjs, send text instead of full image

**Implementation:**
- `apps/web/app/_lib/parsers/quota.ts` - Quota enforcement
- `apps/web/app/api/user/usage/route.ts` - Usage dashboard

## Storage & Cleanup

### Temporary File Storage

**Location:** `/tmp/travel-aw/{type}/{id}/`
- `{type}`: `attachments` or `uploads`
- `{id}`: `emailId` or `userId_jobId`

**Retention:**
- Files stored for 24 hours after upload
- Background job runs hourly to delete expired files
- Cleanup triggered by `expiresAt` timestamp on jobs

**Implementation:**
- `apps/web/app/api/cron/cleanup-temp-files/route.ts` (NEW)
- Vercel Cron or Node.js setInterval for dev
- Delete files where `AttachmentParseJob.expiresAt < now()`

### Database Cleanup

**Expired Jobs:**
- `AttachmentParseJob` records deleted 7 days after `expiresAt`
- `UploadParseJob` records deleted 7 days after `expiresAt`
- Prevents database bloat from old parsing jobs

**Implementation:**
- Same cron job as file cleanup
- DELETE WHERE `expiresAt < now() - 7 days`

## Dependencies & Prerequisites

| Dependency | Version | Purpose |
|------------|---------|---------|
| @anthropic-ai/sdk | ^0.32.1 | Claude API client (already installed) |
| pdf-lib | ^1.17.1 | PDF parsing and page extraction (NEW) |
| sharp | ^0.33.5 | Image processing and format conversion (NEW) |
| file-type | ^19.3.0 | File type detection via magic bytes (NEW) |

**Install Command:**
```bash
cd apps/web && pnpm add pdf-lib sharp file-type
```

## Production Deployment Checklist

### Pre-Launch Requirements

**Infrastructure:**
- [ ] Set up production database (Turso/SQLite)
- [ ] Configure environment variables (DATABASE_URL, ANTHROPIC_API_KEY, SENDGRID_SECRET)
- [ ] Set up temporary file storage (S3 or local disk with backups)
- [ ] Configure Vercel Cron jobs (or alternative scheduler)
- [ ] Set up monitoring (Vercel Analytics, Sentry, or custom dashboard)
- [ ] Configure alerting (Slack, email, PagerDuty)

**Security:**
- [ ] Enable Auth0 JWT validation on all API routes
- [ ] Configure rate limiting (Vercel Edge Middleware or custom)
- [ ] Set up WAF rules (block common attack patterns)
- [ ] Encrypt temporary files at rest (if S3, enable server-side encryption)
- [ ] Implement SendGrid webhook secret validation
- [ ] Add CORS headers (allow only travel.aw domains)
- [ ] Scan dependencies for vulnerabilities (`pnpm audit`)

**Testing:**
- [ ] Load test file upload endpoint (100 concurrent uploads)
- [ ] Load test parsing pipeline (1000 documents in queue)
- [ ] Test failure scenarios (network errors, API rate limits, malformed PDFs)
- [ ] Test GDPR export and deletion flows
- [ ] Test quota enforcement (users blocked at limit)
- [ ] Penetration testing (OWASP Top 10)

**Compliance:**
- [ ] Privacy policy updated (mention AI parsing, data retention)
- [ ] Terms of service updated (file upload limits, acceptable use)
- [ ] GDPR data processing agreement (if EU users)
- [ ] SOC 2 controls documented (if required)

**Documentation:**
- [ ] User guide: How to upload travel confirmations
- [ ] API documentation (for future integrations)
- [ ] Runbook for on-call engineers (common issues + fixes)
- [ ] Architecture diagram (data flow, storage, APIs)

**Rollout Strategy:**
- Phase 1: Internal testing (team only, 1 week)
- Phase 2: Beta (50 invited users, 2 weeks)
- Phase 3: General availability (all users, with quotas)
- Gradual rollout: 10% of users → 50% → 100% (monitor for issues)

## Implementation Phases

### Phase 1: Foundation + Auditing (Stories 1.1-1.4) - 1.5 weeks

**Files Created:**
- `prisma/schema.prisma` - Add AttachmentParseJob, UploadParseJob, AuditLog models
- `packages/contracts/src/types/parsing.ts` - ParsedTripItem, Citation contracts
- `apps/web/app/_lib/parsers/types.ts` - Shared parser types
- `apps/web/app/_lib/parsers/orchestrator.ts` - DocumentOrchestrator class
- `apps/web/app/_lib/parsers/quota.ts` - Quota enforcement logic
- `apps/web/app/_lib/audit.ts` - Audit logging utilities

**Files Modified:**
- `apps/web/app/api/email/inbound/route.ts` - Add attachment extraction + auditing
- `prisma/schema.prisma` - Add `attachmentsParsed` field to InboundEmail, `parseQuota*` fields to User

**New API Routes:**
- `POST /api/parse/upload` - File upload endpoint (with audit logging)
- `GET /api/parse/upload/[jobId]` - Job status endpoint
- `GET /api/user/usage` - Parse quota usage dashboard

**Testing:**
- Upload test PDFs and images
- Verify jobs created and files stored
- Verify 24hr expiry enforced
- Verify audit logs created for all operations
- Test quota enforcement (user blocked at limit)

### Phase 2: Core Parsers + Production Hardening (Stories 2.1, 2.2, 2.6) - 2.5 weeks

**Files Created:**
- `apps/web/app/_lib/parsers/airline.ts` - Airline parser with retry logic
- `apps/web/app/_lib/parsers/hotel.ts` - Hotel parser with retry logic
- `apps/web/app/_lib/prompts/airline.ts` - Airline parsing prompt
- `apps/web/app/_lib/prompts/hotel.ts` - Hotel parsing prompt
- `apps/web/app/_components/trips/ParseReviewModal.tsx` - Review UI
- `apps/web/app/_components/trips/ParseReviewTable.tsx` - Review table
- `apps/web/app/_components/trips/ConfidenceBadge.tsx` - Confidence indicator
- `apps/web/app/_components/trips/CitationBadge.tsx` - Provenance display
- `apps/web/app/_components/trips/SourceModal.tsx` - View original document
- `apps/web/app/_lib/resilience/circuit-breaker.ts` - Circuit breaker pattern
- `apps/web/app/_lib/resilience/retry.ts` - Retry with exponential backoff

**New API Routes:**
- `GET /api/parse/review/[jobId]` - Get parsed results (with audit log)
- `POST /api/parse/review/[jobId]/approve` - Save to trip (with audit log)
- `POST /api/parse/review/[jobId]/reject` - Reject results (with audit log)

**Testing:**
- Parse real airline confirmations (Delta, United, Southwest)
- Parse real hotel confirmations (Marriott, Hilton, Airbnb)
- Verify >90% field extraction accuracy
- Test review UI with low-confidence fields flagged
- Test citation chain displays correctly
- Test retry logic with simulated API failures
- Test circuit breaker prevents runaway costs
- Load test: 100 concurrent parses

### Phase 3: Extended Parsers + Monitoring (Stories 2.3-2.5, 2.7) - 2.5 weeks

**Files Created:**
- `packages/contracts/src/types/offer-rental-car.ts` - OfferRentalCar type
- `packages/contracts/src/types/offer-event.ts` - OfferEvent type
- `apps/web/app/_lib/parsers/rental-car.ts` - Rental car parser
- `apps/web/app/_lib/parsers/event.ts` - Event parser
- `apps/web/app/_lib/weather/client.ts` - Weather API client
- `apps/web/app/_components/trips/RentalCarCard.tsx` - Display card
- `apps/web/app/_components/trips/EventCard.tsx` - Display card
- `apps/web/app/_components/trips/WeatherCard.tsx` - Display card
- `apps/web/app/api/cron/weather-refresh/route.ts` - Weather refresh job
- `apps/web/app/api/cron/cleanup-temp-files/route.ts` - File/DB cleanup job
- `apps/web/app/api/cron/quota-reset/route.ts` - Monthly quota reset
- `apps/web/app/api/admin/metrics/route.ts` - Metrics dashboard
- `apps/web/app/api/user/export-data/route.ts` - GDPR export
- `apps/web/app/api/user/delete-account/route.ts` - GDPR deletion

**Prisma Changes:**
- Add `rental_car`, `event`, `weather` to `TripItemType` enum
- Add User quota fields (`parseQuotaUsed`, `parseQuotaLimit`, `parseQuotaResetAt`)

**Testing:**
- Parse rental car confirmations
- Parse event tickets and reservations
- Verify weather data fetched for destinations
- Test cleanup job deletes expired files and old jobs
- Test quota reset job runs monthly
- Test GDPR export returns complete data
- Test account deletion cascades properly
- Verify metrics dashboard shows accurate stats

## Rollback Plan

If critical issues arise during implementation:

```bash
# Revert schema changes
git checkout HEAD -- prisma/schema.prisma
DATABASE_URL=file:./apps/web/dev.db pnpm db:push

# Revert API routes
git checkout HEAD -- apps/web/app/api/email/inbound/
git checkout HEAD -- apps/web/app/api/parse/

# Revert new packages (if causing issues)
cd apps/web
pnpm remove pdf-lib sharp file-type

# Clear temporary files
rm -rf /tmp/travel-aw/
```

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Field extraction accuracy | >90% | Manual review of 50 parsed confirmations |
| Parsing speed | <10s per document | Monitor AttachmentParseJob processing time |
| User adoption | 50% of users upload ≥1 file in first month | Analytics on `/api/parse/upload` usage |
| Error rate | <5% failed parses | Monitor `status='failed'` jobs |
| False positive rate | <10% incorrect extractions | User feedback + manual QA |

## Future Enhancements (Post-MVP)

1. **Gas Town Integration** (Phase 4) - 2-3 weeks
   - Coordinate parsing through Gas Town's multi-agent architecture
   - Mayor routes documents to specialist polecats
   - Refinery validates and merges results
   - Witness monitors success rates

2. **Real-time Email Processing** (Phase 5) - 1 week
   - Background worker processing queue
   - WebSocket notifications for parsing completion
   - Real-time progress updates in UI

3. **Smart Deduplication** (Phase 6) - 1 week
   - Detect duplicate bookings across sources
   - Fuzzy matching on confirmation numbers
   - Auto-merge or suggest merge to user

4. **Multi-language Support** (Phase 7) - 2 weeks
   - Parse confirmations in Spanish, French, German, Japanese
   - Claude handles translation automatically
   - Store original language in citations

## Questions for User

- [ ] Confirm storage location for temporary files (`/tmp` or S3-compatible?)
- [ ] Preferred weather API (OpenWeatherMap vs WeatherAPI.com)?
- [ ] SendGrid webhook secret - where to obtain/configure?
- [ ] Should we implement background worker now or defer to Phase 4 (Gas Town)?
- [ ] File upload UI - modal or dedicated page?
