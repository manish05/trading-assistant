from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path

from app.agents.workspace import bootstrap_agent_workspace


@dataclass(slots=True)
class TradingAgent:
    agent_id: str
    label: str
    status: str
    workspace_path: str
    created_at: str
    updated_at: str


class AgentRegistry:
    def __init__(
        self,
        *,
        state_path: str | Path | None = None,
        workspace_base_dir: str | Path = "agents",
    ) -> None:
        self._agents: dict[str, TradingAgent] = {}
        self._state_path = Path(state_path) if state_path is not None else None
        self._workspace_base_dir = Path(workspace_base_dir)
        self._workspace_base_dir.mkdir(parents=True, exist_ok=True)
        if self._state_path is not None:
            self._state_path.parent.mkdir(parents=True, exist_ok=True)
            self._load()

    def create(
        self,
        *,
        agent_id: str,
        label: str,
        soul_template: str,
        manual_template: str,
    ) -> TradingAgent:
        workspace_path = bootstrap_agent_workspace(
            base_dir=self._workspace_base_dir,
            agent_id=agent_id,
            soul_template=soul_template,
            manual_template=manual_template,
        )
        now = datetime.now(UTC).isoformat()
        existing = self._agents.get(agent_id)
        if existing is None:
            agent = TradingAgent(
                agent_id=agent_id,
                label=label,
                status="ready",
                workspace_path=str(workspace_path),
                created_at=now,
                updated_at=now,
            )
        else:
            existing.label = label
            existing.status = "ready"
            existing.workspace_path = str(workspace_path)
            existing.updated_at = now
            agent = existing
        self._agents[agent_id] = agent
        self._save()
        return agent

    def get(self, *, agent_id: str) -> TradingAgent | None:
        return self._agents.get(agent_id)

    def list(self) -> list[TradingAgent]:
        return list(self._agents.values())

    @staticmethod
    def as_public_payload(agent: TradingAgent) -> dict:
        payload = asdict(agent)
        return {
            "agentId": payload["agent_id"],
            "label": payload["label"],
            "status": payload["status"],
            "workspacePath": payload["workspace_path"],
            "createdAt": payload["created_at"],
            "updatedAt": payload["updated_at"],
        }

    def _load(self) -> None:
        if self._state_path is None or not self._state_path.exists():
            return

        try:
            payload = json.loads(self._state_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return

        agents_payload = payload.get("agents")
        if not isinstance(agents_payload, list):
            return

        for raw_agent in agents_payload:
            if not isinstance(raw_agent, dict):
                continue
            try:
                agent = TradingAgent(
                    agent_id=str(raw_agent["agentId"]),
                    label=str(raw_agent["label"]),
                    status=str(raw_agent["status"]),
                    workspace_path=str(raw_agent["workspacePath"]),
                    created_at=str(raw_agent["createdAt"]),
                    updated_at=str(raw_agent["updatedAt"]),
                )
            except KeyError:
                continue
            self._agents[agent.agent_id] = agent

    def _save(self) -> None:
        if self._state_path is None:
            return

        payload = {
            "version": 1,
            "agents": [self.as_public_payload(agent) for agent in self._agents.values()],
        }
        self._state_path.write_text(
            json.dumps(payload, separators=(",", ":")),
            encoding="utf-8",
        )
