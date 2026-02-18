from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class FeedEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_id: str = Field(min_length=1)
    ts: str = Field(min_length=1)
    source: str = Field(min_length=1)
    topic: str = Field(min_length=1)
    payload: dict = Field(default_factory=dict)
    symbol: str | None = None
    timeframe: str | None = None
    account_id: str | None = None


class HookRegistration(BaseModel):
    model_config = ConfigDict(extra="forbid")

    hook_id: str = Field(min_length=1)
    agent_id: str = Field(min_length=1)
    hook_type: Literal["wake", "autotrade", "copytrade"]
    hook_path: str = Field(min_length=1)
    topics: list[str] = Field(min_length=1)
