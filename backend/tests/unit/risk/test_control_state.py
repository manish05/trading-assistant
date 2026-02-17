from app.risk.control import RiskControlState


def test_risk_control_state_defaults_to_inactive() -> None:
    state = RiskControlState()

    payload = state.status_payload()

    assert payload["emergencyStopActive"] is False
    assert payload["lastAction"] is None
    assert payload["lastReason"] is None
    assert payload["updatedAt"] is None
    assert payload["actionCounts"]["pause_trading"] == 0
    assert payload["actionCounts"]["cancel_all"] == 0
    assert payload["actionCounts"]["close_all"] == 0
    assert payload["actionCounts"]["disable_live"] == 0


def test_risk_control_state_tracks_emergency_stop_updates() -> None:
    state = RiskControlState()

    payload = state.activate_emergency_stop(
        action="pause_trading",
        reason="manual kill-switch",
    )

    assert payload["emergencyStopActive"] is True
    assert payload["lastAction"] == "pause_trading"
    assert payload["lastReason"] == "manual kill-switch"
    assert payload["updatedAt"] is not None
    assert payload["actionCounts"]["pause_trading"] == 1
