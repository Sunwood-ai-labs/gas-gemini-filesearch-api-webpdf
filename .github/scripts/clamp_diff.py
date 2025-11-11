#!/usr/bin/env python3
"""Clamp diff output by both line count and character budget."""

import sys

def clamp(stream, max_lines, max_chars):
    lines = 0
    chars = 0
    chunks = []
    truncated = False

    for raw in stream:
        if lines >= max_lines:
            truncated = True
            break
        encoded = raw.encode("utf-8", "ignore")
        prospective = chars + len(encoded)
        if prospective > max_chars:
            remain = max_chars - chars
            if remain > 0:
                chunks.append(encoded[:remain].decode("utf-8", "ignore"))
            truncated = True
            break
        chunks.append(raw)
        chars = prospective
        lines += 1

    output = "".join(chunks)
    sys.stdout.write(output)

    if truncated:
        if not output.endswith("\n"):
            sys.stdout.write("\n")
        sys.stdout.write("[diff truncated]")


def main(argv):
    if len(argv) != 3:
        raise SystemExit("usage: clamp_diff.py MAX_LINES MAX_CHARS")
    try:
        max_lines = int(argv[1])
        max_chars = int(argv[2])
    except ValueError as exc:
        raise SystemExit(f"invalid limit: {exc}") from exc

    clamp(sys.stdin, max_lines, max_chars)


if __name__ == "__main__":
    main(sys.argv)
