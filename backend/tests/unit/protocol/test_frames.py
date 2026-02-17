import pytest
from pydantic import ValidationError

from app.protocol.frames import (
    EventFrame,
    RequestFrame,
    ResponseFrame,
    parse_gateway_frame,
)


def test_parse_gateway_frame_returns_request_frame() -> None:
    payload = {
        "type": "req",
        "id": "req_1",
        "method": "gateway.ping",
        "params": {"echo": "ok"},
    }

    frame = parse_gateway_frame(payload)

    assert isinstance(frame, RequestFrame)
    assert frame.method == "gateway.ping"
    assert frame.id == "req_1"


def test_parse_gateway_frame_returns_response_frame() -> None:
    payload = {
        "type": "res",
        "id": "req_1",
        "ok": True,
        "payload": {"now": "2026-02-17T00:00:00Z"},
    }

    frame = parse_gateway_frame(payload)

    assert isinstance(frame, ResponseFrame)
    assert frame.ok is True
    assert frame.payload == {"now": "2026-02-17T00:00:00Z"}


def test_parse_gateway_frame_returns_event_frame() -> None:
    payload = {
        "type": "event",
        "event": "event.gateway.status",
        "payload": {"uptimeSec": 10},
    }

    frame = parse_gateway_frame(payload)

    assert isinstance(frame, EventFrame)
    assert frame.event == "event.gateway.status"


def test_parse_gateway_frame_rejects_invalid_frame() -> None:
    payload = {
        "type": "req",
        "id": "",
        "method": "",
        "params": [],
    }

    with pytest.raises(ValidationError):
        parse_gateway_frame(payload)
