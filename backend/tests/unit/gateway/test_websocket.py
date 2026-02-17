from fastapi.testclient import TestClient

from app.main import create_app


def _connect_payload() -> dict:
    return {
        "type": "req",
        "id": "req_connect_1",
        "method": "gateway.connect",
        "params": {
            "client": {
                "name": "web",
                "kind": "web",
                "platform": "browser",
                "version": "0.1.0",
            },
            "protocol": {
                "min": 1,
                "max": 1,
            },
        },
    }


def _read_event_then_response(websocket):
    first = websocket.receive_json()
    if first.get("type") == "event":
        return first, websocket.receive_json()
    return None, first


def test_websocket_rejects_non_connect_first_request(tmp_path) -> None:
    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(
            {
                "type": "req",
                "id": "req_1",
                "method": "gateway.ping",
                "params": {},
            }
        )
        response = websocket.receive_json()

    assert response["type"] == "res"
    assert response["id"] == "req_1"
    assert response["ok"] is False
    assert response["error"]["code"] == "INVALID_REQUEST"


def test_websocket_connect_then_ping_returns_payload(tmp_path) -> None:
    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        connect_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_ping_1",
                "method": "gateway.ping",
                "params": {},
            }
        )
        ping_response = websocket.receive_json()

    assert connect_response["ok"] is True
    assert connect_response["payload"]["protocol"]["selected"] == 1
    assert ping_response["ok"] is True
    assert "now" in ping_response["payload"]


def test_websocket_status_returns_runtime_snapshot(tmp_path) -> None:
    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_status_1",
                "method": "gateway.status",
                "params": {},
            }
        )
        status_response = websocket.receive_json()

    assert status_response["ok"] is True
    assert status_response["payload"]["server"]["name"] == "mt5-claude-trader-v2"
    assert status_response["payload"]["protocolVersion"] == 1


def test_websocket_risk_preview_returns_decision(tmp_path) -> None:
    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_risk_1",
                "method": "risk.preview",
                "params": {
                    "intent": {
                        "account_id": "acct_demo_1",
                        "symbol": "ETHUSDm",
                        "action": "PLACE_MARKET_ORDER",
                        "side": "buy",
                        "volume": 0.3,
                        "stop_loss": None,
                        "take_profit": 2800.0,
                    },
                    "policy": {
                        "allowed_symbols": ["ETHUSDm"],
                        "max_volume": 0.2,
                        "max_concurrent_positions": 2,
                        "max_daily_loss": 100.0,
                        "require_stop_loss": True,
                    },
                    "snapshot": {
                        "open_positions": 0,
                        "daily_pnl": -20.0,
                    },
                },
            }
        )
        event, response = _read_event_then_response(websocket)

    assert event is not None
    assert event["event"] == "event.risk.preview"
    assert response["ok"] is True
    assert response["payload"]["allowed"] is False
    assert len(response["payload"]["violations"]) == 2


