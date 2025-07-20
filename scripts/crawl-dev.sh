#!/bin/bash
# Helper script to run the crawler in the Docker network

# Check if first argument is --single-page
if [ "$1" = "--single-page" ] || [ "$1" = "-s" ]; then
    # Single page mode - second argument is the URL
    URL="${2:-http://web-dev:5000}"
    shift 2
    docker-compose -f docker-compose.dev.yml run --rm crawler node scripts/crawler.js "$URL" --single-page true "$@"
else
    # Default to crawling the dev server
    URL="${1:-http://web-dev:5000}"
    shift
    docker-compose -f docker-compose.dev.yml run --rm crawler node scripts/crawler.js "$URL" "$@"
fi