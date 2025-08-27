#!/bin/sh

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

# Initial build
echo "[$(date)] Initial build starting..."
# Run TypeScript type check first
echo "[$(date)] Running TypeScript type check..."
npm run type-check || { echo "[$(date)] TypeScript type check failed!"; exit 1; }
npm run build
touch "$JS_LAST_BUILD"
python scripts/build_static_simple.py --output /app/static-build/website
touch "$STATIC_LAST_BUILD"
# Write initial timestamp for browser auto-refresh
date +%s > /app/static-build/website/rebuild-timestamp.txt
echo "[$(date)] Initial build complete"

# Main loop
while true; do
    sleep 0.1  # Check every 100ms for near-instant rebuilds
    
    # Check if JavaScript/CSS needs rebuilding
    if needs_rebuild "$JS_LAST_BUILD" $JS_DIRS; then
        echo "[$(date)] JavaScript/CSS source changes detected:"
        echo "$CHANGED_FILES" | sed 's/^/  /'
        echo "Running TypeScript type check..."
        npm run type-check || { echo "[$(date)] TypeScript type check failed!"; exit 1; }
        echo "Rebuilding JavaScript/CSS bundles..."
        npm run build
        touch "$JS_LAST_BUILD"
        # Force static rebuild since bundled output changed
        rm -f "$STATIC_LAST_BUILD"
        # Write timestamp for browser auto-refresh (JS/CSS changes)
        date +%s > /app/static-build/website/rebuild-timestamp.txt
    fi
    
    # Check if static site needs rebuilding
    if needs_rebuild "$STATIC_LAST_BUILD" $STATIC_DIRS; then
        echo "[$(date)] Content changes detected:"
        echo "$CHANGED_FILES" | sed 's/^/  /'
        echo "Rebuilding static site..."
        python scripts/build_static_simple.py --output /app/static-build/website
        touch "$STATIC_LAST_BUILD"
        # Write timestamp for browser auto-refresh
        date +%s > /app/static-build/website/rebuild-timestamp.txt
    fi
done
