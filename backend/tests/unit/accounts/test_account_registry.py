from app.accounts.registry import AccountRegistry


def test_account_registry_connect_disconnect_and_get(tmp_path) -> None:
    registry = AccountRegistry(state_path=tmp_path / "state" / "accounts.json")

    connected = registry.connect(
        account_id="acct_demo_1",
        connector_id="metaapi_mcp",
        provider_account_id="provider_1",
        mode="demo",
        label="Demo",
        allowed_symbols=["ETHUSDm"],
    )
    assert connected.status == "connected"

    disconnected = registry.disconnect(account_id="acct_demo_1")
    account = registry.get(account_id="acct_demo_1")

    assert disconnected is not None
    assert disconnected.status == "disconnected"
    assert account is not None
    assert account.status == "disconnected"


def test_account_registry_persists_state_between_instances(tmp_path) -> None:
    state_path = tmp_path / "state" / "accounts.json"
    first = AccountRegistry(state_path=state_path)
    _ = first.connect(
        account_id="acct_demo_1",
        connector_id="metaapi_mcp",
        provider_account_id="provider_1",
        mode="demo",
        label="Demo",
        allowed_symbols=["ETHUSDm"],
    )

    second = AccountRegistry(state_path=state_path)
    account = second.get(account_id="acct_demo_1")

    assert account is not None
    assert account.connector_id == "metaapi_mcp"
    assert account.status == "connected"
