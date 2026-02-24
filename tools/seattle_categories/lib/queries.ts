import type {
  PlaceRecord,
  HappeningRecord,
  SeattleCatalog,
  SeattleIntentId,
  SeattleQueryOptions,
  SeattleQueryReport,
} from "./types.js";

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

function selectPlaces(catalog: SeattleCatalog, options: SeattleQueryOptions): PlaceRecord[] {
  return catalog.places
    .filter((p) => p.phaseIds.includes(options.phaseId) && p.intentIds.includes(options.intentId))
    .sort((a, b) => {
      const scoreDiff = scorePlace(b, options.near) - scorePlace(a, options.near);
      if (scoreDiff !== 0) return scoreDiff;
      return a.id.localeCompare(b.id);
    })
    .slice(0, options.limit);
}

function selectHappenings(
  catalog: SeattleCatalog,
  options: SeattleQueryOptions,
): HappeningRecord[] {
  return catalog.happenings
    .filter((h) => h.phaseIds.includes(options.phaseId) && h.intentIds.includes(options.intentId))
    .filter((h) => (options.near ? h.neighborhood === options.near : true))
    .sort((a, b) => {
      const cadenceDiff = CADENCE_PRIORITY[a.cadence] - CADENCE_PRIORITY[b.cadence];
      if (cadenceDiff !== 0) return cadenceDiff;
      return a.id.localeCompare(b.id);
    })
    .slice(0, options.limit);
}

function selectAround(catalog: SeattleCatalog, options: SeattleQueryOptions): PlaceRecord[] {
  const nearby = catalog.places
    .filter((p) => p.phaseIds.includes(options.phaseId) && p.intentIds.includes(options.intentId))
    .filter((p) => (options.near ? p.neighborhood === options.near : true))
    .sort((a, b) => a.id.localeCompare(b.id));

  if (nearby.length > 0) {
    return nearby.slice(0, options.limit);
  }

  return selectPlaces(catalog, options);
}

export function executeSeattleQuery(
  catalog: SeattleCatalog,
  options: SeattleQueryOptions,
): SeattleQueryReport {
  let results: unknown[] = [];

  if (options.intentId === "whats_going_on") {
    results = selectHappenings(catalog, options);
  } else if (options.intentId === "whats_around") {
    results = selectAround(catalog, options);
  } else {
    results = selectPlaces(catalog, options);
  }

  return {
    phaseId: options.phaseId,
    intentId: options.intentId,
    near: options.near,
    resultCount: results.length,
    results,
  };
}

export function allowedValues(catalog: SeattleCatalog): {
  phases: string[];
  intents: SeattleIntentId[];
  neighborhoods: string[];
} {
  const phases = catalog.categories.phases.map((p) => p.id).sort();
  const intents = catalog.categories.intents.map((i) => i.id).sort();
  const neighborhoods = [...new Set(catalog.places.map((p) => p.neighborhood))].sort();
  return { phases, intents, neighborhoods };
}

