from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True)
class MemorySearchResult:
    path: str
    start_line: int
    end_line: int
    snippet: str
    score: float
    source: str = "fts"


class MemoryIndex:
    def __init__(self, *, db_path: str | Path):
        self._db_path = Path(db_path)
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(self._db_path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._initialize_schema()

    def _initialize_schema(self) -> None:
        self._conn.execute(
            """
            CREATE TABLE IF NOT EXISTS chunks (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              path TEXT NOT NULL,
              start_line INTEGER NOT NULL,
              end_line INTEGER NOT NULL,
              snippet TEXT NOT NULL
            )
            """
        )
        self._conn.execute(
            """
            CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts
            USING fts5(snippet, content='chunks', content_rowid='id')
            """
        )
        self._conn.commit()

    def index_workspace(self, workspace_dir: str | Path) -> None:
        workspace = Path(workspace_dir)
        markdown_files = sorted(path for path in workspace.rglob("*.md") if path.is_file())

        for markdown_file in markdown_files:
            self._reindex_file(markdown_file)

        self._conn.commit()

    def _reindex_file(self, file_path: Path) -> None:
        self._delete_chunks_for_path(str(file_path))

        lines = file_path.read_text(encoding="utf-8").splitlines()
        if not lines:
            return

        chunk_size = 12
        for start in range(0, len(lines), chunk_size):
            end = min(start + chunk_size, len(lines))
            snippet = "\n".join(lines[start:end]).strip()
            if not snippet:
                continue
            cursor = self._conn.execute(
                """
                INSERT INTO chunks(path, start_line, end_line, snippet)
                VALUES(?, ?, ?, ?)
                """,
                (str(file_path), start + 1, end, snippet),
            )
            row_id = cursor.lastrowid
            self._conn.execute(
                "INSERT INTO chunks_fts(rowid, snippet) VALUES(?, ?)",
                (row_id, snippet),
            )

    def _delete_chunks_for_path(self, path: str) -> None:
        rows = self._conn.execute("SELECT id FROM chunks WHERE path = ?", (path,)).fetchall()
        for row in rows:
            self._conn.execute("DELETE FROM chunks_fts WHERE rowid = ?", (row["id"],))
        self._conn.execute("DELETE FROM chunks WHERE path = ?", (path,))

    def search(self, query: str, *, max_results: int = 10) -> list[MemorySearchResult]:
        normalized = self._normalize_query(query)
        if not normalized:
            return []

        rows = self._conn.execute(
            """
            SELECT c.path, c.start_line, c.end_line, c.snippet, bm25(chunks_fts) AS rank
            FROM chunks_fts
            JOIN chunks c ON chunks_fts.rowid = c.id
            WHERE chunks_fts MATCH ?
            ORDER BY rank
            LIMIT ?
            """,
            (normalized, max_results),
        ).fetchall()

        results: list[MemorySearchResult] = []
        for row in rows:
            rank = float(row["rank"])
            score = 1 / (1 + abs(rank))
            results.append(
                MemorySearchResult(
                    path=row["path"],
                    start_line=int(row["start_line"]),
                    end_line=int(row["end_line"]),
                    snippet=row["snippet"],
                    score=score,
                )
            )
        return results

    @staticmethod
    def _normalize_query(query: str) -> str:
        tokens = [token.strip().replace('"', "") for token in query.split() if token.strip()]
        if not tokens:
            return ""
        return " AND ".join(f'"{token}"' for token in tokens)
