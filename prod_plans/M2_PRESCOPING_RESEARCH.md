# M2 Pre-Scoping Research: SkillRunner Interface Analysis

**Date:** 2026-02-26
**Scope:** Analyse the current SkillRunner interface, skill I/O contracts, and identify gaps for multi-skill chaining and agent autonomy.

---

## Current SkillRunner Interface

### What `execute()` takes as input and returns

The public entry point is `createSkillRunner(defaultConfig?)` which returns a `SkillRunner` object with a single method:

```typescript
execute(input: SkillInput, config?: ExecutionConfig): Promise<SkillOutput>
```

**SkillInput:**
- `skillDir: string` — absolute path to the skill directory on the host filesystem.
- `data: Record<string, unknown>` — JSON-serializable payload sent to the container via stdin.

**SkillOutput:**
- `success: boolean` — always `true` on the happy path (errors throw instead of returning `success: false`).
- `data: Record<string, unknown>` — parsed JSON object extracted from between the stdout delimiter markers.
- `metadata: ExecutionMetadata` — contains `skillName`, `skillVersion`, `containerId`, `durationMs`, `exitCode`.

**ExecutionConfig (optional overrides):**
- `memoryMb` (default 256), `cpus` (default 0.5), `timeoutSeconds` (default 30).
- `imagePrefix` (default `"travel-aw-skill-"`).
- `envVars: Record<string, string>` — injected into the container as `-e` flags.
- `egressMode: "none" | "allowlist"` (default `"allowlist"`).

### How errors are typed and handled

All errors extend a single base class `SkillRunnerError` which carries a `code: string` discriminant:

| Error class               | `code`                 | When thrown                                        |
|---------------------------|------------------------|----------------------------------------------------|
| `ManifestValidationError` | `MANIFEST_VALIDATION`  | `skill.yaml` fails schema validation               |
| `ConfigError`             | `CONFIG_ERROR`         | Required env vars missing from `ExecutionConfig`    |
| `ImageBuildError`         | `IMAGE_BUILD`          | `docker build` fails                               |
| `NetworkError`            | `NETWORK_ERROR`        | Docker network create/rm fails                     |
| `DnsResolutionError`      | `DNS_RESOLUTION`       | Cannot resolve an egress-allowlisted domain         |
| `ContainerError`          | `CONTAINER_ERROR`      | Container exits non-zero                           |
| `ContainerTimeoutError`   | `CONTAINER_TIMEOUT`    | Container exceeds `timeoutSeconds`                 |
| `OutputParseError`        | `OUTPUT_PARSE`         | stdout missing delimiters or invalid JSON          |

The web route (`/api/skills/invoke`) catches each subclass individually and maps them to HTTP status codes (504 for timeout, 503 for config, 500 for everything else). Internal error messages are never leaked to the client.

### Timeout and resource model

- **Timeout:** A `setTimeout` kills the container via `docker kill` + `docker rm -f` after `timeoutSeconds`. The default is 30 s.
- **Memory:** Hard limit via `--memory={memoryMb}m`. Default 256 MB.
- **CPU:** Soft limit via `--cpus={cpus}`. Default 0.5 (half a core).
- **Filesystem:** Container runs `--read-only` with a `--tmpfs=/tmp:rw,noexec,nosuid,size=64m` scratch area.
- **Capabilities:** `--cap-drop=ALL` and `--security-opt=no-new-privileges`.
- **Cleanup:** `--rm` flag ensures the container is removed after exit. Network handles are destroyed in a `finally` block.

---

## Current Skill I/O Contract

### stdin JSON shape

The web route sends this shape to the container via stdin:

```json
{
  "action": "search_flights",
  "params": {
    "origin": "SFO",
    "destination": "NRT",
    "date": "2026-03-15"
  }
}
```

The Python skills read `input_data.get("params", input_data)`, so they tolerate both the wrapped `{ action, params }` form and a flat params dict.

### stdout delimiter protocol

Skills must print output between two exact markers on stdout:

```
---SKILL_OUTPUT_START---
{"status": "success", ...}
---SKILL_OUTPUT_END---
```

The `parseSkillOutput()` function:
1. Finds the first occurrence of `---SKILL_OUTPUT_START---`.
2. Finds the next `---SKILL_OUTPUT_END---`.
3. Extracts and `JSON.parse()`s the content between them.
4. Requires the result to be a JSON **object** (not array, not primitive).

Anything printed before the start marker or after the end marker is ignored (allows debug logging to stdout).

### What flight-search and hotel-search actually return

**flight-search success shape:**
```json
{
  "status": "success",
  "skill": "flight-search",
  "version": "0.1.0",
  "results": [
    {
      "provider": "Amadeus",
      "airline": "AA",
      "price": { "amount": 847.00, "currency": "USD" },
      "departure": "2026-03-15T08:30:00",
      "arrival": "2026-03-15T14:45:00",
      "stops": 0,
      "duration_minutes": 375
    }
  ],
  "metadata": {
    "query_time_ms": 1200,
    "source_api": "api.amadeus.com",
    "cached": false
  }
}
```

