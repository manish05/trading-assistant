from __future__ import annotations

import json
from pathlib import Path


def bootstrap_agent_workspace(
    *,
    base_dir: str | Path,
    agent_id: str,
    soul_template: str,
    manual_template: str,
) -> Path:
    workspace_path = Path(base_dir) / agent_id

    directories = [
        workspace_path,
        workspace_path / "hooks",
        workspace_path / "strategies",
        workspace_path / "journal" / "daily",
        workspace_path / "journal" / "trade_logs",
        workspace_path / "memory" / "notes",
        workspace_path / "artifacts" / "backtests",
        workspace_path / "artifacts" / "reports",
        workspace_path / "state",
    ]

    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)

    _write_if_missing(workspace_path / "SOUL.md", soul_template.strip() + "\n")
    _write_if_missing(workspace_path / "TRADING_MANUAL.md", manual_template.strip() + "\n")
    _write_if_missing(workspace_path / "memory" / "MEMORY.md", "# MEMORY\n")
    _write_if_missing(workspace_path / "journal" / "learnings.md", "# Learnings\n")

    state_file = workspace_path / "state" / "agent_state.json"
    if not state_file.exists():
        state_file.write_text(
            json.dumps(
                {
                    "agentId": agent_id,
                    "status": "idle",
                    "lastRunId": None,
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )

    return workspace_path


def _write_if_missing(path: Path, content: str) -> None:
    if path.exists():
        return
    path.write_text(content, encoding="utf-8")
