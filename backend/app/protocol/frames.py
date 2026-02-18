from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, TypeAdapter

NonEmptyString = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class FrameModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ErrorShape(FrameModel):
    code: NonEmptyString
    message: NonEmptyString
    details: Any | None = None
    retryable: bool | None = None
    retry_after_ms: int | None = Field(default=None, ge=0)


class RequestFrame(FrameModel):
    type: Literal["req"]
    id: NonEmptyString
    method: NonEmptyString
    params: dict[str, Any] = Field(default_factory=dict)


class ResponseFrame(FrameModel):
    type: Literal["res"]
    id: NonEmptyString
    ok: bool
    payload: Any | None = None
    error: ErrorShape | None = None


class EventFrame(FrameModel):
    type: Literal["event"]
    event: NonEmptyString
    payload: Any | None = None
    seq: int | None = Field(default=None, ge=0)


GatewayFrame = Annotated[RequestFrame | ResponseFrame | EventFrame, Field(discriminator="type")]
GATEWAY_FRAME_ADAPTER = TypeAdapter(GatewayFrame)


def parse_gateway_frame(payload: Any) -> GatewayFrame:
    return GATEWAY_FRAME_ADAPTER.validate_python(payload)
