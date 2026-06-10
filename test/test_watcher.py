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

from watch_and_build import requires_restart, should_ignore


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


if __name__ == "__main__":
    test_python_source_changes_require_restart()
    print("PASS: python source changes require restart")
    test_content_and_template_changes_rebuild_in_process()
    print("PASS: content/template changes rebuild in process")
    test_bytecode_churn_is_ignored()
    print("PASS: bytecode churn is ignored")
