#!/bin/bash
# Script to run tests easily

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Running Mathnotes Tests..."

# Function to detect and activate virtual environment
activate_venv() {
    if [ -n "$VIRTUAL_ENV" ]; then
        echo -e "${GREEN}Already in virtual environment: $VIRTUAL_ENV${NC}"
        return 0
    fi
    
    # Check common venv locations
    for venv_dir in venv .venv env; do
        if [ -f "$venv_dir/bin/activate" ]; then
            echo -e "${GREEN}Activating virtual environment: $venv_dir${NC}"
            source "$venv_dir/bin/activate"
            return 0
        fi
    done
    
    echo -e "${YELLOW}No virtual environment found. Tests may fail if dependencies are not installed.${NC}"
    echo -e "${YELLOW}Consider creating one with: python -m venv venv${NC}"
    return 1
}

# Default to running all tests
TEST_CMD="pytest"

# Check for arguments
if [ "$1" = "unit" ]; then
    echo "Running unit tests only..."
    TEST_CMD="pytest test/test_math_utils.py -v"
elif [ "$1" = "coverage" ]; then
    echo "Running tests with coverage..."
    TEST_CMD="pytest --cov=mathnotes --cov-report=term-missing"
elif [ "$1" = "tox" ]; then
    echo "Running tests with tox..."
    TEST_CMD="tox"
elif [ "$1" = "lint" ]; then
    echo "Running linting checks..."
    TEST_CMD="flake8 mathnotes test"
elif [ "$1" = "format" ]; then
    echo "Running code formatting..."
    TEST_CMD="black mathnotes test"
elif [ "$1" = "docker" ]; then
    echo -e "${GREEN}Forcing Docker mode...${NC}"
    FORCE_DOCKER=1
elif [ "$1" = "help" ]; then
    echo "Usage: ./run-tests.sh [command]"
    echo "Commands:"
    echo "  unit      - Run unit tests only"
    echo "  coverage  - Run tests with coverage report"
    echo "  tox       - Run tests with tox"
    echo "  lint      - Run linting checks"
    echo "  format    - Format code with black"
    echo "  docker    - Force running in Docker"
    echo "  help      - Show this help message"
    echo ""
    echo "No command runs all tests with pytest"
    exit 0
fi

# Check if we should use Docker
USE_DOCKER=0
if [ -f "docker-compose.dev.yml" ] && [ "$FORCE_DOCKER" = "1" ]; then
    USE_DOCKER=1
elif [ -f "docker-compose.dev.yml" ] && ! command -v pytest &> /dev/null; then
    echo -e "${YELLOW}pytest not found locally, will use Docker...${NC}"
    USE_DOCKER=1
fi

# Run tests
if [ $USE_DOCKER -eq 1 ]; then
    echo -e "${GREEN}Running in Docker...${NC}"
    docker-compose -f docker-compose.dev.yml run --rm web-dev $TEST_CMD
else
    echo -e "${GREEN}Running locally...${NC}"
    
    # Try to activate virtual environment
    activate_venv
    
    # Check if pytest is available
    if ! command -v pytest &> /dev/null; then
        echo -e "${RED}Error: pytest not found!${NC}"
        echo "Please either:"
        echo "  1. Create and activate a virtual environment: python -m venv venv && source venv/bin/activate"
        echo "  2. Install dev dependencies: pip install -r requirements-dev.txt"
        echo "  3. Run with Docker: ./run-tests.sh docker"
        exit 1
    fi
    
    # Run the test command
    $TEST_CMD
fi