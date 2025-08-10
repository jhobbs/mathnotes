#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Docker-Based Code Coverage Analysis${NC}"
echo -e "${BLUE}with Branch Coverage Analysis${NC}"
echo -e "${BLUE}========================================${NC}"

# Clean up previous coverage data
echo -e "${YELLOW}Cleaning previous coverage data...${NC}"
rm -rf .coverage* htmlcov coverage.xml unused_lines_*.txt coverage_detailed.txt branch_analysis.txt

# Create a modified Dockerfile for coverage analysis (includes full build)
echo -e "${YELLOW}Creating coverage-enabled Dockerfile with branch coverage...${NC}"
cat > Dockerfile.coverage << 'EOF'
# Stage 1: Get git version (same as production)
FROM alpine/git:latest AS version
WORKDIR /app
COPY .git .git
RUN git describe --always --tags > /version.txt || echo "unknown" > /version.txt

# Stage 2: Node environment for building assets with esbuild (same as production)
FROM node:24-alpine AS esbuild-builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY esbuild.config.js ./
COPY postcss.config.js ./
RUN npm ci
COPY demos-framework/ ./demos-framework/
COPY styles/ ./styles/
COPY demos/ ./demos/
RUN npm run build

# Stage 3: Python environment with coverage
FROM python:3.12-slim AS generator
WORKDIR /app

# Install coverage tool
RUN pip install coverage

# Copy version from first stage
COPY --from=version /version.txt /version/version.txt

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY mathnotes/ ./mathnotes/
COPY content/ ./content/
COPY templates/ ./templates/
COPY scripts/build_static_simple.py ./scripts/
COPY favicon.ico robots.txt ./

# Copy esbuild output from the esbuild-builder stage
COPY --from=esbuild-builder /app/static/dist ./static/dist

# Create coverage configuration with branch coverage enabled
RUN echo '[run]' > .coveragerc && \
    echo 'branch = True' >> .coveragerc && \
    echo 'source = mathnotes,scripts' >> .coveragerc && \
    echo 'omit = */tests/*,*/test_*.py,*/__pycache__/*,*/venv/*,*/.venv/*' >> .coveragerc && \
    echo '' >> .coveragerc && \
    echo '[report]' >> .coveragerc && \
    echo 'show_missing = True' >> .coveragerc && \
    echo 'exclude_lines =' >> .coveragerc && \
    echo '    pragma: no cover' >> .coveragerc && \
    echo '    def __repr__' >> .coveragerc && \
    echo '    raise AssertionError' >> .coveragerc && \
    echo '    raise NotImplementedError' >> .coveragerc && \
    echo '    if __name__ == .__main__.:' >> .coveragerc && \
    echo '    if TYPE_CHECKING:' >> .coveragerc && \
    echo '    @abstractmethod' >> .coveragerc && \
    echo '' >> .coveragerc && \
    echo '[html]' >> .coveragerc && \
    echo 'show_contexts = True' >> .coveragerc

# Run the build with branch coverage
RUN coverage run --branch scripts/build_static_simple.py && \
    coverage report --show-missing > /coverage_report.txt && \
    coverage html -d /htmlcov_output && \
    coverage xml -o /coverage.xml && \
    coverage json -o /coverage.json && \
    cp .coverage /coverage.data

# Final stage - just to extract coverage results  
FROM alpine:latest
COPY --from=generator /coverage_report.txt /coverage_report.txt
COPY --from=generator /htmlcov_output /htmlcov
COPY --from=generator /coverage.xml /coverage.xml
COPY --from=generator /coverage.json /coverage.json
COPY --from=generator /coverage.data /.coverage
EOF

# Build with production settings
echo -e "${YELLOW}Running production build with branch coverage...${NC}"
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
docker cp coverage-prod-container:/coverage.json coverage_prod.json
docker rm coverage-prod-container

# Create dev-mode Dockerfile (also with full build)
echo -e "${YELLOW}Creating dev-mode coverage Dockerfile with branch coverage...${NC}"
cat > Dockerfile.coverage.dev << 'EOF'
# Dev mode also includes full build process
FROM alpine/git:latest AS version
WORKDIR /app
COPY .git .git
RUN git describe --always --tags --dirty > /version.txt || echo "unknown" > /version.txt

