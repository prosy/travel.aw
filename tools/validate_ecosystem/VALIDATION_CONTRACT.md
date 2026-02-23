# Validation Contract

**Authority:** A12
**Path:** `tools/validate_ecosystem/VALIDATION_CONTRACT.md`
**Version:** 1.0.0

---

## Purpose

`validate_ecosystem.ts` is the single authoritative validator for the TRAVEL.aw ecosystem graph. It enforces all structural, referential, and business rules defined by schemas (A9, A10), registries (A4-A7), and policies (A11, A13).

---

## What Is Validated

### Schema Validation (via ajv)

| Check | Schema | Description |
|-------|--------|-------------|
| SV-01 | A9 | Every node validates against `ecosystem_node.schema.json` |
| SV-02 | A10 | Every edge validates against `ecosystem_edge.schema.json` |

### Referential Integrity

| Check | Description |
|-------|-------------|
| RI-01 | Every edge `fromId` resolves to an existing node `id` |
| RI-02 | Every edge `toId` resolves to an existing node `id` |
| RI-03 | No self-edges: `fromId !== toId` on every edge |

### Uniqueness

| Check | Description |
|-------|-------------|
| UQ-01 | No duplicate node IDs |
| UQ-02 | No duplicate edges: unique constraint on `(fromId, toId, type)` triple |

### ID Consistency

| Check | Description |
|-------|-------------|
| ID-01 | Edge `id` must equal `E__{fromId}__{toId}__{type}` (per DD-09) |

### Business Rules

| Check | Description |
|-------|-------------|
| BR-01 | SUPER_APP guardrail: nodes with `providerType: "SUPER_APP"` must have `≥4 journeyStages` and `≥3 capabilities` (per DD-07) |

---

## Determinism Contract

The validator output MUST be:

1. **Deterministic** — identical input produces byte-identical output across runs
2. **Stable-sorted** — all results sorted by `id` (nodes) or `id` (edges)
3. **No network calls** — validator runs entirely offline
4. **No side effects** — reads data, writes report to stdout, nothing else

---

## Output Format

```json
{
  "timestamp": "ISO-8601 UTC",
  "valid": true | false,
  "summary": {
    "nodesChecked": 0,
    "edgesChecked": 0,
    "errorsFound": 0
  },
  "errors": [
    {
      "check": "RI-01",
      "id": "E__FOO__BAR__AGGREGATES",
      "message": "Edge fromId 'FOO' does not resolve to any node"
    }
  ]
}
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All checks pass (0 errors) |
| 1 | One or more validation errors |
| 2 | Runtime error (file not found, malformed JSON, etc.) |
