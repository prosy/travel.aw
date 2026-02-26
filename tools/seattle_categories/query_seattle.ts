/**
 * Deterministic Seattle category query tool.
 *
 * Usage examples:
 *   pnpm -s tsx tools/seattle_categories/query_seattle.ts --list
 *   pnpm -s tsx tools/seattle_categories/query_seattle.ts --phase planning_upfront --intent what_to_do
 *   pnpm -s tsx tools/seattle_categories/query_seattle.ts --phase while_in_seattle --intent whats_around --near downtown
 */

import { loadSeattleCatalog } from "./lib/catalog.js";
import { allowedValues, executeSeattleQuery } from "./lib/queries.js";
import type { SeattleIntentId, SeattlePhaseId, SeattleQueryOptions } from "./lib/types.js";

function parseArgs(argv: string[]): {
  phaseId: SeattlePhaseId;
  intentId: SeattleIntentId;
  near?: string;
  limit: number;
  list: boolean;
  json: boolean;
} {
  const out = {
    phaseId: "while_in_seattle" as SeattlePhaseId,
    intentId: "what_to_do" as SeattleIntentId,
    near: undefined as string | undefined,
    limit: 8,
    list: false,
    json: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--phase") {
      out.phaseId = (argv[++i] ?? out.phaseId) as SeattlePhaseId;
      continue;
    }
    if (arg === "--intent") {
      out.intentId = (argv[++i] ?? out.intentId) as SeattleIntentId;
      continue;
    }
    if (arg === "--near") {
      out.near = argv[++i];
      continue;
    }
    if (arg === "--limit") {
      const raw = argv[++i];
      const n = Number(raw);
      if (!Number.isInteger(n) || n <= 0) {
        throw new Error(`Invalid --limit: ${raw}`);
      }
      out.limit = n;
      continue;
    }
    if (arg === "--list") {
      out.list = true;
      continue;
    }
    if (arg === "--json") {
      out.json = true;
      continue;
    }
  }

  return out;
}

function printList(): void {
  const catalog = loadSeattleCatalog();
  const vals = allowedValues(catalog);
  console.log(JSON.stringify(vals, null, 2));
}

function main(): void {
  const args = parseArgs(process.argv.slice(2).filter((a) => a !== "--"));
  if (args.list) {
    printList();
    return;
  }

  const catalog = loadSeattleCatalog();
  const vals = allowedValues(catalog);

  if (!vals.phases.includes(args.phaseId)) {
    throw new Error(`Unknown phase '${args.phaseId}'. Run with --list for valid values.`);
  }
  if (!vals.intents.includes(args.intentId)) {
    throw new Error(`Unknown intent '${args.intentId}'. Run with --list for valid values.`);
  }

  const query: SeattleQueryOptions = {
    phaseId: args.phaseId,
    intentId: args.intentId,
    near: args.near,
    limit: args.limit,
  };

  const report = executeSeattleQuery(catalog, query);
  const payload = {
    city: catalog.categories.city,
    schema: catalog.categories.schema,
    report,
    storedQueryTriggers: catalog.triggers,
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Seattle Query — phase=${query.phaseId}, intent=${query.intentId}`);
  if (query.near) {
    console.log(`near=${query.near}`);
  }
  console.log(`results=${report.resultCount}\n`);
  console.log(JSON.stringify(report.results, null, 2));
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exitCode = 2;
}

