"""Multi-egress test skill — attempts HTTP requests to multiple targets."""
import json
import sys
import urllib.request
import socket


def try_request(url: str) -> dict:
    """Attempt HTTP GET, return result dict."""
    try:
        req = urllib.request.urlopen(url, timeout=5)
        return {"url": url, "status": req.getcode(), "reachable": True}
    except Exception as e:
        return {"url": url, "error": type(e).__name__ + ": " + str(e), "reachable": False}


def try_dns(hostname: str) -> dict:
    """Attempt DNS resolution, return result dict."""
    try:
        ips = socket.getaddrinfo(hostname, 80)
        return {"hostname": hostname, "resolved": True, "ips": [a[4][0] for a in ips[:3]]}
    except Exception as e:
        return {"hostname": hostname, "resolved": False, "error": type(e).__name__ + ": " + str(e)}


def main():
    input_data = json.loads(sys.stdin.read())
    targets = input_data.get("targets", [])
    dns_targets = input_data.get("dns_targets", [])

    results = [try_request(url) for url in targets]
    dns_results = [try_dns(host) for host in dns_targets]

    output = {"results": results, "dns_results": dns_results}
    print("---SKILL_OUTPUT_START---")
    print(json.dumps(output))
    print("---SKILL_OUTPUT_END---")


if __name__ == "__main__":
    main()
