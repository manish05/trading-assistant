from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path


@dataclass(slots=True)
class TradingAccount:
    account_id: str
    connector_id: str
    provider_account_id: str
    mode: str
    label: str
    allowed_symbols: list[str]
    status: str
    connected_at: str | None
    disconnected_at: str | None


class AccountRegistry:
    def __init__(self, *, state_path: str | Path | None = None) -> None:
        self._accounts: dict[str, TradingAccount] = {}
        self._state_path = Path(state_path) if state_path is not None else None
        if self._state_path is not None:
            self._state_path.parent.mkdir(parents=True, exist_ok=True)
            self._load()

    def connect(
        self,
        *,
        account_id: str,
        connector_id: str,
        provider_account_id: str,
        mode: str,
        label: str,
        allowed_symbols: list[str],
    ) -> TradingAccount:
        now = datetime.now(UTC).isoformat()
        account = self._accounts.get(account_id)
        if account is None:
            account = TradingAccount(
                account_id=account_id,
                connector_id=connector_id,
                provider_account_id=provider_account_id,
                mode=mode,
                label=label,
                allowed_symbols=list(allowed_symbols),
                status="connected",
                connected_at=now,
                disconnected_at=None,
            )
        else:
            account.connector_id = connector_id
            account.provider_account_id = provider_account_id
            account.mode = mode
            account.label = label
            account.allowed_symbols = list(allowed_symbols)
            account.status = "connected"
            account.connected_at = now
            account.disconnected_at = None
        self._accounts[account_id] = account
        self._save()
        return account

    def disconnect(self, *, account_id: str) -> TradingAccount | None:
        account = self._accounts.get(account_id)
        if account is None:
            return None

        account.status = "disconnected"
        account.disconnected_at = datetime.now(UTC).isoformat()
        self._save()
        return account

    def get(self, *, account_id: str) -> TradingAccount | None:
        return self._accounts.get(account_id)

    def list(self) -> list[TradingAccount]:
        return list(self._accounts.values())

    @staticmethod
    def as_public_payload(account: TradingAccount) -> dict:
        payload = asdict(account)
        return {
            "accountId": payload["account_id"],
            "connectorId": payload["connector_id"],
            "providerAccountId": payload["provider_account_id"],
            "mode": payload["mode"],
            "label": payload["label"],
            "allowedSymbols": payload["allowed_symbols"],
            "status": payload["status"],
            "connectedAt": payload["connected_at"],
            "disconnectedAt": payload["disconnected_at"],
        }

    def _load(self) -> None:
        if self._state_path is None or not self._state_path.exists():
            return

        try:
            payload = json.loads(self._state_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return

        accounts_payload = payload.get("accounts")
        if not isinstance(accounts_payload, list):
            return

        for raw_account in accounts_payload:
            if not isinstance(raw_account, dict):
                continue
            try:
                account = TradingAccount(
                    account_id=str(raw_account["accountId"]),
                    connector_id=str(raw_account["connectorId"]),
                    provider_account_id=str(raw_account["providerAccountId"]),
                    mode=str(raw_account["mode"]),
                    label=str(raw_account["label"]),
                    allowed_symbols=list(raw_account.get("allowedSymbols", [])),
                    status=str(raw_account["status"]),
                    connected_at=(
                        str(raw_account["connectedAt"])
                        if raw_account.get("connectedAt") is not None
                        else None
                    ),
                    disconnected_at=(
                        str(raw_account["disconnectedAt"])
                        if raw_account.get("disconnectedAt") is not None
                        else None
                    ),
                )
            except KeyError:
                continue
            self._accounts[account.account_id] = account

    def _save(self) -> None:
        if self._state_path is None:
            return

        payload = {
            "version": 1,
            "accounts": [
                self.as_public_payload(account) for account in self._accounts.values()
            ],
        }
        self._state_path.write_text(
            json.dumps(payload, separators=(",", ":")),
            encoding="utf-8",
        )
