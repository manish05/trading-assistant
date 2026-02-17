import textwrap

import pytest

from app.hooks.runtime import HookRuntime, HookRuntimeError


def test_runtime_executes_hook_and_returns_decision(tmp_path) -> None:
    hook_file = tmp_path / "wake_green.py"
    hook_file.write_text(
        textwrap.dedent(
            """
            def evaluate(event, state):
                return {
                    "decision": "WAKE",
                    "reason": "Two green candles",
                    "dedupeKey": f"{event['symbol']}:{event['ts']}",
                }
            """
        ).strip()
    )

    result = HookRuntime().evaluate_hook(
        hook_path=hook_file,
        event={"symbol": "ETHUSDm", "ts": "2026-02-17T00:00:00Z"},
        state={"candles": []},
        timeout_ms=100,
    )

    assert result["decision"] == "WAKE"
    assert result["reason"] == "Two green candles"


def test_runtime_raises_when_evaluate_function_missing(tmp_path) -> None:
    hook_file = tmp_path / "invalid_hook.py"
    hook_file.write_text("x = 1")

    with pytest.raises(HookRuntimeError, match="evaluate"):
        HookRuntime().evaluate_hook(
            hook_path=hook_file,
            event={},
            state={},
            timeout_ms=100,
        )


def test_runtime_raises_timeout_for_slow_hook(tmp_path) -> None:
    hook_file = tmp_path / "slow_hook.py"
    hook_file.write_text(
        textwrap.dedent(
            """
            import time

            def evaluate(event, state):
                time.sleep(0.2)
                return {"decision": "IGNORE"}
            """
        ).strip()
    )

    with pytest.raises(HookRuntimeError, match="timed out"):
        HookRuntime().evaluate_hook(
            hook_path=hook_file,
            event={},
            state={},
            timeout_ms=50,
        )
