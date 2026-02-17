from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any, Protocol


class MetaApiMcpTransport(Protocol):
    async def call_tool(self, tool_name: str, payload: dict[str, Any]) -> dict[str, Any]: ...


@dataclass(slots=True)
class MetaApiConnectorError(RuntimeError):
    code: str
    message: str
    retryable: bool = False

    def __str__(self) -> str:
        return f"{self.code}: {self.message}"


class MetaApiConnector:
    def __init__(self, *, transport: MetaApiMcpTransport):
        self._transport = transport

    def get_candles(
        self,
        *,
        account_id: str,
        symbol: str,
        timeframe: str,
        limit: int,
        start_time: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "accountId": account_id,
            "symbol": symbol,
            "timeframe": timeframe,
            "limit": limit,
        }
        if start_time:
            payload["startTime"] = start_time
        return self._call_tool("get_candles", payload)

    def place_market_order(
        self,
        *,
        account_id: str,
        symbol: str,
        side: str,
        volume: float,
        stop_loss: float | None = None,
        take_profit: float | None = None,
        comment: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "accountId": account_id,
            "symbol": symbol,
            "side": side,
            "volume": volume,
        }
        if stop_loss is not None:
            payload["stopLoss"] = stop_loss
        if take_profit is not None:
            payload["takeProfit"] = take_profit
        if comment:
            payload["comment"] = comment
        return self._call_tool("place_market_order", payload)

    def cancel_order(self, *, account_id: str, order_id: str) -> dict[str, Any]:
        return self._call_tool(
            "cancel_order",
            {"accountId": account_id, "orderId": order_id},
        )

    def get_positions(self, *, account_id: str) -> dict[str, Any]:
        return self._call_tool("get_positions", {"accountId": account_id})

    def _call_tool(self, tool_name: str, payload: dict[str, Any]) -> dict[str, Any]:
        try:
            return asyncio.run(self._transport.call_tool(tool_name, payload))
        except Exception as exc:  # noqa: BLE001
            mapped = self._map_error(exc)
            raise mapped from exc

    def _map_error(self, exc: Exception) -> MetaApiConnectorError:
        message = str(exc)
        mapping: dict[str, tuple[str, bool]] = {
            "MARKET_CLOSED": ("MARKET_CLOSED", False),
            "TRADE_CONTEXT_BUSY": ("TRADE_CONTEXT_BUSY", True),
            "INSUFFICIENT_FUNDS": ("INSUFFICIENT_FUNDS", False),
            "INVALID_STOPS": ("INVALID_STOPS", False),
        }
        for marker, (code, retryable) in mapping.items():
            if marker in message:
                return MetaApiConnectorError(
                    code=code,
                    message=message,
                    retryable=retryable,
                )
        return MetaApiConnectorError(
            code="CONNECTOR_ERROR",
            message=message,
            retryable=False,
        )
