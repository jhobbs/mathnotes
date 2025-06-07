#!/bin/bash
# Script to scale Fly.io machines to specific regions: ORD, LAX, and DFW

echo "Scaling mathnotes app to ORD, LAX, and DFW regions..."

# First, list current machines
echo "Current machines:"
flyctl machines list -a mathnotes

# Scale to 3 machines total
echo -e "\nScaling to 3 machines..."
flyctl scale count 3 -a mathnotes

# Wait a moment for scaling to complete
sleep 2

# Get the machine ID of the primary machine (should be in ORD)
echo -e "\nGetting primary machine ID..."
MACHINE_ID=$(flyctl machines list -a mathnotes --json | jq -r '.[0].id')

if [ ! -z "$MACHINE_ID" ]; then
    # Clone to LAX region
    echo -e "\nCloning machine to LAX region..."
    flyctl machines clone $MACHINE_ID --region lax -a mathnotes
    
    # Clone to DFW region
    echo -e "\nCloning machine to DFW region..."
    flyctl machines clone $MACHINE_ID --region dfw -a mathnotes
fi

# Wait for cloning to complete
sleep 3

# Remove extra machines if needed (keeping only one per region)
echo -e "\nChecking for duplicate machines in regions..."
flyctl machines list -a mathnotes

echo -e "\nDeployment complete!"
echo "Target configuration: 3 machines total (1 in ORD, 1 in LAX, 1 in DFW)"
echo "Note: You may need to manually remove extra machines if more than 3 exist."
echo "Use 'flyctl machines destroy [machine-id] -a mathnotes' to remove specific machines."