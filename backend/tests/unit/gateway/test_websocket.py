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


def test_websocket_rejects_non_connect_first_request() -> None:
    client = TestClient(create_app())

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


def test_websocket_connect_then_ping_returns_payload() -> None:
    client = TestClient(create_app())

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


def test_websocket_status_returns_runtime_snapshot() -> None:
    client = TestClient(create_app())

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


def test_websocket_risk_preview_returns_decision() -> None:
    client = TestClient(create_app())

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
        response = websocket.receive_json()

    assert response["ok"] is True
    assert response["payload"]["allowed"] is False
    assert len(response["payload"]["violations"]) == 2


def test_websocket_agent_run_updates_queue_status() -> None:
    client = TestClient(create_app())

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
