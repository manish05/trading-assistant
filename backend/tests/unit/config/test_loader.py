from pathlib import Path

import pytest

from app.config.loader import ConfigValidationError, load_config


def test_loader_parses_json5_and_interpolates_environment(tmp_path: Path, monkeypatch) -> None:
    config_path = tmp_path / "config.json5"
    config_path.write_text(
        """
        {
          // gateway section
          gateway: {
            host: "0.0.0.0",
            port: 18789,
            auth: {
              mode: "token",
              token: "${GATEWAY_TOKEN}",
            },
          },
          plugins: {
            allow: ["metaapi_mcp"],
            deny: [],
            slots: { memory: "sqlite_fts" },
          },
        }
        """,
        encoding="utf-8",
    )
    monkeypatch.setenv("GATEWAY_TOKEN", "secret_123")

    config = load_config(config_path)

    assert config.gateway.host == "0.0.0.0"
    assert config.gateway.auth.token == "secret_123"
    assert config.plugins.slots["memory"] == "sqlite_fts"


def test_loader_raises_on_missing_required_fields(tmp_path: Path) -> None:
    config_path = tmp_path / "config.json5"
    config_path.write_text(
        """
        {
          gateway: {
            host: "0.0.0.0"
          }
        }
        """,
        encoding="utf-8",
    )

    with pytest.raises(ConfigValidationError):
        load_config(config_path)


def test_loader_parses_accounts_and_feeds_sections(tmp_path: Path) -> None:
    config_path = tmp_path / "config.json5"
    config_path.write_text(
        """
        {
          gateway: {
            host: "0.0.0.0",
            port: 18789,
            auth: {
              mode: "token",
              token: "dev-token",
            },
          },
          accounts: [
            {
              accountId: "acct_demo_1",
              connectorId: "metaapi_mcp",
              providerAccountId: "provider_1",
              mode: "demo",
              label: "Demo MT5",
              allowedSymbols: ["ETHUSDm", "BTCUSDm"],
            },
          ],
          feeds: {
            candles: {
              enabled: true,
              pollSecondsByTimeframe: {
                "5m": 45,
                "1h": 180,
              },
            },
            priceTicks: { enabled: false },
          },
        }
        """,
        encoding="utf-8",
    )

    config = load_config(config_path)

    assert config.accounts[0].account_id == "acct_demo_1"
    assert config.accounts[0].allowed_symbols == ["ETHUSDm", "BTCUSDm"]
    assert config.feeds.candles.poll_seconds_by_timeframe["5m"] == 45
    assert config.feeds.priceTicks.enabled is False
