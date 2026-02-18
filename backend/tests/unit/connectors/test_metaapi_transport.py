import httpx
import pytest

from app.connectors.metaapi_transport import HttpMetaApiMcpTransport


def test_transport_posts_tool_call_and_returns_result() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.method == "POST"
        assert request.url.path == "/tool/call"
        payload = request.read().decode("utf-8")
        assert '"tool":"get_account_information"' in payload
        return httpx.Response(
            status_code=200,
            json={"result": {"accountId": "acct_1", "status": "DEPLOYED"}},
        )

    client = httpx.Client(transport=httpx.MockTransport(handler), base_url="https://mcp.example.com")
    transport = HttpMetaApiMcpTransport(client=client)

    result = transport.call_tool(
        "get_account_information",
        {"accountId": "acct_1"},
    )

    assert result["accountId"] == "acct_1"


def test_transport_raises_on_non_200_response() -> None:
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(status_code=500, json={"error": "boom"})

    client = httpx.Client(transport=httpx.MockTransport(handler), base_url="https://mcp.example.com")
    transport = HttpMetaApiMcpTransport(client=client)

    with pytest.raises(RuntimeError, match="MCP request failed"):
        transport.call_tool("get_account_information", {"accountId": "acct_1"})
