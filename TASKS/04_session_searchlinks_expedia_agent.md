# Session 4 — SearchLinks + Expedia + Agent Actions

## Branch
`codex-searchlinks-agent`

## Scope lock
Only modify:
- `packages/adapters/searchLinks.ts`
- one UI surface for quick-search chips (prefer trip detail)
- optional `apps/web/**/app/api/agent/**` if it exists

## Objective
Deterministic one-click searches:
- Google, Reddit, Wikipedia
- Expedia via Google site search: `site:expedia.com <query>`

## Codex prompt
> You are working in ../documents/travel.aw on branch codex-searchlinks-agent.  
> SCOPE: Only modify packages/adapters/searchLinks.ts and one UI surface where quick-search chips render (prefer apps/web/**/app/trips/[id]/**). Optionally modify apps/web/**/app/api/agent/** if it exists.  
> TASK: Implement deterministic query builder and ActionLink list for Google, Reddit, Wikipedia, Expedia (via Google site:expedia.com). Render “Quick searches” chip row that opens links in new tab. If agent endpoint exists, return actions[] in response.  
> RULE: If you think a change is needed outside scope, add a TODO comment and STOP.