def test_websocket_risk_status_and_emergency_stop_methods(tmp_path) -> None:
    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_risk_status_1",
                "method": "risk.status",
                "params": {},
            }
        )
        initial_status_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_risk_stop_1",
                "method": "risk.emergencyStop",
                "params": {
                    "action": "pause_trading",
                    "reason": "operator initiated kill-switch drill",
                },
            }
        )
        emergency_event, emergency_stop_response = _read_event_then_response(websocket)

        websocket.send_json(
            {
                "type": "req",
                "id": "req_risk_status_2",
                "method": "risk.status",
                "params": {},
            }
        )
        active_status_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_trade_blocked_by_emergency_stop",
                "method": "trades.place",
                "params": {
                    "intent": {
                        "account_id": "acct_demo_1",
                        "symbol": "ETHUSDm",
                        "action": "PLACE_MARKET_ORDER",
                        "side": "buy",
                        "volume": 0.1,
                        "stop_loss": 2400.0,
                        "take_profit": 2700.0,
                    },
                    "policy": {
                        "allowed_symbols": ["ETHUSDm"],
                        "max_volume": 0.2,
                        "max_concurrent_positions": 2,
                        "max_daily_loss": 100.0,
                        "require_stop_loss": True,
                    },
                    "snapshot": {
                        "open_positions": 0,
                        "daily_pnl": -20.0,
                    },
                },
            }
        )
        blocked_trade_event, blocked_trade_response = _read_event_then_response(websocket)

    assert initial_status_response["ok"] is True
    assert initial_status_response["payload"]["emergencyStopActive"] is False
    assert initial_status_response["payload"]["lastAction"] is None

    assert emergency_event is not None
    assert emergency_event["event"] == "event.risk.emergencyStop"
    assert emergency_stop_response["ok"] is True
    assert emergency_stop_response["payload"]["emergencyStopActive"] is True
    assert emergency_stop_response["payload"]["lastAction"] == "pause_trading"
    assert emergency_stop_response["payload"]["lastReason"] == (
        "operator initiated kill-switch drill"
    )
    assert emergency_stop_response["payload"]["actionCounts"]["pause_trading"] == 1

    assert active_status_response["ok"] is True
    assert active_status_response["payload"]["emergencyStopActive"] is True
    assert active_status_response["payload"]["lastAction"] == "pause_trading"

    assert blocked_trade_event is not None
    assert blocked_trade_event["event"] == "event.risk.alert"
    assert blocked_trade_response["ok"] is False
    assert blocked_trade_response["error"]["code"] == "RISK_BLOCKED"
    assert blocked_trade_response["error"]["details"]["decision"]["violations"][0]["code"] == (
        "EMERGENCY_STOP_ACTIVE"
    )


def test_websocket_agent_run_updates_queue_status(tmp_path) -> None:
    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_run_1",
                "method": "agent.run",
                "params": {
                    "agentId": "agent_eth_5m",
                    "request": {
                        "request_id": "ar_1",
                        "kind": "hook_trigger",
                        "priority": "normal",
                        "payload": {"message": "first run"},
                    },
                },
            }
        )
        run_response_1 = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_run_2",
                "method": "agent.run",
                "params": {
                    "agentId": "agent_eth_5m",
                    "request": {
                        "request_id": "ar_2",
                        "kind": "hook_trigger",
                        "priority": "normal",
                        "payload": {"message": "second run"},
                    },
                },
            }
        )
        run_response_2 = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_queue_status_1",
                "method": "agent.queue.status",
                "params": {"agentId": "agent_eth_5m"},
            }
        )
        status_response = websocket.receive_json()

    assert run_response_1["ok"] is True
    assert run_response_1["payload"]["decision"]["type"] == "run_now"
    assert run_response_2["ok"] is True
    assert run_response_2["payload"]["decision"]["type"] == "enqueued"
    assert status_response["ok"] is True
    assert status_response["payload"]["activeRequestId"] == "ar_1"
    assert status_response["payload"]["pendingCount"] == 1
    assert status_response["payload"]["mode"] == "followup"


def test_gateway_methods_write_audit_entries(tmp_path) -> None:
    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_risk_2",
                "method": "risk.preview",
                "params": {
                    "intent": {
                        "account_id": "acct_demo_1",
                        "symbol": "ETHUSDm",
                        "action": "PLACE_MARKET_ORDER",
                        "side": "buy",
                        "volume": 0.1,
                        "stop_loss": 2400.0,
                        "take_profit": 2700.0,
                    },
                    "policy": {
                        "allowed_symbols": ["ETHUSDm"],
                        "max_volume": 0.2,
                        "max_concurrent_positions": 2,
                        "max_daily_loss": 100.0,
                        "require_stop_loss": True,
                    },
                    "snapshot": {
                        "open_positions": 0,
                        "daily_pnl": -20.0,
                    },
                },
            }
        )
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_run_3",
                "method": "agent.run",
                "params": {
                    "agentId": "agent_eth_5m",
                    "request": {
                        "request_id": "ar_3",
                        "kind": "hook_trigger",
                        "priority": "normal",
                        "payload": {"message": "run for audit"},
                    },
                },
            }
        )
        _ = websocket.receive_json()

    audit_log = (tmp_path / "audit.jsonl").read_text().splitlines()
    assert len(audit_log) >= 2
    assert '"action":"risk.preview"' in audit_log[0]
    assert '"action":"agent.run"' in audit_log[1]


