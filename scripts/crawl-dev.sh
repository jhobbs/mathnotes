#!/bin/bash
# Helper script to run the crawler in the Docker network

# Default to crawling the dev server
URL="${1:-http://web-dev:5000}"
shift

# Pass any additional arguments to the crawler
docker-compose -f docker-compose.dev.yml run --rm crawler node scripts/crawler.js "$URL" "$@"