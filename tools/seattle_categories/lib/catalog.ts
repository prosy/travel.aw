import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type {
  SeattleCatalog,
  SeattleCategorySpec,
  PlaceRecord,
  HappeningRecord,
  StoredQueryTrigger,
} from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "../../..");

const PATHS = {
  categories: resolve(ROOT, "data/seattle/categories.json"),
  places: resolve(ROOT, "data/seattle/places.jsonl"),
  happenings: resolve(ROOT, "data/seattle/happenings.jsonl"),
  triggers: resolve(ROOT, "data/seattle/stored_query_triggers.json"),
};

function loadJson<T>(path: string): T {
  if (!existsSync(path)) {
    throw new Error(`Missing required file: ${path}`);
  }
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as T;
}

function loadJsonl<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, "utf8").trim();
  if (raw === "") return [];
  return raw.split("\n").map((line) => JSON.parse(line) as T);
}

export function loadSeattleCatalog(): SeattleCatalog {
  const categories = loadJson<SeattleCategorySpec>(PATHS.categories);
  const places = loadJsonl<PlaceRecord>(PATHS.places).sort((a, b) => a.id.localeCompare(b.id));
  const happenings = loadJsonl<HappeningRecord>(PATHS.happenings).sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const triggers = loadJson<StoredQueryTrigger[]>(PATHS.triggers).sort((a, b) =>
    a.id.localeCompare(b.id),
  );

  return { categories, places, happenings, triggers };
}

