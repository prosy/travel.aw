# M1-A1: SkillRunner Module Foundation

**Paste this entire block into Claude Code as your prompt.**

---

## Mission

Build the `SkillRunner` TypeScript module in the `augmented-worlds/travel.aw` web app repo. SkillRunner spawns ephemeral Docker containers to execute travel skills with enforced egress, resource limits, and timeout. This is the runtime half of the three-layer security architecture.

## Pre-Flight

Before writing any code:

1. Read `CLAUDE.md` in `augmented-worlds/travel.aw` for repo structure, conventions, known gotchas (especially RISK-10 re: Next.js 16 naming)
2. Understand the existing monorepo layout — especially `packages/` if it exists, or `apps/web/` structure
3. Read `prosy/travel-aw-skills/docs/SKILL_MANIFEST_SPEC.md` to understand the `skill.yaml` schema you'll be parsing
4. Read `prosy/travel-aw-skills/skills/_template/skill.yaml` as a concrete manifest example
5. Verify Docker is available: `docker --version` and `docker info`
6. Check Node.js version: `node --version` (should be 18+)

## Context

- SkillRunner replaces NanoClaw for skill execution. NanoClaw is a WhatsApp/messaging daemon — wrong architecture for our use case.
- Skills are Python scripts in Docker containers. SkillRunner is TypeScript in the web app.
- The I/O contract: JSON in via stdin, JSON out via stdout with delimiters `---SKILL_OUTPUT_START---` / `---SKILL_OUTPUT_END---`
- Egress enforcement is a separate task (M1-A2). This task builds the container spawn, I/O, and timeout machinery. Stub the network policy interface but don't implement iptables yet.
- Skills live in `prosy/travel-aw-skills/skills/{name}/`. SkillRunner needs a configurable `skillsDir` path to find them locally.

## Architecture

```
SkillRunner.execute(skillName, input, config)
  │
  ├─ 1. Load skill.yaml from skillsDir/{skillName}/skill.yaml
  ├─ 2. Validate manifest (required fields, egress declarations)
  ├─ 3. Build/find Docker image for skill
  ├─ 4. Create Docker container:
  │     --rm
  │     --memory={limit}
  │     --cpus={limit}
  │     --env API_KEY=... (from config.env_vars)
  │     --network=none (default; M1-A2 adds filtered network)
  ├─ 5. Write input JSON to container stdin
  ├─ 6. Read stdout, parse between delimiters
  ├─ 7. Enforce timeout: kill container if exceeded
  ├─ 8. Return typed SkillOutput
  │
  └─ On error: safe error (no raw container output), cleanup container
```

## File Plan

### New files

```
packages/skill-runner/
├── src/
│   ├── index.ts              # Public API: createSkillRunner(), SkillRunner.execute()
│   ├── types.ts              # SkillInput, SkillOutput, SkillManifest, ExecutionConfig
│   ├── manifest.ts           # skill.yaml parser + validator
│   ├── docker.ts             # Docker container lifecycle (spawn, stdin/stdout, kill)
│   ├── output-parser.ts      # Stdout delimiter parsing + JSON validation
│   └── errors.ts             # SkillRunnerError hierarchy
├── tests/
│   ├── manifest.test.ts      # Manifest parsing + validation
│   ├── output-parser.test.ts # Delimiter parsing edge cases
│   ├── docker.test.ts        # Container lifecycle (requires Docker)
│   └── integration.test.ts   # End-to-end with test skill (requires Docker)
├── test-fixtures/
│   ├── echo-skill/           # Minimal skill that echoes input back
│   │   ├── skill.yaml
│   │   ├── Dockerfile
│   │   └── src/
│   │       └── main.py
│   └── timeout-skill/        # Skill that sleeps forever (for timeout testing)
│       ├── skill.yaml
│       ├── Dockerfile
│       └── src/
│           └── main.py
├── package.json
├── tsconfig.json
└── README.md
```

### Modified files

```
package.json (root)           # Add packages/skill-runner to workspaces (if monorepo)
tsconfig.json (root)          # Add path reference if needed
```

## Type Definitions: `types.ts`

```typescript
// --- Manifest types (parsed from skill.yaml) ---

export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  capabilities: string[];
  journeyStages: string[];
  permissions: {
    network: {
      egress: Array<{ domain: string; reason: string }>;
    };
    filesystem: {
      read: string[];
      write: string[];
    };
    env_vars: {
      required: string[];
      optional: string[];
    };
  };
  risk_level: 'low' | 'medium' | 'high';
}

// --- Execution types ---

export interface SkillInput {
  action: string;
  params: Record<string, unknown>;
  config?: {
    timeout_ms?: number;
    max_results?: number;
  };
}

export interface SkillOutput {
  status: 'success' | 'error';
  skill: string;
  version: string;
  results?: unknown[];
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    query_time_ms: number;
    source_api?: string;
    cached?: boolean;
  };
}

export interface ExecutionConfig {
  timeout_ms?: number;            // Default: from skill.yaml or 30000
  env_vars?: Record<string, string>;  // API keys injected at runtime
  resource_limits?: {
    memory_mb?: number;           // Default: 256
    cpus?: number;                // Default: 0.5
  };
  skills_dir?: string;           // Path to skills directory
  docker_image_prefix?: string;  // e.g., "travel-aw-skill-"
}
```

