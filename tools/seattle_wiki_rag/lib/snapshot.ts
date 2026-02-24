import fs from "node:fs/promises";
import path from "node:path";

import type { SeattleWikiSnapshot, WikiSectionRecord } from "./types.js";
import {
  getLatestRevision,
  getRevisionById,
  getSectionHtml,
  getSections,
  wikiApiEndpoint,
} from "./wiki_api.js";
import { sha256Hex, stripHtmlToText } from "./util.js";

const TITLE: "Seattle" = "Seattle";

export type IngestOptions = {
  oldid?: number;
  outDir: string;
  writeCurrentPointer?: boolean;
};

export type SnapshotPaths = {
  snapshotPath: string;
  currentPath: string;
};

function snapshotFilename(oldid: number): string {
  return `seattle.wikipedia.oldid_${oldid}.json`;
}

export async function ingestSeattleWikipedia(options: IngestOptions): Promise<{
  snapshot: SeattleWikiSnapshot;
  paths: SnapshotPaths;
}> {
  const outDir = options.outDir;
  const writeCurrentPointer = options.writeCurrentPointer ?? true;
  await fs.mkdir(outDir, { recursive: true });

  const latest = await getLatestRevision(TITLE);
  const oldid = options.oldid ?? latest.oldid;
  const revisionTimestamp =
    oldid === latest.oldid ? latest.timestamp : (await getRevisionById(oldid)).timestamp;

  const sectionsInfo = await getSections(TITLE, oldid);

  const sectionMetas = [...sectionsInfo.sections].sort((a, b) => {
    const ai = Number(a.index);
    const bi = Number(b.index);
    if (Number.isFinite(ai) && Number.isFinite(bi) && ai !== bi) return ai - bi;
    return a.index.localeCompare(b.index);
  });

  const sections: WikiSectionRecord[] = [];
  for (const meta of sectionMetas) {
    const parsed = await getSectionHtml(TITLE, oldid, meta.index);
    const heading = meta.line;
    const html = parsed.html;
    const text = stripHtmlToText(html);
    const sha256 = sha256Hex(
      JSON.stringify({
        anchor: meta.anchor,
        heading,
        index: meta.index,
        html,
        text,
      }),
    );
    sections.push({
      ...meta,
      heading,
      html,
      text,
      sha256,
    });
  }

  const snapshot: SeattleWikiSnapshot = {
    schema: "travel.aw/wiki-snapshot/v1",
    source: "wikipedia",
    apiEndpoint: wikiApiEndpoint(),
    title: TITLE,
    pageid: sectionsInfo.pageid,
    oldid,
    revisionTimestamp,
    fetchedAt: new Date().toISOString(),
    sections,
    sha256: sha256Hex(
      JSON.stringify({
        schema: "travel.aw/wiki-snapshot/v1",
        title: TITLE,
        oldid,
        pageid: sectionsInfo.pageid,
        sections: sections.map((s) => ({ anchor: s.anchor, sha256: s.sha256 })),
      }),
    ),
  };

  const snapshotPath = path.join(outDir, snapshotFilename(oldid));
  await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2) + "\n", "utf8");

  const currentPath = path.join(outDir, "current.json");
  if (writeCurrentPointer) {
    await fs.writeFile(
      currentPath,
      JSON.stringify({ title: TITLE, oldid, snapshot: path.basename(snapshotPath) }, null, 2) +
        "\n",
      "utf8",
    );
  }

  return { snapshot, paths: { snapshotPath, currentPath } };
}

export async function loadCurrentSnapshot(outDir: string): Promise<SeattleWikiSnapshot> {
  const currentPath = path.join(outDir, "current.json");
  const currentRaw = await fs.readFile(currentPath, "utf8");
  const current = JSON.parse(currentRaw) as { snapshot: string; oldid: number };
  const snapshotPath = path.join(outDir, current.snapshot);
  const snapRaw = await fs.readFile(snapshotPath, "utf8");
  return JSON.parse(snapRaw) as SeattleWikiSnapshot;
}
