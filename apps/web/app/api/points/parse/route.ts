import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCurrentUser } from '@/app/_lib/auth';
import { anthropic, LOYALTY_PROGRAM_PARSE_PROMPT } from '@/app/_lib/anthropic';
import type { PointsProgramType } from '@travel/contracts';

// FIX-1: Configurable model
const LLM_MODEL = process.env.LLM_MODEL || 'claude-sonnet-4-5-20250929';

// FIX-2: Configurable size limits
const MAX_IMAGE_BYTES = parseInt(process.env.LLM_MAX_IMAGE_BYTES || '5242880', 10); // 5MB
const MAX_IMAGE_BASE64_CHARS = Math.ceil(MAX_IMAGE_BYTES * 4 / 3); // ~6.67M chars for 5MB
const MAX_TEXT_CHARS = parseInt(process.env.LLM_MAX_TEXT_CHARS || '50000', 10);

const VALID_TYPES: PointsProgramType[] = ['airline', 'hotel', 'car_rental', 'credit_card', 'other'];

export interface ParsedProgram {
  programName: string;
  programType: PointsProgramType;
  accountNumber: string | null;
  membershipTier: string | null;
  notes: string | null;
}

/** Validate and strip a single parsed program object, returning null if invalid */
function validateProgram(raw: unknown): ParsedProgram | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  const programName = typeof obj.programName === 'string' ? obj.programName : '';
  if (!programName) return null; // programName is required

  const rawType = typeof obj.programType === 'string' ? obj.programType : '';
  const programType = VALID_TYPES.includes(rawType as PointsProgramType)
    ? (rawType as PointsProgramType)
    : 'other';

  return {
    programName,
    programType,
    accountNumber: typeof obj.accountNumber === 'string' ? obj.accountNumber : null,
    membershipTier: typeof obj.membershipTier === 'string' ? obj.membershipTier : null,
    notes: typeof obj.notes === 'string' ? obj.notes : null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let imageBase64: string | null = null;
    let textInput: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('image') as File | null;
      const text = formData.get('text') as string | null;

      if (file) {
        // FIX-2: Check file size before converting to base64
        if (file.size > MAX_IMAGE_BYTES) {
          return NextResponse.json(
            { error: `Image exceeds ${MAX_IMAGE_BYTES / 1_048_576}MB limit` },
            { status: 413 }
          );
        }
        const buffer = await file.arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString('base64');
      }
      textInput = text;
    } else {
      const body = await request.json();
      imageBase64 = body.image || null;
      textInput = body.text || null;

      // FIX-2: Check base64 image string length
      if (imageBase64 && imageBase64.length > MAX_IMAGE_BASE64_CHARS) {
        return NextResponse.json(
          { error: `Image exceeds ${MAX_IMAGE_BYTES / 1_048_576}MB limit` },
          { status: 413 }
        );
      }
    }

    // FIX-2: Check text input length
    if (textInput && textInput.length > MAX_TEXT_CHARS) {
      return NextResponse.json(
        { error: `Text exceeds ${MAX_TEXT_CHARS.toLocaleString()} character limit` },
        { status: 413 }
      );
    }

    if (!imageBase64 && !textInput) {
      return NextResponse.json(
        { error: 'Either image or text is required' },
        { status: 400 }
      );
    }

    // Build message content
    const content: Anthropic.MessageParam['content'] = [];

    if (imageBase64) {
      // Detect media type from base64 or default to png
      let mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' = 'image/png';
      if (imageBase64.startsWith('/9j/')) {
        mediaType = 'image/jpeg';
      } else if (imageBase64.startsWith('R0lGOD')) {
        mediaType = 'image/gif';
      } else if (imageBase64.startsWith('UklGR')) {
        mediaType = 'image/webp';
      }

      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: imageBase64,
        },
      });
    }

    if (textInput) {
      content.push({
        type: 'text',
        text: `Here is the text to parse:\n\n${textInput}`,
      });
    }

    content.push({
      type: 'text',
      text: LOYALTY_PROGRAM_PARSE_PROMPT,
    });

    // FIX-1: Use configurable model
    console.info(`points/parse: using model ${LLM_MODEL}`);
    const response = await anthropic.messages.create({
      model: LLM_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content,
        },
      ],
    });

    // Extract text response
    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse JSON from response
    let rawParsed: unknown;
    try {
      // Handle potential markdown code blocks
      let jsonText = textBlock.text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      rawParsed = JSON.parse(jsonText);
    } catch {
      // FIX-3: Log raw output server-side, return safe error to client
      console.warn('points/parse: failed to parse model JSON output:', textBlock.text);
      return NextResponse.json(
        { error: 'Failed to parse loyalty program data', code: 'PARSE_ERROR' },
        { status: 422 }
      );
    }

    // FIX-4: Validate and strip model output against schema
    const rawArray = Array.isArray(rawParsed) ? rawParsed : [rawParsed];
    const programs: ParsedProgram[] = [];

    for (const item of rawArray) {
      const validated = validateProgram(item);
      if (validated) {
        programs.push(validated);
      }
    }

    if (programs.length === 0) {
      console.warn('points/parse: model output had no valid programs:', JSON.stringify(rawParsed));
      return NextResponse.json(
        { error: 'Failed to parse loyalty program data', code: 'PARSE_ERROR' },
        { status: 422 }
      );
    }

    return NextResponse.json({ programs });
  } catch (err) {
    console.error('POST /api/points/parse error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
