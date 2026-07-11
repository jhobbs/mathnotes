"""Tests for mathnotes/notation.py (notation macro registry pre-scan).

Standalone assert script (repo convention; pytest is not installed in the
builder container). Run:

    docker exec -i mathnotes-static-builder python3 - < test/test_notation.py
"""

import os
import sys
import tempfile

try:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
except NameError:
    sys.path.insert(0, "/app")

from mathnotes.notation import (  # noqa: E402
    NotationError,
    get_registry,
    refresh_registry,
    reset_registry,
    scan_content,
    set_registry,
)


def write(tmp, relpath, text):
    path = os.path.join(tmp, relpath)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(text)


def test_scan_finds_declarations():
    with tempfile.TemporaryDirectory() as tmp:
        write(tmp, "a/ints.tex",
              "\\begin{definition}[Integers]\\label{integers}\n"
              "\\notation{\\integers}{\\mathbb{Z}}\n"
              "Body.\n\\end{definition}\n")
        write(tmp, "b/rats.tex",
              "\\begin{definition}[Rationals]\n"
              "\\notation{\\rationals}{\\mathbb{Q}}\n"
              "Body.\n\\end{definition}\n")
        reg = scan_content(tmp)
        assert reg == {"integers": "\\mathbb{Z}", "rationals": "\\mathbb{Q}"}, reg


def test_scan_handles_nested_braces_in_expansion():
    with tempfile.TemporaryDirectory() as tmp:
        write(tmp, "a.tex", "\\notation{\\pow}{\\mathcal{P}\\{x\\}}")
        reg = scan_content(tmp)
        assert reg == {"pow": "\\mathcal{P}\\{x\\}"}, reg


def test_scan_ignores_comments():
    with tempfile.TemporaryDirectory() as tmp:
        write(tmp, "a.tex",
              "% \\notation{\\dead}{X}\n"
              "text 100\\% pure % \\notation{\\alsodead}{Y}\n"
              "\\notation{\\live}{\\mathbb{L}}\n")
        reg = scan_content(tmp)
        assert reg == {"live": "\\mathbb{L}"}, reg


def test_scan_duplicate_is_error_with_both_locations():
    with tempfile.TemporaryDirectory() as tmp:
        write(tmp, "a.tex", "\\notation{\\integers}{\\mathbb{Z}}")
        write(tmp, "b.tex", "\\notation{\\integers}{\\mathbf{Z}}")
        try:
            scan_content(tmp)
            assert False, "expected NotationError for duplicate"
        except NotationError as e:
            assert "integers" in str(e)
            assert "a.tex" in str(e) and "b.tex" in str(e), str(e)


def test_scan_sty_collision_is_error():
    # \grad lives in latex/mathnotes.sty MATH MACROS
    with tempfile.TemporaryDirectory() as tmp:
        write(tmp, "a.tex", "\\notation{\\grad}{\\nabla}")
        try:
            scan_content(tmp)
            assert False, "expected NotationError for .sty collision"
        except NotationError as e:
            assert "grad" in str(e) and "mathnotes.sty" in str(e), str(e)


def test_scan_rejects_notation_macro_inside_expansion():
    with tempfile.TemporaryDirectory() as tmp:
        write(tmp, "a.tex", "\\notation{\\integers}{\\mathbb{Z}}")
        write(tmp, "b.tex", "\\notation{\\intsq}{\\integers^2}")
        try:
            scan_content(tmp)
            assert False, "expected NotationError for nested notation macro"
        except NotationError as e:
            assert "intsq" in str(e) and "integers" in str(e), str(e)


def test_scan_malformed_is_error():
    with tempfile.TemporaryDirectory() as tmp:
        write(tmp, "a.tex", "\\notation{integers}{\\mathbb{Z}}")  # missing backslash
        try:
            scan_content(tmp)
            assert False, "expected NotationError for malformed declaration"
        except NotationError as e:
            assert "a.tex" in str(e), str(e)


def test_registry_lifecycle():
    old_cwd = os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        os.chdir(tmp)
        try:
            write(tmp, "content/a.tex", "\\notation{\\integers}{\\mathbb{Z}}")
            reset_registry()
            assert get_registry() == {"integers": "\\mathbb{Z}"}
            assert refresh_registry() is False  # unchanged
            write(tmp, "content/a.tex", "\\notation{\\integers}{\\mathbf{Z}}")
            assert refresh_registry() is True
            assert get_registry() == {"integers": "\\mathbf{Z}"}
        finally:
            os.chdir(old_cwd)
            reset_registry()


def test_registry_empty_without_content_dir():
    old_cwd = os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        os.chdir(tmp)
        try:
            reset_registry()
            assert get_registry() == {}
        finally:
            os.chdir(old_cwd)
            reset_registry()


def test_set_registry_for_tests():
    set_registry({"foo": "\\mathbb{F}"})
    assert get_registry() == {"foo": "\\mathbb{F}"}
    reset_registry()


if __name__ == "__main__":
    test_scan_finds_declarations()
    print("PASS: scan finds declarations")
    test_scan_handles_nested_braces_in_expansion()
    print("PASS: nested braces in expansion")
    test_scan_ignores_comments()
    print("PASS: comments ignored")
    test_scan_duplicate_is_error_with_both_locations()
    print("PASS: duplicate is loud error")
    test_scan_sty_collision_is_error()
    print("PASS: .sty collision is loud error")
    test_scan_rejects_notation_macro_inside_expansion()
    print("PASS: notation macro inside expansion rejected")
    test_scan_malformed_is_error()
    print("PASS: malformed declaration is loud error")
    test_registry_lifecycle()
    print("PASS: registry lifecycle")
    test_registry_empty_without_content_dir()
    print("PASS: registry empty without content dir")
    test_set_registry_for_tests()
    print("PASS: set_registry test helper")
