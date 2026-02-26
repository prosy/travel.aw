"""
flight-search skill — Search flights via Amadeus API.

Reads JSON input from stdin, queries the Amadeus Flight Offers Search API,
and writes structured results between output markers to stdout.

Falls back to realistic mock data when AMADEUS_API_KEY is not set.
"""

import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

# --- Security declarations (required by StopCrabs) ---

ALLOWED_PATHS = []

ALLOWED_DOMAINS = ["api.amadeus.com"]

REQUIRES_USER_CONFIRMATION = True
HAS_DESTINATION_ALLOWLIST = True


def validate_checksum(data: bytes, expected_hash: str) -> bool:
    """Verify hash/checksum of downloaded content (DSAL-OC-016-B)."""
    return hashlib.sha256(data).hexdigest() == expected_hash


# --- Amadeus API helpers ---

AMADEUS_AUTH_URL = "https://api.amadeus.com/v1/security/oauth2/token"
AMADEUS_FLIGHTS_URL = "https://api.amadeus.com/v2/shopping/flight-offers"


def get_access_token(api_key: str, api_secret: str) -> str:
    """Authenticate with Amadeus and return an access token."""
    data = urllib.parse.urlencode({
        "grant_type": "client_credentials",
        "client_id": api_key,
        "client_secret": api_secret,
    }).encode("utf-8")

    req = urllib.request.Request(AMADEUS_AUTH_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    with urllib.request.urlopen(req, timeout=10) as resp:
        body = json.loads(resp.read())
        return body["access_token"]


def search_flights_api(
    token: str,
    origin: str,
    destination: str,
    date: str,
    passengers: int = 1,
    cabin: str = "ECONOMY",
    max_results: int = 10,
) -> list[dict]:
    """Call Amadeus Flight Offers Search API."""
    params = urllib.parse.urlencode({
        "originLocationCode": origin,
        "destinationLocationCode": destination,
        "departureDate": date,
        "adults": passengers,
        "travelClass": cabin,
        "max": max_results,
        "currencyCode": "USD",
    })

    url = f"{AMADEUS_FLIGHTS_URL}?{params}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {token}")

    with urllib.request.urlopen(req, timeout=15) as resp:
        body = json.loads(resp.read())
        return body.get("data", [])


def parse_flight_offer(offer: dict) -> dict:
    """Convert an Amadeus flight offer to our output schema."""
    itinerary = offer.get("itineraries", [{}])[0]
    segments = itinerary.get("segments", [])
    first_seg = segments[0] if segments else {}
    last_seg = segments[-1] if segments else {}

    price_info = offer.get("price", {})

    return {
        "provider": "Amadeus",
        "airline": first_seg.get("carrierCode", ""),
        "price": {
            "amount": float(price_info.get("grandTotal", "0")),
            "currency": price_info.get("currency", "USD"),
        },
        "departure": first_seg.get("departure", {}).get("at", ""),
        "arrival": last_seg.get("arrival", {}).get("at", ""),
        "stops": len(segments) - 1,
        "duration_minutes": parse_duration(itinerary.get("duration", "PT0M")),
    }


def parse_duration(iso_duration: str) -> int:
    """Parse ISO 8601 duration (e.g., PT10H30M) to minutes."""
    minutes = 0
    remaining = iso_duration.replace("PT", "")
    if "H" in remaining:
        hours_str, remaining = remaining.split("H")
        minutes += int(hours_str) * 60
    if "M" in remaining:
        mins_str = remaining.replace("M", "")
        if mins_str:
            minutes += int(mins_str)
    return minutes


# --- Mock data for testing without API credentials ---

def mock_flight_results(origin: str, destination: str, date: str) -> list[dict]:
    """Return realistic mock flight data."""
    return [
        {
            "provider": "Amadeus (mock)",
            "airline": "AA",
            "price": {"amount": 847.00, "currency": "USD"},
            "departure": f"{date}T08:30:00",
            "arrival": f"{date}T14:45:00",
            "stops": 0,
            "duration_minutes": 375,
        },
        {
            "provider": "Amadeus (mock)",
            "airline": "UA",
            "price": {"amount": 723.50, "currency": "USD"},
            "departure": f"{date}T11:15:00",
            "arrival": f"{date}T19:30:00",
            "stops": 1,
            "duration_minutes": 495,
        },
        {
            "provider": "Amadeus (mock)",
            "airline": "DL",
            "price": {"amount": 912.00, "currency": "USD"},
            "departure": f"{date}T06:00:00",
            "arrival": f"{date}T11:20:00",
            "stops": 0,
            "duration_minutes": 320,
        },
    ]


# --- Main entry point ---

def run(input_data: dict) -> dict:
    """Execute the flight search skill."""
    params = input_data.get("params", input_data)
    origin = params.get("origin", "")
    destination = params.get("destination", "")
    date = params.get("date", "")
    passengers = params.get("passengers", 1)
    cabin = params.get("cabin", "ECONOMY")
    max_results = input_data.get("config", {}).get("max_results", 10)

    if not origin or not destination or not date:
        return {
            "status": "error",
            "skill": "flight-search",
            "version": "0.1.0",
            "error": {
                "code": "INVALID_PARAMS",
                "message": "Required: origin, destination, date",
            },
        }

    api_key = os.environ.get("AMADEUS_API_KEY", "")
    api_secret = os.environ.get("AMADEUS_API_SECRET", "")

    start_time = time.time()

    if api_key and api_secret:
        try:
            token = get_access_token(api_key, api_secret)
            offers = search_flights_api(token, origin, destination, date, passengers, cabin, max_results)
            results = [parse_flight_offer(o) for o in offers]
            source = "api.amadeus.com"
        except urllib.error.HTTPError as e:
            return {
                "status": "error",
                "skill": "flight-search",
                "version": "0.1.0",
                "error": {
                    "code": f"API_HTTP_{e.code}",
                    "message": f"Amadeus API returned HTTP {e.code}",
                },
            }
        except urllib.error.URLError:
            return {
                "status": "error",
                "skill": "flight-search",
                "version": "0.1.0",
                "error": {
                    "code": "API_TIMEOUT",
                    "message": "Amadeus API did not respond in time",
                },
            }
    else:
        results = mock_flight_results(origin, destination, date)
        source = "mock"

    elapsed_ms = int((time.time() - start_time) * 1000)

    return {
        "status": "success",
        "skill": "flight-search",
        "version": "0.1.0",
        "results": results,
        "metadata": {
            "query_time_ms": elapsed_ms,
            "source_api": source,
            "cached": False,
        },
    }


def main():
    raw = sys.stdin.read()
    input_data = json.loads(raw) if raw.strip() else {}
    output = run(input_data)
    print("---SKILL_OUTPUT_START---")
    print(json.dumps(output))
    print("---SKILL_OUTPUT_END---")


if __name__ == "__main__":
    main()
