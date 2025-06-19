#!/bin/bash

# Test script for direct demo integration

echo "Testing direct demo integration with electric-field.html"
echo "======================================================="

# Export environment variables to enable direct demo integration
export ENABLE_DIRECT_DEMOS=true
export DIRECT_DEMO_WHITELIST=electric-field.html

echo ""
echo "Environment variables set:"
echo "  ENABLE_DIRECT_DEMOS=$ENABLE_DIRECT_DEMOS"
echo "  DIRECT_DEMO_WHITELIST=$DIRECT_DEMO_WHITELIST"
echo ""

# Build and run with Docker Compose
echo "Building Docker image..."
docker-compose build

echo ""
echo "Starting application..."
docker-compose up -d

echo ""
echo "Waiting for application to start..."
sleep 5

echo ""
echo "Application should now be running at http://localhost:5000"
echo "Navigate to: http://localhost:5000/mathnotes/physics/electric-fields"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"