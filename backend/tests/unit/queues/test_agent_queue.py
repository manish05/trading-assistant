from app.queues.agent_queue import (
    AgentQueue,
    AgentRequest,
    QueueDecisionType,
    QueueSettings,
)


def _request(
    request_id: str,
    *,
    dedupe_key: str | None = None,
    priority: str = "normal",
) -> AgentRequest:
    return AgentRequest(
        request_id=request_id,
        agent_id="agent_eth_5m",
        kind="hook_trigger",
        priority=priority,
        dedupe_key=dedupe_key,
        payload={"source": "test"},
    )


def test_followup_mode_runs_immediately_when_idle() -> None:
    queue = AgentQueue(QueueSettings(mode="followup", cap=10, drop_policy="old"))

    decision = queue.enqueue(_request("req_1"), now_ms=1_000)

    assert decision.type == QueueDecisionType.RUN_NOW
    assert queue.active_request is not None
    assert queue.active_request.request_id == "req_1"


def test_followup_mode_enqueues_when_busy() -> None:
    queue = AgentQueue(QueueSettings(mode="followup", cap=10, drop_policy="old"))
    _ = queue.enqueue(_request("req_1"), now_ms=1_000)

    decision = queue.enqueue(_request("req_2"), now_ms=1_100)

    assert decision.type == QueueDecisionType.ENQUEUED
    assert [item.request_id for item in queue.pending] == ["req_2"]


def test_interrupt_mode_interrupts_only_high_priority() -> None:
    queue = AgentQueue(QueueSettings(mode="interrupt", cap=10, drop_policy="old"))
    _ = queue.enqueue(_request("req_1"), now_ms=1_000)

    normal_decision = queue.enqueue(_request("req_2"), now_ms=1_100)
    high_decision = queue.enqueue(_request("req_3", priority="high"), now_ms=1_200)

    assert normal_decision.type == QueueDecisionType.ENQUEUED
    assert high_decision.type == QueueDecisionType.INTERRUPT
    assert queue.active_request is not None
    assert queue.active_request.request_id == "req_3"


def test_collect_mode_batches_and_flushes_after_debounce() -> None:
    queue = AgentQueue(
        QueueSettings(
            mode="collect",
            cap=10,
            drop_policy="old",
            debounce_ms=100,
        )
    )

    decision_1 = queue.enqueue(_request("req_1"), now_ms=1_000)
    decision_2 = queue.enqueue(_request("req_2"), now_ms=1_050)
    flushed_none = queue.flush_collect(now_ms=1_070)
    flushed_ready = queue.flush_collect(now_ms=1_200)

    assert decision_1.type == QueueDecisionType.COLLECTING
    assert decision_2.type == QueueDecisionType.COLLECTING
    assert flushed_none is None
    assert flushed_ready is not None
    assert flushed_ready.request_id.startswith("collected_")
    assert flushed_ready.payload["requestIds"] == ["req_1", "req_2"]


def test_queue_dedupes_by_dedupe_key() -> None:
    queue = AgentQueue(QueueSettings(mode="followup", cap=10, drop_policy="old"))
    _ = queue.enqueue(_request("req_1", dedupe_key="same-key"), now_ms=1_000)

    decision = queue.enqueue(_request("req_2", dedupe_key="same-key"), now_ms=1_001)

    assert decision.type == QueueDecisionType.DEDUPED
    assert [item.request_id for item in queue.pending] == []


def test_queue_drops_oldest_when_cap_reached_and_policy_old() -> None:
    queue = AgentQueue(QueueSettings(mode="followup", cap=2, drop_policy="old"))
    _ = queue.enqueue(_request("req_1"), now_ms=1_000)
    _ = queue.enqueue(_request("req_2"), now_ms=1_100)

    decision = queue.enqueue(_request("req_3"), now_ms=1_200)

    assert decision.type == QueueDecisionType.ENQUEUED
    assert [item.request_id for item in queue.pending] == ["req_3"]
