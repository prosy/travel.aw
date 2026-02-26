"""Egress test skill — attempts HTTP requests to declared and undeclared domains."""
import json
import sys
import urllib.request


def try_request(url: str) -> dict:
    """Attempt HTTP GET, return result dict."""
    try:
        req = urllib.request.urlopen(url, timeout=5)
        return {"url": url, "status": req.getcode(), "reachable": True}
    except Exception as e:
        return {"url": url, "error": type(e).__name__ + ": " + str(e), "reachable": False}


def main():
    input_data = json.loads(sys.stdin.read())
    targets = input_data.get("targets", [])

    results = [try_request(url) for url in targets]

    output = {"results": results}
    print("---SKILL_OUTPUT_START---")
    print(json.dumps(output))
    print("---SKILL_OUTPUT_END---")


if __name__ == "__main__":
    main()
