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
