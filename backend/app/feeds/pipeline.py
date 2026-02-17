from datetime import UTC, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.feeds.types import FeedEvent, HookRegistration
from app.hooks.runtime import HookRuntime, HookRuntimeError
from app.queues.agent_queue import AgentRequest
from app.risk.engine import TradeIntent


class FeedPipelineOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    wake_requests: list[AgentRequest] = Field(default_factory=list)
    trade_intents: list[TradeIntent] = Field(default_factory=list)
    hook_errors: list[dict] = Field(default_factory=list)


class FeedHookPipeline:
    def __init__(self, *, hook_runtime: HookRuntime):
        self._hook_runtime = hook_runtime
        self._hooks: list[HookRegistration] = []

    def register_hook(self, registration: HookRegistration) -> None:
        self._hooks.append(registration)

    def process_event(self, event: FeedEvent) -> FeedPipelineOutput:
        output = FeedPipelineOutput()
        event_payload = event.model_dump(mode="json")

        for registration in self._hooks:
            if event.topic not in registration.topics:
                continue

            try:
                decision = self._hook_runtime.evaluate_hook(
                    hook_path=registration.hook_path,
                    event=event_payload,
                    state={},
                )
            except HookRuntimeError as exc:
                output.hook_errors.append(
                    {
                        "hookId": registration.hook_id,
                        "agentId": registration.agent_id,
                        "error": str(exc),
                    }
                )
                continue

            decision_type = str(decision.get("decision", "IGNORE")).upper()
            if registration.hook_type == "wake" and decision_type == "WAKE":
                output.wake_requests.append(
                    AgentRequest(
                        request_id=f"ar_{event.event_id}_{registration.hook_id}",
                        agent_id=registration.agent_id,
                        kind="hook_trigger",
                        dedupe_key=decision.get("dedupeKey"),
                        payload={
                            "reason": decision.get("reason"),
                            "triggerEventId": event.event_id,
                            "triggerTopic": event.topic,
                            "triggerTs": datetime.now(UTC).isoformat(),
                        },
                    )
                )

            if (
                registration.hook_type in {"autotrade", "copytrade"}
                and decision_type == "TRADE_INTENT"
            ):
                intent = TradeIntent.model_validate(decision.get("intent", {}))
                output.trade_intents.append(intent)

        return output