def test_gateway_memory_search_and_backtest_methods(tmp_path) -> None:
    workspace = tmp_path / "agent_eth_5m"
    workspace.mkdir(parents=True)
    (workspace / "TRADING_MANUAL.md").write_text(
        "Never trade without stop loss.",
        encoding="utf-8",
    )

    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_memory_1",
                "method": "memory.search",
                "params": {
                    "workspacePath": str(workspace),
                    "query": "stop loss",
                    "maxResults": 5,
                },
            }
        )
        memory_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_backtest_1",
                "method": "backtests.run",
                "params": {
                    "candles": [
                        {
                            "ts": "2026-01-01T00:00:00Z",
                            "open": 100,
                            "high": 102,
                            "low": 99,
                            "close": 101,
                        },
                        {
                            "ts": "2026-01-01T00:05:00Z",
                            "open": 101,
                            "high": 106,
                            "low": 100,
                            "close": 105,
                        },
                    ],
                    "signals": [
                        {
                            "index": 0,
                            "side": "buy",
                            "stopLoss": 99,
                            "takeProfit": 105,
                        }
                    ],
                },
            }
        )
        backtest_event, backtest_response = _read_event_then_response(websocket)

    assert memory_response["ok"] is True
    assert len(memory_response["payload"]["results"]) >= 1
    assert memory_response["payload"]["results"][0]["path"].endswith("TRADING_MANUAL.md")

    assert backtest_response["ok"] is True
    assert backtest_response["payload"]["metrics"]["trades"] == 1
    assert backtest_event is not None
    assert backtest_event["event"] == "event.backtests.report"


def test_gateway_device_pair_and_notify_methods(tmp_path) -> None:
    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_device_pair_1",
                "method": "devices.pair",
                "params": {
                    "deviceId": "dev_iphone_1",
                    "platform": "ios",
                    "label": "iPhone 17",
                    "pushToken": "push_abc",
                },
            }
        )
        pair_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_devices_list_1",
                "method": "devices.list",
                "params": {},
            }
        )
        list_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_notify_test_1",
                "method": "devices.notifyTest",
                "params": {"deviceId": "dev_iphone_1", "message": "test ping"},
            }
        )
        notify_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_register_push_1",
                "method": "devices.registerPush",
                "params": {"deviceId": "dev_iphone_1", "pushToken": "push_new"},
            }
        )
        register_push_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_device_unpair_1",
                "method": "devices.unpair",
                "params": {"deviceId": "dev_iphone_1"},
            }
        )
        unpair_response = websocket.receive_json()

    assert pair_response["ok"] is True
    assert pair_response["payload"]["device"]["deviceId"] == "dev_iphone_1"
    assert list_response["ok"] is True
    assert len(list_response["payload"]["devices"]) == 1
    assert notify_response["ok"] is True
    assert notify_response["payload"]["status"] == "queued"
    assert register_push_response["ok"] is True
    assert register_push_response["payload"]["device"]["deviceId"] == "dev_iphone_1"
    assert unpair_response["ok"] is True
    assert unpair_response["payload"]["status"] == "removed"


