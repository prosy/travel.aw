import type { SearchHit, SeattleWikiSnapshot, WikiSectionRecord } from "./types.js";
import { normalizeAnchor, tokenize } from "./util.js";

function makeSnippet(text: string, q: string): string {
  const needle = q.trim().toLowerCase();
  const hay = text.toLowerCase();
  const i = needle ? hay.indexOf(needle) : -1;
  if (i < 0) return text.slice(0, 220);
  const start = Math.max(0, i - 80);
  const end = Math.min(text.length, i + needle.length + 120);
  return text.slice(start, end);
}

export function findSectionByAnchor(
  snapshot: SeattleWikiSnapshot,
  anchor: string,
): WikiSectionRecord | undefined {
  const want = normalizeAnchor(anchor);
  return snapshot.sections.find((s) => normalizeAnchor(s.anchor) === want);
}

/**
 * Deterministic lexical search (BM25-ish) over section text.
 * No embeddings; stable tokenization; stable tie-breakers.
 */
export function searchSnapshot(snapshot: SeattleWikiSnapshot, q: string, limit = 8): SearchHit[] {
  const queryTokens = tokenize(q);
  if (queryTokens.length === 0) return [];

  const docs = snapshot.sections.map((s) => ({
    anchor: s.anchor,
    heading: s.heading,
    text: s.text,
    tokens: tokenize(s.text),
  }));

  const N = docs.length;
  const df = new Map<string, number>();
  for (const doc of docs) {
    const seen = new Set(doc.tokens);
    for (const t of seen) df.set(t, (df.get(t) ?? 0) + 1);
  }

  const avgdl = docs.reduce((sum, d) => sum + d.tokens.length, 0) / Math.max(1, N);
  const k1 = 1.2;
  const b = 0.75;

  const hits: SearchHit[] = docs.map((doc) => {
    const tf = new Map<string, number>();
    for (const t of doc.tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

    let score = 0;
    for (const t of queryTokens) {
      const f = tf.get(t) ?? 0;
      if (f === 0) continue;
      const n = df.get(t) ?? 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      const dl = doc.tokens.length;
      const denom = f + k1 * (1 - b + b * (dl / Math.max(1, avgdl)));
      score += idf * ((f * (k1 + 1)) / denom);
    }

    return {
      anchor: doc.anchor,
      heading: doc.heading,
      score,
      snippet: makeSnippet(doc.text, q),
    };
  });

  return hits
    .filter((h) => h.score > 0)
    .sort((a, b2) => {
      if (b2.score !== a.score) return b2.score - a.score;
      const ah = `${a.heading}#${a.anchor}`;
      const bh = `${b2.heading}#${b2.anchor}`;
      return ah.localeCompare(bh);
    })
    .slice(0, Math.max(1, limit));
}

