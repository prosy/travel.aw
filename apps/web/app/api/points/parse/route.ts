import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCurrentUser } from '@/app/_lib/auth';
import { anthropic, LOYALTY_PROGRAM_PARSE_PROMPT } from '@/app/_lib/anthropic';
import type { PointsProgramType } from '@travel/contracts';

export interface ParsedProgram {
  programName: string;
  programType: PointsProgramType;
  accountNumber: string | null;
  membershipTier: string | null;
  notes: string | null;
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
        const buffer = await file.arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString('base64');
      }
      textInput = text;
    } else {
      const body = await request.json();
      imageBase64 = body.image || null;
      textInput = body.text || null;
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

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
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
    let programs: ParsedProgram[];
    try {
      // Handle potential markdown code blocks
      let jsonText = textBlock.text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      programs = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', textBlock.text);
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: textBlock.text },
        { status: 500 }
      );
    }

    // Validate and normalize
    const validTypes: PointsProgramType[] = ['airline', 'hotel', 'car_rental', 'credit_card', 'other'];
    programs = programs.map((p) => ({
      programName: p.programName || 'Unknown Program',
      programType: validTypes.includes(p.programType) ? p.programType : 'other',
      accountNumber: p.accountNumber || null,
      membershipTier: p.membershipTier || null,
      notes: p.notes || null,
    }));

    return NextResponse.json({ programs });
  } catch (err) {
    console.error('POST /api/points/parse error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