def test_gateway_persists_device_and_queue_state_between_app_instances(tmp_path) -> None:
    first_client = TestClient(create_app(data_dir=tmp_path))

    with first_client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_device_pair_persist_1",
                "method": "devices.pair",
                "params": {
                    "deviceId": "dev_android_1",
                    "platform": "android",
                    "label": "Pixel",
                    "pushToken": "push_123",
                },
            }
        )
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_agent_run_persist_1",
                "method": "agent.run",
                "params": {
                    "agentId": "agent_persist_1",
                    "request": {
                        "request_id": "persist_req_1",
                        "kind": "hook_trigger",
                        "priority": "normal",
                        "payload": {"message": "first"},
                    },
                },
            }
        )
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_agent_run_persist_2",
                "method": "agent.run",
                "params": {
                    "agentId": "agent_persist_1",
                    "request": {
                        "request_id": "persist_req_2",
                        "kind": "hook_trigger",
                        "priority": "normal",
                        "payload": {"message": "second"},
                    },
                },
            }
        )
        _ = websocket.receive_json()

    second_client = TestClient(create_app(data_dir=tmp_path))

    with second_client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_devices_list_persist_1",
                "method": "devices.list",
                "params": {},
            }
        )
        devices_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_queue_status_persist_1",
                "method": "agent.queue.status",
                "params": {"agentId": "agent_persist_1"},
            }
        )
        queue_response = websocket.receive_json()

    assert devices_response["ok"] is True
    assert devices_response["payload"]["devices"][0]["deviceId"] == "dev_android_1"

    assert queue_response["ok"] is True
    assert queue_response["payload"]["activeRequestId"] == "persist_req_1"
    assert queue_response["payload"]["pendingCount"] == 1


def test_gateway_config_and_plugin_status_methods(tmp_path) -> None:
    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_config_get_1",
                "method": "config.get",
                "params": {},
            }
        )
        config_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_plugins_status_1",
                "method": "plugins.status",
                "params": {},
            }
        )
        plugins_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_config_schema_1",
                "method": "config.schema",
                "params": {},
            }
        )
        schema_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_config_patch_1",
                "method": "config.patch",
                "params": {
                    "patch": {
                        "gateway": {
                            "port": 19001,
                        }
                    }
                },
            }
        )
        patch_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_config_get_2",
                "method": "config.get",
                "params": {},
            }
        )
        config_response_after_patch = websocket.receive_json()

    assert config_response["ok"] is True
    assert "gateway" in config_response["payload"]
    assert "plugins" in config_response["payload"]

    assert plugins_response["ok"] is True
    assert "enabledPlugins" in plugins_response["payload"]

    assert schema_response["ok"] is True
    assert "properties" in schema_response["payload"]["schema"]

    assert patch_response["ok"] is True
    assert patch_response["payload"]["config"]["gateway"]["port"] == 19001

    assert config_response_after_patch["ok"] is True
    assert config_response_after_patch["payload"]["gateway"]["port"] == 19001


def test_gateway_trades_place_blocks_when_risk_rejects(tmp_path) -> None:
    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_trade_1",
                "method": "trades.place",
                "params": {
                    "intent": {
                        "account_id": "acct_demo_1",
                        "symbol": "ETHUSDm",
                        "action": "PLACE_MARKET_ORDER",
                        "side": "buy",
                        "volume": 0.5,
                        "stop_loss": None,
                        "take_profit": 2700.0,
                    },
                    "policy": {
                        "allowed_symbols": ["ETHUSDm"],
                        "max_volume": 0.2,
                        "max_concurrent_positions": 2,
                        "max_daily_loss": 100.0,
                        "require_stop_loss": True,
                    },
                    "snapshot": {
                        "open_positions": 0,
                        "daily_pnl": -20.0,
                    },
                },
            }
        )
        event, response = _read_event_then_response(websocket)

    assert event is not None
    assert event["type"] == "event"
    assert event["event"] == "event.risk.alert"
    assert response["ok"] is False
    assert response["error"]["code"] == "RISK_BLOCKED"


