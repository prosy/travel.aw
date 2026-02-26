"""Timeout skill — sleeps forever to test container timeout handling."""
import time
import sys

def main():
    sys.stdin.read()  # consume stdin
    while True:
        time.sleep(3600)

if __name__ == "__main__":
    main()
