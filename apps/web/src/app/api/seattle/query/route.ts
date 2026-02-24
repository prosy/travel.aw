import { NextRequest, NextResponse } from "next/server";

import {
  parseIntentId,
  parseLimit,
  parsePhaseId,
  runSeattleQuery,
} from "../../../../features/seattle/server/query";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const phaseId = parsePhaseId(searchParams.get("phase"), "while_in_seattle");
  const intentId = parseIntentId(searchParams.get("intent"), "what_to_do");
  const near = searchParams.get("near") ?? undefined;
  const limit = parseLimit(searchParams.get("limit"), 8);

  try {
    const payload = await runSeattleQuery({ phaseId, intentId, near, limit });
    return NextResponse.json({ ok: true, ...payload });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: String(error),
      },
      { status: 400 },
    );
  }
}
