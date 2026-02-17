from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import UTC, datetime


@dataclass(slots=True)
class PairedDevice:
    device_id: str
    platform: str
    label: str
    push_token: str
    paired_at: str
    last_seen_at: str


class DeviceRegistry:
    def __init__(self) -> None:
        self._devices: dict[str, PairedDevice] = {}

    def pair(self, *, device_id: str, platform: str, label: str, push_token: str) -> PairedDevice:
        now = datetime.now(UTC).isoformat()
        current = self._devices.get(device_id)
        if current is None:
            current = PairedDevice(
                device_id=device_id,
                platform=platform,
                label=label,
                push_token=push_token,
                paired_at=now,
                last_seen_at=now,
            )
        else:
            current.platform = platform
            current.label = label
            current.push_token = push_token
            current.last_seen_at = now
        self._devices[device_id] = current
        return current

    def list(self) -> list[PairedDevice]:
        return list(self._devices.values())

    def notify_test(self, *, device_id: str, message: str) -> dict:
        device = self._devices.get(device_id)
        if device is None:
            return {"status": "missing_device", "deviceId": device_id}
        device.last_seen_at = datetime.now(UTC).isoformat()
        return {"status": "queued", "deviceId": device_id, "message": message}

    @staticmethod
    def as_public_payload(device: PairedDevice) -> dict:
        payload = asdict(device)
        return {
            "deviceId": payload["device_id"],
            "platform": payload["platform"],
            "label": payload["label"],
            "pairedAt": payload["paired_at"],
            "lastSeenAt": payload["last_seen_at"],
        }
