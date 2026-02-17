import textwrap

from app.feeds.pipeline import FeedHookPipeline
from app.feeds.types import FeedEvent, HookRegistration
from app.hooks.runtime import HookRuntime


def test_pipeline_emits_wake_requests_for_matching_topic(tmp_path) -> None:
    hook_file = tmp_path / "wake_hook.py"
    hook_file.write_text(
        textwrap.dedent(
            """
            def evaluate(event, state):
                return {"decision": "WAKE", "reason": "signal", "dedupeKey": "k1"}
            """
        ).strip()
    )

    pipeline = FeedHookPipeline(hook_runtime=HookRuntime())
    pipeline.register_hook(
        HookRegistration(
            hook_id="hook_1",
            agent_id="agent_eth_5m",
            hook_type="wake",
            hook_path=str(hook_file),
            topics=["market.candle.closed"],
        )
    )

    output = pipeline.process_event(
        FeedEvent(
            event_id="evt_1",
            topic="market.candle.closed",
            ts="2026-02-17T00:00:00Z",
            source="metaapi",
            payload={"symbol": "ETHUSDm"},
            symbol="ETHUSDm",
        )
    )

    assert len(output.wake_requests) == 1
    assert output.wake_requests[0].agent_id == "agent_eth_5m"
    assert output.wake_requests[0].dedupe_key == "k1"


def test_pipeline_ignores_non_matching_topics(tmp_path) -> None:
    hook_file = tmp_path / "wake_hook.py"
    hook_file.write_text("def evaluate(event, state): return {'decision': 'WAKE'}")

    pipeline = FeedHookPipeline(hook_runtime=HookRuntime())
    pipeline.register_hook(
        HookRegistration(
            hook_id="hook_1",
            agent_id="agent_eth_5m",
            hook_type="wake",
            hook_path=str(hook_file),
            topics=["market.candle.closed"],
        )
    )

    output = pipeline.process_event(
        FeedEvent(
            event_id="evt_2",
            topic="social.tweet",
            ts="2026-02-17T00:00:00Z",
            source="x",
            payload={"text": "hello"},
        )
    )

    assert output.wake_requests == []
    assert output.trade_intents == []


def test_pipeline_emits_trade_intent_from_autotrade_hook(tmp_path) -> None:
    hook_file = tmp_path / "autotrade_hook.py"
    hook_file.write_text(
        textwrap.dedent(
            """
            def evaluate(event, state):
                return {
                    "decision": "TRADE_INTENT",
                    "reason": "pattern",
                    "intent": {
                        "account_id": "acct_demo_1",
                        "symbol": "ETHUSDm",
                        "action": "PLACE_MARKET_ORDER",
                        "side": "buy",
                        "volume": 0.1,
                        "stop_loss": 2400.0,
                        "take_profit": 2700.0,
                    },
                }
            """
        ).strip()
    )

    pipeline = FeedHookPipeline(hook_runtime=HookRuntime())
    pipeline.register_hook(
        HookRegistration(
            hook_id="hook_auto_1",
            agent_id="agent_eth_5m",
            hook_type="autotrade",
            hook_path=str(hook_file),
            topics=["market.candle.closed"],
        )
    )

    output = pipeline.process_event(
        FeedEvent(
            event_id="evt_3",
            topic="market.candle.closed",
            ts="2026-02-17T00:00:00Z",
            source="metaapi",
            payload={"symbol": "ETHUSDm"},
            symbol="ETHUSDm",
        )
    )

    assert output.wake_requests == []
    assert len(output.trade_intents) == 1
    assert output.trade_intents[0].symbol == "ETHUSDm"
