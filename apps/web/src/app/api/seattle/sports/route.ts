import { NextResponse } from "next/server";

import { runSportsStoredQuery } from "../../../../features/seattle/server/query";

type RawWikiResponse = {
  ok?: boolean;
  error?: string;
  html?: string;
  text?: string;
  anchor?: string;
  heading?: string;
  oldid?: number;
  attribution?: {
    source: string;
    page: string;
    section: string;
    oldid: number;
  };
};

function compactSportsHtml(rawHtml: string): string {
  const paragraphs = Array.from(rawHtml.matchAll(/<p[\s\S]*?<\/p>/gi))
    .slice(0, 3)
    .map((match) => match[0])
    .join("");

  const table = rawHtml.match(/<table class="wikitable[\s\S]*?<\/table>/i)?.[0] ?? "";
  return `${paragraphs}${table}`;
}

export async function GET(): Promise<NextResponse> {
  const payload = await runSportsStoredQuery();
  const raw = payload.wikiResponse as RawWikiResponse;

  const compact = {
    ok: Boolean(raw?.ok),
    error: raw?.error,
    heading: raw?.heading,
    anchor: raw?.anchor,
    oldid: raw?.oldid,
    attribution: raw?.attribution,
    html: compactSportsHtml(raw?.html ?? ""),
  };

  return NextResponse.json({ ok: true, trigger: payload.trigger, wikiResponse: compact });
}