FROM node:24-alpine AS esbuild-builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY esbuild.config.js ./
COPY postcss.config.js ./
RUN npm ci
COPY demos-framework/ ./demos-framework/
COPY styles/ ./styles/
COPY demos/ ./demos/
# Dev mode build (might have different settings)
ENV NODE_ENV=development
RUN npm run build

FROM python:3.12-slim as generator
WORKDIR /app

# Install coverage tool
RUN pip install coverage

# Copy version
COPY --from=version /version.txt /version/version.txt

# Copy requirements
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy all source code
COPY mathnotes/ ./mathnotes/
COPY content/ ./content/
COPY templates/ ./templates/
COPY scripts/build_static_simple.py ./scripts/
COPY favicon.ico robots.txt ./

# Copy esbuild output
COPY --from=esbuild-builder /app/static/dist ./static/dist

# Create coverage configuration with branch coverage
RUN echo '[run]' > .coveragerc && \
    echo 'branch = True' >> .coveragerc && \
    echo 'source = mathnotes,scripts' >> .coveragerc && \
    echo 'omit = */tests/*,*/test_*.py,*/__pycache__/*,*/venv/*,*/.venv/*' >> .coveragerc

# Run the build with coverage in DEV mode
ENV DEV_MODE=1
ENV DEVELOPMENT=1
RUN coverage run --branch scripts/build_static_simple.py && \
    coverage report --show-missing > /coverage_report.txt && \
    coverage json -o /coverage.json && \
    cp .coverage /coverage.data
EOF

# Build with development settings
echo -e "${YELLOW}Running development build with branch coverage...${NC}"
docker build -f Dockerfile.coverage.dev -t coverage-dev . || {
    echo -e "${RED}Development build failed${NC}"
    exit 1
}

# Extract coverage data from dev build
echo -e "${YELLOW}Extracting development coverage data...${NC}"
docker create --name coverage-dev-container coverage-dev
docker cp coverage-dev-container:/coverage.data .coverage.dev
docker cp coverage-dev-container:/coverage_report.txt coverage_report_dev.txt
docker cp coverage-dev-container:/coverage.json coverage_dev.json
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

# Generate combined reports with branch coverage
echo -e "${YELLOW}Generating combined coverage reports with branch analysis...${NC}"
coverage report --show-missing > coverage_combined.txt
coverage html
coverage json -o coverage_combined.json
coverage report

# Analyze branch coverage to find single-sided conditionals
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Analyzing Branch Coverage${NC}"
echo -e "${CYAN}Finding conditionals that only evaluate one way...${NC}"
echo -e "${CYAN}========================================${NC}"

python3 << 'EOF'
import json
import os
from collections import defaultdict

# Load the combined coverage JSON
with open('coverage_combined.json', 'r') as f:
    coverage_data = json.load(f)

# Track single-sided branches
single_sided_branches = defaultdict(list)
partial_branches = defaultdict(list)
never_taken_branches = defaultdict(list)

# Analyze each file
for filepath, file_data in coverage_data['files'].items():
    # Skip if no branch data
    if 'executed_branches' not in file_data or 'missing_branches' not in file_data:
        continue
    
    executed = file_data['executed_branches']
    missing = file_data['missing_branches']
    
    # Convert to sets for easier analysis
    executed_set = set(tuple(b) for b in executed)
    missing_set = set(tuple(b) for b in missing)
    
    # Group branches by line number
    branches_by_line = defaultdict(set)
    for branch in executed_set:
        line_num = branch[0]
        branches_by_line[line_num].add(('executed', branch))
    
    for branch in missing_set:
        line_num = branch[0]
        branches_by_line[line_num].add(('missing', branch))
    
    # Analyze each line with branches
    for line_num, branches in branches_by_line.items():
        executed_from_line = [b for status, b in branches if status == 'executed']
        missing_from_line = [b for status, b in branches if status == 'missing']
        
        # If a line has both executed and missing branches, it's a partial branch
        if executed_from_line and missing_from_line:
            # This is a conditional where only one path was taken
            single_sided_branches[filepath].append({
                'line': line_num,
                'executed_branches': executed_from_line,
                'missing_branches': missing_from_line,
                'total_branches': len(executed_from_line) + len(missing_from_line)
            })
        elif missing_from_line and not executed_from_line:
            # Branches that were never taken at all
            never_taken_branches[filepath].append({
                'line': line_num,
                'missing_branches': missing_from_line
            })

