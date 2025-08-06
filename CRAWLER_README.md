# JavaScript Error Crawler

A Playwright-based crawler that checks for JavaScript errors across all pages in the site.

## Usage

### Development Environment (Recommended)

When running in the Docker development environment, use the helper script:

```bash
# Start the dev environment
docker-compose -f docker-compose.dev.yml up -d

# Crawl the dev server (default)
./scripts/crawl-dev.sh

# Crawl with options
./scripts/crawl-dev.sh http://web-dev:5000 --verbose true
./scripts/crawl-dev.sh http://web-dev:5000 --log-skipped true
./scripts/crawl-dev.sh http://web-dev:5000 --max-depth 2
```

### Production/Staging

For production or standalone crawling:

```bash
# Install dependencies
npm install

# Crawl production
node scripts/crawler.js https://lacunary.org

# Crawl local Docker container
node scripts/crawler.js http://host.docker.internal:5000
```

## Options

- `--max-depth N` - Maximum crawl depth (default: Infinity)
- `--headless false` - Show browser window (default: true)
- `--verbose true` - Show detailed logging (default: false)
- `--log-skipped true` - Log skipped URLs (default: false)

## How it Works

1. Starts at the given URL
2. Creates an isolated browser page for each URL
3. Waits for page to load and stabilize
4. Catches any JavaScript errors
5. Harvests links and continues crawling
6. Stops immediately on first error

## Network Architecture

In development:
- `web-dev:5000` - Development server
- The crawler runs in the same Docker network

URLs are served on port 5000

## Troubleshooting

### "Failed to load resource" errors
These are usually from the browser trying to load external resources. Check the `IGNORE_PATTERNS` in the script.

### "net::ERR_ABORTED" for large files
Chrome may abort loading very large JavaScript files. This is usually not a real error.

### Host resolution issues
- Use `web-dev:5000` when running inside Docker
- Use `localhost:5000` when running outside Docker
- Use `host.docker.internal:5000` from Docker to reach host