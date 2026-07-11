"""Tests for the dev build watcher's change classification.

Python source changes can't be applied by an in-process rebuild (modules are
already imported), so the watcher must restart itself for those. Compiled
bytecode churn must be ignored entirely.

Run standalone (no pytest needed):
    python3 test/test_watcher.py
or inside the dev builder container:
    docker exec -i -w /app mathnotes-static-builder python3 - < test/test_watcher.py
"""

import os
import sys

_candidates = [os.getcwd()]  # running via stdin; cwd must be the repo/app root
try:
    _candidates.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
except NameError:
    pass
for _root in _candidates:
    if os.path.isdir(os.path.join(_root, "scripts")):
        sys.path.insert(0, os.path.join(_root, "scripts"))
        break

from watch_and_build import (
    requires_restart, should_ignore, snapshot_then_build, initial_build_with_retry,
)


def test_python_source_changes_require_restart():
    assert requires_restart(["mathnotes/block_index.py"])
    assert requires_restart(["content/foo.md", "mathnotes/config.py"])


def test_content_and_template_changes_rebuild_in_process():
    assert not requires_restart(["content/algebra/groups.md"])
    assert not requires_restart(["templates/base.html"])
    assert not requires_restart([])


def test_bytecode_churn_is_ignored():
    assert should_ignore("mathnotes/__pycache__/block_index.cpython-313.pyc")
    assert should_ignore("mathnotes/sitegenerator/__pycache__/builder.cpython-313.pyc")
    assert not should_ignore("mathnotes/block_index.py")
    assert not should_ignore("content/algebra/groups.md")


def test_sty_changes_require_restart():
    """latex_processor (PRE-EXPANSION MACROS) and the MathML worker (MATH
    MACROS) each read mathnotes.sty once per process, so an in-process
    rebuild would keep serving stale macros — .sty changes must re-exec."""
    assert requires_restart(["latex/mathnotes.sty"])


def test_latex_dir_is_watched():
    import watch_and_build as wb
    assert "latex" in wb.CONTENT_DIRS


def test_generated_notation_sty_is_ignored():
    """mathnotes-notation.sty is written BY the build (like a lockfile);
    reacting to it would restart the watcher after every notation change."""
    assert should_ignore("latex/mathnotes-notation.sty")
    assert not should_ignore("latex/mathnotes.sty")


def test_changes_landing_during_a_build_surface_afterward():
    """The snapshot must be taken BEFORE the build: a file that changes
    while the build runs has to show up as a diff on the next poll (at
    worst one redundant rebuild) instead of being absorbed into a
    post-build snapshot and lost."""
    import tempfile
    import time
    import watch_and_build as wb

    with tempfile.TemporaryDirectory() as td:
        f = os.path.join(td, "page.tex")
        with open(f, "w") as fh:
            fh.write("v1")

        orig_dirs, orig_build = wb.CONTENT_DIRS, wb.build_site

        def build_that_races(output_dir, builder=None):
            # a change lands while the build is running
            future = time.time() + 5
            os.utime(f, (future, future))
            return "fake-builder"

        wb.CONTENT_DIRS = [td]
        wb.build_site = build_that_races
        try:
            builder, snapshot = wb.snapshot_then_build("/tmp/unused")
            assert builder == "fake-builder"
            changed = wb.find_changes(snapshot, wb.get_mtimes(wb.CONTENT_DIRS))
            assert f in changed, "mid-build change was swallowed by the snapshot"
        finally:
            wb.CONTENT_DIRS, wb.build_site = orig_dirs, orig_build


def test_startup_snapshot_precedes_heavy_imports():
    """The watcher's baseline snapshot must be captured before the
    mathnotes imports load build code: a .py file replaced while those
    imports run must register as a change on the first poll, or the
    process runs stale code forever believing it is current (the
    2026-07-10 checkout/merge race)."""
    import inspect
    import watch_and_build as wb

    assert isinstance(wb.STARTUP_MTIMES, dict) and wb.STARTUP_MTIMES
    src = inspect.getsource(wb)
    assert src.index("STARTUP_MTIMES = get_mtimes(") < src.index("from mathnotes"), \
        "STARTUP_MTIMES must be captured before the mathnotes imports"
    # and main() must actually seed the watch loop from it
    main_src = inspect.getsource(wb.main)
    assert "STARTUP_MTIMES" in main_src


def test_failed_initial_build_reexecs_when_python_changed_since_startup():
    """If the initial build fails and a .py changed after this process
    imported its code (a mid-edit import), an in-process retry would rerun
    the same stale modules forever — the watcher must re-exec instead."""
    import logging
    import tempfile
    import watch_and_build as wb

    class Reexeced(Exception):
        pass

    def fake_reexec():
        raise Reexeced

    def failing_build(output_dir, builder=None):
        raise RuntimeError("boom")

    with tempfile.TemporaryDirectory() as td:
        py = os.path.join(td, "mod.py")
        with open(py, "w") as fh:
            fh.write("x = 1")

        orig = (wb.CONTENT_DIRS, wb.build_site, wb.STARTUP_MTIMES, wb._reexec)
        wb.CONTENT_DIRS = [td]
        wb.STARTUP_MTIMES = {}  # mod.py appeared after this process started
        wb.build_site = failing_build
        wb._reexec = fake_reexec
        logging.disable(logging.CRITICAL)
        try:
            try:
                initial_build_with_retry("/tmp/unused")
                assert False, "expected re-exec"
            except Reexeced:
                pass
        finally:
            logging.disable(logging.NOTSET)
            wb.CONTENT_DIRS, wb.build_site, wb.STARTUP_MTIMES, wb._reexec = orig


if __name__ == "__main__":
    test_python_source_changes_require_restart()
    print("PASS: python source changes require restart")
    test_content_and_template_changes_rebuild_in_process()
    print("PASS: content/template changes rebuild in process")
    test_bytecode_churn_is_ignored()
    print("PASS: bytecode churn is ignored")
    test_sty_changes_require_restart()
    print("PASS: sty changes require restart")
    test_latex_dir_is_watched()
    print("PASS: latex dir is watched")
    test_generated_notation_sty_is_ignored()
    print("PASS: generated notation sty is ignored")
    test_changes_landing_during_a_build_surface_afterward()
    print("PASS: mid-build changes surface after the build")
    test_startup_snapshot_precedes_heavy_imports()
    print("PASS: startup snapshot precedes heavy imports")
    test_failed_initial_build_reexecs_when_python_changed_since_startup()
    print("PASS: failed initial build re-execs on stale python")
