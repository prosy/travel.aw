/**
 * M1-A3: Comprehensive egress enforcement integration tests.
 *
 * Proves the SkillRunner security model end-to-end:
 *   - Declared domains are reachable
 *   - Undeclared domains are blocked (DNS fails)
 *   - Localhost/host network is blocked
 *   - Offline skills (empty egress) have no network
 *   - Networks are cleaned up after every execution
 *   - Public API (createSkillRunner) enforces egress correctly
 *
 * Maps to PRD acceptance criteria (M1-2, M1-6 Scenario 4):
 *   [x] Each skill execution creates a temporary Docker network with restricted egress
 *   [x] Only domains listed in skill.yaml egress are resolvable/reachable
 *   [x] Undeclared domain calls fail (DNS failure)
 *   [x] Localhost/host network access blocked from container
 *   [x] Egress enforcement verified by test
 *
 * Requires Docker to be running.
 */

import { describe, it, expect, afterAll } from "vitest";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { createSkillRunner } from "../src/index.js";
import { loadManifest } from "../src/manifest.js";
import { runContainer } from "../src/docker.js";
import { ContainerTimeoutError } from "../src/errors.js";

const FIXTURES = join(__dirname, "..", "test-fixtures");
const EGRESS_SKILL = join(FIXTURES, "egress-skill");
const MULTI_EGRESS_SKILL = join(FIXTURES, "multi-egress-skill");
const ECHO_SKILL = join(FIXTURES, "echo-skill");
const TIMEOUT_SKILL = join(FIXTURES, "timeout-skill");

const RUNNER_CONFIG = { imagePrefix: "travel-aw-skill-" };

// Cleanup: remove any orphan skill-net-* networks after all tests
afterAll(() => {
  try {
    const networks = execSync("docker network ls --format '{{.Name}}'")
      .toString()
      .trim()
      .split("\n")
      .filter((n) => n.startsWith("skill-net-"));
    for (const net of networks) {
      execSync(`docker network rm ${net} 2>/dev/null || true`);
    }
  } catch {
    // Best-effort cleanup
  }
});

// ────────────────────────────────────────────────
// Scenario 1: Declared domains ARE reachable
// ────────────────────────────────────────────────

describe("Declared domain access (allowlist)", () => {
  it("single declared domain (httpbin.org) is reachable via HTTP", async () => {
    const manifest = await loadManifest(EGRESS_SKILL);
    const result = await runContainer(
      manifest,
      { targets: ["http://httpbin.org/get"] },
      EGRESS_SKILL,
      { ...RUNNER_CONFIG, egressMode: "allowlist", timeoutSeconds: 15 },
    );

    expect(result.success).toBe(true);
    const results = result.data.results as Array<Record<string, unknown>>;
    expect(results).toHaveLength(1);
    expect(results[0].reachable).toBe(true);
    expect(results[0].status).toBe(200);
  }, 30_000);

  it("multiple declared domains are all reachable", async () => {
    const manifest = await loadManifest(MULTI_EGRESS_SKILL);
    const result = await runContainer(
      manifest,
      {
        targets: ["http://httpbin.org/get", "http://example.com/"],
      },
      MULTI_EGRESS_SKILL,
      { ...RUNNER_CONFIG, egressMode: "allowlist", timeoutSeconds: 15 },
    );

    expect(result.success).toBe(true);
    const results = result.data.results as Array<Record<string, unknown>>;
    expect(results).toHaveLength(2);
    expect(results[0].reachable).toBe(true);
    expect(results[1].reachable).toBe(true);
  }, 30_000);

  it("declared domain DNS resolution works inside container", async () => {
    const manifest = await loadManifest(MULTI_EGRESS_SKILL);
    const result = await runContainer(
      manifest,
      { targets: [], dns_targets: ["httpbin.org", "example.com"] },
      MULTI_EGRESS_SKILL,
      { ...RUNNER_CONFIG, egressMode: "allowlist", timeoutSeconds: 15 },
    );

    expect(result.success).toBe(true);
    const dnsResults = result.data.dns_results as Array<Record<string, unknown>>;
    expect(dnsResults).toHaveLength(2);
    expect(dnsResults[0].resolved).toBe(true);
    expect(dnsResults[1].resolved).toBe(true);
  }, 30_000);
});

// ────────────────────────────────────────────────
// Scenario 2: Undeclared domains ARE blocked
// ────────────────────────────────────────────────

