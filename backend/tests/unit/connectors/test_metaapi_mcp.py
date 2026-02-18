from app.connectors.metaapi_mcp import MetaApiConnector, MetaApiConnectorError


class FakeTransport:
    def __init__(self) -> None:
        self.calls: list[tuple[str, dict]] = []
        self.responses: dict[str, dict] = {}
        self.errors: dict[str, Exception] = {}

    async def call_tool(self, tool_name: str, payload: dict) -> dict:
        self.calls.append((tool_name, payload))
        if tool_name in self.errors:
            raise self.errors[tool_name]
        return self.responses.get(tool_name, {})


def test_place_market_order_maps_to_metaapi_tool() -> None:
    transport = FakeTransport()
    transport.responses["place_market_order"] = {"orderId": "1234", "status": "executed"}
    connector = MetaApiConnector(transport=transport)

    result = connector.place_market_order(
        account_id="acct_1",
        symbol="ETHUSDm",
        side="buy",
        volume=0.1,
        stop_loss=2400.0,
        take_profit=2700.0,
        comment="from-test",
    )

    assert result["status"] == "executed"
    assert transport.calls[0][0] == "place_market_order"
    assert transport.calls[0][1] == {
        "accountId": "acct_1",
        "symbol": "ETHUSDm",
        "side": "buy",
        "volume": 0.1,
        "stopLoss": 2400.0,
        "takeProfit": 2700.0,
        "comment": "from-test",
    }


def test_get_candles_maps_optional_start_time() -> None:
    transport = FakeTransport()
    transport.responses["get_candles"] = {"candles": [{"close": 1.0}]}
    connector = MetaApiConnector(transport=transport)

    result = connector.get_candles(
        account_id="acct_1",
        symbol="ETHUSDm",
        timeframe="5m",
        limit=50,
        start_time="2026-01-01T00:00:00Z",
    )

    assert result == {"candles": [{"close": 1.0}]}
    assert transport.calls[0] == (
        "get_candles",
        {
            "accountId": "acct_1",
            "symbol": "ETHUSDm",
            "timeframe": "5m",
            "limit": 50,
            "startTime": "2026-01-01T00:00:00Z",
        },
    )


def test_connector_maps_market_closed_errors_to_typed_exception() -> None:
    transport = FakeTransport()
    transport.errors["place_market_order"] = RuntimeError("MARKET_CLOSED: market is closed")
    connector = MetaApiConnector(transport=transport)

    try:
        connector.place_market_order(
            account_id="acct_1",
            symbol="ETHUSDm",
            side="buy",
            volume=0.1,
        )
        raise AssertionError("Expected MetaApiConnectorError")
    except MetaApiConnectorError as error:
        assert error.code == "MARKET_CLOSED"
        assert error.retryable is False
