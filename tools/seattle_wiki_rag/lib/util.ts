import crypto from "node:crypto";

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function decodeHtmlEntities(text: string): string {
  const named: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
  };

  const withNamed = text.replace(
    /&(amp|lt|gt|quot|nbsp);|&#39;/g,
    (m) => named[m] ?? m,
  );

  const withDec = withNamed.replace(/&#(\d+);/g, (_m, n) => {
    const code = Number(n);
    if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return "";
    return String.fromCodePoint(code);
  });

  return withDec.replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => {
    const code = Number.parseInt(String(hex), 16);
    if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return "";
    return String.fromCodePoint(code);
  });
}

export function stripHtmlToText(html: string): string {
  const noScripts = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");

  const withSpaces = noScripts
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n")
    .replace(/<\/li\s*>/gi, "\n")
    .replace(/<\/h[1-6]\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  return decodeHtmlEntities(withSpaces)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function normalizeAnchor(anchor: string): string {
  return anchor.trim().replace(/ /g, "_").toLowerCase();
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