describe("Undeclared domain blocking", () => {
  it("undeclared domain (google.com) is blocked via HTTP", async () => {
    const manifest = await loadManifest(EGRESS_SKILL);
    // egress-skill only declares httpbin.org — google.com is undeclared
    const result = await runContainer(
      manifest,
      { targets: ["http://google.com/"] },
      EGRESS_SKILL,
      { ...RUNNER_CONFIG, egressMode: "allowlist", timeoutSeconds: 15 },
    );

    expect(result.success).toBe(true);
    const results = result.data.results as Array<Record<string, unknown>>;
    expect(results).toHaveLength(1);
    expect(results[0].reachable).toBe(false);
  }, 30_000);

  it("undeclared domain DNS resolution fails inside container", async () => {
    const manifest = await loadManifest(MULTI_EGRESS_SKILL);
    const result = await runContainer(
      manifest,
      { targets: [], dns_targets: ["google.com", "github.com"] },
      MULTI_EGRESS_SKILL,
      { ...RUNNER_CONFIG, egressMode: "allowlist", timeoutSeconds: 15 },
    );

    expect(result.success).toBe(true);
    const dnsResults = result.data.dns_results as Array<Record<string, unknown>>;
    expect(dnsResults).toHaveLength(2);
    expect(dnsResults[0].resolved).toBe(false);
    expect(dnsResults[1].resolved).toBe(false);
  }, 30_000);

  it("mix of declared + undeclared: only declared succeeds", async () => {
    const manifest = await loadManifest(EGRESS_SKILL);
    // httpbin.org is declared, github.com is not
    const result = await runContainer(
      manifest,
      { targets: ["http://httpbin.org/get", "http://github.com/"] },
      EGRESS_SKILL,
      { ...RUNNER_CONFIG, egressMode: "allowlist", timeoutSeconds: 15 },
    );

    expect(result.success).toBe(true);
    const results = result.data.results as Array<Record<string, unknown>>;
    expect(results).toHaveLength(2);
    expect(results[0].reachable).toBe(true); // httpbin.org — declared
    expect(results[1].reachable).toBe(false); // github.com — undeclared
  }, 30_000);
});

// ────────────────────────────────────────────────
// Scenario 3: Localhost/host network blocked
// ────────────────────────────────────────────────

describe("Localhost and host network blocking", () => {
  it("localhost HTTP is blocked from container", async () => {
    const manifest = await loadManifest(EGRESS_SKILL);
    const result = await runContainer(
      manifest,
      { targets: ["http://localhost:3000/", "http://127.0.0.1:3000/"] },
      EGRESS_SKILL,
      { ...RUNNER_CONFIG, egressMode: "allowlist", timeoutSeconds: 15 },
    );

    expect(result.success).toBe(true);
    const results = result.data.results as Array<Record<string, unknown>>;
    expect(results).toHaveLength(2);
    // Both localhost variants must be unreachable
    expect(results[0].reachable).toBe(false);
    expect(results[1].reachable).toBe(false);
  }, 30_000);

  it("host.docker.internal is blocked from container", async () => {
    const manifest = await loadManifest(EGRESS_SKILL);
    const result = await runContainer(
      manifest,
      { targets: ["http://host.docker.internal:3000/"] },
      EGRESS_SKILL,
      { ...RUNNER_CONFIG, egressMode: "allowlist", timeoutSeconds: 15 },
    );

    expect(result.success).toBe(true);
    const results = result.data.results as Array<Record<string, unknown>>;
    expect(results).toHaveLength(1);
    expect(results[0].reachable).toBe(false);
  }, 30_000);

  it("undeclared external domains fail DNS resolution inside container", async () => {
    // Note: "localhost" resolves via /etc/hosts inside the container (baked into base image),
    // but undeclared external domains cannot resolve because --dns=127.0.0.1 blocks DNS
    // and only --add-host entries are injected. HTTP to localhost still fails (no service).
    const manifest = await loadManifest(MULTI_EGRESS_SKILL);
    const result = await runContainer(
      manifest,
      { targets: [], dns_targets: ["google.com", "github.com"] },
      MULTI_EGRESS_SKILL,
      { ...RUNNER_CONFIG, egressMode: "allowlist", timeoutSeconds: 15 },
    );

    expect(result.success).toBe(true);
    const dnsResults = result.data.dns_results as Array<Record<string, unknown>>;
    expect(dnsResults).toHaveLength(2);
    expect(dnsResults[0].resolved).toBe(false);
    expect(dnsResults[1].resolved).toBe(false);
  }, 30_000);
});

// ────────────────────────────────────────────────
// Scenario 4: Offline skills (empty egress)
// ────────────────────────────────────────────────

