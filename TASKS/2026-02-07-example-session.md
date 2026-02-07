title: "example session"
date: 2026-02-07
branch: "example-session"
owner: "unassigned"
scope:
  - "path/to/files/**"
estimate: "1 day"
verify:
  - "pnpm dev"
  - "curl http://localhost:3000/health"

# Goal

One-sentence objective.

## Scope lock

List exact files/folders allowed (globs or explicit paths).

## Tasks

Step-by-step list of expected changes and deliverables.

## Verification

Commands and expected outputs.

## Rules / Notes

Anything the worker must not change; TODO policy.
