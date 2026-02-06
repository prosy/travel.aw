# Session 5 — Email Ingest (Inbound webhook stub)

## Branch
`codex-email`

## Scope lock
Only modify:
- `apps/web/**/app/api/email/inbound/**`
- DB write helpers if already present

## Objective
Accept inbound payload (SendGrid-style), store raw payload, create TripItem(type=note) with evidence.kind=email.

## Codex prompt
> You are working in ../documents/travel.aw on branch codex-email.  
> SCOPE: Only modify apps/web/**/app/api/email/inbound/** and DB write helpers.  
> TASK: Implement POST /api/email/inbound that stores raw inbound payload to InboundEmail and creates a TripItem (type=note) with evidence.kind=email. Add basic extraction for subject/from/date; safe defaults.  
> RULE: If you believe a change is needed outside scope, add a TODO comment and STOP.
