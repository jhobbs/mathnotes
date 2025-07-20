# Crawl Single Page

Tests a single page for JavaScript errors without following any links.

## Usage
```
/crawl-single [URL]
```

If no URL is provided, tests the homepage.

## Examples
```
/crawl-single
/crawl-single http://web-dev:5000/mathnotes/differential-equations/dilution-and-accretion
/crawl-single http://localhost:5000/mathnotes/some-page
```

## Implementation

<function_calls>
<invoke name="Bash">
<parameter name="command">
# Get the URL from arguments or use default
URL="${1:-http://web-dev:5000}"

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

# Run the crawler in single-page mode
echo "🔍 Testing single page: $URL"
./scripts/crawl-dev.sh --single-page "$URL" --verbose true
