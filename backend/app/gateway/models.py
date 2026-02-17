from pydantic import BaseModel, ConfigDict, Field


class GatewayClientInfo(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1)
    kind: str = Field(min_length=1)
    platform: str = Field(min_length=1)
    version: str = Field(min_length=1)
    device_id: str | None = None


class GatewayProtocolRange(BaseModel):
    model_config = ConfigDict(extra="forbid")

    min: int = Field(ge=1)
    max: int = Field(ge=1)


class GatewayConnectParams(BaseModel):
    model_config = ConfigDict(extra="forbid")

    client: GatewayClientInfo
    protocol: GatewayProtocolRange
    auth: dict | None = None
