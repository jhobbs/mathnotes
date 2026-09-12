"""Tests for scripts/check_tex.py, the single-file .tex checker used by the
vim-on-save hook.

Run inside the dev builder container:
    docker exec -i -w /app mathnotes-static-builder python3 - < test/test_check_tex.py
"""

import subprocess
import sys
import tempfile
from pathlib import Path

CHECKER = "/app/scripts/check_tex.py"

PREAMBLE = r"""\documentclass{article}
\usepackage{mathnotes}
\title{Probe}
\slug{probe-check-tex}
\begin{document}
\section{P}
"""

POSTAMBLE = "\n\\end{document}\n"


def run_checker(body):
    """Write body into a temp .tex file, check it, return (returncode, stdout)."""
    with tempfile.TemporaryDirectory() as d:
        path = Path(d) / "probe.tex"
        path.write_text(PREAMBLE + body + POSTAMBLE)
        proc = subprocess.run(
            [sys.executable, CHECKER, str(path)],
            capture_output=True,
            text=True,
            cwd="/app",
        )
        return proc.returncode, proc.stdout.strip(), str(path)


def test_clean_file_is_silent():
    code, out, _ = run_checker(r"Some prose with math $a + b = c$ in it." + "\n")
    assert code == 0, f"clean file should exit 0, got {code}: {out}"
    assert out == "", f"clean file should print nothing, got: {out!r}"


def test_misplaced_ampersand():
    """The real failure from 01-discrete-entropy.tex: an alignment & inside \\[ \\]."""
    code, out, path = run_checker("\\[ D(p) & = \\sum_x p(x) \\]\n")
    assert code == 1, f"expected exit 1, got {code}: {out}"
    assert "Misplaced &" in out, f"expected 'Misplaced &' in output, got: {out!r}"
    assert out.startswith(path + ":"), f"expected '{path}:' prefix, got: {out!r}"


def test_missing_macro_argument():
    """The second real failure: \\mathbb_Y, a macro missing its braced argument."""
    code, out, path = run_checker(r"\[ a \mathbb_Y b \]" + "\n")
    assert code == 1, f"expected exit 1, got {code}: {out}"
    assert "Missing superscript or subscript argument" in out, f"got: {out!r}"
    assert out.startswith(path + ":"), f"expected '{path}:' prefix, got: {out!r}"


def test_error_format_is_vim_parseable():
    """Output must be file:line: message so vim's default errorformat parses it."""
    code, out, path = run_checker("Line one.\n\nLine two.\n\n\\[ a \\mathbb_Y b \\]\n")
    assert code == 1, f"expected exit 1, got {code}: {out}"
    head, _, _ = out.partition(" ")
    prefix, _, rest = out.partition(": ")
    assert prefix.startswith(path + ":"), f"bad prefix: {out!r}"
    lineno = prefix[len(path) + 1:]
    assert lineno.isdigit(), f"expected a numeric line in {out!r}, got {lineno!r}"
    assert int(lineno) > 1, f"error should point past line 1, got {lineno}"
    assert rest, "expected a message after the line number"


def test_reports_line_of_the_failing_math():
    """The reported line must be the one holding the bad math, not the file start."""
    body = "Filler.\n\n" * 5 + r"\[ a \mathbb_Y b \]" + "\n"
    code, out, path = run_checker(body)
    assert code == 1, f"expected exit 1, got {code}: {out}"
    lineno = int(out[len(path) + 1:].partition(":")[0])
    # PREAMBLE is 6 lines; 5 filler paragraphs of 2 lines each follow.
    expected = 6 + 10 + 1
    assert lineno == expected, f"expected line {expected}, got {lineno}: {out!r}"


def test_unclosed_environment_is_vim_parseable():
    """Structural errors come from a different parser path than per-node math
    errors and must still be normalized to a single file:line: message line."""
    body = "\\begin{proof}\n\\[\n\\bal\na & = b\n\\]\n\\end{proof}\n"
    code, out, path = run_checker(body)
    assert code == 1, f"expected exit 1, got {code}: {out}"
    assert len(out.splitlines()) == 1, f"expected one line, got:\n{out}"
    assert out.startswith(path + ":"), f"expected '{path}:' prefix, got: {out!r}"
    lineno = out[len(path) + 1:].partition(":")[0]
    assert lineno.isdigit(), f"expected a numeric line, got {lineno!r} in {out!r}"


def test_unclosed_environment_points_at_the_unclosed_block():
    """Report where the unclosed environment opened, not where it was noticed."""
    body = "\\begin{proof}\n\\[\n\\bal\na & = b\n\\]\n\\end{proof}\n"
    code, out, path = run_checker(body)
    assert code == 1, f"expected exit 1, got {code}: {out}"
    lineno = int(out[len(path) + 1:].partition(":")[0])
    # PREAMBLE is 6 lines; \bal (aligned) opens on line 9 and is never closed.
    assert lineno == 9, f"expected line 9 (the unclosed \\bal), got {lineno}: {out!r}"


def test_all_errors_are_single_line():
    """Every error path must emit exactly one line; vim's errorformat is line-based."""
    bodies = [
        r"\[ D(p) & = \sum_x p(x) \]" + "\n",
        r"\[ a \mathbb_Y b \]" + "\n",
        "\\begin{proof}\n\\[\n\\bal\na & = b\n\\]\n\\end{proof}\n",
        "\\begin{theorem}\nUnclosed theorem.\n",
    ]
    for body in bodies:
        code, out, path = run_checker(body)
        assert code == 1, f"expected exit 1 for {body!r}, got {code}: {out}"
        assert len(out.splitlines()) == 1, f"multi-line output for {body!r}:\n{out}"
        assert out.startswith(path + ":"), f"bad prefix for {body!r}: {out!r}"


def test_missing_file_does_not_crash():
    proc = subprocess.run(
        [sys.executable, CHECKER, "/app/content/does-not-exist.tex"],
        capture_output=True,
        text=True,
        cwd="/app",
    )
    assert proc.returncode == 1, f"expected exit 1, got {proc.returncode}"
    assert proc.stdout.strip(), "expected a diagnostic on stdout"
    assert ":" in proc.stdout, f"expected file:line: shape, got {proc.stdout!r}"


if __name__ == "__main__":
    failures = 0
    for name, fn in sorted(globals().items()):
        if not name.startswith("test_") or not callable(fn):
            continue
        try:
            fn()
            print(f"PASS {name}")
        except AssertionError as e:
            failures += 1
            print(f"FAIL {name}: {e}")
        except Exception as e:
            failures += 1
            print(f"ERROR {name}: {type(e).__name__}: {e}")
    print()
    print("FAILURES:", failures)
    sys.exit(1 if failures else 0)
