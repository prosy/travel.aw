## Session Close Protocol (MANDATORY)

Before ending any session or running `/compact`, complete these steps in order.

### Tier 1 — Every Session (no exceptions)

1. **`.agent_state.md`** — Update with:
   - What was completed (bullets, concise)
   - Commit SHAs (all commits this session)
   - Next actions for the next agent (numbered, prioritized)
   - Open blockers (or "None")

2. **`CLAUDE.md` — Known Gotchas** — If you hit a non-obvious problem this session, add a one-line entry to the `## Known Gotchas` section:
   - Format: `- symptom — cause/fix`
   - Skip if the gotcha is already documented
   - Ask yourself: *"Did I learn something non-obvious that the next agent should know?"*

3. **`prod_plans/TRAVEL_AW_Sprint_Living_Record.md`** — Update with:
   - Work completed this session (bullets, concise)
   - Decisions made or deferred
   - Blockers encountered
   - Skip if no meaningful progress was made (e.g., research-only session)

4. **`CLAUDE.md`** — Update ONLY if durable state changed:
   - Status transitions (e.g., "WP-0 in progress" -> "WP-0 COMPLETE")
   - New authority files created (add to authority table)
   - Registry/schema changes
   - Do NOT update for in-progress work or session-specific context (that's `.agent_state.md`)

### Tier 2 — When Authorities Change

5. **`AUTH/CHANGELOG.md`** — Add entry if this session changed authority files:
   - New authorities created, registry updates, schema changes
   - Format: `## YYYY-MM-DD | commit_sha | one-line summary`
   - Skip for: docs-only commits, formatting changes
   - One entry per logical change (not per commit)

6. **`AUTH/TRAVEL_AUTHORITIES_INDEX.md`** — Update if:
   - New authority files were created (add to index table)
   - Authority paths changed
   - Do NOT update for edits to existing authorities

### Tier 3 — Do NOT Auto-Update (Human Gate)

These files require human review before changes. Propose edits in `.agent_state.md` under "Proposed authority updates" if you believe a change is needed:

- Schemas (`packages/contracts/schemas/`) — structural contract changes
- Registry enums — adding/removing journey stages, capabilities, provider types
- `.claude/rules/` symlinks — adding/removing auto-loaded authorities

### Authority Files — Single Source of Truth

All authority files live in `AUTH/`, `docs/ecosystem/`, and `packages/contracts/`.
Claude Code auto-loads a subset via symlinks in `.claude/rules/`:

| `.claude/rules/` symlink | Target |
|--------------------------|--------|
| `TRAVEL_AUTHORITIES_INDEX.md` | `AUTH/TRAVEL_AUTHORITIES_INDEX.md` |
| `SESSION_CLOSE_PROTOCOL.md` | `AUTH/SESSION_CLOSE_PROTOCOL.md` |

**Edit authority files at their canonical paths only** — never edit the symlinks directly.
Both Claude Code and Codex read from the same authority locations.

### Skip List

Do NOT maintain or update:
- Duplicate copies of authority files (symlinks only, no copies)
- README files for individual scripts (docstrings are sufficient)
- Separate status trackers (CLAUDE.md is the single status source)

### Commit

All session-close updates go in a single commit:
```
chore: session close — <one-line summary>
```

### Closing Receipt

After completing all steps, print to screen:

```
--- SESSION CLOSE RECEIPT ---
agent_state.md:    UPDATED | NO CHANGES
living_record.md:  UPDATED | NO CHANGES | SKIPPED (no progress)
known_gotchas:     ADDED "<one-line>" | NONE
CLAUDE.md:         UPDATED "<what changed>" | NO CHANGES
Tier 2 files:      UPDATED "<which>" | N/A
Commit:            <sha> | NO COMMIT
---
```

**If this receipt is not printed, the session close is incomplete.**
