#!/usr/bin/env python3
"""
Persistent build watcher that keeps caches warm between rebuilds.
Much faster than spawning a new Python process for each build.
"""

import sys
import os
import time
import logging
import random
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mathnotes.sitegenerator.builder import SiteBuilder
from mathnotes.navigation import clear_navigation_cache
from mathnotes.markdown_processor import clear_markdown_cache

# Configure logging with microsecond precision to debug duplicate output
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter('%(asctime)s.%(msecs)03d - %(name)s - %(levelname)s - %(message)s', datefmt='%H:%M:%S'))
logging.root.addHandler(handler)
logging.root.setLevel(logging.INFO)
logger = logging.getLogger(__name__)

# Process ID for debugging
PROCESS_ID = random.randint(1000, 9999)
logger.info(f"Python watcher starting with debug ID: {PROCESS_ID}")

# Directories to watch for content changes
CONTENT_DIRS = ['content', 'mathnotes', 'templates']
# Signal file that shell script touches after JS/CSS rebuild
JS_REBUILD_SIGNAL = '/tmp/js_rebuild_complete'
# Timestamp file for browser auto-reload (placed outside website dir so it survives clean)
TIMESTAMP_FILE = '/app/static-build/rebuild-timestamp.txt'
EXCLUDED_PATTERNS = {'.swp', '.swo', '.swn', '~', '#'}


def should_ignore(path: str) -> bool:
    """Check if a file should be ignored (swap files, temp files, etc.)"""
    name = os.path.basename(path)
    return any(name.endswith(p) or name.startswith('.#') for p in EXCLUDED_PATTERNS)


def get_mtimes(dirs: list) -> dict:
    """Get modification times for all relevant files."""
    mtimes = {}
    for dir_name in dirs:
        dir_path = Path(dir_name)
        if dir_path.exists():
            for f in dir_path.rglob('*'):
                if f.is_file() and not should_ignore(str(f)):
                    try:
                        mtimes[str(f)] = f.stat().st_mtime
                    except OSError:
                        pass
    return mtimes


def find_changes(old_mtimes: dict, new_mtimes: dict) -> list:
    """Find files that changed between two mtime snapshots."""
    changed = []

    # Check for modified or new files
    for path, mtime in new_mtimes.items():
        if path not in old_mtimes or old_mtimes[path] < mtime:
            changed.append(path)

    # Check for deleted files
    for path in old_mtimes:
        if path not in new_mtimes:
            changed.append(path)

    return changed


def build_site(output_dir: str, builder: SiteBuilder = None) -> SiteBuilder:
    """Build the site, optionally reusing an existing builder."""
    if builder is None:
        # First build - create fresh builder
        logger.info("Creating new SiteBuilder...")
        builder = SiteBuilder(output_dir=output_dir)
    else:
        # Subsequent builds - clear some caches but keep builder
        logger.info("Reusing SiteBuilder, clearing caches...")
        # Clear navigation cache (will be rebuilt quickly)
        clear_navigation_cache()
        # Clear page specs cache so specs are recomputed
        # (markdown rendering cache uses mtime, so only changed files re-render)
        for page in builder.page_registry.pages:
            page._specs_cache = None
        # DON'T clear markdown cache - mtime-based invalidation handles it

    builder.build()
    return builder


def main():
    output_dir = '/app/static-build/website'
    if len(sys.argv) > 2 and sys.argv[1] == '--output':
        output_dir = sys.argv[2]

    logger.info(f"Starting persistent build watcher, output={output_dir}")

    # Initial build
    logger.info("Performing initial build...")
    builder = build_site(output_dir)

    # Write timestamp for browser refresh (outside website dir so it survives clean)
    timestamp_file = Path(TIMESTAMP_FILE)
    timestamp_file.write_text(str(int(time.time())))

    logger.info("Initial build complete, watching for changes...")

    # Get initial file state
    last_mtimes = get_mtimes(CONTENT_DIRS)

    # Track JS rebuild signal file
    js_signal_path = Path(JS_REBUILD_SIGNAL)
    last_js_signal_mtime = 0
    if js_signal_path.exists():
        last_js_signal_mtime = js_signal_path.stat().st_mtime

    # Watch loop with debounce
    pending_changes = []
    last_change_time = 0
    DEBOUNCE_SECONDS = 0.3  # Wait 300ms after last change before building

    while True:
        time.sleep(0.1)  # Check every 100ms

        # Check for content changes
        current_mtimes = get_mtimes(CONTENT_DIRS)
        changed = find_changes(last_mtimes, current_mtimes)

        # Check for JS rebuild signal
        js_rebuild_needed = False
        if js_signal_path.exists():
            current_js_mtime = js_signal_path.stat().st_mtime
            if current_js_mtime > last_js_signal_mtime:
                js_rebuild_needed = True
                last_js_signal_mtime = current_js_mtime

        if changed or js_rebuild_needed:
            if changed:
                pending_changes = changed
            if js_rebuild_needed:
                pending_changes = pending_changes or ['(JS/CSS rebuild)']
                # Random delay to detect duplicate processes
                delay = random.uniform(0.01, 0.05)
                time.sleep(delay)
                logger.info(f"[ID:{PROCESS_ID}] JS/CSS rebuild signal received (delay={delay:.3f}s)")
            last_change_time = time.time()
            last_mtimes = current_mtimes

        # If we have pending changes and enough time has passed, build
        if pending_changes and (time.time() - last_change_time) >= DEBOUNCE_SECONDS:
            delay = random.uniform(0.01, 0.05)
            time.sleep(delay)
            logger.info(f"[ID:{PROCESS_ID}] Changes detected: {len(pending_changes)} item(s) (delay={delay:.3f}s)")
            for f in pending_changes[:5]:  # Show first 5
                logger.info(f"  {f}")
            if len(pending_changes) > 5:
                logger.info(f"  ... and {len(pending_changes) - 5} more")

            try:
                build_start = time.time()
                builder = build_site(output_dir, builder)
                build_time = time.time() - build_start

                # Write timestamp for browser refresh (survives clean since outside website dir)
                Path(TIMESTAMP_FILE).write_text(str(int(time.time())))

                logger.info(f"[ID:{PROCESS_ID}] Rebuild complete in {build_time:.2f}s")
            except Exception as e:
                logger.error(f"Build failed: {e}")

            pending_changes = []
            # Re-get mtimes after build in case more changes happened
            last_mtimes = get_mtimes(CONTENT_DIRS)


if __name__ == '__main__':
    main()
