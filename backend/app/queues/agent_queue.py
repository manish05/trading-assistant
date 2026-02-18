from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class QueueMode(StrEnum):
    FOLLOWUP = "followup"
    INTERRUPT = "interrupt"
    COLLECT = "collect"
    STEER_BACKLOG = "steer-backlog"
    QUEUE = "queue"


class QueueDropPolicy(StrEnum):
    OLD = "old"
    NEW = "new"


class RequestPriority(StrEnum):
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"


class QueueSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mode: QueueMode
    cap: int = Field(default=50, ge=1)
    drop_policy: QueueDropPolicy = QueueDropPolicy.OLD
    debounce_ms: int = Field(default=0, ge=0)


class AgentRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    request_id: str = Field(min_length=1)
    agent_id: str = Field(min_length=1)
    kind: str = Field(min_length=1)
    priority: RequestPriority = RequestPriority.NORMAL
    dedupe_key: str | None = None
    payload: dict = Field(default_factory=dict)


class QueueDecisionType(StrEnum):
    RUN_NOW = "run_now"
    ENQUEUED = "enqueued"
    INTERRUPT = "interrupt"
    COLLECTING = "collecting"
    DEDUPED = "deduped"
    DROPPED = "dropped"


class QueueDecision(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: QueueDecisionType
    request: AgentRequest | None = None
    details: dict = Field(default_factory=dict)


class AgentQueue:
    def __init__(self, settings: QueueSettings):
        self.settings = settings
        self.active_request: AgentRequest | None = None
        self.pending: list[AgentRequest] = []
        self.collect_buffer: list[AgentRequest] = []
        self._collect_last_enqueue_ms: int | None = None

    def enqueue(self, request: AgentRequest, *, now_ms: int) -> QueueDecision:
        if self._is_duplicate(request):
            return QueueDecision(type=QueueDecisionType.DEDUPED, request=request)

        if self.settings.mode == QueueMode.COLLECT:
            self.collect_buffer.append(request)
            self._collect_last_enqueue_ms = now_ms
            return QueueDecision(type=QueueDecisionType.COLLECTING, request=request)

        if self.active_request is None:
            self.active_request = request
            return QueueDecision(type=QueueDecisionType.RUN_NOW, request=request)

        if self.settings.mode == QueueMode.INTERRUPT and request.priority == RequestPriority.HIGH:
            self.active_request = request
            return QueueDecision(type=QueueDecisionType.INTERRUPT, request=request)

        if not self._has_capacity_for_pending():
            if self.settings.drop_policy == QueueDropPolicy.NEW:
                return QueueDecision(
                    type=QueueDecisionType.DROPPED,
                    request=request,
                    details={"reason": "queue capacity reached"},
                )
            if self.pending:
                self.pending.pop(0)
            else:
                return QueueDecision(
                    type=QueueDecisionType.DROPPED,
                    request=request,
                    details={"reason": "queue capacity reached"},
                )

        self.pending.append(request)
        return QueueDecision(type=QueueDecisionType.ENQUEUED, request=request)

    def flush_collect(self, *, now_ms: int) -> AgentRequest | None:
        if self.settings.mode != QueueMode.COLLECT or not self.collect_buffer:
            return None

        debounce_ms = max(self.settings.debounce_ms, 0)
        if (
            self._collect_last_enqueue_ms is not None
            and now_ms - self._collect_last_enqueue_ms < debounce_ms
        ):
            return None

        collected = self.collect_buffer.copy()
        self.collect_buffer.clear()
        self._collect_last_enqueue_ms = None

        return AgentRequest(
            request_id=f"collected_{now_ms}",
            agent_id=collected[0].agent_id,
            kind="collect_batch",
            priority=RequestPriority.NORMAL,
            payload={
                "requestIds": [item.request_id for item in collected],
                "count": len(collected),
            },
        )

    def mark_active_complete(self) -> AgentRequest | None:
        self.active_request = None
        if not self.pending:
            return None
        next_request = self.pending.pop(0)
        self.active_request = next_request
        return next_request

    def snapshot(self) -> dict:
        return {
            "settings": self.settings.model_dump(mode="json"),
            "activeRequest": (
                self.active_request.model_dump(mode="json") if self.active_request else None
            ),
            "pending": [request.model_dump(mode="json") for request in self.pending],
            "collectBuffer": [request.model_dump(mode="json") for request in self.collect_buffer],
            "collectLastEnqueueMs": self._collect_last_enqueue_ms,
        }

    @classmethod
    def from_snapshot(cls, snapshot: dict) -> "AgentQueue":
        settings = QueueSettings.model_validate(snapshot.get("settings", {}))
        queue = cls(settings=settings)

        active_request_payload = snapshot.get("activeRequest")
        if active_request_payload is not None:
            queue.active_request = AgentRequest.model_validate(active_request_payload)

        queue.pending = [
            AgentRequest.model_validate(request_payload)
            for request_payload in snapshot.get("pending", [])
        ]
        queue.collect_buffer = [
            AgentRequest.model_validate(request_payload)
            for request_payload in snapshot.get("collectBuffer", [])
        ]
        queue._collect_last_enqueue_ms = snapshot.get("collectLastEnqueueMs")
        return queue

    def _has_capacity_for_pending(self) -> bool:
        occupied = len(self.pending) + (1 if self.active_request else 0)
        return occupied < self.settings.cap

    def _is_duplicate(self, request: AgentRequest) -> bool:
        if request.dedupe_key is None:
            return False
        dedupe_key = request.dedupe_key

        if self.active_request and self.active_request.dedupe_key == dedupe_key:
            return True

        for pending_request in self.pending:
            if pending_request.dedupe_key == dedupe_key:
                return True

        for buffered_request in self.collect_buffer:
            if buffered_request.dedupe_key == dedupe_key:
                return True

        return False
