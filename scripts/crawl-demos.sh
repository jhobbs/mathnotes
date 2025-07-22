#!/bin/bash
# Helper script to run the demo screenshot crawler in the Docker network

# Default to web-dev URL when running in Docker
DEFAULT_URL="http://web-dev:5000"

# Check if --help is requested
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -u, --url <url>         Base URL to crawl (default: $DEFAULT_URL)"
    echo "  -o, --output <dir>      Output directory for screenshots (default: ./demo-screenshots)"
    echo "  --show-browser          Show the browser window"
    echo "  -v, --verbose           Verbose output"
    echo "  -c, --concurrency <n>   Number of concurrent pages (default: 1)"
    echo "  -d, --demo <name>       Capture only a specific demo"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                              # Capture all demo screenshots"
    echo "  $0 -o ./screenshots             # Custom output directory"
    echo "  $0 --demo electric-field        # Capture single demo"
    echo "  $0 -d cellular-automata/game-of-life"
    exit 0
fi

# Build the docker command
DOCKER_CMD="docker-compose -f docker-compose.dev.yml run --rm"

# Mount the output directory as a volume
DOCKER_CMD="$DOCKER_CMD -v \$(pwd)/demo-screenshots:/usr/src/app/crawler/demo-screenshots"

# Run the crawler with all arguments
DOCKER_CMD="$DOCKER_CMD crawler npx tsx crawl-demos.ts"

# Add default URL if not specified
if [[ ! "$*" =~ (--url|-u) ]]; then
    DOCKER_CMD="$DOCKER_CMD --url $DEFAULT_URL"
fi

# Pass all arguments
DOCKER_CMD="$DOCKER_CMD $@"

# Check if verbose mode is requested
VERBOSE=false
for arg in "$@"; do
    if [[ "$arg" == "--verbose" ]] || [[ "$arg" == "-v" ]]; then
        VERBOSE=true
        break
    fi
done

# Only show output in verbose mode
if [[ "$VERBOSE" == "true" ]]; then
    echo "Running demo crawler in Docker..."
    echo "Command: $DOCKER_CMD"
    echo ""
fi

eval $DOCKER_CMD
