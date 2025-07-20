# Crawl Full Site

Crawls the entire site starting from a URL, following all internal links to check for JavaScript errors.

## Usage
```
/crawl-site [URL] [OPTIONS]
```

If no URL is provided, starts from the homepage.

## Options
- `--max-depth N` - Maximum crawl depth (default: unlimited)
- `--verbose` - Show detailed output
- `--log-skipped` - Log skipped URLs

## Examples
```
/crawl-site
/crawl-site http://web-dev:5000
/crawl-site http://localhost:5000 --verbose --log-skipped
```

## Implementation

<function_calls>
<invoke name="Bash">
<parameter name="command">
# Parse arguments
URL=""
ARGS=""

for arg in "$@"; do
  if [[ "$arg" == --* ]]; then
    ARGS="$ARGS $arg"
  elif [ -z "$URL" ]; then
    URL="$arg"
  else
    ARGS="$ARGS $arg"
  fi
done

# Use default URL if none provided
URL="${URL:-http://web-dev:5000}"

# Check if we're in the mathnotes directory
if [ ! -f "docker-compose.dev.yml" ]; then
  echo "❌ Not in mathnotes directory. Please navigate to the project root."
  exit 1
fi

# Check if dev environment is running
if ! docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
  echo "⚠️  Dev environment not running. Starting it now..."
  docker-compose -f docker-compose.dev.yml up -d
  echo "Waiting for services to be ready..."
  sleep 5
fi

# Run the crawler
echo "🕷️  Crawling site starting from: $URL"
echo "Options: $ARGS"
./scripts/crawl-dev.sh "$URL" $ARGS