**hotel-search success shape:**
```json
{
  "status": "success",
  "skill": "hotel-search",
  "version": "0.1.0",
  "results": [
    {
      "provider": "Amadeus",
      "name": "Grand Hotel NYC",
      "hotel_id": "HTNYC001",
      "rating": "5",
      "price": { "amount": 450.00, "currency": "USD", "per_night": 150.00 },
      "room_type": "STANDARD",
      "check_in": "2026-03-15",
      "check_out": "2026-03-18"
    }
  ],
  "metadata": {
    "query_time_ms": 800,
    "source_api": "api.amadeus.com",
    "cached": false
  }
}
```

**Error shape (both skills):**
```json
{
  "status": "error",
  "skill": "flight-search",
  "version": "0.1.0",
  "error": {
    "code": "INVALID_PARAMS",
    "message": "Required: origin, destination, date"
  }
}
```

Note: skill-level errors (`status: "error"`) are returned inside a successful container execution (`SkillOutput.success: true`). The caller must check `data.status` to distinguish API-level failures from infrastructure failures.

---

## Gaps for Multi-Skill Chaining

### Can `execute()` be called sequentially (output of skill A -> input of skill B)?

**Yes, mechanically.** `execute()` is a plain async function. Nothing prevents calling it twice in sequence:

```typescript
const flights = await runner.execute({ skillDir: flightDir, data: flightParams });
const hotels  = await runner.execute({ skillDir: hotelDir,  data: hotelParams });
```

However, the output of one skill cannot be fed directly as input to another without transformation, because:

1. `SkillOutput.data` contains the full envelope (`status`, `skill`, `version`, `results`, `metadata`), but skills expect `{ action, params }` on stdin.
2. There is no standard way to extract just the `results` array and reshape it into the next skill's required `params`.
3. Each skill has a different parameter schema (origin/destination/date vs city_code/check_in/check_out) so the transformation is domain-specific.

### What type transformations would be needed?

For a "search flights then search hotels" chain:

1. **Extract** `results` from the flight-search output.
2. **Derive** hotel-search params from flight data: the destination IATA code maps to `city_code`, the arrival date maps to `check_in`, and a trip-duration heuristic or user input gives `check_out`.
3. **Wrap** derived params in the `{ action: "search_hotels", params: {...} }` envelope.

This transformation logic is inherently domain-specific. A generic "pipe skill A output to skill B input" is not possible without a mapping layer.

### Is there a "plan" or "orchestration" layer?

**No.** The current architecture has exactly two layers:

1. **Web route** (`/api/skills/invoke`) — validates a single skill invocation, calls `runner.execute()`, returns the result.
2. **SkillRunner** — manages Docker lifecycle for a single skill execution.

There is no concept of:
- A **plan** (sequence of skill invocations with data flow).
- An **orchestrator** (entity that decides which skill to call next).
- A **context accumulator** (shared state across skill invocations).
- A **rollback/compensation** mechanism (if skill B fails after skill A succeeded).

### What would an agent need to chain: search flights -> search hotels -> build itinerary?

1. **Plan definition format** — a DAG or sequence specifying skill order, input mappings, and branching logic. Example:
   ```
   Step 1: flight-search(origin, dest, date) -> flights
   Step 2: hotel-search(dest_city(flights), arrival_date(flights), check_out) -> hotels
   Step 3: itinerary-builder(flights[selected], hotels[selected], user_prefs) -> itinerary
   ```

2. **Data mapping functions** — per-edge transformers that reshape one skill's output into the next skill's input. These could be:
   - Hardcoded TypeScript functions (simplest, least flexible).
   - LLM-generated mappings at runtime (most flexible, highest latency).
   - Declarative JSONPath/jq-style expressions in the plan definition (middle ground).

3. **Selection/decision points** — after flight-search returns 10 results, something must choose which flight to use for the hotel search dates. This is either:
   - The user (interactive confirmation).
   - The agent (autonomous selection based on preferences/constraints).
   - Deferred (pass all options forward and let itinerary-builder handle combinatorics).

4. **Shared execution context** — an accumulator that holds all intermediate results so the itinerary-builder can reference both flights and hotels.

5. **An `itinerary-builder` skill** — does not yet exist.

---

## Gaps for Agent Autonomy

### Current model: human triggers each skill invocation via web UI

The current flow is strictly human-in-the-loop:

```
User (browser) -> POST /api/skills/invoke { skill, action, params }
                -> SkillRunner.execute()
                -> Response to user
```

