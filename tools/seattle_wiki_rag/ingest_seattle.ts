/**
 * Ingest Wikipedia Seattle page into a deterministic snapshot (no vectors).
 *
 * Usage:
 *   pnpm -s tsx tools/seattle_wiki_rag/ingest_seattle.ts
 *   pnpm -s tsx tools/seattle_wiki_rag/ingest_seattle.ts --oldid 123456789
 */

import path from "node:path";

import { ingestSeattleWikipedia } from "./lib/snapshot.js";

function parseArgs(argv: string[]): { oldid?: number } {
  const out: { oldid?: number } = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--oldid") {
      const v = argv[i + 1];
      if (!v) throw new Error("Missing value for --oldid");
      const n = Number(v);
      if (!Number.isInteger(n) || n <= 0) throw new Error(`Invalid --oldid: ${v}`);
      out.oldid = n;
      i++;
    }
  }
  return out;
}

async function main(): Promise<void> {
  const { oldid } = parseArgs(process.argv.slice(2));
  const outDir = path.join("tools", "seattle_wiki_rag", "data");
  const { snapshot, paths } = await ingestSeattleWikipedia({ oldid, outDir });

  console.log(
    JSON.stringify(
      {
        ok: true,
        title: snapshot.title,
        oldid: snapshot.oldid,
        sections: snapshot.sections.length,
        snapshotPath: paths.snapshotPath,
        currentPath: paths.currentPath,
        sha256: snapshot.sha256,
      },
      null,
      2,
    ),
  );
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 2;
});

