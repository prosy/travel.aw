import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import type {
  HappeningRecord,
  PlaceRecord,
  SeattleCatalog,
  SeattleCategorySpec,
  StoredQueryTrigger,
} from "../types";

function candidateRoots(): string[] {
  const cwd = process.cwd();
  const roots = [
    cwd,
    resolve(cwd, ".."),
    resolve(cwd, "../.."),
    resolve(cwd, "../../.."),
    resolve(cwd, "../../../.."),
    resolve(cwd, "../../../../.."),
  ];
  return [...new Set(roots)];
}

function resolveSeattleDataDir(): string {
  for (const root of candidateRoots()) {
    const candidate = join(root, "data", "seattle");
    if (existsSync(join(candidate, "categories.json"))) {
      return candidate;
    }
  }
  throw new Error("Could not resolve data/seattle directory from current working directory.");
}

function parseJsonl<T>(raw: string): T[] {
  const trimmed = raw.trim();
  if (trimmed === "") return [];
  return trimmed.split("\n").map((line) => JSON.parse(line) as T);
}

export async function loadSeattleCatalog(): Promise<SeattleCatalog> {
  const dataDir = resolveSeattleDataDir();

  const [categoriesRaw, placesRaw, happeningsRaw, triggersRaw] = await Promise.all([
    readFile(join(dataDir, "categories.json"), "utf8"),
    readFile(join(dataDir, "places.jsonl"), "utf8"),
    readFile(join(dataDir, "happenings.jsonl"), "utf8"),
    readFile(join(dataDir, "stored_query_triggers.json"), "utf8"),
  ]);

  const categories = JSON.parse(categoriesRaw) as SeattleCategorySpec;
  const places = parseJsonl<PlaceRecord>(placesRaw).sort((a, b) => a.id.localeCompare(b.id));
  const happenings = parseJsonl<HappeningRecord>(happeningsRaw).sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const triggers = (JSON.parse(triggersRaw) as StoredQueryTrigger[]).sort((a, b) =>
    a.id.localeCompare(b.id),
  );

  return { categories, places, happenings, triggers };
}
