export type SeattlePhaseId = "planning_upfront" | "while_in_seattle";

export type SeattleIntentId = "what_to_do" | "whats_going_on" | "whats_around";

export type SeattleCadence = "daily" | "weekly" | "seasonal" | "yearly";

export interface SeattlePhase {
  id: SeattlePhaseId;
  label: string;
  description: string;
}

export interface SeattleIntent {
  id: SeattleIntentId;
  label: string;
  description: string;
}

export interface SeattleCategorySpec {
  schema: string;
  city: string;
  phases: SeattlePhase[];
  intents: SeattleIntent[];
}

export interface PlaceRecord {
  id: string;
  name: string;
  phaseIds: SeattlePhaseId[];
  intentIds: SeattleIntentId[];
  neighborhood: string;
  tags: string[];
  summary: string;
  source: {
    type: string;
    page?: string;
    anchor?: string;
    label?: string;
  };
  storedQueryName?: string;
}

export interface HappeningRecord {
  id: string;
  name: string;
  phaseIds: SeattlePhaseId[];
  intentIds: SeattleIntentId[];
  neighborhood: string;
  cadence: SeattleCadence;
  tags: string[];
  summary: string;
  source: {
    type: string;
    label?: string;
  };
}

export interface StoredQueryTrigger {
  id: string;
  phaseId: SeattlePhaseId;
  intentId: SeattleIntentId;
  pageContext: string;
  storedQueryName: string;
  description: string;
}

export interface SeattleCatalog {
  categories: SeattleCategorySpec;
  places: PlaceRecord[];
  happenings: HappeningRecord[];
  triggers: StoredQueryTrigger[];
}

export interface SeattleQueryInput {
  phaseId: SeattlePhaseId;
  intentId: SeattleIntentId;
  near?: string;
  limit: number;
}

export interface SeattleQueryReport {
  phaseId: SeattlePhaseId;
  intentId: SeattleIntentId;
  near?: string;
  resultCount: number;
  results: Array<PlaceRecord | HappeningRecord>;
}

