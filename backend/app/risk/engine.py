from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class ViolationCode(StrEnum):
    SYMBOL_NOT_ALLOWED = "SYMBOL_NOT_ALLOWED"
    MAX_VOLUME_EXCEEDED = "MAX_VOLUME_EXCEEDED"
    MAX_CONCURRENT_POSITIONS = "MAX_CONCURRENT_POSITIONS"
    MAX_DAILY_LOSS = "MAX_DAILY_LOSS"
    STOP_LOSS_REQUIRED = "STOP_LOSS_REQUIRED"


class TradeIntent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    account_id: str = Field(min_length=1)
    symbol: str = Field(min_length=1)
    action: str = Field(min_length=1)
    side: str = Field(min_length=1)
    volume: float = Field(gt=0)
    stop_loss: float | None = None
    take_profit: float | None = None


class RiskPolicy(BaseModel):
    model_config = ConfigDict(extra="forbid")

    allowed_symbols: list[str]
    max_volume: float = Field(gt=0)
    max_concurrent_positions: int = Field(ge=1)
    max_daily_loss: float = Field(gt=0)
    require_stop_loss: bool = True


class AccountRiskSnapshot(BaseModel):
    model_config = ConfigDict(extra="forbid")

    open_positions: int = Field(ge=0)
    daily_pnl: float


class RiskViolation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: ViolationCode
    message: str
    details: dict = Field(default_factory=dict)


class RiskDecision(BaseModel):
    model_config = ConfigDict(extra="forbid")

    allowed: bool
    violations: list[RiskViolation]


class RiskEngine:
    def evaluate(
        self,
        *,
        intent: TradeIntent,
        policy: RiskPolicy,
        snapshot: AccountRiskSnapshot,
    ) -> RiskDecision:
        violations: list[RiskViolation] = []

        if intent.symbol not in policy.allowed_symbols:
            violations.append(
                RiskViolation(
                    code=ViolationCode.SYMBOL_NOT_ALLOWED,
                    message="Symbol is not in the allowlist.",
                    details={"symbol": intent.symbol},
                )
            )

        if intent.volume > policy.max_volume:
            violations.append(
                RiskViolation(
                    code=ViolationCode.MAX_VOLUME_EXCEEDED,
                    message="Requested volume exceeds max_volume policy.",
                    details={"volume": intent.volume, "maxVolume": policy.max_volume},
                )
            )

        if snapshot.open_positions >= policy.max_concurrent_positions:
            violations.append(
                RiskViolation(
                    code=ViolationCode.MAX_CONCURRENT_POSITIONS,
                    message="Max concurrent positions reached.",
                    details={
                        "openPositions": snapshot.open_positions,
                        "maxConcurrentPositions": policy.max_concurrent_positions,
                    },
                )
            )

        if abs(min(snapshot.daily_pnl, 0.0)) >= policy.max_daily_loss:
            violations.append(
                RiskViolation(
                    code=ViolationCode.MAX_DAILY_LOSS,
                    message="Daily loss limit reached.",
                    details={"dailyPnl": snapshot.daily_pnl, "maxDailyLoss": policy.max_daily_loss},
                )
            )

        if policy.require_stop_loss and intent.stop_loss is None:
            violations.append(
                RiskViolation(
                    code=ViolationCode.STOP_LOSS_REQUIRED,
                    message="Stop loss is required by policy.",
                )
            )

        return RiskDecision(allowed=len(violations) == 0, violations=violations)
