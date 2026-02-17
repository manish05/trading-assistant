from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

import json5
from pydantic import BaseModel, ConfigDict, Field, ValidationError


class ConfigValidationError(ValueError):
    """Raised when config cannot be parsed or validated."""


class GatewayAuthConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mode: str = Field(min_length=1)
    token: str = Field(min_length=1)


class GatewayConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    host: str = Field(min_length=1)
    port: int = Field(ge=1, le=65535)
    auth: GatewayAuthConfig


class PluginsConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    allow: list[str] = Field(default_factory=list)
    deny: list[str] = Field(default_factory=list)
    slots: dict[str, str] = Field(default_factory=dict)


class AppConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    gateway: GatewayConfig
    plugins: PluginsConfig = Field(default_factory=PluginsConfig)


_ENV_PATTERN = re.compile(r"\$\{([A-Z0-9_]+)\}")


def default_config() -> AppConfig:
    return AppConfig(
        gateway=GatewayConfig(
            host="0.0.0.0",
            port=18789,
            auth=GatewayAuthConfig(
                mode="token",
                token=os.getenv("GATEWAY_TOKEN", "dev-token"),
            ),
        ),
        plugins=PluginsConfig(
            allow=[],
            deny=[],
            slots={"memory": "sqlite_fts"},
        ),
    )


def load_config(config_path: str | Path) -> AppConfig:
    path = Path(config_path)
    if not path.exists():
        raise ConfigValidationError(f"Config file does not exist: {path}")

    try:
        raw_text = path.read_text(encoding="utf-8")
        parsed = json5.loads(raw_text)
    except Exception as exc:  # noqa: BLE001
        raise ConfigValidationError(f"Failed to parse config: {exc}") from exc

    interpolated = _interpolate_env(parsed)

    try:
        return AppConfig.model_validate(interpolated)
    except ValidationError as exc:
        raise ConfigValidationError(str(exc)) from exc


def _interpolate_env(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: _interpolate_env(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_interpolate_env(item) for item in value]
    if isinstance(value, str):
        return _ENV_PATTERN.sub(lambda match: os.getenv(match.group(1), ""), value)
    return value
