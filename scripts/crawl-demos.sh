#!/bin/bash -x
# Helper script to run the demo screenshot crawler in the Docker network

# Default to web-dev URL when running in Docker
DEFAULT_URL="http://web-dev:5000"

GEMINI="/home/jason/.claude/local/claude --model opus" #/home/jason/.claude/local/claude --model opus" # -m gemini-2.5-flash"

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
    echo "  --describe              Get AI description of base screenshot after capture"
    echo "  --ask <question>        Ask a custom question about the screenshots"
    echo "                          Use \$BASE_PATH, \$FULL_PATH, or \$CANVAS_PATH in questions"
    echo "  --check-standards       Check if demo meets standards in DEMO-STANDARD.md"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                              # Capture all demo screenshots"
    echo "  $0 -o ./screenshots             # Custom output directory"
    echo "  $0 --demo electric-field        # Capture single demo"
    echo "  $0 -d game-of-life --describe"
    echo "  $0 -d pendulum --ask 'what physics concepts are illustrated?'"
    echo "  $0 -d pendulum --check-standards"
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

# Parse options
VERBOSE=false
DESCRIBE=false
ASK_QUESTION=""
CHECK_STANDARDS=false

# Convert arguments to array for easier parsing
ARGS=("$@")

for ((i=0; i<${#ARGS[@]}; i++)); do
    arg="${ARGS[i]}"
    if [[ "$arg" == "--verbose" ]] || [[ "$arg" == "-v" ]]; then
        VERBOSE=true
    elif [[ "$arg" == "--describe" ]]; then
        DESCRIBE=true
    elif [[ "$arg" == "--ask" ]]; then
        # Get the next argument as the question
        if [[ $((i + 1)) -lt ${#ARGS[@]} ]]; then
            ASK_QUESTION="${ARGS[$((i + 1))]}"
            ((i++)) # Skip the next argument
        fi
    elif [[ "$arg" == "--check-standards" ]]; then
        CHECK_STANDARDS=true
    fi
done

# Only show output in verbose mode
if [[ "$VERBOSE" == "true" ]]; then
    echo "Running demo crawler in Docker..."
    echo "Command: $DOCKER_CMD"
    echo ""
fi

# Run the crawler and capture output if we need to describe or ask or check standards
if [[ "$DESCRIBE" == "true" ]] || [[ -n "$ASK_QUESTION" ]] || [[ "$CHECK_STANDARDS" == "true" ]]; then
    # Capture the output to parse the screenshot paths
    OUTPUT=$(eval $DOCKER_CMD 2>&1)
    
    # Extract the screenshot paths from the output
    BASE_PATH=$(echo "$OUTPUT" | grep "^base: " | tail -1 | cut -d' ' -f2)
    FULL_PATH=$(echo "$OUTPUT" | grep "^full: " | tail -1 | cut -d' ' -f2)
    CANVAS_PATH=$(echo "$OUTPUT" | grep "^canvas: " | tail -1 | cut -d' ' -f2)
    
    if [[ -n "$BASE_PATH" ]] && [[ -f "$BASE_PATH" ]]; then
        if [[ "$DESCRIBE" == "true" ]]; then
            # Simple description mode
            $GEMINI -p "describe what you see in @$BASE_PATH"
            GEMINI_EXIT_CODE=$?
        elif [[ "$CHECK_STANDARDS" == "true" ]]; then
            # Check standards mode
            STANDARDS_FILE="/home/jason/mathnotes/DEMO-STANDARD.md"
            $GEMINI -p "You're a multimodal model. You can process images and answer questions about them. The file @$STANDARDS_FILE defines the dashed rectangle as the canvas. Analyze how the drawing elements interact with this specific border. Does the demo in @$CANVAS_PATH meet the standards? Be very thorough and precise in your measurements."
            GEMINI_EXIT_CODE=$?
        else
            # Custom question mode - replace placeholders
            QUESTION="$ASK_QUESTION"
            QUESTION="${QUESTION//\$BASE_PATH/$BASE_PATH}"
            QUESTION="${QUESTION//\$FULL_PATH/$FULL_PATH}"
            QUESTION="${QUESTION//\$CANVAS_PATH/$CANVAS_PATH}"
            $GEMINI -p "$QUESTION"
            GEMINI_EXIT_CODE=$?
        fi
        
        # Propagate gemini errors
        if [[ $GEMINI_EXIT_CODE -ne 0 ]]; then
            echo "Error: gemini command failed with exit code $GEMINI_EXIT_CODE" >&2
            exit $GEMINI_EXIT_CODE
        fi
    else
        # If something went wrong, show the error
        echo "$OUTPUT" >&2
        exit 1
    fi
else
    eval $DOCKER_CMD
fi
