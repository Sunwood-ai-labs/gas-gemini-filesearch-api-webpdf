#!/usr/bin/env python3
"""Ensure a Hugging Face Space exists before deployment.

This script mirrors the inline logic from the GitHub Actions workflow but is
split out so it can be maintained and tested independently.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from typing import Optional


API_BASE = "https://huggingface.co/api"


def require(value: str | None, message: str) -> str:
    if not value:
        raise SystemExit(message)
    return value


def build_headers(token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def request(method: str, url: str, headers: dict[str, str], payload: Optional[dict] = None) -> bytes:
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return resp.read()


def main() -> int:
    token = require(os.environ.get("HF_TOKEN", ""), "Missing Hugging Face token")
    slug = require(os.environ.get("SPACE_SLUG", "").strip(), "space_slug input is required")
    org = os.environ.get("SPACE_ORG", "").strip()
    sdk = os.environ.get("SPACE_SDK", "").strip() or "gradio"
    private = os.environ.get("SPACE_PRIVATE", "false").strip().lower() == "true"
    hardware = os.environ.get("SPACE_HARDWARE", "").strip()

    headers = build_headers(token)

    try:
        if org:
            owner = org
        else:
            whoami_raw = request("GET", f"{API_BASE}/whoami-v2", headers=headers)
            whoami = json.loads(whoami_raw)
            owner = whoami.get("name")
            if not owner:
                raise SystemExit("Unable to resolve the current user from the Hugging Face token")

        space_api_url = f"{API_BASE}/spaces/{owner}/{slug}"
        exists = True
        try:
            request("GET", space_api_url, headers=headers)
        except urllib.error.HTTPError as error:
            if error.code == 404:
                exists = False
            else:
                raise

        created = False
        if not exists:
            payload = {
                "name": slug,
                "type": "space",
                "sdk": sdk,
                "private": private,
            }
            if org:
                payload["organization"] = org
            if hardware:
                payload["hardware"] = hardware

            try:
                request("POST", f"{API_BASE}/repos/create", headers=headers, payload=payload)
                created = True
            except urllib.error.HTTPError as error:
                if error.code == 409:
                    created = False
                else:
                    raise

        github_output = require(os.environ.get("GITHUB_OUTPUT"), "GITHUB_OUTPUT is not set")
        with open(github_output, "a", encoding="utf-8") as handle:
            handle.write(f"space_owner={owner}\n")
            handle.write(f"space_url=https://huggingface.co/spaces/{owner}/{slug}\n")
            handle.write(f"space_created={'true' if created else 'false'}\n")

        status = "Created" if created else "Found existing"
        print(f"{status} Hugging Face Space: https://huggingface.co/spaces/{owner}/{slug}")
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="ignore")
        print(f"::error::Hugging Face API error ({error.code}): {body}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
