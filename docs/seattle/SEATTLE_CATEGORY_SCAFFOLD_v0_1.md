# Seattle Category Scaffold v0.1

## Goal

Create a first-pass structure for Seattle trip support across two phases:

1. `planning_upfront` (pre-trip planning)
2. `while_in_seattle` (in-city decisions)

Each phase supports three traveler intents:

- `what_to_do`
- `whats_going_on`
- `whats_around`

## First-Pass Directory Plan

```
docs/seattle/
  SEATTLE_CATEGORY_SCAFFOLD_v0_1.md

data/seattle/
  categories.json
  places.jsonl
  happenings.jsonl
  stored_query_triggers.json

tools/seattle_categories/
  README.md
  query_seattle.ts
  lib/
    types.ts
    catalog.ts
    queries.ts

apps/web/src/features/seattle/
  README.md
  planning/
  while_in_seattle/
```

## Data Shape (first pass)

- `categories.json` is the phase + intent contract for Seattle.
- `places.jsonl` is deterministic catalog data for `what_to_do` and `whats_around`.
- `happenings.jsonl` is deterministic "what's going on" seed data.
- `stored_query_triggers.json` maps page contexts to deterministic stored queries (for example `seattle_sports`).

## Querying Model

`tools/seattle_categories/query_seattle.ts` provides deterministic filtering and ordering:

- `what_to_do`: returns place ideas by phase/intent and optional neighborhood.
- `whats_going_on`: returns happenings sorted by stable cadence priority then name.
- `whats_around`: returns nearby places with neighborhood-biased ranking.

## Next Build Step (after scaffold)

Implement web routes under `apps/web/src/features/seattle`:

- `/seattle/planning`
- `/seattle/while-in-seattle`
- `/seattle/while-in-seattle/sports`

The sports route should fire `seattle_sports` from the stored query trigger table and render attribution + section output.

