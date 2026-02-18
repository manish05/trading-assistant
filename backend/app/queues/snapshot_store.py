import json
from pathlib import Path

from pydantic import ValidationError

from app.queues.agent_queue import AgentQueue


class QueueSnapshotStore:
    def __init__(self, *, state_path: str | Path):
        self._state_path = Path(state_path)
        self._state_path.parent.mkdir(parents=True, exist_ok=True)

    def load(self) -> dict[str, AgentQueue]:
        if not self._state_path.exists():
            return {}

        try:
            payload = json.loads(self._state_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}

        queue_payloads = payload.get("queues")
        if not isinstance(queue_payloads, dict):
            return {}

        queues: dict[str, AgentQueue] = {}
        for agent_id, queue_payload in queue_payloads.items():
            if not isinstance(agent_id, str) or not isinstance(queue_payload, dict):
                continue
            try:
                queues[agent_id] = AgentQueue.from_snapshot(queue_payload)
            except ValidationError:
                continue
        return queues

    def save(self, queues: dict[str, AgentQueue]) -> None:
        payload = {
            "version": 1,
            "queues": {
                agent_id: queue.snapshot()
                for agent_id, queue in sorted(queues.items(), key=lambda item: item[0])
            },
        }
        self._state_path.write_text(
            json.dumps(payload, separators=(",", ":")),
            encoding="utf-8",
        )
