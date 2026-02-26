"""Echo skill — reads JSON from stdin, echoes it back between output markers."""
import json
import sys

def main():
    raw = sys.stdin.read()
    data = json.loads(raw)
    output = {"echo": data, "skill": "echo-skill"}
    print("---SKILL_OUTPUT_START---")
    print(json.dumps(output))
    print("---SKILL_OUTPUT_END---")

if __name__ == "__main__":
    main()
