from pathlib import Path

from app.memory.index import MemoryIndex


def test_memory_index_searches_workspace_markdown_with_citations(tmp_path: Path) -> None:
    workspace = tmp_path / "agent_eth_5m"
    (workspace / "journal").mkdir(parents=True)
    (workspace / "memory").mkdir(parents=True)
    (workspace / "SOUL.md").write_text("# SOUL\nI am concise.\n", encoding="utf-8")
    (workspace / "TRADING_MANUAL.md").write_text(
        "# Manual\nNever trade without stop loss.\n",
        encoding="utf-8",
    )
    (workspace / "journal" / "learnings.md").write_text(
        "# Learnings\nTwo green candles before long setups.\n",
        encoding="utf-8",
    )

    index = MemoryIndex(db_path=tmp_path / "memory.db")
    index.index_workspace(workspace)
    results = index.search("stop loss", max_results=5)

    assert len(results) >= 1
    assert results[0].path.endswith("TRADING_MANUAL.md")
    assert "stop loss" in results[0].snippet.lower()
    assert results[0].start_line >= 1


def test_memory_index_reindex_replaces_old_chunks(tmp_path: Path) -> None:
    workspace = tmp_path / "agent_eth_5m"
    workspace.mkdir(parents=True)
    manual_path = workspace / "TRADING_MANUAL.md"
    manual_path.write_text("Rule A", encoding="utf-8")

    index = MemoryIndex(db_path=tmp_path / "memory.db")
    index.index_workspace(workspace)
    old_results = index.search("Rule A", max_results=5)

    manual_path.write_text("Rule B", encoding="utf-8")
    index.index_workspace(workspace)
    new_results = index.search("Rule B", max_results=5)

    assert len(old_results) == 1
    assert len(new_results) == 1
    assert "Rule B" in new_results[0].snippet
