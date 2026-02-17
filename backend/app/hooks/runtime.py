from __future__ import annotations

import runpy
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import TimeoutError as FutureTimeoutError
from pathlib import Path
from typing import Any


class HookRuntimeError(RuntimeError):
    """Raised when hook execution fails."""


class HookRuntime:
    def evaluate_hook(
        self,
        *,
        hook_path: str | Path,
        event: dict[str, Any],
        state: dict[str, Any],
        timeout_ms: int = 200,
    ) -> dict[str, Any]:
        path = Path(hook_path)
        if not path.exists():
            raise HookRuntimeError(f"Hook file not found: {path}")

        timeout_seconds = max(timeout_ms, 1) / 1000

        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(self._evaluate_sync, path, event, state)
            try:
                result = future.result(timeout=timeout_seconds)
            except FutureTimeoutError as exc:
                future.cancel()
                raise HookRuntimeError(f"Hook execution timed out after {timeout_ms}ms") from exc
            except Exception as exc:  # noqa: BLE001
                raise HookRuntimeError(str(exc)) from exc

        if not isinstance(result, dict):
            raise HookRuntimeError("Hook evaluate() must return a dict")
        return result

    def _evaluate_sync(
        self,
        hook_path: Path,
        event: dict[str, Any],
        state: dict[str, Any],
    ) -> dict[str, Any]:
        namespace = runpy.run_path(str(hook_path))
        evaluate = namespace.get("evaluate")
        if not callable(evaluate):
            raise HookRuntimeError("Hook must export a callable evaluate(event, state)")
        return evaluate(event, state)
