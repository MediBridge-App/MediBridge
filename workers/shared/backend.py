import json
from typing import Any
from urllib.request import Request, urlopen


def save_analysis(
    payload: dict[str, Any],
    *,
    base_url: str,
    api_key: str,
    opener: Any = urlopen,
    timeout: int = 10,
) -> dict[str, Any]:
    if not base_url.strip():
        raise ValueError("base_url must not be empty")

    if not api_key.strip():
        raise ValueError("api_key must not be empty")

    request = Request(
        url=f"{base_url.rstrip('/')}/internal/ai/analyses",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-API-Key": api_key,
        },
        method="POST",
    )

    with opener(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))
