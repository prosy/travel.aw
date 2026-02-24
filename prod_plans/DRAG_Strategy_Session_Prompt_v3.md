# D-RAG Strategy Review Session — Claude Code Prompt

## Session Type: READ-ONLY Strategic Review | No pipeline code changes | Markdown output only

---

## Authorities (read and verify first)

Read these three files. For each, confirm it exists at the stated path and record its sha256 hash. If multiple copies exist (Drive vs repo vs local), select the authoritative copy and report which you chose.

1. **Pipeline Manifest v3.7.0:**
   ```
   ~/Library/CloudStorage/GoogleDrive-gprosl@gmail.com/My Drive/Mazda_PDFs/authoritative/config/pipeline_manifest.yaml
   ```

2. **Data Contract:**
   ```
   ~/Library/CloudStorage/GoogleDrive-gprosl@gmail.com/My Drive/Mazda_PDFs/authoritative/contracts/Data_Contract_Deterministic_RAG_v2.md
   ```

3. **I/O Contracts:**
   ```
   ~/Library/CloudStorage/GoogleDrive-gprosl@gmail.com/My Drive/Mazda_PDFs/notebooks_functions_inputs_outputs_v4.md
   ```

If an authority file is not found, halt and report. Do not substitute.

---

## Strategy Docs (read ALL files in these folders)

```
~/Library/CloudStorage/GoogleDrive-gprosl@gmail.com/My Drive/Strategy/
~/Library/CloudStorage/GoogleDrive-gprosl@gmail.com/My Drive/Strategy UVP Convergence/
```

The second folder is flagged as stale — read it but note the staleness.

---

## Development State (read ALL of these)

- `git log --oneline -50` + TASKS + CHANGELOG + `.claude/` memory files
- `/Projects/daily_tracker/` — all files
- `authoritative/docs/EPIC_*.md` — recent EPICs
- `authoritative/codex_context/` — read-only context

---

## After reading, confirm:

- Authority paths verified (3 files found, hashes recorded)
- Number of strategy docs found (list filenames)
- Number of daily tracker entries found
- Recent git activity summary (last 30 days)
- Any files missing or unreadable

---

## Then execute the EPIC

```
authoritative/docs/EPIC_DRAG_Strategy_Review_v3.md
```

Read the full EPIC. Execute Sections 1–7 sequentially. Write all output files to:

```
authoritative/docs/strategy_review/
```

Creating that directory if it doesn't exist is allowed. No other filesystem changes.

---

## Rules

- No pipeline code changes. Creating Markdown deliverables and the output directory is allowed.
- Read ALL docs before synthesizing. No premature conclusions.
- Bounded search only — read from the exact folders listed above. No broad repo-wide grep.
- If strategy docs conflict, apply the tie-break hierarchy in EPIC Section 0.3. If still ambiguous, flag as 🔴 Decision Required.
- Be honest. If the pipeline is over-engineered for MVP, say so. If strategy docs are stale, say so.
