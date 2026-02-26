# M1-A2: Egress Enforcement — Docker Network Allowlist

**Paste this entire block into Claude Code as your prompt.**

---

## Mission

Replace `--network=none` in the SkillRunner with per-execution Docker network egress filtering. Each skill execution creates a temporary Docker bridge network. Only domains declared in `skill.yaml` `permissions.network.egress` are reachable. Everything else is blocked.

This is the second piece of M1's runtime security layer. M1-A1 built the container spawn/I/O/timeout machinery. This task adds network-level enforcement so skills can only call the APIs they declared.

## Pre-Flight

Before writing any code:

1. Read `CLAUDE.md` in `augmented-worlds/travel.aw` (prosy repo) for repo conventions and known gotchas
2. Read `packages/skill-runner/src/docker.ts` — the current `--network=none` implementation you're replacing
3. Read `packages/skill-runner/src/types.ts` — the `EgressRule`, `SkillManifest`, `ExecutionConfig` types
4. Read `packages/skill-runner/src/errors.ts` — the error hierarchy you'll extend
5. Read `packages/skill-runner/src/index.ts` — the public API you'll wire into
6. Verify Docker is available: `docker --version` and `docker network ls`
7. Verify iptables is available: `sudo iptables -L` (macOS: may need Docker Desktop's built-in Linux VM — see Constraints)
8. Check existing test fixtures: `packages/skill-runner/test-fixtures/echo-skill/` and `timeout-skill/`

## Context

- M1-A1 is complete: SkillRunner spawns containers with `--network=none`, enforces resource limits/timeout, parses delimited output. 40 tests pass.
- `--network=none` blocks ALL network access. This is correct for offline skills but wrong for skills that need API access (flight-search, hotel-search).
- The `skill.yaml` manifest already declares egress domains (e.g., `api.amadeus.com`). SkillRunner already parses and validates these (no wildcards, no IPs). But it doesn't enforce them at runtime yet.
- DD-17 (from revised PRD) recommends Option A: Docker bridge network + iptables rules. However, **iptables is not available on macOS Docker Desktop** — the Docker VM handles networking differently. See the Approach section for the macOS-compatible design.

## Approach: DNS-Based Egress Filtering (Option C — Revised)

The PRD recommended Option A (iptables), but iptables requires Linux host access. On macOS with Docker Desktop, the Docker VM abstracts networking. The practical approach for M1 is:

**DNS-based filtering with a sidecar resolver:**

1. Create a temporary Docker bridge network per skill execution
2. Run a lightweight DNS resolver container (or embedded DNS config) on that network that only resolves declared domains
3. Configure the skill container to use that DNS resolver
4. Undeclared domains → DNS resolution fails → connection fails
5. Block direct IP access via `--cap-drop=ALL` + no raw socket capability (skills can't bypass DNS)

**Simpler alternative (recommended for M1):** Use Docker's built-in `--dns` flag + a custom entrypoint wrapper:

1. Create a temporary Docker bridge network (isolates from other containers)
2. Inject a custom `/etc/hosts` file into the container that only maps declared domains
3. Set `--dns=127.0.0.1` (loopback — no external DNS) so undeclared domains can't resolve
4. Pre-resolve declared domains to IPs at execution time and inject as `--add-host=domain:ip`
5. This is pure Docker flags — no iptables, no sidecar, works on macOS and Linux

### Why this works

- Skill container can only resolve domains that are pre-injected via `--add-host`
- `--dns=127.0.0.1` blocks all DNS resolution (nothing listens on 127.0.0.1:53 inside the container)
- Skills can't bypass by using raw IPs because they don't know the IPs (not declared in manifest)
- Defense in depth: `--cap-drop=ALL` prevents raw sockets, so skills can't craft custom DNS packets

### Limitation

- A skill that hardcodes an IP address (e.g., `http://142.250.80.46`) would bypass this. This is acceptable for M1 because:
  - StopCrabs CI gate catches hardcoded IPs in skill PRs
  - IP addresses change, so hardcoding them is impractical
  - M2+ can add iptables rules when running on Linux hosts

## Architecture

```
SkillRunner.execute(input, config)
  │
  ├─ 1. Load manifest, validate, build image (existing M1-A1 code)
  │
  ├─ 2. Create temporary Docker network               ← NEW
  │     docker network create skill-net-{uuid}
  │
  ├─ 3. Resolve egress domains to IPs                 ← NEW
  │     dns.resolve4('api.amadeus.com') → ['1.2.3.4']
  │
  ├─ 4. Build docker run command:
  │     --rm
  │     --network=skill-net-{uuid}                     ← CHANGED (was --network=none)
  │     --dns=127.0.0.1                                ← NEW (block external DNS)
  │     --add-host=api.amadeus.com:1.2.3.4             ← NEW (inject allowed domains)
  │     --cap-drop=ALL                                 ← NEW (no raw sockets)
  │     --memory={limit} --cpus={limit}
  │     -i {image}
  │
  ├─ 5. Write input, read output, enforce timeout (existing)
  │
  ├─ 6. Cleanup: remove temporary network              ← NEW
  │     docker network rm skill-net-{uuid}
  │
  └─ On error: ensure network cleanup (try/finally)    ← NEW
```

## File Plan

### New files

```
packages/skill-runner/
├── src/
│   └── network.ts              # Egress enforcement: network create/destroy, DNS resolve, --add-host args
├── tests/
│   └── network.test.ts         # Unit tests for network module + integration tests for egress filtering
└── test-fixtures/
    └── egress-skill/           # Test skill that attempts HTTP requests
        ├── skill.yaml          # Declares egress: httpbin.org
        ├── Dockerfile
        └── src/
            └── main.py         # Tries declared + undeclared domains, reports results
```

### Modified files

```
packages/skill-runner/src/docker.ts       # Replace --network=none with network module calls
packages/skill-runner/src/types.ts        # Add NetworkConfig type, add egressMode to ExecutionConfig
packages/skill-runner/src/errors.ts       # Add NetworkError, EgressError, DnsResolutionError
packages/skill-runner/src/index.ts        # Re-export network module
packages/skill-runner/tests/docker.test.ts      # Update existing tests for new network behavior
packages/skill-runner/tests/integration.test.ts # Add egress enforcement end-to-end tests
```

## Type Additions: `types.ts`

Add to existing types:

```typescript
export type EgressMode = "none" | "allowlist";

// Add to ExecutionConfig:
export interface ExecutionConfig {
  // ... existing fields ...
  /** Egress mode: "none" blocks all network, "allowlist" uses manifest egress rules (default: "allowlist") */
  egressMode?: EgressMode;
}
```

## Error Additions: `errors.ts`

```typescript
export class NetworkError extends SkillRunnerError {
  constructor(message: string) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

export class DnsResolutionError extends SkillRunnerError {
  constructor(
    public readonly domain: string,
  ) {
    super(
      `Failed to resolve domain "${domain}" — cannot create egress allowlist`,
      "DNS_RESOLUTION",
    );
    this.name = "DnsResolutionError";
  }
}
```

## Network Module: `network.ts`

This is the core new module. Responsibilities:

### 1. `createNetwork(skillName: string): Promise<NetworkHandle>`

```bash
docker network create --driver=bridge skill-net-{skillName}-{uuid}
```

Returns a `NetworkHandle` with the network name and a `destroy()` method.

### 2. `resolveEgressDomains(egress: EgressRule[]): Promise<ResolvedEgress[]>`

For each declared domain:
- Use Node.js `dns.promises.resolve4()` to get IPv4 addresses
- Optionally `dns.promises.resolve6()` for IPv6
- If resolution fails, throw `DnsResolutionError` (fail before spawning)
- Return `[{ domain: string, ips: string[] }]`

### 3. `buildNetworkArgs(networkName: string, resolved: ResolvedEgress[]): string[]`

Build the Docker CLI args:
```
--network=skill-net-{name}-{uuid}
--dns=127.0.0.1
--add-host=api.amadeus.com:1.2.3.4
--add-host=api.amadeus.com:5.6.7.8    (if multiple IPs)
--cap-drop=ALL
```

For skills with empty egress (offline skills), return:
```
--network=none
```
This preserves M1-A1 behavior for offline skills — no network at all.

### 4. `destroyNetwork(networkName: string): Promise<void>`

```bash
docker network rm {networkName}
```

Force-remove. Swallow errors if network already removed (idempotent cleanup).

### Types

```typescript
export interface NetworkHandle {
  networkName: string;
  destroy(): Promise<void>;
}

export interface ResolvedEgress {
  domain: string;
  ips: string[];
}
```

## Docker.ts Changes

Modify `runContainer()` to:

1. Import and use `network.ts` functions
2. **Before** container spawn:
   - If `egressMode === "none"` OR manifest egress is empty: use `--network=none` (unchanged)
   - If `egressMode === "allowlist"` (default) AND manifest has egress domains:
     - Create temporary network
     - Resolve egress domains to IPs
     - Build network args
3. **Replace** the hardcoded `--network=none` with the network args
4. **After** container exits (in `finally` block): destroy temporary network
5. **On timeout**: destroy network as part of cleanup

Key change in `runContainer()`:

```typescript
// Before (M1-A1):
const args = [
  "run", "--rm", "-i",
  `--name=${containerName}`,
  `--network=none`,                    // ← hardcoded
  ...
];

// After (M1-A2):
const egressMode = cfg.egressMode ?? "allowlist";
let networkHandle: NetworkHandle | null = null;
let networkArgs: string[];

if (egressMode === "none" || manifest.permissions.network.egress.length === 0) {
  networkArgs = ["--network=none"];
} else {
  networkHandle = await createNetwork(manifest.name);
  const resolved = await resolveEgressDomains(manifest.permissions.network.egress);
  networkArgs = buildNetworkArgs(networkHandle.networkName, resolved);
}

try {
  const args = [
    "run", "--rm", "-i",
    `--name=${containerName}`,
    ...networkArgs,                    // ← dynamic
    ...
  ];
  // ... spawn container, wait for exit ...
} finally {
  if (networkHandle) {
    await networkHandle.destroy();
  }
}
```

## Test Fixture: `egress-skill/`

### `skill.yaml`

```yaml
name: egress-skill
version: "0.1.0"
description: "Test skill that attempts HTTP requests to test egress filtering."
author: "travel-aw"

capabilities:
  - C-INFO

journeyStages:
  - J0

permissions:
  network:
    egress:
      - domain: "httpbin.org"
        reason: "Test HTTP endpoint"
  filesystem:
    read: []
    write: []
  env_vars:
    required: []
    optional: []

risk_level: "low"
```

### `Dockerfile`

```dockerfile
FROM python:3.12-slim
RUN pip install --no-cache-dir requests
WORKDIR /skill
COPY src/ ./src/
CMD ["python", "src/main.py"]
```

### `src/main.py`

```python
"""Egress test skill — attempts HTTP requests to declared and undeclared domains."""
import json
import sys

def try_request(url: str) -> dict:
    """Attempt HTTP GET, return result dict."""
    try:
        import urllib.request
        req = urllib.request.urlopen(url, timeout=5)
        return {"url": url, "status": req.getcode(), "reachable": True}
    except Exception as e:
        return {"url": url, "error": str(e), "reachable": False}

def main():
    input_data = json.loads(sys.stdin.read())
    targets = input_data.get("targets", [])

    results = [try_request(url) for url in targets]

    output = {"results": results}
    print("---SKILL_OUTPUT_START---")
    print(json.dumps(output))
    print("---SKILL_OUTPUT_END---")

if __name__ == "__main__":
    main()
```

**Note:** Uses `urllib` (stdlib) instead of `requests` to avoid the pip install. Simpler Dockerfile.

## Test Plan

### `tests/network.test.ts` — Unit + Integration

**Unit tests (no Docker):**

1. `buildNetworkArgs` with resolved domains → correct `--add-host` flags
2. `buildNetworkArgs` with empty egress → returns `["--network=none"]`
3. `buildNetworkArgs` with multiple IPs per domain → one `--add-host` per IP
4. `resolveEgressDomains` with valid domain → returns IPs (network required but no Docker)
5. `resolveEgressDomains` with non-existent domain → throws `DnsResolutionError`

**Integration tests (require Docker):**

6. `createNetwork` → network appears in `docker network ls` → `destroy()` → gone
7. Full egress test: egress-skill with declared domain (httpbin.org) → reachable
8. Full egress test: egress-skill with undeclared domain (example.com) → blocked (DNS fails)
9. Network cleanup on timeout: timeout-skill with egress → network is removed after timeout
10. Network cleanup on container error: network is removed even if container crashes

### Update `tests/docker.test.ts`

- Existing tests should still pass (echo-skill has empty egress → falls back to `--network=none`)
- Add test: echo-skill with `egressMode: "none"` explicit → `--network=none` used

### Update `tests/integration.test.ts`

- Existing tests should still pass (echo-skill has no egress)
- Add end-to-end test: egress-skill → declared domain reachable, undeclared blocked

## Implementation Sequence

```
 1. Read pre-flight files (docker.ts, types.ts, errors.ts, index.ts)
 2. Add NetworkError + DnsResolutionError to errors.ts
 3. Add EgressMode to types.ts, add egressMode to ExecutionConfig
 4. Write network.ts: createNetwork, resolveEgressDomains, buildNetworkArgs, destroyNetwork
 5. Write tests/network.test.ts: unit tests for buildNetworkArgs (no Docker needed)
 6. Run unit tests — verify they pass
 7. Modify docker.ts: replace --network=none with network module integration
 8. Run existing tests — verify echo-skill + timeout-skill still pass (regression check)
 9. Create test-fixtures/egress-skill/ (skill.yaml + Dockerfile + main.py)
10. Build egress-skill Docker image
11. Write network.test.ts integration tests (require Docker)
12. Write integration.test.ts egress tests
13. Run full test suite
14. Update index.ts re-exports
15. Run pnpm build to verify clean compilation
16. Run pnpm --filter @travel/skill-runner test to verify all tests pass
17. Session close protocol
```

## Acceptance Criteria

- [ ] `network.ts` exists with `createNetwork`, `resolveEgressDomains`, `buildNetworkArgs`, `destroyNetwork`
- [ ] `docker.ts` uses network module instead of hardcoded `--network=none`
- [ ] Skills with empty egress still use `--network=none` (offline mode preserved)
- [ ] Skills with declared egress get a temporary bridge network with DNS-based allowlist
- [ ] Declared domain (httpbin.org) is reachable from inside the container
- [ ] Undeclared domain (example.com) is NOT reachable (DNS resolution fails)
- [ ] Localhost/host network access blocked from container
- [ ] Temporary networks are cleaned up after every execution (success, error, timeout)
- [ ] No orphan networks left behind (verify via `docker network ls`)
- [ ] All existing M1-A1 tests still pass (regression)
- [ ] New egress tests pass
- [ ] `pnpm build` compiles cleanly
- [ ] No raw Docker/network output ever reaches SkillOutput

## Constraints

- **No iptables on macOS** — Docker Desktop runs containers in a Linux VM. The `--add-host` + `--dns=127.0.0.1` approach works on both macOS and Linux.
- **No sidecar DNS container** — too complex for M1. The `--add-host` approach is simpler and sufficient.
- **No Docker SDK** — continue using `child_process.spawn` for all Docker CLI commands.
- **DNS resolution happens on the host** — `dns.promises.resolve4()` runs in the SkillRunner process (host machine), not inside the container. This is intentional: the host resolves IPs, then injects them into the container.
- **Idempotent cleanup** — `destroyNetwork()` must not throw if the network is already removed. Use `docker network rm` with swallowed errors.
- **`--cap-drop=ALL`** — already partially in M1-A1 via `--security-opt=no-new-privileges`. Add `--cap-drop=ALL` for defense in depth (prevents raw socket creation that could bypass DNS).

## Risks

| Risk | Mitigation |
|------|-----------|
| DNS resolution returns stale IPs | Acceptable for short-lived containers (30s). IPs resolved at execution time. |
| Domain resolves to IPv6 only | Resolve both A and AAAA records. Use `--add-host` for both. |
| `httpbin.org` is down during tests | Use a more reliable test domain, or mock DNS resolution in unit tests. Integration tests can be marked as requiring network. |
| Network creation race condition | UUID in network name prevents collisions. |
| Network not cleaned up on SIGKILL | Add startup cleanup: remove any `skill-net-*` networks older than 5 minutes. |
| Skills using `requests` library ignore /etc/hosts | `--add-host` modifies `/etc/hosts` inside the container. Python `requests` uses system DNS which respects `/etc/hosts`. The `--dns=127.0.0.1` ensures no fallback DNS. |

## What Comes Next (NOT in scope)

- **M1-A3:** Integration test proving blocked/allowed egress end-to-end (partially covered by this task's tests)
- **M1-B:** Real skills (flight-search, hotel-search with Amadeus API)
- **M1-C:** Web app route that calls SkillRunner
- **M2+:** Linux iptables-based egress for production (blocks raw IP access too)
