from datetime import UTC, datetime
from typing import Literal

RiskEmergencyAction = Literal["pause_trading", "cancel_all", "close_all", "disable_live"]


class RiskControlState:
    def __init__(self) -> None:
        self._emergency_stop_active = False
        self._last_action: RiskEmergencyAction | None = None
        self._last_reason: str | None = None
        self._updated_at: str | None = None
        self._action_counts: dict[RiskEmergencyAction, int] = {
            "pause_trading": 0,
            "cancel_all": 0,
            "close_all": 0,
            "disable_live": 0,
        }

    def status_payload(self) -> dict:
        return {
            "emergencyStopActive": self._emergency_stop_active,
            "lastAction": self._last_action,
            "lastReason": self._last_reason,
            "updatedAt": self._updated_at,
            "actionCounts": dict(self._action_counts),
        }

    def activate_emergency_stop(
        self,
        *,
        action: RiskEmergencyAction,
        reason: str | None,
    ) -> dict:
        self._emergency_stop_active = True
        self._last_action = action
        self._last_reason = reason
        self._updated_at = datetime.now(UTC).isoformat()
        self._action_counts[action] += 1
        return self.status_payload()

    def resume(self, *, reason: str | None) -> dict:
        self._emergency_stop_active = False
        if reason is not None:
            self._last_reason = reason
        self._updated_at = datetime.now(UTC).isoformat()
        return self.status_payload()
