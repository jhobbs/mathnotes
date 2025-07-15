#!/bin/bash
# Test Docker build with the same configuration as GitHub Actions

set -e

echo "=== GitHub Actions Build Test ==="
echo "This script tests the Docker build with settings similar to GitHub Actions"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get metadata like GitHub Actions
COMMIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "0000000000000000000000000000000000000000")
COMMIT_SHORT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")

echo "Build metadata:"
echo "  Commit: $COMMIT_SHA"
echo "  Branch: $BRANCH"
echo "  Timestamp: $TIMESTAMP"
echo

# Build with labels like GitHub Actions
echo -e "${YELLOW}Building Docker image with GitHub Actions configuration...${NC}"

docker build \
  --label org.opencontainers.image.created="$TIMESTAMP" \
  --label org.opencontainers.image.description="" \
  --label org.opencontainers.image.licenses="" \
  --label org.opencontainers.image.revision="$COMMIT_SHA" \
  --label org.opencontainers.image.source="https://github.com/jhobbs/mathnotes" \
  --label org.opencontainers.image.title="mathnotes" \
  --label org.opencontainers.image.url="https://github.com/jhobbs/mathnotes" \
  --label org.opencontainers.image.version="$BRANCH" \
  --tag "ghcr.io/jhobbs/mathnotes:$BRANCH" \
  --tag "ghcr.io/jhobbs/mathnotes:latest" \
  --tag "ghcr.io/jhobbs/mathnotes:$BRANCH-$COMMIT_SHORT" \
  . 2>&1 | tee build-github-test.log

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "\n${GREEN}✓ Build successful!${NC}"
    echo -e "\nBuilt images:"
    docker images | grep ghcr.io/jhobbs/mathnotes | head -5
    
    echo -e "\n${YELLOW}To test the image:${NC}"
    echo "docker run -p 5001:5001 ghcr.io/jhobbs/mathnotes:$BRANCH"
    
    echo -e "\n${YELLOW}To inspect image metadata:${NC}"
    echo "docker inspect ghcr.io/jhobbs/mathnotes:$BRANCH | jq '.[0].Config.Labels'"
else
    echo -e "\n${RED}✗ Build failed!${NC}"
    echo "Check build-github-test.log for details"
    exit 1
fi