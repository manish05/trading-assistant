import json

from app.queues.agent_queue import AgentQueue, AgentRequest, QueueSettings
from app.queues.snapshot_store import QueueSnapshotStore


def test_queue_snapshot_store_round_trips_active_and_pending_requests(tmp_path) -> None:
    store = QueueSnapshotStore(state_path=tmp_path / "state" / "agent_queues.json")
    queue = AgentQueue(QueueSettings(mode="followup", cap=5, drop_policy="old"))
    _ = queue.enqueue(
        AgentRequest(
            request_id="req_active_1",
            agent_id="agent_1",
            kind="hook_trigger",
            priority="normal",
            payload={"a": 1},
        ),
        now_ms=1_000,
    )
    _ = queue.enqueue(
        AgentRequest(
            request_id="req_pending_1",
            agent_id="agent_1",
            kind="hook_trigger",
            priority="normal",
            payload={"b": 2},
        ),
        now_ms=1_010,
    )

    store.save({"agent_1": queue})
    loaded = store.load()

    assert "agent_1" in loaded
    loaded_queue = loaded["agent_1"]
    assert loaded_queue.active_request is not None
    assert loaded_queue.active_request.request_id == "req_active_1"
    assert [item.request_id for item in loaded_queue.pending] == ["req_pending_1"]


def test_queue_snapshot_store_returns_empty_for_invalid_json(tmp_path) -> None:
    state_path = tmp_path / "state" / "agent_queues.json"
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text("{bad json", encoding="utf-8")
    store = QueueSnapshotStore(state_path=state_path)

    loaded = store.load()

    assert loaded == {}


def test_queue_snapshot_store_skips_invalid_queue_entries(tmp_path) -> None:
    state_path = tmp_path / "state" / "agent_queues.json"
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text(
        json.dumps(
            {
                "version": 1,
                "queues": {
                    "agent_bad": {"settings": {"mode": "invalid"}},
                    "agent_good": {
                        "settings": {"mode": "followup", "cap": 10, "drop_policy": "old"},
                        "activeRequest": None,
                        "pending": [],
                        "collectBuffer": [],
                        "collectLastEnqueueMs": None,
                    },
                },
            }
        ),
        encoding="utf-8",
    )
    store = QueueSnapshotStore(state_path=state_path)

    loaded = store.load()

    assert list(loaded.keys()) == ["agent_good"]
