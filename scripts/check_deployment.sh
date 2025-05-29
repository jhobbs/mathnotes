#!/bin/bash

# Script to check if the latest git commit is deployed to lacunary.org

# Get the current git commit hash
CURRENT_COMMIT=$(git describe --always --tags --dirty 2>/dev/null || git rev-parse --short HEAD 2>/dev/null)

if [ -z "$CURRENT_COMMIT" ]; then
    echo "Error: Unable to get current git commit hash"
    exit 1
fi

echo "Current local commit: $CURRENT_COMMIT"
echo "Checking deployment status..."

# Check the live site version
# The version is in the footer of mathnotes pages, not the homepage
LIVE_VERSION=$(curl -s https://www.lacunary.org/mathnotes/ | grep -oP 'Version: \K[^<]+' | head -1)

if [ -z "$LIVE_VERSION" ]; then
    echo "Error: Unable to fetch version from live site"
    exit 1
fi

echo "Live site version: $LIVE_VERSION"

# Compare versions
if [ "$CURRENT_COMMIT" = "$LIVE_VERSION" ]; then
    echo "✓ Deployment complete! The live site is running commit $CURRENT_COMMIT"
    exit 0
else
    echo "✗ Deployment pending. Live site is still on version $LIVE_VERSION"
    echo "  Waiting for GitHub Actions to deploy commit $CURRENT_COMMIT"
    exit 1
fi