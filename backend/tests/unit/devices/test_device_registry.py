from app.devices.registry import DeviceRegistry


def test_device_registry_persists_paired_devices_between_instances(tmp_path) -> None:
    state_path = tmp_path / "state" / "devices.json"
    first = DeviceRegistry(state_path=state_path)
    _ = first.pair(
        device_id="dev_1",
        platform="ios",
        label="iPhone",
        push_token="push_a",
    )

    second = DeviceRegistry(state_path=state_path)
    devices = second.list()

    assert len(devices) == 1
    assert devices[0].device_id == "dev_1"
    assert devices[0].push_token == "push_a"


def test_device_registry_handles_invalid_state_payload(tmp_path) -> None:
    state_path = tmp_path / "state" / "devices.json"
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text("{not json", encoding="utf-8")

    registry = DeviceRegistry(state_path=state_path)

    assert registry.list() == []


def test_device_registry_register_push_and_unpair(tmp_path) -> None:
    registry = DeviceRegistry(state_path=tmp_path / "state" / "devices.json")
    _ = registry.pair(
        device_id="dev_1",
        platform="ios",
        label="iPhone",
        push_token="push_a",
    )

    updated = registry.register_push(device_id="dev_1", push_token="push_b")
    removed = registry.unpair(device_id="dev_1")

    assert updated is not None
    assert updated.push_token == "push_b"
    assert removed is True
    assert registry.list() == []
