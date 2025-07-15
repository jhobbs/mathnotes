#!/bin/bash
# Test multi-platform Docker builds locally to reproduce GitHub Actions behavior

set -e

echo "=== Multi-platform Docker Build Test ==="
echo "This script tests building the Docker image for multiple platforms"
echo "to reproduce the GitHub Actions build environment locally."
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Function to check if buildx is available
check_buildx() {
    if docker buildx version &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to setup buildx
setup_buildx() {
    echo -e "${YELLOW}Setting up Docker buildx...${NC}"
    
    # Create a new builder instance
    if docker buildx create --name multiplatform-builder --use &> /dev/null; then
        echo -e "${GREEN}Created new buildx builder: multiplatform-builder${NC}"
    else
        echo -e "${YELLOW}Using existing buildx builder${NC}"
        docker buildx use multiplatform-builder
    fi
    
    # Bootstrap the builder
    docker buildx inspect --bootstrap
}

# Function to build for a specific platform
build_platform() {
    local platform=$1
    local tag=$2
    
    echo -e "\n${YELLOW}Building for platform: $platform${NC}"
    
    if docker buildx build \
        --platform "$platform" \
        --tag "$tag" \
        --load \
        . 2>&1 | tee build-${platform//\//-}.log; then
        echo -e "${GREEN}✓ Build successful for $platform${NC}"
        return 0
    else
        echo -e "${RED}✗ Build failed for $platform${NC}"
        return 1
    fi
}

# Main execution
main() {
    # Check if buildx is available
    if ! check_buildx; then
        echo -e "${RED}Docker buildx is not available.${NC}"
        echo "Please install Docker Desktop or enable experimental features."
        exit 1
    fi
    
    # Setup buildx builder
    setup_buildx
    
    # Get current git commit hash
    COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    
    # Define platforms to test (same as GitHub Actions)
    PLATFORMS=("linux/amd64" "linux/arm64")
    
    # Test single platform builds
    echo -e "\n${YELLOW}Testing individual platform builds...${NC}"
    
    SUCCESS_COUNT=0
    TOTAL_COUNT=${#PLATFORMS[@]}
    
    for platform in "${PLATFORMS[@]}"; do
        tag="ghcr.io/jhobbs/mathnotes:test-${platform//\//-}-${COMMIT_HASH}"
        if build_platform "$platform" "$tag"; then
            ((SUCCESS_COUNT++))
        fi
    done
    
    echo -e "\n${YELLOW}=== Build Summary ===${NC}"
    echo "Successful builds: $SUCCESS_COUNT/$TOTAL_COUNT"
    
    if [ $SUCCESS_COUNT -eq $TOTAL_COUNT ]; then
        echo -e "${GREEN}All platform builds succeeded!${NC}"
        
        # Optionally test multi-platform build
        echo -e "\n${YELLOW}Testing combined multi-platform build...${NC}"
        if docker buildx build \
            --platform linux/amd64,linux/arm64 \
            --tag "ghcr.io/jhobbs/mathnotes:multiplatform-test" \
            . 2>&1 | tee build-multiplatform.log; then
            echo -e "${GREEN}✓ Multi-platform build successful${NC}"
        else
            echo -e "${RED}✗ Multi-platform build failed${NC}"
        fi
    else
        echo -e "${RED}Some platform builds failed. Check the log files for details.${NC}"
        exit 1
    fi
    
    # List built images
    echo -e "\n${YELLOW}Built images:${NC}"
    docker images | grep "mathnotes.*test" | head -5
    
    # Cleanup option
    echo -e "\n${YELLOW}To clean up test images, run:${NC}"
    echo "docker images | grep 'mathnotes.*test' | awk '{print \$3}' | xargs docker rmi"
}

# Run main function
main