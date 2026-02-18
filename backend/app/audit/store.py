from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4


@dataclass(slots=True)
class AuditEntry:
    audit_id: str
    ts: str
    actor: str
    action: str
    trace_id: str
    data: dict


class AuditStore:
    def __init__(self, *, data_dir: str | Path):
        self._data_dir = Path(data_dir)
        self._data_dir.mkdir(parents=True, exist_ok=True)
        self._audit_path = self._data_dir / "audit.jsonl"

    @property
    def audit_path(self) -> Path:
        return self._audit_path

    def append(self, *, actor: str, action: str, trace_id: str, data: dict) -> AuditEntry:
        entry = AuditEntry(
            audit_id=f"audit_{uuid4().hex[:12]}",
            ts=datetime.now(UTC).isoformat(),
            actor=actor,
            action=action,
            trace_id=trace_id,
            data=data,
        )

        with self._audit_path.open("a", encoding="utf-8") as file:
            file.write(json.dumps(asdict(entry), separators=(",", ":")) + "\n")

        return entry

    def read_all(self) -> list[dict]:
        if not self._audit_path.exists():
            return []

        entries: list[dict] = []
        with self._audit_path.open("r", encoding="utf-8") as file:
            for line in file:
                clean_line = line.strip()
                if not clean_line:
                    continue
                entries.append(json.loads(clean_line))
        return entries
