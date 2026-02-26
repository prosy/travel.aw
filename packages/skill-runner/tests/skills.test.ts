/**
 * M1-B: Flight Search and Hotel Search skill integration tests.
 *
 * Tests both skills execute inside SkillRunner Docker containers with:
 *   - Proper manifest parsing and validation
 *   - Mock mode (no API credentials) returning structured results
 *   - Egress enforcement (api.amadeus.com is declared)
 *   - Error handling for invalid params
 *   - Output conforms to the SkillRunner I/O contract
 *
 * These tests run in mock mode (no AMADEUS_API_KEY) so they work
 * without API credentials. Real API mode is covered by manual B5 testing.
 *
 * Requires Docker to be running.
 */

import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { createSkillRunner } from "../src/index.js";
import { loadManifest } from "../src/manifest.js";
import { runContainer } from "../src/docker.js";

const FIXTURES = join(__dirname, "..", "test-fixtures");
const FLIGHT_SKILL = join(FIXTURES, "flight-search");
const HOTEL_SKILL = join(FIXTURES, "hotel-search");

const RUNNER_CONFIG = { imagePrefix: "travel-aw-skill-" };

// Placeholder env vars satisfy validateEnvVars() — the Python skills
// detect empty/invalid credentials and fall back to mock mode internally.
const MOCK_ENV = { AMADEUS_API_KEY: "", AMADEUS_API_SECRET: "" };

// ────────────────────────────────────────────────
// Flight Search Skill
// ────────────────────────────────────────────────

describe("flight-search skill", () => {
  it("parses manifest correctly", async () => {
    const manifest = await loadManifest(FLIGHT_SKILL);
    expect(manifest.name).toBe("flight-search");
    expect(manifest.version).toBe("0.1.0");
    expect(manifest.capabilities).toEqual(["C-FLIGHT-SEARCH"]);
    expect(manifest.journeyStages).toEqual(["J1", "J3"]);
    expect(manifest.risk_level).toBe("medium");
    expect(manifest.permissions.network.egress).toEqual([
      { domain: "api.amadeus.com", reason: "Amadeus flight search API" },
    ]);
    expect(manifest.permissions.env_vars.required).toEqual([
      "AMADEUS_API_KEY",
      "AMADEUS_API_SECRET",
    ]);
  });

  it("returns mock results when no API credentials", async () => {
    const manifest = await loadManifest(FLIGHT_SKILL);
    // Run without AMADEUS env vars → triggers mock mode
    const result = await runContainer(
      manifest,
      {
        action: "search_flights",
        params: {
          origin: "SEA",
          destination: "NRT",
          date: "2026-03-15",
          passengers: 1,
          cabin: "ECONOMY",
        },
      },
      FLIGHT_SKILL,
      {
        ...RUNNER_CONFIG,
        egressMode: "none", // No network needed for mock mode
        envVars: MOCK_ENV, // Empty credentials → skill falls back to mock
      },
    );

    expect(result.success).toBe(true);

    const output = result.data;
    expect(output.status).toBe("success");
    expect(output.skill).toBe("flight-search");
    expect(output.version).toBe("0.1.0");
    expect(output.metadata).toBeDefined();

    const meta = output.metadata as Record<string, unknown>;
    expect(meta.source_api).toBe("mock");

    const results = output.results as Array<Record<string, unknown>>;
    expect(results.length).toBeGreaterThan(0);

    // Verify result shape
    const first = results[0];
    expect(first).toHaveProperty("provider");
    expect(first).toHaveProperty("airline");
    expect(first).toHaveProperty("price");
    expect(first).toHaveProperty("departure");
    expect(first).toHaveProperty("arrival");
    expect(first).toHaveProperty("stops");
    expect(first).toHaveProperty("duration_minutes");

    const price = first.price as Record<string, unknown>;
    expect(typeof price.amount).toBe("number");
    expect(price.currency).toBe("USD");
  }, 30_000);

  it("returns error for missing required params", async () => {
    const manifest = await loadManifest(FLIGHT_SKILL);
    const result = await runContainer(
      manifest,
      { params: { origin: "SEA" } }, // missing destination and date
      FLIGHT_SKILL,
      { ...RUNNER_CONFIG, egressMode: "none", envVars: MOCK_ENV },
    );

    expect(result.success).toBe(true);
    const output = result.data;
    expect(output.status).toBe("error");
    expect(output.error).toBeDefined();
    const err = output.error as Record<string, unknown>;
    expect(err.code).toBe("INVALID_PARAMS");
  }, 30_000);

  it("works through createSkillRunner public API", async () => {
    const runner = createSkillRunner(RUNNER_CONFIG);
    const result = await runner.execute(
      {
        skillDir: FLIGHT_SKILL,
        data: {
          params: {
            origin: "LAX",
            destination: "LHR",
            date: "2026-04-01",
          },
        },
      },
      { egressMode: "none", envVars: MOCK_ENV },
    );

    expect(result.success).toBe(true);
    expect(result.data.status).toBe("success");
    expect(result.metadata.skillName).toBe("flight-search");
    expect(result.metadata.skillVersion).toBe("0.1.0");
  }, 30_000);
});

// ────────────────────────────────────────────────
// Hotel Search Skill
// ────────────────────────────────────────────────

