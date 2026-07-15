"""Configuration for the mathnotes site."""

from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parent.parent

# Production base URL
BASE_URL = "https://lacunary.org"


def configure_latexblocks():
    """Point latexblocks at this site's layout. Absolute sty and
    node_modules paths: tests and the watcher chdir into tempdirs, so the
    MathML worker (which resolves the mathjax npm package from
    node_modules_dir) and the macro package must be anchored at the repo
    root, not cwd. content_dir must stay relative ("content") for exactly
    that reason."""
    import latexblocks

    latexblocks.configure(
        url_prefix="/mathnotes",
        content_dir="content",
        sty_path=str(_REPO_ROOT / "latex" / "mathnotes.sty"),
        notation_sty_path=str(_REPO_ROOT / "latex" / "mathnotes-notation.sty"),
        node_modules_dir=str(_REPO_ROOT),
    )

# Content directories
CONTENT_DIRS = [
    "content/algebra",
    "content/analysis",
    "content/applied-math",
    "content/geometry",
    "content/topology",
    "content/discrete-math",
    "content/foundations",
    "content/test",
]
