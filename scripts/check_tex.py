#!/usr/bin/env python3
"""Check a single .tex content file, reporting errors as file:line: message.

Runs inside the dev builder container, where the MathJax worker is already warm:

    docker exec -w /app mathnotes-static-builder \
        python3 /app/scripts/check_tex.py content/path/to/page.tex

Exits 0 and prints nothing when the file parses. Exits 1 and prints one
file:line: message line when it does not, which is vim's default errorformat.

This catches parse and MathML errors in the given file only. It does not catch
cross-file problems: unresolved \\dref targets render as error spans rather than
failing, and duplicate labels are build warnings.
"""

import re
import sys
from pathlib import Path

sys.path.insert(0, "/app")

# pylatexenc reports source positions as @(line,col).
_POS_RE = re.compile(r"@\((\d+),(\d+)\)")


def normalize(path, text):
    """Collapse a parser message into a single 'file:line: message' line.

    Per-node math errors already arrive as 'file:line: message'. Structural
    errors (unclosed environments) come from a different parser path: they span
    several lines and carry positions as @(line,col) instead. Both must end up
    on one line with a line number, or vim's line-based errorformat silently
    matches nothing and the error looks like a clean file.
    """
    text = text.strip()
    lines = text.splitlines()
    first = lines[0] if lines else "unknown error"

    already = re.match(re.escape(str(path)) + r":(\d+): (.*)$", first)
    if already:
        return f"{path}:{already.group(1)}: {already.group(2)}"

    positions = _POS_RE.findall(text)
    if "Open LaTeX blocks" in text and positions:
        # The innermost still-open block is what was never closed, which is
        # more useful than where the parser finally noticed.
        line = positions[-1][0]
    elif positions:
        line = positions[0][0]
    else:
        line = "1"

    message = first
    prefix = f"{path}: "
    if message.startswith(prefix):
        message = message[len(prefix):]
    # Collapse whitespace so a wrapped message can never span lines.
    message = " ".join(message.split())
    return f"{path}:{line}: {message}"


def main(argv):
    if len(argv) != 2:
        print(f"usage: {Path(argv[0]).name} <file.tex>", file=sys.stderr)
        return 2

    path = Path(argv[1])

    from mathnotes.config import configure_latexblocks

    configure_latexblocks()

    from latexblocks.content_loader import load_content_file
    from latexblocks.latex_processor import LatexDialectError

    try:
        load_content_file(path)
    except LatexDialectError as e:
        print(normalize(path, str(e)))
        return 1
    except OSError as e:
        print(f"{path}:1: {e.strerror or type(e).__name__}")
        return 1
    except Exception as e:
        # Anything else (bad frontmatter, worker failure) gets normalized to the
        # same shape so vim can always parse it.
        print(normalize(path, f"{type(e).__name__}: {e}"))
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
