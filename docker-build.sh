#!/bin/bash
# Get git version
GIT_VERSION=$(git describe --always --tags --dirty 2>/dev/null || echo "unknown")

# Export for docker-compose build
export GIT_VERSION

# Build with docker-compose
docker-compose build "$@"

echo "Built with GIT_VERSION=${GIT_VERSION} baked into image"