def test_gateway_trades_place_executes_with_connector(tmp_path) -> None:
    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_trade_2",
                "method": "trades.place",
                "params": {
                    "intent": {
                        "account_id": "acct_demo_1",
                        "symbol": "ETHUSDm",
                        "action": "PLACE_MARKET_ORDER",
                        "side": "buy",
                        "volume": 0.1,
                        "stop_loss": 2400.0,
                        "take_profit": 2700.0,
                    },
                    "policy": {
                        "allowed_symbols": ["ETHUSDm"],
                        "max_volume": 0.2,
                        "max_concurrent_positions": 2,
                        "max_daily_loss": 100.0,
                        "require_stop_loss": True,
                    },
                    "snapshot": {
                        "open_positions": 0,
                        "daily_pnl": -20.0,
                    },
                },
            }
        )
        event, response = _read_event_then_response(websocket)

    assert event is not None
    assert event["type"] == "event"
    assert event["event"] == "event.trade.executed"
    assert response["ok"] is True
    assert response["payload"]["execution"]["status"] == "executed"


def test_gateway_trade_lifecycle_methods(tmp_path) -> None:
    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_trade_modify_1",
                "method": "trades.modify",
                "params": {
                    "accountId": "acct_demo_1",
                    "orderId": "order_1",
                    "openPrice": 2500.0,
                    "stopLoss": 2450.0,
                    "takeProfit": 2600.0,
                },
            }
        )
        modify_event, modify_response = _read_event_then_response(websocket)

        websocket.send_json(
            {
                "type": "req",
                "id": "req_trade_cancel_1",
                "method": "trades.cancel",
                "params": {"accountId": "acct_demo_1", "orderId": "order_1"},
            }
        )
        cancel_event, cancel_response = _read_event_then_response(websocket)

        websocket.send_json(
            {
                "type": "req",
                "id": "req_trade_close_1",
                "method": "trades.closePosition",
                "params": {"accountId": "acct_demo_1", "positionId": "pos_1"},
            }
        )
        close_event, close_response = _read_event_then_response(websocket)

    assert modify_event is not None
    assert modify_event["event"] == "event.trade.modified"
    assert modify_response["ok"] is True
    assert modify_response["payload"]["execution"]["status"] == "modified"

    assert cancel_event is not None
    assert cancel_event["event"] == "event.trade.canceled"
    assert cancel_response["ok"] is True
    assert cancel_response["payload"]["execution"]["status"] == "canceled"

    assert close_event is not None
    assert close_event["event"] == "event.trade.closed"
    assert close_response["ok"] is True
    assert close_response["payload"]["execution"]["status"] == "closed"


def test_gateway_accounts_namespace_methods(tmp_path) -> None:
    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_accounts_connect_1",
                "method": "accounts.connect",
                "params": {
                    "accountId": "acct_demo_1",
                    "connectorId": "metaapi_mcp",
                    "providerAccountId": "provider_1",
                    "mode": "demo",
                    "label": "Demo MT5",
                    "allowedSymbols": ["ETHUSDm", "BTCUSDm"],
                },
            }
        )
        connect_event, connect_response = _read_event_then_response(websocket)

        websocket.send_json(
            {
                "type": "req",
                "id": "req_accounts_list_1",
                "method": "accounts.list",
                "params": {},
            }
        )
        list_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_accounts_status_1",
                "method": "accounts.status",
                "params": {"accountId": "acct_demo_1"},
            }
        )
        status_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_accounts_disconnect_1",
                "method": "accounts.disconnect",
                "params": {"accountId": "acct_demo_1"},
            }
        )
        disconnect_event, disconnect_response = _read_event_then_response(websocket)

        websocket.send_json(
            {
                "type": "req",
                "id": "req_accounts_get_1",
                "method": "accounts.get",
                "params": {"accountId": "acct_demo_1"},
            }
        )
        get_response = websocket.receive_json()

    assert connect_event is not None
    assert connect_event["event"] == "event.account.status"
    assert connect_response["ok"] is True
    assert connect_response["payload"]["account"]["status"] == "connected"

    assert list_response["ok"] is True
    assert list_response["payload"]["accounts"][0]["accountId"] == "acct_demo_1"

    assert status_response["ok"] is True
    assert status_response["payload"]["account"]["status"] == "connected"

    assert disconnect_event is not None
    assert disconnect_event["event"] == "event.account.status"
    assert disconnect_response["ok"] is True
    assert disconnect_response["payload"]["account"]["status"] == "disconnected"

    assert get_response["ok"] is True
    assert get_response["payload"]["account"]["status"] == "disconnected"


