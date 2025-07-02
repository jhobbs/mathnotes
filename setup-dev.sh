#!/bin/bash
# Setup script for development environment

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Mathnotes Development Setup ===${NC}"
echo ""

# Check Python version
echo "Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed!${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo -e "${GREEN}Python $PYTHON_VERSION found${NC}"

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment already exists at 'venv'${NC}"
    read -p "Do you want to recreate it? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing existing virtual environment..."
        rm -rf venv
    else
        echo "Using existing virtual environment..."
    fi
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${GREEN}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${GREEN}Activating virtual environment...${NC}"
source venv/bin/activate

# Upgrade pip
echo -e "${GREEN}Upgrading pip...${NC}"
pip install --upgrade pip

# Install development dependencies
echo -e "${GREEN}Installing development dependencies...${NC}"
pip install -r requirements-dev.txt

# Run initial tests to verify setup
echo ""
echo -e "${GREEN}Running tests to verify setup...${NC}"
pytest test/test_math_utils.py -v

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo -e "  1. Activate the virtual environment: ${BLUE}source venv/bin/activate${NC}"
    echo -e "  2. Run tests: ${BLUE}pytest${NC} or ${BLUE}make test${NC}"
    echo -e "  3. Run with coverage: ${BLUE}make coverage${NC}"
    echo -e "  4. Run linting: ${BLUE}make lint${NC}"
    echo -e "  5. Format code: ${BLUE}make format${NC}"
    echo ""
    echo "For Docker-based development:"
    echo -e "  - Build: ${BLUE}docker-compose -f docker-compose.dev.yml build${NC}"
    echo -e "  - Run tests: ${BLUE}./run-tests.sh docker${NC}"
else
    echo ""
    echo -e "${RED}✗ Tests failed. Please check the output above.${NC}"
    exit 1
fi