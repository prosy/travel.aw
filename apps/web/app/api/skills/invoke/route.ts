import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import {
  createSkillRunner,
  SkillRunnerError,
  ContainerTimeoutError,
  ManifestValidationError,
  ConfigError,
} from '@travel/skill-runner';
import path from 'path';

// --- Configuration ---

const SKILLS_DIR = process.env.SKILLS_DIR;

const ALLOWED_SKILLS: Record<string, { action: string; requiredParams: string[] }> = {
  'flight-search': {
    action: 'search_flights',
    requiredParams: ['origin', 'destination', 'date'],
  },
  'hotel-search': {
    action: 'search_hotels',
    requiredParams: ['city_code', 'check_in', 'check_out'],
  },
};

const MAX_STRING_LENGTH = 500;

// --- Rate limiting (basic in-memory, per-user) ---

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

// --- SkillRunner singleton ---

const runner = createSkillRunner({
  timeoutSeconds: 30,
  memoryMb: 256,
  cpus: 0.5,
});

// --- Route handler ---

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Skills configured?
    if (!SKILLS_DIR) {
      return NextResponse.json(
        { error: 'Skills not configured', code: 'SKILLS_NOT_CONFIGURED' },
        { status: 503 },
      );
    }

    // 3. Rate limit
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.', code: 'RATE_LIMITED' },
        { status: 429 },
      );
    }

    // 4. Parse body
    const body = await request.json();
    const { skill, action, params } = body as {
      skill?: string;
      action?: string;
      params?: Record<string, unknown>;
    };

    // 5. Validate skill name (allowlist)
    if (!skill || !ALLOWED_SKILLS[skill]) {
      return NextResponse.json(
        { error: `Invalid skill. Allowed: ${Object.keys(ALLOWED_SKILLS).join(', ')}` },
        { status: 400 },
      );
    }

    const skillConfig = ALLOWED_SKILLS[skill];

    // 6. Validate action matches skill
    if (action !== skillConfig.action) {
      return NextResponse.json(
        { error: `Invalid action for ${skill}. Expected: ${skillConfig.action}` },
        { status: 400 },
      );
    }

    // 7. Validate params
    if (!params || typeof params !== 'object') {
      return NextResponse.json(
        { error: 'params is required and must be an object' },
        { status: 400 },
      );
    }

    const missingParams = skillConfig.requiredParams.filter(
      (p) => !(p in params) || params[p] === '' || params[p] === undefined,
    );
    if (missingParams.length > 0) {
      return NextResponse.json(
        { error: `Missing required params: ${missingParams.join(', ')}` },
        { status: 400 },
      );
    }

    // 8. Enforce max string lengths
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && value.length > MAX_STRING_LENGTH) {
        return NextResponse.json(
          { error: `Param "${key}" exceeds maximum length of ${MAX_STRING_LENGTH}` },
          { status: 400 },
        );
      }
    }

    // 9. Execute skill
    const startMs = Date.now();
    const result = await runner.execute(
      {
        skillDir: path.join(SKILLS_DIR, skill),
        data: { action, params },
      },
      {
        envVars: {
          AMADEUS_API_KEY: process.env.AMADEUS_API_KEY || '',
          AMADEUS_API_SECRET: process.env.AMADEUS_API_SECRET || '',
        },
      },
    );
    const queryTimeMs = Date.now() - startMs;

    // 10. Return results
    return NextResponse.json({
      status: 'success',
      skill,
      results: result.data,
      metadata: {
        query_time_ms: queryTimeMs,
        skill_version: result.metadata.skillVersion,
      },
    });
  } catch (err) {
    // Map SkillRunner errors to safe responses
    if (err instanceof ContainerTimeoutError) {
      console.error('POST /api/skills/invoke timeout:', err.message);
      return NextResponse.json(
        { status: 'error', error: { code: 'SKILL_TIMEOUT', message: 'Search timed out. Please try again.' } },
        { status: 504 },
      );
    }

    if (err instanceof ManifestValidationError) {
      console.error('POST /api/skills/invoke manifest error:', err.message);
      return NextResponse.json(
        { status: 'error', error: { code: 'INTERNAL_ERROR', message: 'An internal error occurred.' } },
        { status: 500 },
      );
    }

    if (err instanceof ConfigError) {
      console.error('POST /api/skills/invoke config error:', err.message);
      return NextResponse.json(
        { status: 'error', error: { code: 'SKILLS_NOT_CONFIGURED', message: 'Skills service is not properly configured.' } },
        { status: 503 },
      );
    }

    if (err instanceof SkillRunnerError) {
      console.error(`POST /api/skills/invoke skill error [${err.code}]:`, err.message);
      return NextResponse.json(
        { status: 'error', error: { code: 'SKILL_EXECUTION_ERROR', message: 'Search failed. Please try again.' } },
        { status: 500 },
      );
    }

    console.error('POST /api/skills/invoke error:', err);
    return NextResponse.json(
      { status: 'error', error: { code: 'INTERNAL_ERROR', message: 'An internal error occurred.' } },
      { status: 500 },
    );
  }
}
