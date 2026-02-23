# ID Policy

**Authority:** A13
**Path:** `data/ecosystem/ID_POLICY.md`
**Version:** 1.0.0

---

## Node ID Format

```
{PROVIDER_TYPE}_{SNAKE_CASE_NAME}
```

- **Case:** UPPER_SNAKE_CASE
- **PROVIDER_TYPE** must be a valid code from `provider_types.json` (A6)
- **SNAKE_CASE_NAME** is a concise identifier for the service/entity
- Name portion must start with a letter or digit, followed by letters, digits, or underscores

### Examples

| Provider Type | Node ID |
|--------------|---------|
| OTA | `OTA_BOOKING_COM` |
| METASEARCH | `METASEARCH_GOOGLE_FLIGHTS` |
| DIRECT_SUPPLIER | `DIRECT_SUPPLIER_UNITED_AIRLINES` |
| CONTENT_PLATFORM | `CONTENT_PLATFORM_LONELY_PLANET` |
| SOCIAL_PLATFORM | `SOCIAL_PLATFORM_INSTAGRAM` |
| REVIEW_PLATFORM | `REVIEW_PLATFORM_TRIPADVISOR` |
| MAPPING_SERVICE | `MAPPING_SERVICE_GOOGLE_MAPS` |
| SUPER_APP | `SUPER_APP_GOOGLE` |

---

## Edge ID Format

```
E__{fromId}__{toId}__{type}
```

- **Delimiter:** Double underscore `__` (two consecutive underscores)
- **Rationale:** Node IDs contain single underscores (e.g., `OTA_BOOKING_COM`), making a single-underscore delimiter ambiguous. Double underscore `__` never appears within a valid node ID or relationship type, so the edge ID is always unambiguously parseable. See DD-09.

### Examples

| Edge ID | From | To | Type |
|---------|------|----|------|
| `E__OTA_BOOKING_COM__METASEARCH_GOOGLE_FLIGHTS__AGGREGATES` | OTA_BOOKING_COM | METASEARCH_GOOGLE_FLIGHTS | AGGREGATES |
| `E__REVIEW_PLATFORM_TRIPADVISOR__OTA_BOOKING_COM__FEEDS_INTO` | REVIEW_PLATFORM_TRIPADVISOR | OTA_BOOKING_COM | FEEDS_INTO |
| `E__SUPER_APP_GOOGLE__MAPPING_SERVICE_GOOGLE_MAPS__OWNED_BY` | SUPER_APP_GOOGLE | MAPPING_SERVICE_GOOGLE_MAPS | OWNED_BY |

### Parsing

Split on `__` (double underscore). The result is always exactly 4 segments:

```
["E", "{fromId}", "{toId}", "{type}"]
```

---

## Immutability Rules

1. **Node IDs are immutable once merged.** A node's `id` field cannot be changed after it appears in a committed dataset.
2. **Edge IDs are immutable once merged.** Same rule applies.
3. **No ID reuse.** If a node or edge is removed (deprecated), its ID must not be reused for a different entity.
4. **Renaming requires deprecation.** To "rename" an entity, deprecate the old ID and create a new one. Both must be logged in AUTH/CHANGELOG.md.

---

## Validation

The validator (`validate_ecosystem.ts`) enforces:

- Node ID matches pattern `^{PROVIDER_TYPE}_{SNAKE_CASE_NAME}$` (regex in schema A9)
- Edge ID matches pattern `^E__.*__.*__.*$` and equals `E__{fromId}__{toId}__{type}` (checked programmatically)
- No duplicate node IDs
- No duplicate edge IDs
- All referenced IDs (edge fromId/toId) resolve to existing nodes
