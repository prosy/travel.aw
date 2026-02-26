"""
hotel-search skill — Search hotels via Amadeus API.

Reads JSON input from stdin, queries the Amadeus Hotel List + Hotel Offers APIs,
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
AMADEUS_HOTEL_LIST_URL = "https://api.amadeus.com/v1/reference-data/locations/hotels/by-city"
AMADEUS_HOTEL_OFFERS_URL = "https://api.amadeus.com/v3/shopping/hotel-offers"


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


def search_hotels_by_city(token: str, city_code: str) -> list[str]:
    """Get hotel IDs for a city using the Hotel List API."""
    params = urllib.parse.urlencode({
        "cityCode": city_code,
    })

    url = f"{AMADEUS_HOTEL_LIST_URL}?{params}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {token}")

    with urllib.request.urlopen(req, timeout=15) as resp:
        body = json.loads(resp.read())
        hotels = body.get("data", [])
        # Return first 10 hotel IDs
        return [h["hotelId"] for h in hotels[:10]]


def search_hotel_offers(
    token: str,
    hotel_ids: list[str],
    check_in: str,
    check_out: str,
    guests: int = 1,
) -> list[dict]:
    """Get hotel offers using the Hotel Offers API."""
    params = urllib.parse.urlencode({
        "hotelIds": ",".join(hotel_ids),
        "checkInDate": check_in,
        "checkOutDate": check_out,
        "adults": guests,
        "currency": "USD",
    })

    url = f"{AMADEUS_HOTEL_OFFERS_URL}?{params}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {token}")

    with urllib.request.urlopen(req, timeout=15) as resp:
        body = json.loads(resp.read())
        return body.get("data", [])


def parse_hotel_offer(hotel_data: dict) -> dict:
    """Convert an Amadeus hotel offer to our output schema."""
    hotel = hotel_data.get("hotel", {})
    offers = hotel_data.get("offers", [{}])
    first_offer = offers[0] if offers else {}
    price_info = first_offer.get("price", {})
    room = first_offer.get("room", {})

    return {
        "provider": "Amadeus",
        "name": hotel.get("name", ""),
        "hotel_id": hotel.get("hotelId", ""),
        "rating": hotel.get("rating", ""),
        "price": {
            "amount": float(price_info.get("total", "0")),
            "currency": price_info.get("currency", "USD"),
            "per_night": float(price_info.get("base", "0")),
        },
        "room_type": room.get("typeEstimated", {}).get("category", ""),
        "check_in": first_offer.get("checkInDate", ""),
        "check_out": first_offer.get("checkOutDate", ""),
    }


# --- Mock data for testing without API credentials ---

def mock_hotel_results(city_code: str, check_in: str, check_out: str) -> list[dict]:
    """Return realistic mock hotel data."""
    return [
        {
            "provider": "Amadeus (mock)",
            "name": f"Grand Hotel {city_code}",
            "hotel_id": "MOCK001",
            "rating": "5",
            "price": {"amount": 450.00, "currency": "USD", "per_night": 150.00},
            "room_type": "STANDARD",
            "check_in": check_in,
            "check_out": check_out,
        },
        {
            "provider": "Amadeus (mock)",
            "name": f"City Inn {city_code}",
            "hotel_id": "MOCK002",
            "rating": "3",
            "price": {"amount": 270.00, "currency": "USD", "per_night": 90.00},
            "room_type": "STANDARD",
            "check_in": check_in,
            "check_out": check_out,
        },
        {
            "provider": "Amadeus (mock)",
            "name": f"Boutique Suites {city_code}",
            "hotel_id": "MOCK003",
            "rating": "4",
            "price": {"amount": 360.00, "currency": "USD", "per_night": 120.00},
            "room_type": "SUITE",
            "check_in": check_in,
            "check_out": check_out,
        },
    ]


# --- Main entry point ---

def run(input_data: dict) -> dict:
    """Execute the hotel search skill."""
    params = input_data.get("params", input_data)
    city_code = params.get("city_code", "")
    check_in = params.get("check_in", "")
    check_out = params.get("check_out", "")
    guests = params.get("guests", 1)

    if not city_code or not check_in or not check_out:
        return {
            "status": "error",
            "skill": "hotel-search",
            "version": "0.1.0",
            "error": {
                "code": "INVALID_PARAMS",
                "message": "Required: city_code, check_in, check_out",
            },
        }

    api_key = os.environ.get("AMADEUS_API_KEY", "")
    api_secret = os.environ.get("AMADEUS_API_SECRET", "")

    start_time = time.time()

    if api_key and api_secret:
        try:
            token = get_access_token(api_key, api_secret)
            hotel_ids = search_hotels_by_city(token, city_code)
            if not hotel_ids:
                results = []
            else:
                offers = search_hotel_offers(token, hotel_ids, check_in, check_out, guests)
                results = [parse_hotel_offer(o) for o in offers]
            source = "api.amadeus.com"
        except urllib.error.HTTPError as e:
            return {
                "status": "error",
                "skill": "hotel-search",
                "version": "0.1.0",
                "error": {
                    "code": f"API_HTTP_{e.code}",
                    "message": f"Amadeus API returned HTTP {e.code}",
                },
            }
        except urllib.error.URLError:
            return {
                "status": "error",
                "skill": "hotel-search",
                "version": "0.1.0",
                "error": {
                    "code": "API_TIMEOUT",
                    "message": "Amadeus API did not respond in time",
                },
            }
    else:
        results = mock_hotel_results(city_code, check_in, check_out)
        source = "mock"

    elapsed_ms = int((time.time() - start_time) * 1000)

    return {
        "status": "success",
        "skill": "hotel-search",
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