describe("Offline skill behavior (empty egress → --network=none)", () => {
  it("echo-skill (no egress) runs without network", async () => {
    const result = await runContainer(
      await loadManifest(ECHO_SKILL),
      { test: "offline" },
      ECHO_SKILL,
      RUNNER_CONFIG,
    );

    expect(result.success).toBe(true);
    expect(result.data.echo).toEqual({ test: "offline" });
  });

  it("echo-skill with explicit egressMode=none still works", async () => {
    const result = await runContainer(
      await loadManifest(ECHO_SKILL),
      { test: "explicit-none" },
      ECHO_SKILL,
      { ...RUNNER_CONFIG, egressMode: "none" },
    );

    expect(result.success).toBe(true);
    expect(result.data.echo).toEqual({ test: "explicit-none" });
  });
});

// ────────────────────────────────────────────────
// Scenario 5: Network cleanup
// ────────────────────────────────────────────────

describe("Network cleanup guarantees", () => {
  function getSkillNetworks(): string[] {
    return execSync("docker network ls --format '{{.Name}}'")
      .toString()
      .trim()
      .split("\n")
      .filter((n) => n.startsWith("skill-net-"));
  }

  it("no orphan networks after successful execution", async () => {
    const before = getSkillNetworks();

    const manifest = await loadManifest(EGRESS_SKILL);
    await runContainer(
      manifest,
      { targets: ["http://httpbin.org/get"] },
      EGRESS_SKILL,
      { ...RUNNER_CONFIG, egressMode: "allowlist", timeoutSeconds: 15 },
    );

    const after = getSkillNetworks();
    expect(after.length).toBe(before.length);
  }, 30_000);

  it("no orphan networks after container timeout", async () => {
    const before = getSkillNetworks();

    const manifest = await loadManifest(TIMEOUT_SKILL);
    // Force egress on timeout-skill to create a network
    manifest.permissions.network.egress = [
      { domain: "httpbin.org", reason: "test" },
    ];

    await expect(
      runContainer(manifest, {}, TIMEOUT_SKILL, {
        ...RUNNER_CONFIG,
        egressMode: "allowlist",
        timeoutSeconds: 3,
      }),
    ).rejects.toThrow(ContainerTimeoutError);

    // Give Docker a moment to finish cleanup
    await new Promise((r) => setTimeout(r, 1000));

    const after = getSkillNetworks();
    expect(after.length).toBe(before.length);
  }, 20_000);

  it("no orphan networks after multiple sequential executions", async () => {
    const before = getSkillNetworks();

    const manifest = await loadManifest(EGRESS_SKILL);
    for (let i = 0; i < 3; i++) {
      await runContainer(
        manifest,
        { targets: ["http://httpbin.org/get"] },
        EGRESS_SKILL,
        { ...RUNNER_CONFIG, egressMode: "allowlist", timeoutSeconds: 15 },
      );
    }

    const after = getSkillNetworks();
    expect(after.length).toBe(before.length);
  }, 60_000);
});

// ────────────────────────────────────────────────
// Scenario 6: Public API (createSkillRunner) integration
// ────────────────────────────────────────────────

describe("createSkillRunner with egress enforcement", () => {
  const runner = createSkillRunner(RUNNER_CONFIG);

  it("executes egress-skill via public API with allowlist", async () => {
    const result = await runner.execute(
      {
        skillDir: EGRESS_SKILL,
        data: { targets: ["http://httpbin.org/get"] },
      },
      { egressMode: "allowlist", timeoutSeconds: 15 },
    );

    expect(result.success).toBe(true);
    const results = result.data.results as Array<Record<string, unknown>>;
    expect(results[0].reachable).toBe(true);
  }, 30_000);

  it("blocks undeclared via public API", async () => {
    const result = await runner.execute(
      {
        skillDir: EGRESS_SKILL,
        data: { targets: ["http://github.com/"] },
      },
      { egressMode: "allowlist", timeoutSeconds: 15 },
    );

    expect(result.success).toBe(true);
    const results = result.data.results as Array<Record<string, unknown>>;
    expect(results[0].reachable).toBe(false);
  }, 30_000);

  it("default egressMode is allowlist (not none)", async () => {
    // No explicit egressMode — default should be allowlist
    const result = await runner.execute(
      {
        skillDir: EGRESS_SKILL,
        data: { targets: ["http://httpbin.org/get"] },
      },
      { timeoutSeconds: 15 },
    );

    expect(result.success).toBe(true);
    const results = result.data.results as Array<Record<string, unknown>>;
    // If default were "none", this would fail since egress-skill declares httpbin.org
    expect(results[0].reachable).toBe(true);
  }, 30_000);

  it("offline echo-skill works through public API with default config", async () => {
    const result = await runner.execute({
      skillDir: ECHO_SKILL,
      data: { message: "api-test" },
    });

    expect(result.success).toBe(true);
    expect(result.data.echo).toEqual({ message: "api-test" });
  });
});
