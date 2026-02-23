# Contract Versioning Policy

**Authority:** A11
**Path:** `packages/contracts/CONTRACT_VERSIONING.md`
**Version:** 1.0.0

---

## Semver Rules

All registries and schemas follow [Semantic Versioning 2.0.0](https://semver.org/).

### MAJOR (breaking)

- Removing a field from a schema
- Removing an enum value from a registry or schema
- Changing a node or edge ID format
- Changing a field from optional to required
- Renaming or removing a locked registry entry

### MINOR (additive)

- Adding a new optional field to a schema
- Adding a new enum value to a registry or schema
- Adding a new registry entry (with status "candidate" or "locked")
- Adding a new relationship type

### PATCH (fix)

- Fixing a typo in a description or notes field
- Clarifying documentation without changing semantics
- Correcting a label without changing the code/ID

---

## Registry Lock Policy

Once a registry entry has `status: "locked"`:

- **Removing** the entry requires a MAJOR version bump + DD entry
- **Renaming** the code/type requires a MAJOR version bump + DD entry (old code is retired, not reused)
- **Editing** the label or description is a PATCH (no semantic change)
- **Adding** new entries is MINOR

---

## Schema Change Policy

| Change | Version Bump |
|--------|-------------|
| Add optional field | MINOR |
| Add required field | MAJOR |
| Remove field | MAJOR |
| Change field type | MAJOR |
| Tighten validation (e.g., add pattern) | MAJOR |
| Loosen validation (e.g., remove pattern) | MINOR |
| Add enum value | MINOR |
| Remove enum value | MAJOR |

---

## Version Tracking

- Each registry file has a `_version` field in its metadata header
- Schema files use `$id` for identity; version tracked in AUTH/CHANGELOG.md
- All version changes must be logged in AUTH/CHANGELOG.md (A17)
- Breaking changes require a Design Decision (DD) entry in DECISIONS.md (A2)
