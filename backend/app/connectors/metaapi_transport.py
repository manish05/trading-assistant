from __future__ import annotations

from typing import Any

import httpx


class HttpMetaApiMcpTransport:
    """Simple HTTP transport for MetaAPI MCP compatible servers."""

    def __init__(
        self,
        *,
        client: httpx.Client | None = None,
        base_url: str | None = None,
        token: str | None = None,
        timeout_seconds: float = 20.0,
    ) -> None:
        if client is not None:
            self._client = client
        else:
            if not base_url:
                raise ValueError("base_url is required when client is not provided")
            headers = {"Authorization": f"Bearer {token}"} if token else {}
            self._client = httpx.Client(
                base_url=base_url,
                headers=headers,
                timeout=timeout_seconds,
            )

    def call_tool(self, tool_name: str, payload: dict[str, Any]) -> dict[str, Any]:
        response = self._client.post(
            "/tool/call",
            json={
                "tool": tool_name,
                "arguments": payload,
            },
        )
        if response.status_code >= 400:
            raise RuntimeError(f"MCP request failed ({response.status_code}): {response.text}")

        body = response.json()
        if isinstance(body, dict) and "result" in body and isinstance(body["result"], dict):
            return body["result"]
        if isinstance(body, dict):
            return body
        raise RuntimeError("MCP response did not return an object payload")