Every skill invocation requires an explicit HTTP request from the frontend. The web route enforces:
- Authentication (`getCurrentUser()`).
- Skill allowlist (only `flight-search` and `hotel-search`).
- Parameter validation (required params per skill).
- Rate limiting (10 requests/minute per user).

### What would need to change for an agent to trigger skills programmatically?

1. **Agent execution context** — a new caller identity type. Today the system only knows "authenticated user." An agent needs its own identity with:
   - A scoped API key or service token (not a user session cookie).
   - An associated user principal (agent acts on behalf of user X).
   - Rate limits appropriate for automated usage (higher burst, but bounded total).

2. **Internal skill invocation API** — either:
   - A new internal route (`/api/agent/execute-skill`) that bypasses the web UI's parameter validation and allowlist, replacing them with agent-specific policy checks.
   - Or direct `SkillRunner.execute()` calls from a server-side agent process (skipping HTTP entirely).

3. **Policy engine integration** — the existing `authz.yml` and policy framework needs rules for agent-initiated actions. Key questions:
   - Which skills can the agent invoke without human approval?
   - What spend limits apply before requiring confirmation?
   - Can the agent invoke skills the user hasn't explicitly enabled?

4. **Audit trail** — every agent-initiated skill invocation must be logged with: the agent identity, the user it acts on behalf of, the full input/output, and whether human approval was obtained.

### Where would approval checkpoints go (before booking, before payment)?

Based on the `risk_level` field in skill manifests and the `REQUIRES_USER_CONFIRMATION` declarations in the Python skills:

| Stage                    | Risk level | Approval needed? | Mechanism                              |
|--------------------------|------------|-------------------|----------------------------------------|
| Search flights           | medium     | No                | Read-only, no side effects             |
| Search hotels            | medium     | No                | Read-only, no side effects             |
| Build itinerary          | low        | No                | Pure computation                       |
| **Hold/reserve flight**  | **high**   | **Yes**           | Pre-booking, reversible but time-bound |
| **Book flight**          | **high**   | **Yes**           | Payment, irreversible                  |
| **Book hotel**           | **high**   | **Yes**           | Payment, irreversible                  |

Approval checkpoints should be implemented as:

1. **Pause points in the plan** — the orchestrator suspends execution and emits an approval request to the user (via WebSocket push, email, or in-app notification).
2. **Approval tokens** — the user returns a signed approval token that the orchestrator validates before proceeding. Tokens should be single-use, time-limited, and scoped to the specific action + parameters.
3. **Budget gates** — automatic approval for actions below a configurable threshold (e.g., hotel under $200/night), mandatory human approval above it.

---

## Runtime Limitations

### Docker on Vercel (not possible — serverless)

The current `SkillRunner` spawns Docker containers via `docker run`. This requires:
- A Docker daemon running on the host.
- The ability to spawn child processes (`node:child_process`).
- Network access to create/destroy Docker bridge networks.

Vercel serverless functions cannot do any of this. The `apps/web` deployment on Vercel can only make HTTP calls to external services.

### Options for skill execution infrastructure

| Option                              | Pros                                            | Cons                                                     |
|-------------------------------------|-------------------------------------------------|----------------------------------------------------------|
| **Separate skill execution service** | Clean separation; web app calls service via HTTP; can scale independently | Another service to deploy, monitor, and secure; adds network hop latency |
| **Railway/Fly.io for SkillRunner**  | Persistent VMs with Docker support; easy deployment; good DX | Cost (~$5-20/mo baseline); cold start if scaled to zero; vendor dependency |
| **Local-only (dev mode)**           | Zero infrastructure cost; fastest iteration; already works | Cannot serve production users; no multi-user support      |
| **Cloud Run / ECS**                 | Native container execution; auto-scaling; pay-per-use | More complex setup; container-in-container needs DinD or Firecracker |
| **Modal / Beam / Banana**           | Serverless container execution; Python-native; fast cold starts | Not Docker-compatible (own runtimes); would require skill rewrite |

### Recommended path forward

For M2, the pragmatic approach is:

1. **Local-only for development and testing.** The current `SkillRunner` works as-is on any machine with Docker.
2. **Design the orchestration layer to be transport-agnostic.** The agent should call an interface like `executeSkill(name, params)` that can be backed by either local Docker or a remote HTTP service.
3. **Defer production deployment decision** until M3. By then, the skill execution volume and latency requirements will be clearer. Railway or Fly.io are the simplest paths for a dedicated SkillRunner service that the Vercel-hosted web app calls over HTTPS.

The key architectural constraint: **the web app (Vercel) and the skill runner (Docker host) must communicate over HTTP.** This means the `/api/skills/invoke` route (or a new agent-facing route) should proxy to a SkillRunner service rather than calling `runner.execute()` directly. This separation already exists conceptually in the codebase — making it physical is the M2/M3 infrastructure task.
