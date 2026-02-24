import type {
  HappeningRecord,
  PlaceRecord,
  SeattleCatalog,
  SeattleIntentId,
  SeattlePhaseId,
  SeattleQueryInput,
  SeattleQueryReport,
  StoredQueryTrigger,
} from "../types";

import { loadSeattleCatalog } from "./catalog";

const CADENCE_PRIORITY: Record<HappeningRecord["cadence"], number> = {
  daily: 0,
  weekly: 1,
  seasonal: 2,
  yearly: 3,
};

function scorePlace(place: PlaceRecord, near?: string): number {
  let score = 0;
  if (near && place.neighborhood === near) score += 10;
  if (place.storedQueryName) score += 2;
  return score;
}

function selectPlaces(catalog: SeattleCatalog, input: SeattleQueryInput): PlaceRecord[] {
  return catalog.places
    .filter((item) => item.phaseIds.includes(input.phaseId) && item.intentIds.includes(input.intentId))
    .sort((a, b) => {
      const diff = scorePlace(b, input.near) - scorePlace(a, input.near);
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
    })
    .slice(0, input.limit);
}

function selectHappenings(catalog: SeattleCatalog, input: SeattleQueryInput): HappeningRecord[] {
  return catalog.happenings
    .filter((item) => item.phaseIds.includes(input.phaseId) && item.intentIds.includes(input.intentId))
    .filter((item) => (input.near ? item.neighborhood === input.near : true))
    .sort((a, b) => {
      const diff = CADENCE_PRIORITY[a.cadence] - CADENCE_PRIORITY[b.cadence];
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
    })
    .slice(0, input.limit);
}

function selectAround(catalog: SeattleCatalog, input: SeattleQueryInput): PlaceRecord[] {
  const nearMatches = catalog.places
    .filter((item) => item.phaseIds.includes(input.phaseId) && item.intentIds.includes(input.intentId))
    .filter((item) => (input.near ? item.neighborhood === input.near : true))
    .sort((a, b) => a.id.localeCompare(b.id));

  if (nearMatches.length > 0) return nearMatches.slice(0, input.limit);
  return selectPlaces(catalog, input);
}

export async function runSeattleQuery(input: SeattleQueryInput): Promise<{
  city: string;
  schema: string;
  report: SeattleQueryReport;
  triggers: StoredQueryTrigger[];
}> {
  const catalog = await loadSeattleCatalog();

  const allowedPhases = new Set(catalog.categories.phases.map((p) => p.id));
  const allowedIntents = new Set(catalog.categories.intents.map((i) => i.id));

  if (!allowedPhases.has(input.phaseId)) {
    throw new Error(`Invalid phaseId: ${input.phaseId}`);
  }
  if (!allowedIntents.has(input.intentId)) {
    throw new Error(`Invalid intentId: ${input.intentId}`);
  }

  let results: Array<PlaceRecord | HappeningRecord> = [];
  if (input.intentId === "whats_going_on") {
    results = selectHappenings(catalog, input);
  } else if (input.intentId === "whats_around") {
    results = selectAround(catalog, input);
  } else {
    results = selectPlaces(catalog, input);
  }

  return {
    city: catalog.categories.city,
    schema: catalog.categories.schema,
    report: {
      phaseId: input.phaseId,
      intentId: input.intentId,
      near: input.near,
      resultCount: results.length,
      results,
    },
    triggers: catalog.triggers,
  };
}

export function parsePhaseId(raw: string | null | undefined, fallback: SeattlePhaseId): SeattlePhaseId {
  if (raw === "planning_upfront" || raw === "while_in_seattle") return raw;
  return fallback;
}

export function parseIntentId(raw: string | null | undefined, fallback: SeattleIntentId): SeattleIntentId {
  if (raw === "what_to_do" || raw === "whats_going_on" || raw === "whats_around") return raw;
  return fallback;
}

export function parseLimit(raw: string | null | undefined, fallback = 8): number {
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return fallback;
  return Math.min(n, 20);
}

export async function runSportsStoredQuery(): Promise<{
  trigger: StoredQueryTrigger | null;
  wikiResponse: unknown;
}> {
  const catalog = await loadSeattleCatalog();
  const trigger = catalog.triggers.find((item) => item.pageContext === "seattle_sports") ?? null;
  if (!trigger) {
    return {
      trigger: null,
      wikiResponse: {
        ok: false,
        error: "Missing seattle_sports trigger in data/seattle/stored_query_triggers.json",
      },
    };
  }

  const base = process.env.SEATTLE_WIKI_API_BASE ?? "http://127.0.0.1:8787";
  const url = `${base}/api/stored-query/${trigger.storedQueryName}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    const body = (await response.json()) as unknown;
    return { trigger, wikiResponse: body };
  } catch (error) {
    return {
      trigger,
      wikiResponse: {
        ok: false,
        error: `Could not fetch stored query from ${url}: ${String(error)}`,
      },
    };
  }
}
