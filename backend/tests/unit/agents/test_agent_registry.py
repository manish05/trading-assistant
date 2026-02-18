from app.agents.registry import AgentRegistry


def test_agent_registry_creates_and_gets_agent(tmp_path) -> None:
    registry = AgentRegistry(
        state_path=tmp_path / "state" / "agents.json",
        workspace_base_dir=tmp_path / "agents",
    )

    agent = registry.create(
        agent_id="agent_eth_5m",
        label="ETH Scalper",
        soul_template="# SOUL\nStay concise.",
        manual_template="# TRADING MANUAL\nAlways use SL.",
    )
    fetched = registry.get(agent_id="agent_eth_5m")

    assert fetched is not None
    assert fetched.agent_id == agent.agent_id
    assert fetched.label == "ETH Scalper"
    assert fetched.status == "ready"
    assert (tmp_path / "agents" / "agent_eth_5m" / "SOUL.md").exists()


def test_agent_registry_persists_profiles(tmp_path) -> None:
    state_path = tmp_path / "state" / "agents.json"
    workspace_base_dir = tmp_path / "agents"

    first = AgentRegistry(state_path=state_path, workspace_base_dir=workspace_base_dir)
    _ = first.create(
        agent_id="agent_btc_1h",
        label="BTC Trend",
        soul_template="# SOUL\nTrend rider.",
        manual_template="# TRADING MANUAL\nNo revenge trades.",
    )

    second = AgentRegistry(state_path=state_path, workspace_base_dir=workspace_base_dir)
    agent = second.get(agent_id="agent_btc_1h")

    assert agent is not None
    assert agent.label == "BTC Trend"
    assert agent.workspace_path.endswith("/agent_btc_1h")
