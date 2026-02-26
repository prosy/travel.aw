# flight-search

Search flights via the Amadeus Self-Service API (sandbox).

- **Capabilities:** C-FLIGHT-SEARCH
- **Risk:** medium (calls external API)
- **Network:** api.amadeus.com only
- **Env vars:** AMADEUS_API_KEY, AMADEUS_API_SECRET

## What this skill does

Accepts origin/destination IATA codes, a departure date, and optional passenger count and cabin class. Calls the Amadeus Flight Offers Search API and returns structured flight results.

Falls back to realistic mock data when API credentials are not provided (for testing).

## Input

```json
{
  "action": "search_flights",
  "params": {
    "origin": "SEA",
    "destination": "NRT",
    "date": "2026-03-15",
    "passengers": 1,
    "cabin": "ECONOMY"
  }
}
```

## Output

Returns structured flight offers with airline, price, departure/arrival times, stops, and duration.