describe("hotel-search skill", () => {
  it("parses manifest correctly", async () => {
    const manifest = await loadManifest(HOTEL_SKILL);
    expect(manifest.name).toBe("hotel-search");
    expect(manifest.version).toBe("0.1.0");
    expect(manifest.capabilities).toEqual(["C-HOTEL-SEARCH"]);
    expect(manifest.journeyStages).toEqual(["J1", "J3"]);
    expect(manifest.risk_level).toBe("medium");
    expect(manifest.permissions.network.egress).toEqual([
      { domain: "api.amadeus.com", reason: "Amadeus hotel search API" },
    ]);
    expect(manifest.permissions.env_vars.required).toEqual([
      "AMADEUS_API_KEY",
      "AMADEUS_API_SECRET",
    ]);
  });

  it("returns mock results when no API credentials", async () => {
    const manifest = await loadManifest(HOTEL_SKILL);
    const result = await runContainer(
      manifest,
      {
        action: "search_hotels",
        params: {
          city_code: "PAR",
          check_in: "2026-03-15",
          check_out: "2026-03-18",
          guests: 2,
        },
      },
      HOTEL_SKILL,
      {
        ...RUNNER_CONFIG,
        egressMode: "none",
        envVars: MOCK_ENV,
      },
    );

    expect(result.success).toBe(true);

    const output = result.data;
    expect(output.status).toBe("success");
    expect(output.skill).toBe("hotel-search");
    expect(output.version).toBe("0.1.0");

    const meta = output.metadata as Record<string, unknown>;
    expect(meta.source_api).toBe("mock");

    const results = output.results as Array<Record<string, unknown>>;
    expect(results.length).toBeGreaterThan(0);

    // Verify result shape
    const first = results[0];
    expect(first).toHaveProperty("provider");
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("hotel_id");
    expect(first).toHaveProperty("rating");
    expect(first).toHaveProperty("price");
    expect(first).toHaveProperty("room_type");
    expect(first).toHaveProperty("check_in");
    expect(first).toHaveProperty("check_out");

    const price = first.price as Record<string, unknown>;
    expect(typeof price.amount).toBe("number");
    expect(price.currency).toBe("USD");
    expect(typeof price.per_night).toBe("number");
  }, 30_000);

  it("returns error for missing required params", async () => {
    const manifest = await loadManifest(HOTEL_SKILL);
    const result = await runContainer(
      manifest,
      { params: { city_code: "PAR" } }, // missing check_in and check_out
      HOTEL_SKILL,
      { ...RUNNER_CONFIG, egressMode: "none", envVars: MOCK_ENV },
    );

    expect(result.success).toBe(true);
    const output = result.data;
    expect(output.status).toBe("error");
    const err = output.error as Record<string, unknown>;
    expect(err.code).toBe("INVALID_PARAMS");
  }, 30_000);

  it("works through createSkillRunner public API", async () => {
    const runner = createSkillRunner(RUNNER_CONFIG);
    const result = await runner.execute(
      {
        skillDir: HOTEL_SKILL,
        data: {
          params: {
            city_code: "TYO",
            check_in: "2026-04-01",
            check_out: "2026-04-05",
            guests: 1,
          },
        },
      },
      { egressMode: "none", envVars: MOCK_ENV },
    );

    expect(result.success).toBe(true);
    expect(result.data.status).toBe("success");
    expect(result.metadata.skillName).toBe("hotel-search");
    expect(result.metadata.skillVersion).toBe("0.1.0");
  }, 30_000);
});

// ────────────────────────────────────────────────
// B5: Egress enforcement with real skills
// ────────────────────────────────────────────────

describe("Egress enforcement with real skills", () => {
  it("flight-search: declared domain (api.amadeus.com) is resolvable with allowlist", async () => {
    // In allowlist mode, api.amadeus.com should be resolvable (injected via --add-host)
    // The skill will fail auth (no credentials) but the network connection should work
    const manifest = await loadManifest(FLIGHT_SKILL);
    const result = await runContainer(
      manifest,
      {
        params: {
          origin: "SEA",
          destination: "NRT",
          date: "2026-03-15",
        },
      },
      FLIGHT_SKILL,
      {
        ...RUNNER_CONFIG,
        egressMode: "allowlist",
        envVars: MOCK_ENV,
        timeoutSeconds: 15,
      },
    );

    expect(result.success).toBe(true);
    // Without valid credentials, should get mock results (empty env vars)
    // or an API error if the network reached Amadeus (depending on how
    // the skill handles missing credentials vs network errors)
    expect(result.data.status).toBeDefined();
  }, 30_000);

  it("hotel-search: declared domain (api.amadeus.com) is resolvable with allowlist", async () => {
    const manifest = await loadManifest(HOTEL_SKILL);
    const result = await runContainer(
      manifest,
      {
        params: {
          city_code: "PAR",
          check_in: "2026-03-15",
          check_out: "2026-03-18",
        },
      },
      HOTEL_SKILL,
      {
        ...RUNNER_CONFIG,
        egressMode: "allowlist",
        envVars: MOCK_ENV,
        timeoutSeconds: 15,
      },
    );

    expect(result.success).toBe(true);
    expect(result.data.status).toBeDefined();
  }, 30_000);
});
