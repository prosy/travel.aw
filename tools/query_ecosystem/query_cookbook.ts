/**
 * TRAVEL.aw Query Cookbook — CLI Entry Point
 *
 * Runs the 5 MVP queries (Q1–Q5) from Ecosystem Spec §6.2.
 * See docs/ecosystem/QUERY_COOKBOOK.md (A16) for definitions.
 *
 * Usage:
 *   tsx tools/query_ecosystem/query_cookbook.ts --query N   # Run single query (1-5)
 *   tsx tools/query_ecosystem/query_cookbook.ts --all        # Run all 5 queries
 *   tsx tools/query_ecosystem/query_cookbook.ts --fixtures   # Determinism check
 *
 * Exit codes: 0 = success, 2 = runtime error
 */

import type { CookbookReport, QueryResult } from "./lib/types.js";
import {
  q1CrossStageInfluence,
  q2SocialToBookingPaths,
  q3LocalEventDiscovery,
  q4ItineraryIntegrations,
  q5NearbyVsUpcoming,
} from "./lib/queries.js";

// ---------------------------------------------------------------------------
// Query registry
// ---------------------------------------------------------------------------

const QUERIES: Record<number, () => QueryResult<unknown>> = {
  1: q1CrossStageInfluence,
  2: q2SocialToBookingPaths,
  3: q3LocalEventDiscovery,
  4: q4ItineraryIntegrations,
  5: q5NearbyVsUpcoming,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function runQuery(n: number): QueryResult<unknown> {
  const fn = QUERIES[n];
  if (!fn) {
    throw new Error(`Unknown query: Q${n}. Valid range: 1-5.`);
  }
  return fn();
}

function runAll(): CookbookReport {
  const queries: QueryResult<unknown>[] = [];
  for (let i = 1; i <= 5; i++) {
    queries.push(runQuery(i));
  }
  return {
    timestamp: new Date().toISOString(),
    queries,
  };
}

function stripTimestamps(obj: unknown): unknown {
  const json = JSON.stringify(obj);
  return JSON.parse(json, (key, value) => {
    if (key === "timestamp") return "";
    return value;
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const args = process.argv.slice(2).filter((a) => a !== "--");

  try {
    if (args.includes("--fixtures")) {
      // ---- Determinism check: run all queries twice, compare ----
      console.log("=== QUERY COOKBOOK — DETERMINISM CHECK ===\n");

      const run1 = runAll();
      const run2 = runAll();

      const s1 = JSON.stringify(stripTimestamps(run1));
      const s2 = JSON.stringify(stripTimestamps(run2));

      if (s1 === s2) {
        console.log("PASS: All 5 queries produce identical output across two runs (excluding timestamps)\n");

        // Print summary of each query
        for (const q of run1.queries) {
          console.log(`  ${q.queryId}: ${q.title} — ${q.resultCount} results`);
        }
        console.log("");
      } else {
        console.error("FAIL: Output differs between runs");
        process.exit(2);
      }
    } else if (args.includes("--all")) {
      // ---- Run all queries ----
      const report = runAll();
      console.log(JSON.stringify(report, null, 2));
    } else {
      // ---- Single query ----
      const queryIdx = args.findIndex((a) => a === "--query");
      if (queryIdx === -1 || !args[queryIdx + 1]) {
        console.error("Usage:");
        console.error("  tsx tools/query_ecosystem/query_cookbook.ts --query N");
        console.error("  tsx tools/query_ecosystem/query_cookbook.ts --all");
        console.error("  tsx tools/query_ecosystem/query_cookbook.ts --fixtures");
        process.exit(2);
      }

      const n = parseInt(args[queryIdx + 1], 10);
      const result = runQuery(n);
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.error("Runtime error:", err);
    process.exit(2);
  }
}

main();
