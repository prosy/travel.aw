# Seattle Wikipedia Deterministic RAG (no vectors)

This tool ingests the Wikipedia **Seattle** page at a pinned revision (`oldid`) and stores each section deterministically (by anchor) for exact retrieval and deterministic lexical search.

## Quick start

1. Ingest (pins to latest revision unless you pass one):
   - `pnpm -s tsx tools/seattle_wiki_rag/ingest_seattle.ts`

2. Run API server:
   - `pnpm -s tsx tools/seattle_wiki_rag/server.ts`

3. Fetch the Sports section:
   - `curl 'http://127.0.0.1:8787/api/wiki/section?anchor=Sports'`

## Stored query (page open “auto-fire”)

- `GET /api/stored-query/seattle_sports` returns the stored content for `Seattle#Sports`.