# Write analysis report
with open('branch_analysis.txt', 'w') as f:
    f.write("=" * 80 + "\n")
    f.write("BRANCH COVERAGE ANALYSIS REPORT\n")
    f.write("=" * 80 + "\n\n")
    
    # Summary statistics
    total_single_sided = sum(len(v) for v in single_sided_branches.values())
    total_never_taken = sum(len(v) for v in never_taken_branches.values())
    
    f.write("SUMMARY\n")
    f.write("-" * 40 + "\n")
    f.write(f"Files with single-sided conditionals: {len(single_sided_branches)}\n")
    f.write(f"Total single-sided conditionals: {total_single_sided}\n")
    f.write(f"Total never-executed branches: {total_never_taken}\n\n")
    
    # Single-sided conditionals (the main focus)
    f.write("=" * 80 + "\n")
    f.write("SINGLE-SIDED CONDITIONALS\n")
    f.write("(Conditionals where only one branch was executed)\n")
    f.write("=" * 80 + "\n\n")
    
    if single_sided_branches:
        for filepath in sorted(single_sided_branches.keys()):
            # Make path relative for readability
            display_path = filepath.replace(os.getcwd() + '/', '')
            f.write(f"\n{display_path}\n")
            f.write("-" * len(display_path) + "\n")
            
            for branch_info in sorted(single_sided_branches[filepath], key=lambda x: x['line']):
                line = branch_info['line']
                executed = branch_info['executed_branches']
                missing = branch_info['missing_branches']
                
                f.write(f"  Line {line}: ")
                
                # Try to determine the type of branch
                if len(missing) == 1 and len(executed) == 1:
                    # Likely an if/else where only one path was taken
                    f.write("IF statement - only ")
                    if missing[0][1] == 0:
                        f.write("TRUE branch executed (FALSE never taken)")
                    else:
                        f.write("FALSE branch executed (TRUE never taken)")
                else:
                    # More complex branching
                    f.write(f"{len(executed)} of {branch_info['total_branches']} branches executed")
                
                f.write(f"\n")
                f.write(f"    Executed: {executed}\n")
                f.write(f"    Missing:  {missing}\n")
    else:
        f.write("No single-sided conditionals found.\n")
    
    # Never-taken branches
    if never_taken_branches:
        f.write("\n" + "=" * 80 + "\n")
        f.write("NEVER-EXECUTED BRANCHES\n")
        f.write("(Branches that were never entered)\n")
        f.write("=" * 80 + "\n\n")
        
        for filepath in sorted(never_taken_branches.keys()):
            display_path = filepath.replace(os.getcwd() + '/', '')
            f.write(f"\n{display_path}\n")
            f.write("-" * len(display_path) + "\n")
            
            for branch_info in sorted(never_taken_branches[filepath], key=lambda x: x['line']):
                line = branch_info['line']
                missing = branch_info['missing_branches']
                f.write(f"  Line {line}: {len(missing)} branches never executed\n")

print("\nBranch analysis written to: branch_analysis.txt")

# Also print a summary to console
print("\n" + "=" * 60)
print("BRANCH COVERAGE SUMMARY")
print("=" * 60)
print(f"Single-sided conditionals found: {total_single_sided}")
print(f"Files affected: {len(single_sided_branches)}")

if total_single_sided > 0:
    print("\nTop files with single-sided conditionals:")
    sorted_files = sorted(single_sided_branches.items(), key=lambda x: len(x[1]), reverse=True)[:5]
    for filepath, branches in sorted_files:
        display_path = filepath.replace(os.getcwd() + '/', '')
        print(f"  {display_path}: {len(branches)} conditionals")

print("\nDetailed analysis saved to: branch_analysis.txt")
EOF

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
echo "  • htmlcov/index.html - Interactive HTML report with branch visualization"
echo
echo -e "${MAGENTA}Branch analysis:${NC}"
echo "  • branch_analysis.txt - Detailed analysis of single-sided conditionals"
echo

# Show summary of files with lowest coverage
echo -e "${YELLOW}Files with lowest coverage:${NC}"
coverage report | sort -t% -k4 -n | head -20

# Clean up temporary files
rm -f Dockerfile.coverage Dockerfile.coverage.dev

echo
echo -e "${GREEN}To view detailed coverage: open htmlcov/index.html${NC}"
echo -e "${MAGENTA}To view branch analysis: cat branch_analysis.txt${NC}"