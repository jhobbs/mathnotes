#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Docker-Based Code Coverage Analysis${NC}"
echo -e "${BLUE}========================================${NC}"

# Clean up previous coverage data
echo -e "${YELLOW}Cleaning previous coverage data...${NC}"
rm -rf .coverage* htmlcov coverage.xml unused_lines_*.txt coverage_detailed.txt

# Create a modified Dockerfile for coverage analysis
echo -e "${YELLOW}Creating coverage-enabled Dockerfile...${NC}"
cat > Dockerfile.coverage << 'EOF'
FROM python:3.11-slim as generator

WORKDIR /app

# Install coverage tool
RUN pip install coverage

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy all source code
COPY . .

# Create coverage configuration
RUN echo '[run]' > .coveragerc && \
    echo 'source = mathnotes,scripts,generator' >> .coveragerc && \
    echo 'omit = */tests/*,*/test_*.py,*/__pycache__/*,*/venv/*,*/.venv/*' >> .coveragerc && \
    echo '' >> .coveragerc && \
    echo '[report]' >> .coveragerc && \
    echo 'exclude_lines =' >> .coveragerc && \
    echo '    pragma: no cover' >> .coveragerc && \
    echo '    def __repr__' >> .coveragerc && \
    echo '    raise AssertionError' >> .coveragerc && \
    echo '    raise NotImplementedError' >> .coveragerc && \
    echo '    if __name__ == .__main__.:' >> .coveragerc && \
    echo '    if TYPE_CHECKING:' >> .coveragerc && \
    echo '    @abstractmethod' >> .coveragerc

# Run the build with coverage
RUN coverage run scripts/build_static_simple.py && \
    coverage report --show-missing > /coverage_report.txt && \
    coverage html -d /htmlcov_output && \
    coverage xml -o /coverage.xml && \
    cp .coverage /coverage.data

# Final stage - just to extract coverage results  
FROM alpine:latest
COPY --from=generator /coverage_report.txt /coverage_report.txt
COPY --from=generator /htmlcov_output /htmlcov
COPY --from=generator /coverage.xml /coverage.xml
COPY --from=generator /coverage.data /.coverage
EOF

# Build with production settings
echo -e "${YELLOW}Running production build with coverage...${NC}"
docker build -f Dockerfile.coverage -t coverage-prod . || {
    echo -e "${RED}Production build failed${NC}"
    exit 1
}

# Extract coverage data from production build
echo -e "${YELLOW}Extracting production coverage data...${NC}"
docker create --name coverage-prod-container coverage-prod
docker cp coverage-prod-container:/coverage_report.txt coverage_report_prod.txt
docker cp coverage-prod-container:/.coverage .coverage.prod
docker cp coverage-prod-container:/htmlcov htmlcov_prod
docker rm coverage-prod-container

# Create dev-mode Dockerfile
echo -e "${YELLOW}Creating dev-mode coverage Dockerfile...${NC}"
cat > Dockerfile.coverage.dev << 'EOF'
FROM python:3.11-slim as generator

WORKDIR /app

# Install coverage tool
RUN pip install coverage

# Copy requirements
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy all source code
COPY . .

# Create coverage configuration
RUN echo '[run]' > .coveragerc && \
    echo 'source = mathnotes,scripts,generator' >> .coveragerc && \
    echo 'omit = */tests/*,*/test_*.py,*/__pycache__/*,*/venv/*,*/.venv/*' >> .coveragerc

# Run the build with coverage in DEV mode
ENV DEV_MODE=1
ENV DEVELOPMENT=1
RUN coverage run scripts/build_static_simple.py && \
    coverage report --show-missing > /coverage_report.txt && \
    cp .coverage /coverage.data
EOF

# Build with development settings
echo -e "${YELLOW}Running development build with coverage...${NC}"
docker build -f Dockerfile.coverage.dev -t coverage-dev . || {
    echo -e "${RED}Development build failed${NC}"
    exit 1
}

# Extract coverage data from dev build
echo -e "${YELLOW}Extracting development coverage data...${NC}"
docker create --name coverage-dev-container coverage-dev
docker cp coverage-dev-container:/coverage.data .coverage.dev
docker cp coverage-dev-container:/coverage_report.txt coverage_report_dev.txt
docker rm coverage-dev-container

# Combine coverage data
echo -e "${YELLOW}Combining coverage data from both builds...${NC}"
pip install coverage >/dev/null 2>&1 || true

# Fix paths in coverage data (remove /app/ prefix to match local paths)
echo -e "${YELLOW}Fixing paths in coverage data...${NC}"
python3 << 'EOF'
import sqlite3
import os

# Get the current working directory
cwd = os.getcwd()

for db_file in ['.coverage.prod', '.coverage.dev']:
    if not os.path.exists(db_file):
        print(f"Warning: {db_file} not found")
        continue
    
    print(f"Fixing paths in {db_file}")
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Get all file paths
    cursor.execute("SELECT DISTINCT path FROM file")
    paths = cursor.fetchall()
    
    # Update each path
    for (path,) in paths:
        if path.startswith('/app/'):
            # Remove /app/ prefix and make it relative to current directory
            new_path = path.replace('/app/', cwd + '/')
            cursor.execute("UPDATE file SET path = ? WHERE path = ?", (new_path, path))
    
    conn.commit()
    conn.close()
    print(f"Fixed {len(paths)} paths in {db_file}")
EOF

coverage combine .coverage.prod .coverage.dev

# Generate combined reports
echo -e "${YELLOW}Generating combined coverage reports...${NC}"
coverage report --show-missing > coverage_combined.txt
coverage html
coverage report

# Analyze and report
echo
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Coverage Analysis Complete${NC}"
echo -e "${GREEN}========================================${NC}"
echo
echo "Individual reports:"
echo "  • coverage_report_prod.txt - Production build coverage"
echo "  • coverage_report_dev.txt - Development build coverage"
echo
echo "Combined reports:"
echo "  • coverage_combined.txt - Combined text report"
echo "  • htmlcov/index.html - Interactive HTML report"
echo

# Show summary of files with lowest coverage
echo -e "${YELLOW}Files with lowest coverage:${NC}"
coverage report | sort -t% -k4 -n | head -20

# Clean up temporary files
rm -f Dockerfile.coverage Dockerfile.coverage.dev

echo
echo -e "${GREEN}To view detailed coverage: open htmlcov/index.html${NC}"