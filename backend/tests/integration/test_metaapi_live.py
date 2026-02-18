import os

import pytest

from app.connectors.metaapi_transport import HttpMetaApiMcpTransport


@pytest.mark.live
def test_metaapi_mcp_live_get_account_information() -> None:
    base_url = os.getenv("METAAPI_MCP_URL")
    token = os.getenv("METAAPI_CLOUD_ACCESS_TOKEN")
    account_id = os.getenv("METAAPI_ACCOUNT_ID")

    if not base_url or not token or not account_id:
        pytest.skip(
            "METAAPI_MCP_URL, METAAPI_CLOUD_ACCESS_TOKEN, and METAAPI_ACCOUNT_ID are required"
        )

    transport = HttpMetaApiMcpTransport(base_url=base_url, token=token)
    result = transport.call_tool("get_account_information", {"accountId": account_id})

    assert isinstance(result, dict)
    assert result.get("id") == account_id or result.get("accountId") == account_id
