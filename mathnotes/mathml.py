"""Build-time LaTeX -> MathML conversion via a persistent Node MathJax worker.

MathConverter speaks the JSON-lines protocol of scripts/tex2mml-worker.mjs.
One request is in flight at a time (the build is single-threaded). If the
worker dies mid-request it is restarted once and the request retried; a
second failure is a hard error. A TeX parse error is a MathConversionError.
"""

import atexit
import json
import os
import subprocess
from typing import Optional


class MathConversionError(ValueError):
    """The worker could not convert an expression (TeX error)."""


class _WorkerDied(Exception):
    pass


_WORKER_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "scripts", "tex2mml-worker.mjs")


class MathConverter:
    def __init__(self, worker_path: str = _WORKER_PATH):
        self.worker_path = worker_path
        self._proc: Optional[subprocess.Popen] = None
        self._next_id = 0

    def _spawn(self):
        cmd = ["node", self.worker_path]
        try:
            self._proc = subprocess.Popen(
                cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                text=True, bufsize=1)
        except OSError as e:
            raise RuntimeError(
                f"could not start MathML worker ({' '.join(cmd)}): {e}") from e

    def _request_once(self, payload: dict) -> dict:
        if self._proc is None or self._proc.poll() is not None:
            self._spawn()
        try:
            self._proc.stdin.write(json.dumps(payload) + "\n")
            self._proc.stdin.flush()
            line = self._proc.stdout.readline()
        except (BrokenPipeError, OSError) as e:
            raise _WorkerDied(str(e)) from e
        if not line:
            raise _WorkerDied("worker closed stdout")
        return json.loads(line)

    def convert(self, latex: str, display: bool) -> str:
        self._next_id += 1
        payload = {"id": self._next_id, "latex": latex, "display": display}
        try:
            resp = self._request_once(payload)
        except _WorkerDied:
            self._proc = None
            try:
                resp = self._request_once(payload)
            except _WorkerDied as e:
                raise RuntimeError(
                    f"MathML worker died twice converting {latex!r}: {e}") from e
        if resp.get("id") != payload["id"]:
            raise RuntimeError(
                f"MathML worker protocol desync: sent id {payload['id']}, "
                f"got {resp.get('id')!r}")
        if "error" in resp:
            raise MathConversionError(resp["error"])
        return resp["mathml"]

    def close(self):
        if self._proc is not None and self._proc.poll() is None:
            self._proc.stdin.close()
            try:
                self._proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self._proc.kill()
                self._proc.wait()
        if self._proc is not None:
            self._proc.stdout.close()
        self._proc = None


_converter: Optional[MathConverter] = None


def get_converter() -> MathConverter:
    """Module-level singleton; atexit covers the build script and watch mode."""
    global _converter
    if _converter is None:
        _converter = MathConverter()
        atexit.register(_converter.close)
    return _converter
