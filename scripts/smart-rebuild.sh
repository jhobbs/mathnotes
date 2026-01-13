#!/bin/sh

# Debug ID to detect duplicate processes
SHELL_ID=$(head -c 4 /dev/urandom | od -An -tu4 | tr -d ' ' | cut -c1-4)
echo "[SHELL:$SHELL_ID] Shell script starting at $(date +%H:%M:%S.%3N)"

# State files to track last build times
JS_LAST_BUILD="/tmp/js_last_build"
STATIC_LAST_BUILD="/tmp/static_last_build"

# Directories that trigger JavaScript/CSS rebuild
JS_DIRS="demos demos-framework styles"

# Directories that trigger static rebuild (includes JS dirs)
STATIC_DIRS="content mathnotes templates $JS_DIRS"

# Check if any files in given directories are newer than timestamp file
# Sets CHANGED_FILES variable with list of changed files
needs_rebuild() {
    timestamp_file=$1
    shift
    dirs="$@"
    
    # Clear the changed files list
    CHANGED_FILES=""
    
    # If timestamp file doesn't exist, we need to build
    if [ ! -f "$timestamp_file" ]; then
        CHANGED_FILES="(initial build)"
        return 0
    fi
    
    # Check if any file in the directories is newer than our timestamp
    for dir in $dirs; do
        if [ -d "$dir" ]; then
            # Find files newer than our timestamp, excluding swap files and temp files
            new_files=$(find "$dir" -type f -newer "$timestamp_file" \
                ! -name "*.swp" \
                ! -name "*.swo" \
                ! -name "*.swn" \
                ! -name ".*.swp" \
                ! -name ".*.swo" \
                ! -name ".*.swn" \
                ! -name "*~" \
                ! -name ".*~" \
                ! -name "#*#" \
                ! -name ".#*" \
                2>/dev/null | head -10)
            if [ -n "$new_files" ]; then
                CHANGED_FILES="$CHANGED_FILES$new_files
"
            fi
        fi
    done
    
    # If we found any changed files, return 0 (needs rebuild)
    if [ -n "$CHANGED_FILES" ]; then
        return 0
    fi
    
    return 1
}

# Initial setup
mkdir -p /version
git describe --always --tags > /version/version.txt || echo "unknown" > /version/version.txt
mkdir -p /app/static-build

# Initial JS/CSS build
echo "[$(date)] Initial build starting..."
echo "[$(date)] Running TypeScript type check..."
npm run type-check || { echo "[$(date)] TypeScript type check failed!"; exit 1; }
npm run build
touch "$JS_LAST_BUILD"
echo "[$(date)] JS/CSS build complete"

# Start Python watcher in background for content changes
# This keeps the site builder warm between rebuilds for fast incremental builds
echo "[$(date)] Starting persistent Python watcher..."
python scripts/watch_and_build.py --output /app/static-build/website &
PYTHON_PID=$!

# Trap to kill Python watcher on exit
trap "kill $PYTHON_PID 2>/dev/null" EXIT

# Main loop - only handles JS/CSS rebuilds now
# Content rebuilds are handled by the Python watcher
while true; do
    sleep 0.1  # Check every 100ms for near-instant rebuilds

    # Check if JavaScript/CSS needs rebuilding
    if needs_rebuild "$JS_LAST_BUILD" $JS_DIRS; then
        # Small random delay to detect duplicate processes
        sleep 0.0$(head -c 2 /dev/urandom | od -An -tu2 | tr -d ' ' | cut -c1-2)
        echo "[SHELL:$SHELL_ID] $(date +%H:%M:%S.%3N) JavaScript/CSS source changes detected:"
        echo "$CHANGED_FILES" | sed 's/^/  /'
        echo "[SHELL:$SHELL_ID] Running TypeScript type check..."
        npm run type-check || { echo "[$(date)] TypeScript type check failed!"; continue; }
        echo "Rebuilding JavaScript/CSS bundles..."
        npm run build
        touch "$JS_LAST_BUILD"
        # Signal Python watcher that JS/CSS rebuild is complete
        touch /tmp/js_rebuild_complete
        echo "[SHELL:$SHELL_ID] $(date +%H:%M:%S.%3N) JS/CSS rebuild complete"
    fi

    # Check if Python watcher is still running
    if ! kill -0 $PYTHON_PID 2>/dev/null; then
        echo "[$(date)] Python watcher died, restarting..."
        python scripts/watch_and_build.py --output /app/static-build/website &
        PYTHON_PID=$!
    fi
done
