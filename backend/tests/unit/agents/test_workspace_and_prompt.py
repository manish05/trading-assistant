from pathlib import Path

from app.agents.prompt_builder import PromptContext, build_system_prompt
from app.agents.workspace import bootstrap_agent_workspace


def test_bootstrap_agent_workspace_creates_expected_structure(tmp_path: Path) -> None:
    workspace_path = bootstrap_agent_workspace(
        base_dir=tmp_path,
        agent_id="agent_eth_5m",
        soul_template="# SOUL\nI speak in concise blocks.",
        manual_template="# TRADING MANUAL\nAlways require SL.",
    )

    expected_paths = [
        workspace_path / "SOUL.md",
        workspace_path / "TRADING_MANUAL.md",
        workspace_path / "hooks",
        workspace_path / "journal" / "daily",
        workspace_path / "journal" / "trade_logs",
        workspace_path / "memory" / "notes",
        workspace_path / "state" / "agent_state.json",
    ]

    for path in expected_paths:
        assert path.exists()


def test_build_system_prompt_includes_soul_manual_tools_and_citations() -> None:
    prompt = build_system_prompt(
        PromptContext(
            agent_id="agent_eth_5m",
            enabled_tools=["risk.preview", "agent.run", "memory.search"],
            soul_text="I am calm and concise.",
            manual_text="Never trade without stop loss.",
            trigger_summary="Triggered by two consecutive green candles.",
            memory_citations=[
                "agents/agent_eth_5m/TRADING_MANUAL.md#L3-L8",
                "agents/agent_eth_5m/journal/learnings.md#L10-L18",
            ],
        )
    )

    assert "Agent: agent_eth_5m" in prompt
    assert "Enabled tools" in prompt
    assert "- risk.preview" in prompt
    assert "## SOUL" in prompt
    assert "I am calm and concise." in prompt
    assert "## TRADING_MANUAL" in prompt
    assert "Never trade without stop loss." in prompt
    assert "Triggered by two consecutive green candles." in prompt
    assert "Memory citations" in prompt
