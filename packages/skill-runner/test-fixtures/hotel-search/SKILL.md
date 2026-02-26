# hotel-search

Search hotels via the Amadeus Self-Service API (sandbox).

- **Capabilities:** C-HOTEL-SEARCH
- **Risk:** medium (calls external API)
- **Network:** api.amadeus.com only
- **Env vars:** AMADEUS_API_KEY, AMADEUS_API_SECRET

## What this skill does

Accepts a destination city code, check-in/check-out dates, and guest count. Calls the Amadeus Hotel List + Hotel Offers APIs and returns structured hotel results.

Falls back to realistic mock data when API credentials are not provided (for testing).

## Input

```json
{
  "action": "search_hotels",
  "params": {
    "city_code": "PAR",
    "check_in": "2026-03-15",
    "check_out": "2026-03-18",
    "guests": 2
  }
}
```

## Output

Returns structured hotel offers with name, rating, price, and location.
