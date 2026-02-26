import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { execSync } from "node:child_process";
import {
  buildNetworkArgs,
  createNetwork,
  resolveEgressDomains,
} from "../src/network.js";
import { DnsResolutionError } from "../src/errors.js";
import { loadManifest } from "../src/manifest.js";
import { runContainer } from "../src/docker.js";
import type { ResolvedEgress } from "../src/network.js";

const FIXTURES = join(__dirname, "..", "test-fixtures");
const EGRESS_SKILL = join(FIXTURES, "egress-skill");

// --- Unit tests (no Docker required) ---

describe("buildNetworkArgs", () => {
  it("returns --network=none when no network name provided", () => {
    const args = buildNetworkArgs(null, []);
    expect(args).toContain("--network=none");
    expect(args).toContain("--cap-drop=ALL");
  });

  it("returns --network=none when resolved is empty", () => {
    const args = buildNetworkArgs("skill-net-test-123", []);
    expect(args).toContain("--network=none");
  });

  it("builds correct args for single domain with single IP", () => {
    const resolved: ResolvedEgress[] = [
      { domain: "api.example.com", ips: ["1.2.3.4"] },
    ];
    const args = buildNetworkArgs("skill-net-test-abc", resolved);

    expect(args).toContain("--network=skill-net-test-abc");
    expect(args).toContain("--dns=127.0.0.1");
    expect(args).toContain("--add-host=api.example.com:1.2.3.4");
    expect(args).toContain("--cap-drop=ALL");
    expect(args).not.toContain("--network=none");
  });

  it("builds correct args for domain with multiple IPs", () => {
    const resolved: ResolvedEgress[] = [
      { domain: "api.example.com", ips: ["1.2.3.4", "5.6.7.8"] },
    ];
    const args = buildNetworkArgs("skill-net-test-abc", resolved);

    expect(args).toContain("--add-host=api.example.com:1.2.3.4");
    expect(args).toContain("--add-host=api.example.com:5.6.7.8");
  });

  it("builds correct args for multiple domains", () => {
    const resolved: ResolvedEgress[] = [
      { domain: "api.example.com", ips: ["1.2.3.4"] },
      { domain: "cdn.example.com", ips: ["10.0.0.1"] },
    ];
    const args = buildNetworkArgs("skill-net-test-abc", resolved);

    expect(args).toContain("--add-host=api.example.com:1.2.3.4");
    expect(args).toContain("--add-host=cdn.example.com:10.0.0.1");
  });
});

describe("resolveEgressDomains", () => {
  it("resolves a valid domain to IPs", async () => {
    const result = await resolveEgressDomains([
      { domain: "httpbin.org", reason: "test" },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].domain).toBe("httpbin.org");
    expect(result[0].ips.length).toBeGreaterThan(0);
  });

  it("throws DnsResolutionError for non-existent domain", async () => {
    await expect(
      resolveEgressDomains([
        { domain: "this-domain-does-not-exist-12345.invalid", reason: "test" },
      ]),
    ).rejects.toThrow(DnsResolutionError);
  });

  it("resolves multiple domains", async () => {
    const result = await resolveEgressDomains([
      { domain: "httpbin.org", reason: "test" },
      { domain: "example.com", reason: "test" },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].domain).toBe("httpbin.org");
    expect(result[1].domain).toBe("example.com");
  });

  it("returns empty array for empty egress list", async () => {
    const result = await resolveEgressDomains([]);
    expect(result).toEqual([]);
  });
});

// --- Integration tests (require Docker) ---

describe("Docker network lifecycle", () => {
  it("creates and destroys a temporary network", async () => {
    const handle = await createNetwork("test-lifecycle");

    // Verify network exists
    const networks = execSync("docker network ls --format '{{.Name}}'")
      .toString()
      .trim()
      .split("\n");
    expect(networks).toContain(handle.networkName);

    // Destroy
    await handle.destroy();

    // Verify network is gone
    const afterNetworks = execSync("docker network ls --format '{{.Name}}'")
      .toString()
      .trim()
      .split("\n");
    expect(afterNetworks).not.toContain(handle.networkName);
  });

  it("destroy is idempotent", async () => {
    const handle = await createNetwork("test-idempotent");
    await handle.destroy();
    // Second destroy should not throw
    await handle.destroy();
  });
});

describe("Egress enforcement end-to-end", () => {
  it("allows requests to declared domain (httpbin.org)", async () => {
    const manifest = await loadManifest(EGRESS_SKILL);
    const result = await runContainer(
      manifest,
      { targets: ["http://httpbin.org/get"] },
      EGRESS_SKILL,
      {
        imagePrefix: "travel-aw-skill-",
        egressMode: "allowlist",
        timeoutSeconds: 15,
      },
    );

    expect(result.success).toBe(true);
    const results = result.data.results as Array<Record<string, unknown>>;
    expect(results).toHaveLength(1);
    expect(results[0].reachable).toBe(true);
    expect(results[0].status).toBe(200);
  }, 30_000);

  it("blocks requests to undeclared domain", async () => {
    const manifest = await loadManifest(EGRESS_SKILL);
    const result = await runContainer(
      manifest,
      { targets: ["http://example.com/"] },
      EGRESS_SKILL,
      {
        imagePrefix: "travel-aw-skill-",
        egressMode: "allowlist",
        timeoutSeconds: 15,
      },
    );

    expect(result.success).toBe(true);
    const results = result.data.results as Array<Record<string, unknown>>;
    expect(results).toHaveLength(1);
    // Undeclared domain should fail (DNS can't resolve)
    expect(results[0].reachable).toBe(false);
  }, 30_000);

  it("blocks all network when egressMode is none", async () => {
    const manifest = await loadManifest(EGRESS_SKILL);
    const result = await runContainer(
      manifest,
      { targets: ["http://httpbin.org/get"] },
      EGRESS_SKILL,
      {
        imagePrefix: "travel-aw-skill-",
        egressMode: "none",
        timeoutSeconds: 15,
      },
    );

    expect(result.success).toBe(true);
    const results = result.data.results as Array<Record<string, unknown>>;
    expect(results).toHaveLength(1);
    // Even declared domain should fail with --network=none
    expect(results[0].reachable).toBe(false);
  }, 30_000);

  it("cleans up network after execution", async () => {
    // Snapshot networks before the test to isolate from parallel tests
    const beforeNetworks = new Set(
      execSync("docker network ls --format '{{.Name}}'")
        .toString()
        .trim()
        .split("\n"),
    );

    const manifest = await loadManifest(EGRESS_SKILL);
    await runContainer(
      manifest,
      { targets: ["http://httpbin.org/get"] },
      EGRESS_SKILL,
      {
        imagePrefix: "travel-aw-skill-",
        egressMode: "allowlist",
        timeoutSeconds: 15,
      },
    );

    const afterNetworks = execSync("docker network ls --format '{{.Name}}'")
      .toString()
      .trim()
      .split("\n");

    // Any new skill-net networks created during this test should be cleaned up
    const newNetworks = afterNetworks.filter(
      (n) => n.startsWith("skill-net-egress-skill-") && !beforeNetworks.has(n),
    );
    expect(newNetworks.length).toBe(0);
  }, 30_000);
});
