#!/bin/bash

# Script to monitor deployment of the latest git commit to lacunary.org
# It will check periodically until the deployment is complete or timeout

# Configuration
MAX_WAIT_TIME=600  # Maximum time to wait in seconds (10 minutes)
CHECK_INTERVAL=10  # How often to check in seconds

# Get the current git commit hash (short version to match what's on the site)
CURRENT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null)

if [ -z "$CURRENT_COMMIT" ]; then
    echo "Error: Unable to get current git commit hash"
    exit 1
fi

echo "Monitoring deployment of commit: $CURRENT_COMMIT"
echo "Will check every ${CHECK_INTERVAL}s for up to ${MAX_WAIT_TIME}s"
echo ""

START_TIME=$(date +%s)
DEPLOYMENT_COMPLETE=false

while true; do
    # Check the live site version from mathnotes page (version is now inside a link)
    LIVE_VERSION=$(curl -s https://www.lacunary.org/mathnotes/ 2>/dev/null | grep -oP 'Version:.*?>(\K[^<]+)' | head -1)
    
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    if [ -n "$LIVE_VERSION" ]; then
        echo "[$(date '+%H:%M:%S')] Live version: $LIVE_VERSION"
        
        if [ "$CURRENT_COMMIT" = "$LIVE_VERSION" ]; then
            echo ""
            echo "✓ Deployment complete! The live site is running commit $CURRENT_COMMIT"
            echo "  Deployment took approximately ${ELAPSED} seconds"
            DEPLOYMENT_COMPLETE=true
            break
        fi
    else
        echo "[$(date '+%H:%M:%S')] Unable to fetch version from live site"
    fi
    
    # Check if we've exceeded max wait time
    if [ $ELAPSED -ge $MAX_WAIT_TIME ]; then
        echo ""
        echo "✗ Timeout: Deployment did not complete within ${MAX_WAIT_TIME} seconds"
        break
    fi
    
    # Wait before next check
    sleep $CHECK_INTERVAL
done

# Test the site if deployment was successful
if [ "$DEPLOYMENT_COMPLETE" = true ]; then
    echo ""
    echo "Testing site endpoints..."
    
    # Test main page
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.lacunary.org/)
    echo "  Homepage (/):" $([[ $HTTP_STATUS == 200 ]] && echo "✓ OK ($HTTP_STATUS)" || echo "✗ Failed ($HTTP_STATUS)")
    
    # Test mathnotes section
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.lacunary.org/mathnotes/)
    echo "  Mathnotes (/mathnotes/):" $([[ $HTTP_STATUS == 200 ]] && echo "✓ OK ($HTTP_STATUS)" || echo "✗ Failed ($HTTP_STATUS)")
    
    # Test sitemap
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.lacunary.org/sitemap.xml)
    echo "  Sitemap (/sitemap.xml):" $([[ $HTTP_STATUS == 200 ]] && echo "✓ OK ($HTTP_STATUS)" || echo "✗ Failed ($HTTP_STATUS)")
fi

exit $([[ "$DEPLOYMENT_COMPLETE" = true ]] && echo 0 || echo 1)