## Manifest Parser: `manifest.ts`

Parse `skill.yaml` using a YAML library (install `yaml` from npm — it's small, well-maintained).

**Validation rules (fail loudly):**
- `name`: required, non-empty string
- `version`: required, semver-like string
- `capabilities`: required, non-empty array of strings starting with `C-`
- `journeyStages`: required, non-empty array matching `J[0-8]` pattern
- `permissions.network.egress`: required array (can be empty for offline skills)
- `permissions.network.egress[].domain`: no wildcards (`*`), no IP addresses, must be a valid domain
- `risk_level`: required, one of `low`, `medium`, `high`
- `permissions.env_vars.required`: required array (can be empty)

**Return:** Typed `SkillManifest` or throw `ManifestValidationError` with specific field errors.

## Docker Container Lifecycle: `docker.ts`

Use Node.js `child_process.spawn` to call `docker run`. Do NOT use a Docker SDK — too heavy for what we need.

**Container spawn:**

```bash
docker run \
  --rm \
  --name skill-{name}-{uuid} \
  --memory={limit}m \
  --cpus={limit} \
  --network=none \
  --env SKILL_INPUT=/dev/stdin \
  --env VAR1=val1 \
  --env VAR2=val2 \
  -i \
  {image}
```

**Key behaviors:**

1. **Stdin:** Write input JSON to the container's stdin, then close stdin (half-close). The skill reads from stdin.

2. **Stdout:** Accumulate stdout. After the process exits (or is killed), parse for delimiters.

3. **Stderr:** Accumulate but NEVER return to caller. Log at debug level only.

4. **Timeout:** Use `setTimeout` to kill the container if it exceeds the configured timeout.
   - First: `docker kill {container-name}`
   - If still running after 5s: `docker rm -f {container-name}`
   - Return timeout error.

5. **Exit code:** 0 = parse stdout for output. Non-zero = return error (do NOT include stderr in error message).

6. **Container naming:** `skill-{skillName}-{shortUuid}` for debuggability. The `--rm` flag handles cleanup.

7. **Image resolution:** For M1, images are built locally. The image name is `{docker_image_prefix}{skillName}:{version}`. SkillRunner checks if the image exists (`docker image inspect`). If not, it builds from the skill's Dockerfile (`docker build -t {image} {skillDir}`).

**Environment variable injection:**
- Start with `config.env_vars` (caller provides API keys)
- Cross-reference with `manifest.permissions.env_vars.required` — if a required var is missing, fail before spawning
- Do NOT inject any env vars not explicitly provided in config (defense in depth)

## Output Parser: `output-parser.ts`

Parse container stdout for the skill's JSON response.

**Rules:**
1. Find `---SKILL_OUTPUT_START---` and `---SKILL_OUTPUT_END---` markers
2. Extract text between markers
3. Parse as JSON
4. Validate against `SkillOutput` shape (at minimum: `status` field exists)
5. If markers not found: return error with code `NO_OUTPUT_MARKERS`
6. If JSON parse fails: return error with code `INVALID_OUTPUT_JSON`
7. Never include raw stdout in error responses — just the error code

## Error Hierarchy: `errors.ts`

```typescript
export class SkillRunnerError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'SkillRunnerError';
  }
}

export class ManifestValidationError extends SkillRunnerError {
  constructor(public field: string, message: string) {
    super('MANIFEST_VALIDATION', `${field}: ${message}`);
  }
}

export class ContainerError extends SkillRunnerError {}  // CONTAINER_SPAWN, CONTAINER_TIMEOUT, CONTAINER_EXIT
export class OutputParseError extends SkillRunnerError {} // NO_OUTPUT_MARKERS, INVALID_OUTPUT_JSON
export class ConfigError extends SkillRunnerError {}      // MISSING_ENV_VAR, MISSING_SKILL, DOCKER_NOT_FOUND
```

**CRITICAL:** Errors returned to the web app must NEVER contain raw container output, stderr, or Docker error messages. Only typed error codes and safe messages.

## Test Fixtures

### `test-fixtures/echo-skill/`

A minimal skill that reads JSON from stdin and echoes it back wrapped in a SkillOutput envelope.

**skill.yaml:**
```yaml
name: echo-test
version: "0.1.0"
description: "Test skill that echoes input"
author: "travel-aw"
capabilities:
  - C-FLIGHT-SEARCH
journeyStages:
  - J1
permissions:
  network:
    egress: []
  filesystem:
    read: []
    write: []
  env_vars:
    required: []
    optional: []
risk_level: "low"
```

**Dockerfile:**
```dockerfile
FROM python:3.12-slim
WORKDIR /skill
COPY src/ ./src/
CMD ["python", "src/main.py"]
```

**src/main.py:**
```python
import sys
import json

def main():
    input_data = json.loads(sys.stdin.read())
    output = {
        "status": "success",
        "skill": "echo-test",
        "version": "0.1.0",
        "results": [{"echo": input_data}],
        "metadata": {"query_time_ms": 1, "cached": False}
    }
    print("---SKILL_OUTPUT_START---")
    print(json.dumps(output))
    print("---SKILL_OUTPUT_END---")

if __name__ == "__main__":
    main()
```

### `test-fixtures/timeout-skill/`

A skill that sleeps forever. For testing timeout enforcement.

**src/main.py:**
```python
import time
time.sleep(999999)
```

**skill.yaml:** Same as echo-skill but `name: timeout-test`.

## Public API: `index.ts`

```typescript
import { SkillManifest, SkillInput, SkillOutput, ExecutionConfig } from './types';

export interface SkillRunner {
  execute(skillName: string, input: SkillInput, config?: Partial<ExecutionConfig>): Promise<SkillOutput>;
}

export function createSkillRunner(defaultConfig: ExecutionConfig): SkillRunner;

// Re-export types
export { SkillManifest, SkillInput, SkillOutput, ExecutionConfig } from './types';
export { SkillRunnerError, ManifestValidationError, ContainerError, OutputParseError, ConfigError } from './errors';
```

## Implementation Sequence

```
 1. Pre-flight: read repo state, verify Docker, check monorepo structure
 2. Create packages/skill-runner/ directory and package.json
 3. Install dependencies: yaml (YAML parser), uuid (for container naming)
    — use whatever package manager the repo uses (check packageManager field)
 4. Write types.ts — all type definitions
 5. Write errors.ts — error hierarchy
 6. Write manifest.ts — skill.yaml parser + validation
 7. Write manifest.test.ts — test with echo-skill fixture
 8. Write output-parser.ts — delimiter parsing
 9. Write output-parser.test.ts — happy path + edge cases (no markers, bad JSON, empty)
10. Write docker.ts — container spawn, stdin/stdout, timeout, cleanup
11. Create test-fixtures/echo-skill/ (skill.yaml + Dockerfile + main.py)
12. Create test-fixtures/timeout-skill/ (skill.yaml + Dockerfile + main.py)
13. Build echo-skill Docker image: docker build -t travel-aw-skill-echo-test:0.1.0 test-fixtures/echo-skill/
14. Write docker.test.ts — spawn echo-skill, verify output parsing
15. Write docker.test.ts — spawn timeout-skill with 3s timeout, verify killed
16. Write index.ts — public API, wire everything together
17. Write integration.test.ts — end-to-end: createSkillRunner → execute echo-skill → verify output
18. Write README.md for the package
19. Verify all tests pass
20. Session close protocol
```

## Acceptance Criteria

- [ ] `packages/skill-runner/` exists with clean TypeScript build
- [ ] `manifest.ts` parses valid skill.yaml and rejects invalid ones (missing fields, wildcard egress, bad C-codes)
- [ ] `output-parser.ts` extracts JSON between delimiters and handles all error cases
- [ ] `docker.ts` spawns a container, feeds stdin JSON, reads stdout, returns typed output
- [ ] echo-skill test: input JSON → container → output JSON matches expected shape
- [ ] timeout-skill test: container killed after configured timeout, error returned
- [ ] Missing required env var: fails before spawning container
- [ ] Container exit code non-zero: error returned without raw stderr
- [ ] No raw Docker/container output ever reaches the public API return values
- [ ] Image auto-build: if image doesn't exist, SkillRunner builds from Dockerfile
- [ ] All tests pass (unit + integration)
- [ ] No new dependencies beyond `yaml` and `uuid` (plus dev deps for testing)

## Constraints

- **No Docker SDK** — use `child_process.spawn` for `docker run`, `docker kill`, `docker build`, `docker image inspect`
- **No network policy work in this task** — use `--network=none` for now. M1-A2 adds egress filtering.
- **No web app changes** — SkillRunner is a standalone package. Web app integration is M1-C.
- **Python in containers, TypeScript in SkillRunner** — these are different worlds connected by stdin/stdout JSON.
- **Match existing repo conventions** — package manager, tsconfig style, test framework (check what the repo already uses)

## Risks

| Risk | Mitigation |
|------|-----------|
| Repo uses a different package structure than expected | Pre-flight step 2 checks this. Adapt `packages/` location to match. |
| Docker not available in dev environment | Pre-flight step 5 catches this. Docker Desktop required for M1. |
| stdin half-close behavior differs across Node versions | Test on actual Node version. Use `stdin.end()` after writing. |
| Container naming collision | UUID suffix makes collisions statistically impossible. |
| Test cleanup if tests crash mid-container | `--rm` flag handles most cases. Add `afterAll` cleanup that force-removes any `skill-*` containers. |
| `yaml` npm package API differs from expected | Check docs during implementation. Alternative: `js-yaml` if needed. |

## What Comes Next (NOT in scope for this task)

- **M1-A2:** Egress enforcement — replace `--network=none` with filtered Docker network
- **M1-A3:** Integration test with egress enforcement (blocked domain test)
- **M1-B:** Real skills (flight-search, hotel-search with Amadeus API)
- **M1-C:** Web app route that calls SkillRunner
