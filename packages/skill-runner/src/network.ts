/**
 * Egress enforcement via Docker networks + DNS-based domain allowlisting.
 *
 * Approach:
 * - Create a temporary Docker bridge network per skill execution
 * - Pre-resolve declared egress domains to IPs on the host
 * - Inject resolved domains via --add-host (writes to container /etc/hosts)
 * - Set --dns=127.0.0.1 so undeclared domains can't resolve (no DNS server on loopback)
 * - Drop all capabilities to prevent raw socket DNS bypass
 *
 * Works on macOS (Docker Desktop) and Linux — no iptables required.
 */

import { spawn } from "node:child_process";
import { resolve4, resolve6 } from "node:dns/promises";
import { v4 as uuidv4 } from "uuid";
import { DnsResolutionError, NetworkError } from "./errors.js";
import type { EgressRule } from "./types.js";

export interface ResolvedEgress {
  domain: string;
  ips: string[];
}

export interface NetworkHandle {
  networkName: string;
  destroy(): Promise<void>;
}

/**
 * Create a temporary Docker bridge network for a skill execution.
 */
export async function createNetwork(skillName: string): Promise<NetworkHandle> {
  const shortId = uuidv4().slice(0, 8);
  const networkName = `skill-net-${skillName}-${shortId}`;

  await dockerExec(["network", "create", "--driver=bridge", networkName]);

  return {
    networkName,
    async destroy() {
      await destroyNetwork(networkName);
    },
  };
}

/**
 * Destroy a Docker network. Idempotent — swallows errors if already removed.
 */
export async function destroyNetwork(networkName: string): Promise<void> {
  try {
    await dockerExec(["network", "rm", networkName]);
  } catch {
    // Swallow — network may already be removed (e.g., by --rm container cleanup)
  }
}

/**
 * Resolve egress domains to IP addresses using host DNS.
 * Fails fast if any declared domain can't be resolved.
 */
export async function resolveEgressDomains(
  egress: EgressRule[],
): Promise<ResolvedEgress[]> {
  const results: ResolvedEgress[] = [];

  for (const rule of egress) {
    const ips: string[] = [];

    try {
      const ipv4 = await resolve4(rule.domain);
      ips.push(...ipv4);
    } catch {
      // IPv4 resolution failed — try IPv6 before giving up
    }

    try {
      const ipv6 = await resolve6(rule.domain);
      ips.push(...ipv6);
    } catch {
      // IPv6 resolution failed
    }

    if (ips.length === 0) {
      throw new DnsResolutionError(rule.domain);
    }

    results.push({ domain: rule.domain, ips });
  }

  return results;
}

/**
 * Build Docker CLI args for network configuration.
 *
 * If resolved egress is provided (non-empty), creates an allowlist:
 *   --network={name} --dns=127.0.0.1 --add-host=domain:ip --cap-drop=ALL
 *
 * If resolved is empty or null, blocks all network:
 *   --network=none
 */
export function buildNetworkArgs(
  networkName: string | null,
  resolved: ResolvedEgress[],
): string[] {
  if (!networkName || resolved.length === 0) {
    return ["--network=none", "--cap-drop=ALL"];
  }

  const args: string[] = [
    `--network=${networkName}`,
    // Block external DNS — only --add-host entries are resolvable
    "--dns=127.0.0.1",
    // Drop all capabilities — prevents raw socket DNS bypass
    "--cap-drop=ALL",
  ];

  for (const entry of resolved) {
    for (const ip of entry.ips) {
      args.push(`--add-host=${entry.domain}:${ip}`);
    }
  }

  return args;
}

/**
 * Run a Docker CLI command and return stdout.
 */
function dockerExec(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("docker", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(
          new NetworkError(
            `Docker command failed (exit ${code}): docker ${args.join(" ")}`,
          ),
        );
      }
    });

    proc.on("error", (err) => {
      reject(
        new NetworkError(`Failed to spawn docker: ${err.message}`),
      );
    });
  });
}
