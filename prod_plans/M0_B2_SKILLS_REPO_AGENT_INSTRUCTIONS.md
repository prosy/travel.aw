# M0-B2: Create `travel-aw/skills` with StopCrabs CI Gate

**Paste this entire block into Claude Code as your prompt.**

---

## Mission

Create the private `travel-aw/skills` repository — the curated, security-vetted travel skills registry. Every skill PR must pass a StopCrabs CI scan before human review. This is the security foundation for the entire three-layer architecture.

## Pre-Flight

Before creating anything:

1. Verify `stopcrabs` is installable: `pip install stopcrabs` — confirm version ≥0.2.0
2. Run `stopcrabs --help` to understand CLI flags, especially:
   - Output formats (JSON, SARIF, Markdown)
   - Severity threshold flags
   - Exit code behavior (non-zero on blocking findings)
3. Read StopCrabs README at https://github.com/prosy/StopCrabs for rule structure and YAML format
4. Check if `stopcrabs` has a `--config` or `--rules-dir` flag for loading custom rules (we'll need this for TRAVEL-001/002/003 in B3)

## Context

- StopCrabs is a pure Python CLI — no server, no database, no Supabase
- 21 OC vulnerability classifications, 37 DSAL detection rules, 4 backends (regex, AST/semgrep, config posture, IOC)
- Output: JSON, Markdown, SARIF (CI-friendly)
- Non-zero exit on blocking findings, configurable severity thresholds
- Extensible: add new rules as YAML files with no code changes
- This repo will later be consumed by NanoClaw fork at M1

## Repository Structure

```
travel-aw/skills/
├── .github/
│   ├── workflows/
│   │   └── stopcrabs-gate.yml          # CI gate — runs on every PR
│   ├── PULL_REQUEST_TEMPLATE.md        # Skill submission checklist
│   └── CODEOWNERS                      # Require review from maintainers
├── rules/
│   └── travel/                         # Custom travel rules (B3 — placeholder for now)
│       └── .gitkeep
├── skills/
│   └── _template/                      # Reference skill structure
│       ├── SKILL.md                    # Skill metadata + description
│       ├── skill.yaml                  # Manifest: capabilities, permissions, egress declarations
│       └── src/                        # Skill source code
│           └── .gitkeep
├── docs/
│   ├── SUBMISSION_GUIDE.md             # How to submit a skill
│   ├── SECURITY_POLICY.md              # What StopCrabs checks, severity levels, appeal process
│   └── SKILL_MANIFEST_SPEC.md          # skill.yaml schema documentation
├── scripts/
│   └── run-stopcrabs.sh                # Local scan script (mirrors CI)
├── .stopcrabs.yml                      # StopCrabs config: severity threshold, custom rules path
├── LICENSE                             # TBD — private repo, proprietary for now
└── README.md                           # Repo purpose, submission flow, security model
```

## Skill Manifest Schema (`skill.yaml`)

Design this schema. It must declare upfront what a skill does so StopCrabs (and reviewers) can audit it. Minimum fields:

```yaml
# skill.yaml — every skill must have this
name: flight-search                    # Unique identifier
version: "0.1.0"
description: "Search flights via Skyscanner API"
author: "travel-aw"

# Capability mapping (from travel ecosystem spec)
capabilities:
  - C-FLIGHT-SEARCH

# Journey stages this skill serves
journeyStages:
  - J2  # Planning
  - J3  # Booking

# Permission declarations — what the skill needs
permissions:
  network:
    egress:
      - domain: "partners.api.skyscanner.net"
        reason: "Flight search API"
    # No wildcard domains allowed
  filesystem:
    read: ["./config/"]
    write: []                          # Read-only skill
  env_vars:
    required: ["SKYSCANNER_API_KEY"]
    optional: []

# Risk classification
risk_level: "low"                      # low = read-only, no PII | medium = writes data | high = handles PII or payments
```

## CI Workflow: `stopcrabs-gate.yml`

```yaml
name: StopCrabs Security Gate

on:
  pull_request:
    paths:
      - 'skills/**'

jobs:
  security-scan:
    name: StopCrabs Scan
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write             # To post scan results as PR comment

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install StopCrabs
        run: pip install stopcrabs

      # NOTE: Verify exact CLI flags in pre-flight step 2.
      # The flags below are best-guess from docs. Adjust after testing.
      - name: Run StopCrabs scan
        id: scan
        run: |
          # Scan only changed skill directories
          CHANGED_SKILLS=$(git diff --name-only origin/main...HEAD -- skills/ | cut -d/ -f1-2 | sort -u)
          EXIT_CODE=0
          for skill_dir in $CHANGED_SKILLS; do
            echo "::group::Scanning $skill_dir"
            stopcrabs scan "$skill_dir" \
              --format sarif \
              --output "results/${skill_dir//\//_}.sarif" \
              --severity-threshold medium \
              --config .stopcrabs.yml \
              || EXIT_CODE=$?
            echo "::endgroup::"
          done
          echo "exit_code=$EXIT_CODE" >> "$GITHUB_OUTPUT"

      - name: Upload SARIF
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results/
        continue-on-error: true        # Don't fail if no SARIF generated

      - name: Post scan summary to PR
        if: always()
        run: |
          # Generate markdown summary from SARIF results
          echo "## 🦀 StopCrabs Security Scan Results" > summary.md
          if [ "${{ steps.scan.outputs.exit_code }}" = "0" ]; then
            echo "✅ All checks passed." >> summary.md
          else
            echo "❌ Blocking findings detected. See details below." >> summary.md
            # Parse SARIF files for findings summary
            for f in results/*.sarif; do
              [ -f "$f" ] && python3 -c "
          import json, sys
          with open('$f') as fh:
              data = json.load(fh)
          for run in data.get('runs', []):
              for result in run.get('results', []):
                  level = result.get('level', 'unknown')
                  msg = result.get('message', {}).get('text', 'No description')
                  rule = result.get('ruleId', 'unknown')
                  print(f'- **{rule}** [{level}]: {msg}')
          " >> summary.md 2>/dev/null
            done
          fi
          gh pr comment ${{ github.event.pull_request.number }} --body-file summary.md
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Gate decision
        if: steps.scan.outputs.exit_code != '0'
        run: |
          echo "::error::StopCrabs found blocking security findings. Fix issues and re-push."
          exit 1

  manifest-validation:
    name: Validate skill.yaml
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Validate manifests
        run: |
          # Check every changed skill has a valid skill.yaml
          CHANGED_SKILLS=$(git diff --name-only origin/main...HEAD -- skills/ | cut -d/ -f1-2 | sort -u)
          for skill_dir in $CHANGED_SKILLS; do
            if [ ! -f "$skill_dir/skill.yaml" ]; then
              echo "::error::Missing skill.yaml in $skill_dir"
              exit 1
            fi
            # Validate no wildcard egress
            if grep -q '\*' "$skill_dir/skill.yaml" 2>/dev/null; then
              echo "::error::Wildcard found in $skill_dir/skill.yaml — all domains must be explicit"
              exit 1
            fi
          done
          echo "All manifests valid."
```

## StopCrabs Config: `.stopcrabs.yml`

```yaml
# .stopcrabs.yml — repo-level StopCrabs configuration
severity_threshold: medium             # Block on medium+ findings
output_format: sarif
rules:
  builtin: true                        # All 37 DSAL rules
  custom_dir: rules/travel/            # Travel-specific rules (B3)
```

**IMPORTANT:** Verify this config format matches actual StopCrabs CLI. Read the README and `--help` output. If the config file format differs, adapt accordingly. The intent is: block on medium+, include custom rules dir, output SARIF.

## Key Files to Write

### README.md
Cover:
- What this repo is (curated, security-vetted travel skills registry)
- Three security gates: StopCrabs CI scan → human code review → container sandbox execution (NanoClaw)
- Submission flow: fork → add skill in `skills/your-skill/` → PR → CI gate → human review → merge
- This is NOT like ClawHub (zero-vetting). Every skill is audited.

### PULL_REQUEST_TEMPLATE.md
```markdown
## Skill Submission

**Skill name:** 
**Capability codes:** 
**Risk level:** low / medium / high

### Checklist
- [ ] `skill.yaml` manifest is complete
- [ ] All egress domains explicitly declared (no wildcards)
- [ ] No hardcoded credentials or API keys
- [ ] `SKILL.md` describes what the skill does in plain language
- [ ] Tested locally with `./scripts/run-stopcrabs.sh skills/my-skill/`
```

### CODEOWNERS
```
# All skill merges require security review
/skills/ @travel-aw/security-reviewers
```

### scripts/run-stopcrabs.sh
```bash
#!/bin/bash
# Local mirror of CI gate — run before pushing
set -euo pipefail
SKILL_DIR="${1:?Usage: ./scripts/run-stopcrabs.sh skills/my-skill/}"
stopcrabs scan "$SKILL_DIR" --format markdown --severity-threshold medium --config .stopcrabs.yml
```

### SUBMISSION_GUIDE.md
Document:
- Skill directory structure requirements
- skill.yaml manifest fields and validation rules
- Permission declaration requirements (especially: no wildcard egress)
- Risk level classification criteria
- How to run StopCrabs locally before submitting
- What happens after CI passes (human review process)

### SECURITY_POLICY.md
Document:
- What StopCrabs checks (21 OC classifications, link to taxonomy)
- Severity levels and what blocks merge
- Travel-specific rules (placeholder for B3: TRAVEL-001, 002, 003)
- How to appeal a false positive
- Responsible disclosure for vulnerabilities found in approved skills

### SKILL_MANIFEST_SPEC.md
Document the skill.yaml schema fully — every field, valid values, examples.

## Implementation Sequence

```
 1. Pre-flight: install stopcrabs, test CLI, read docs
 2. Create repo directory structure (all dirs + .gitkeep files)
 3. Write .stopcrabs.yml config (verify against actual CLI flags)
 4. Write skill.yaml schema in SKILL_MANIFEST_SPEC.md
 5. Create _template/ skill with example skill.yaml + SKILL.md
 6. Write stopcrabs-gate.yml workflow
 7. Write scripts/run-stopcrabs.sh
 8. Write README.md, SUBMISSION_GUIDE.md, SECURITY_POLICY.md
 9. Write PULL_REQUEST_TEMPLATE.md + CODEOWNERS
10. Test locally: run stopcrabs against _template/ skill — should pass clean
11. Create a deliberately bad test skill (hardcoded creds, wildcard egress) — run stopcrabs, confirm it blocks
12. Clean up test skill, commit everything
```

## Acceptance Criteria

- [ ] Repo structure matches plan above
- [ ] `stopcrabs scan skills/_template/` exits 0 (clean template)
- [ ] `scripts/run-stopcrabs.sh skills/_template/` works
- [ ] `.stopcrabs.yml` config is valid (verified against actual CLI)
- [ ] `stopcrabs-gate.yml` workflow syntax is valid (use `act` or `actionlint` if available, otherwise manual review)
- [ ] skill.yaml schema documented with all fields
- [ ] PR template includes security checklist
- [ ] CODEOWNERS requires security review for /skills/
- [ ] README explains three-gate security model
- [ ] No hardcoded paths or secrets anywhere

## Risks

| Risk | Mitigation |
|------|-----------|
| StopCrabs CLI flags don't match assumptions | Pre-flight step 2 catches this. Adapt all configs/scripts to actual CLI. |
| SARIF upload action version mismatch | Pin to v3. Continue-on-error prevents gate failure from upload issues. |
| `.stopcrabs.yml` format wrong | Verify against docs/source. May need to be passed as CLI flags instead of config file. |
| Custom rules dir not supported yet | `rules/travel/` stays as placeholder with .gitkeep. B3 adds actual rules. |

## Open Questions for B3 (Next Step)

These are NOT blockers for B2 — just flag them:

1. Does StopCrabs support `--rules-dir` or similar for loading custom YAML rules from an external path?
2. If not, do custom travel rules need to be packaged as a StopCrabs plugin or contributed upstream?
3. Should TRAVEL-001/002/003 rules be upstreamed to StopCrabs or kept private in this repo?
