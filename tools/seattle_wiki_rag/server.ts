/**
 * Minimal deterministic RAG API for Seattle Wikipedia (no vectors).
 *
 * Run:
 *   pnpm -s tsx tools/seattle_wiki_rag/server.ts
 */

import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { URL } from "node:url";

import type { StoredQuerySpec } from "./lib/types.js";
import { loadCurrentSnapshot } from "./lib/snapshot.js";
import { findSectionByAnchor, searchSnapshot } from "./lib/search.js";

const PORT = Number(process.env.PORT ?? "8787");
const OUT_DIR = path.join("tools", "seattle_wiki_rag", "data");
const STORED_QUERIES_PATH = path.join("tools", "seattle_wiki_rag", "stored_queries.json");

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body, null, 2) + "\n";
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(json);
}

async function readBodyJson(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(String(c)));
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  return JSON.parse(raw) as unknown;
}

async function loadStoredQueries(): Promise<StoredQuerySpec[]> {
  const raw = await fs.readFile(STORED_QUERIES_PATH, "utf8");
  return JSON.parse(raw) as StoredQuerySpec[];
}

async function handler(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");

  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, { ok: true });
  }

  // Snapshot metadata
  if (req.method === "GET" && url.pathname === "/api/wiki/snapshot") {
    try {
      const snap = await loadCurrentSnapshot(OUT_DIR);
      return sendJson(res, 200, {
        ok: true,
        title: snap.title,
        oldid: snap.oldid,
        revisionTimestamp: snap.revisionTimestamp,
        fetchedAt: snap.fetchedAt,
        sections: snap.sections.length,
        sha256: snap.sha256,
      });
    } catch (e) {
      return sendJson(res, 500, { ok: false, error: String(e) });
    }
  }

  // Exact section fetch by anchor (deterministic)
  if (req.method === "GET" && url.pathname === "/api/wiki/section") {
    const anchor = url.searchParams.get("anchor") ?? "";
    if (!anchor.trim()) return sendJson(res, 400, { ok: false, error: "Missing ?anchor=" });

    try {
      const snap = await loadCurrentSnapshot(OUT_DIR);
      const section = findSectionByAnchor(snap, anchor);
      if (!section) {
        return sendJson(res, 404, { ok: false, error: `Unknown anchor: ${anchor}` });
      }
      return sendJson(res, 200, {
        ok: true,
        title: snap.title,
        oldid: snap.oldid,
        anchor: section.anchor,
        heading: section.heading,
        html: section.html,
        text: section.text,
        sha256: section.sha256,
        attribution: {
          source: "Wikipedia",
          page: "Seattle",
          section: section.anchor,
          oldid: snap.oldid,
        },
      });
    } catch (e) {
      return sendJson(res, 500, { ok: false, error: String(e) });
    }
  }

  // Stored query endpoint (e.g., page-open auto fire)
  if (req.method === "GET" && url.pathname.startsWith("/api/stored-query/")) {
    const name = url.pathname.split("/").pop() ?? "";
    try {
      const queries = await loadStoredQueries();
      const q = queries.find((x) => x.name === name);
      if (!q) return sendJson(res, 404, { ok: false, error: `Unknown stored query: ${name}` });

      const snap = await loadCurrentSnapshot(OUT_DIR);
      const section = findSectionByAnchor(snap, q.anchor);
      if (!section) {
        return sendJson(res, 500, { ok: false, error: `Missing section for anchor=${q.anchor}` });
      }
      return sendJson(res, 200, {
        ok: true,
        name: q.name,
        title: snap.title,
        oldid: snap.oldid,
        anchor: section.anchor,
        heading: section.heading,
        html: section.html,
        text: section.text,
        sha256: section.sha256,
        attribution: {
          source: "Wikipedia",
          page: "Seattle",
          section: section.anchor,
          oldid: snap.oldid,
        },
      });
    } catch (e) {
      return sendJson(res, 500, { ok: false, error: String(e) });
    }
  }

  // Deterministic lexical search (no vectors)
  if (req.method === "POST" && url.pathname === "/api/wiki/search") {
    try {
      const body = (await readBodyJson(req)) as { q?: unknown; limit?: unknown };
      const q = typeof body.q === "string" ? body.q : "";
      const limit =
        typeof body.limit === "number" && Number.isFinite(body.limit) ? body.limit : 8;
      if (!q.trim()) return sendJson(res, 400, { ok: false, error: "Missing body.q" });

      const snap = await loadCurrentSnapshot(OUT_DIR);
      const hits = searchSnapshot(snap, q, Math.max(1, Math.min(20, Math.floor(limit))));
      return sendJson(res, 200, { ok: true, title: snap.title, oldid: snap.oldid, q, hits });
    } catch (e) {
      return sendJson(res, 500, { ok: false, error: String(e) });
    }
  }

  return sendJson(res, 404, { ok: false, error: "Not found" });
}

async function main(): Promise<void> {
  const server = http.createServer((req, res) => {
    void handler(req, res);
  });
  server.listen(PORT, "127.0.0.1", () => {
    console.log(`seattle_wiki_rag listening on http://127.0.0.1:${PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 2;
});
