# Seattle Categories Query Tool

Deterministic first-pass query layer for Seattle planning categories.

## Inputs

- `data/seattle/categories.json`
- `data/seattle/places.jsonl`
- `data/seattle/happenings.jsonl`
- `data/seattle/stored_query_triggers.json`

## Commands

- List allowed values:
  - `pnpm -s tsx tools/seattle_categories/query_seattle.ts --list`
- Planning ideas:
  - `pnpm -s tsx tools/seattle_categories/query_seattle.ts --phase planning_upfront --intent what_to_do`
- While in Seattle, nearby:
  - `pnpm -s tsx tools/seattle_categories/query_seattle.ts --phase while_in_seattle --intent whats_around --near seattle_center`
- While in Seattle, happenings:
  - `pnpm -s tsx tools/seattle_categories/query_seattle.ts --phase while_in_seattle --intent whats_going_on`

