from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path


@dataclass(slots=True)
class PairedDevice:
    device_id: str
    platform: str
    label: str
    push_token: str
    paired_at: str
    last_seen_at: str


class DeviceRegistry:
    def __init__(self, *, state_path: str | Path | None = None) -> None:
        self._devices: dict[str, PairedDevice] = {}
        self._state_path = Path(state_path) if state_path is not None else None
        if self._state_path is not None:
            self._state_path.parent.mkdir(parents=True, exist_ok=True)
            self._load()

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
        self._save()
        return current

    def list(self) -> list[PairedDevice]:
        return list(self._devices.values())

    def unpair(self, *, device_id: str) -> bool:
        removed = self._devices.pop(device_id, None) is not None
        if removed:
            self._save()
        return removed

    def register_push(self, *, device_id: str, push_token: str) -> PairedDevice | None:
        device = self._devices.get(device_id)
        if device is None:
            return None
        device.push_token = push_token
        device.last_seen_at = datetime.now(UTC).isoformat()
        self._save()
        return device

    def notify_test(self, *, device_id: str, message: str) -> dict:
        device = self._devices.get(device_id)
        if device is None:
            return {"status": "missing_device", "deviceId": device_id}
        device.last_seen_at = datetime.now(UTC).isoformat()
        self._save()
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

    def _load(self) -> None:
        if self._state_path is None or not self._state_path.exists():
            return
        try:
            payload = json.loads(self._state_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return

        devices_payload = payload.get("devices")
        if not isinstance(devices_payload, list):
            return

        for raw_device in devices_payload:
            if not isinstance(raw_device, dict):
                continue
            try:
                device = PairedDevice(
                    device_id=str(raw_device["deviceId"]),
                    platform=str(raw_device["platform"]),
                    label=str(raw_device["label"]),
                    push_token=str(raw_device["pushToken"]),
                    paired_at=str(raw_device["pairedAt"]),
                    last_seen_at=str(raw_device["lastSeenAt"]),
                )
            except KeyError:
                continue
            self._devices[device.device_id] = device

    def _save(self) -> None:
        if self._state_path is None:
            return
        payload = {
            "version": 1,
            "devices": [
                {
                    "deviceId": device.device_id,
                    "platform": device.platform,
                    "label": device.label,
                    "pushToken": device.push_token,
                    "pairedAt": device.paired_at,
                    "lastSeenAt": device.last_seen_at,
                }
                for device in self._devices.values()
            ],
        }
        self._state_path.write_text(
            json.dumps(payload, separators=(",", ":")),
            encoding="utf-8",
        )