def test_gateway_feeds_namespace_methods(tmp_path) -> None:
    client = TestClient(create_app(data_dir=tmp_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_feeds_list_1",
                "method": "feeds.list",
                "params": {},
            }
        )
        list_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_feeds_sub_1",
                "method": "feeds.subscribe",
                "params": {
                    "topics": ["market.candle.closed"],
                    "symbols": ["ETHUSDm"],
                    "timeframes": ["5m"],
                },
            }
        )
        subscribe_event, subscribe_response = _read_event_then_response(websocket)

        subscription_id = subscribe_response["payload"]["subscription"]["subscriptionId"]

        websocket.send_json(
            {
                "type": "req",
                "id": "req_feeds_candles_1",
                "method": "feeds.getCandles",
                "params": {"symbol": "ETHUSDm", "timeframe": "5m", "limit": 3},
            }
        )
        candles_response = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_feeds_unsub_1",
                "method": "feeds.unsubscribe",
                "params": {"subscriptionId": subscription_id},
            }
        )
        unsubscribe_event, unsubscribe_response = _read_event_then_response(websocket)

    assert list_response["ok"] is True
    assert len(list_response["payload"]["feeds"]) >= 1

    assert subscribe_response["ok"] is True
    assert subscribe_response["payload"]["subscription"]["topics"] == ["market.candle.closed"]
    assert subscribe_event is not None
    assert subscribe_event["event"] == "event.feed.event"
    assert subscribe_event["payload"]["action"] == "subscribed"

    assert candles_response["ok"] is True
    assert len(candles_response["payload"]["candles"]) == 3
    assert candles_response["payload"]["candles"][0]["symbol"] == "ETHUSDm"

    assert unsubscribe_response["ok"] is True
    assert unsubscribe_response["payload"]["status"] == "removed"
    assert unsubscribe_event is not None
    assert unsubscribe_event["event"] == "event.feed.event"
    assert unsubscribe_event["payload"]["action"] == "unsubscribed"


def test_gateway_bootstraps_accounts_from_config(tmp_path) -> None:
    config_path = tmp_path / "config.json5"
    config_path.write_text(
        """
        {
          gateway: {
            host: "0.0.0.0",
            port: 18789,
            auth: {
              mode: "token",
              token: "dev-token",
            },
          },
          accounts: [
            {
              accountId: "acct_bootstrap_1",
              connectorId: "metaapi_mcp",
              providerAccountId: "provider_bootstrap_1",
              mode: "demo",
              label: "Bootstrap account",
              allowedSymbols: ["ETHUSDm"],
            },
          ],
        }
        """,
        encoding="utf-8",
    )
    client = TestClient(create_app(data_dir=tmp_path, config_path=config_path))

    with client.websocket_connect("/ws") as websocket:
        websocket.send_json(_connect_payload())
        _ = websocket.receive_json()

        websocket.send_json(
            {
                "type": "req",
                "id": "req_accounts_list_bootstrap_1",
                "method": "accounts.list",
                "params": {},
            }
        )
        response = websocket.receive_json()

    assert response["ok"] is True
    assert response["payload"]["accounts"][0]["accountId"] == "acct_bootstrap_1"
