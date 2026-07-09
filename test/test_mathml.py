"""Tests for the LaTeX->MathML worker (scripts/tex2mml-worker.mjs) and the
MathConverter client (mathnotes/mathml.py).

Run: docker exec -i mathnotes-static-builder python3 - < test/test_mathml.py
"""
import json
import os, sys, traceback
import subprocess
try:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
except NameError:
    sys.path.insert(0, "/app")

try:
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if not os.path.isdir(os.path.join(ROOT, "scripts")):
        # Piped via `python3 - < file.py`, __file__ is the literal string
        # "<stdin>" (not undefined) in this container's Python, so the
        # dirname/dirname math above lands on "/" instead of "/app". Force
        # the same fallback a real NameError would take.
        raise NameError
except NameError:
    ROOT = "/app"
WORKER = os.path.join(ROOT, "scripts", "tex2mml-worker.mjs")


def worker_roundtrip(requests):
    proc = subprocess.run(
        ["node", WORKER],
        input="".join(json.dumps(r) + "\n" for r in requests),
        capture_output=True, text=True, timeout=120)
    assert proc.returncode == 0, proc.stderr
    return [json.loads(line) for line in proc.stdout.splitlines()]


def test_worker_inline_and_display():
    r1, r2 = worker_roundtrip([
        {"id": 1, "latex": "x<y", "display": False},
        {"id": 2, "latex": "\\int_0^1 f", "display": True},
    ])
    assert r1["id"] == 1 and r1["mathml"].startswith("<math")
    assert 'alttext="x&lt;y"' in r1["mathml"]
    assert 'display="block"' not in r1["mathml"]
    assert "\n" not in r1["mathml"]  # single-line output
    assert r2["id"] == 2 and 'display="block"' in r2["mathml"]
    assert 'alttext="\\int_0^1 f"' in r2["mathml"]


def test_worker_sty_macros_and_ams_symbols():
    r1, r2, r3, r4 = worker_roundtrip([
        {"id": 1, "latex": "\\vec{F}", "display": False},   # mathnotes.sty macro
        {"id": 2, "latex": "\\square", "display": False},   # ams symbol (proof QED)
        {"id": 3, "latex": "\\Res_{z=i} f(z)", "display": False},  # \operatorname* macro
        {"id": 4, "latex": "\\cancel{(x-r_1)}", "display": False},  # cancel package (eagerly loaded)
    ])
    assert "error" not in r1 and 'mathvariant="bold"' in r1["mathml"]
    assert "error" not in r2 and r2["mathml"].startswith("<math")
    assert "error" not in r3 and ">Res<" in r3["mathml"]
    assert "error" not in r4 and r4["mathml"].startswith("<math")


def test_worker_amsmath_environments():
    reqs = [{"id": i, "latex": t, "display": True} for i, t in enumerate([
        "\\begin{aligned} a &= b \\\\ c &= d \\end{aligned}",
        "\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}",
        "\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}",
        "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}",
        "\\begin{cases} 1 & x > 0 \\\\ 0 & x \\le 0 \\end{cases}",
    ])]
    for r in worker_roundtrip(reqs):
        assert "error" not in r, r


def test_worker_tex_error_is_response_not_crash():
    r1, r2 = worker_roundtrip([
        {"id": 1, "latex": "\\notarealmacro", "display": False},
        {"id": 2, "latex": "x", "display": False},
    ])
    assert "Undefined control sequence" in r1["error"]
    assert r2["mathml"].startswith("<math")  # worker survived the TeX error


def test_worker_malformed_protocol_exits_nonzero():
    proc = subprocess.run(["node", WORKER], input="not json\n",
                          capture_output=True, text=True, timeout=120)
    assert proc.returncode != 0


from mathnotes.mathml import MathConverter, MathConversionError, get_converter


def test_converter_roundtrip():
    c = MathConverter()
    try:
        mml = c.convert("x^2", display=False)
        assert mml.startswith("<math") and 'alttext="x^2"' in mml
        dm = c.convert("\\sum_{n=1}^\\infty a_n", display=True)
        assert 'display="block"' in dm
    finally:
        c.close()


def test_converter_tex_error_raises():
    c = MathConverter()
    try:
        try:
            c.convert("\\notarealmacro", display=False)
            assert False, "expected MathConversionError"
        except MathConversionError as e:
            assert "notarealmacro" in str(e) or "Undefined" in str(e)
        # converter still usable after an error response
        assert c.convert("x", display=False).startswith("<math")
    finally:
        c.close()


def test_converter_restarts_dead_worker():
    c = MathConverter()
    try:
        assert c.convert("x", display=False).startswith("<math")
        c._proc.kill()
        c._proc.wait()
        # one restart + retry of the in-flight request
        assert c.convert("y", display=False).startswith("<math")
    finally:
        c.close()


def test_converter_startup_failure_names_command():
    c = MathConverter(worker_path="/nonexistent/worker.mjs")
    try:
        c.convert("x", display=False)
        assert False, "expected RuntimeError"
    except RuntimeError as e:
        assert "worker" in str(e).lower()
    finally:
        c.close()


def test_get_converter_is_singleton():
    assert get_converter() is get_converter()


if __name__ == "__main__":
    fns = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    failed = 0
    for fn in fns:
        try:
            fn(); print(f"PASS {fn.__name__}")
        except Exception:
            failed += 1; print(f"FAIL {fn.__name__}"); traceback.print_exc()
    print(f"{len(fns) - failed}/{len(fns)} passed")
    sys.exit(1 if failed else 0)
