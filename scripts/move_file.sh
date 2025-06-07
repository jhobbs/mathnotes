#!/bin/bash

# Helper script to move markdown files while preserving SEO
# Usage: ./scripts/move_file.sh old_file.md new_file.md

set -e

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <old_file.md> <new_file.md>"
    echo "Example: $0 algebra/groups.md group-theory/intro.md"
    exit 1
fi

OLD_FILE="$1"
NEW_FILE="$2"

# Check if old file exists
if [ ! -f "$OLD_FILE" ]; then
    echo "Error: $OLD_FILE does not exist"
    exit 1
fi

# Check if new file already exists
if [ -f "$NEW_FILE" ]; then
    echo "Error: $NEW_FILE already exists"
    exit 1
fi

# Create new directory if it doesn't exist
NEW_DIR=$(dirname "$NEW_FILE")
mkdir -p "$NEW_DIR"

# Extract current slug or generate from path
echo "Analyzing $OLD_FILE..."
CURRENT_SLUG=$(grep -E "^slug:" "$OLD_FILE" 2>/dev/null | sed 's/slug: *//' | tr -d '"' || echo "")

if [ -n "$CURRENT_SLUG" ]; then
    # File has custom slug - use section/slug format
    SECTION=$(dirname "$OLD_FILE")
    OLD_URL="$SECTION/$CURRENT_SLUG"
    echo "Found custom slug: $CURRENT_SLUG"
    echo "Old canonical URL: $OLD_URL"
else

    # No custom slug - use file path without .md
    OLD_URL="${OLD_FILE%.md}"
    echo "No custom slug found"
    echo "Old file-based URL: $OLD_URL"
fi

# Move the file
echo "Moving $OLD_FILE to $NEW_FILE..."
mv "$OLD_FILE" "$NEW_FILE"

# Add redirect_from to the new file
echo "Adding redirect_from to $NEW_FILE..."

# Check if file already has redirect_from
if grep -q "redirect_from:" "$NEW_FILE"; then
    echo "Warning: File already has redirect_from. Please manually add: $OLD_URL"
else
    # Create a temporary file with the updated frontmatter
    TEMP_FILE=$(mktemp)
    
    # Process the file line by line
    IN_FRONTMATTER=false
    FRONTMATTER_END_FOUND=false
    
    while IFS= read -r line; do
        if [ "$line" = "---" ] && [ "$IN_FRONTMATTER" = false ]; then
            # Start of frontmatter
            IN_FRONTMATTER=true
            echo "$line" >> "$TEMP_FILE"
        elif [ "$line" = "---" ] && [ "$IN_FRONTMATTER" = true ] && [ "$FRONTMATTER_END_FOUND" = false ]; then
            # End of frontmatter - add redirect_from here
            echo "redirect_from:" >> "$TEMP_FILE"
            echo "  - $OLD_URL" >> "$TEMP_FILE"
            echo "$line" >> "$TEMP_FILE"
            FRONTMATTER_END_FOUND=true
        else
            echo "$line" >> "$TEMP_FILE"
        fi
    done < "$NEW_FILE"
    
    # Replace the original file
    mv "$TEMP_FILE" "$NEW_FILE"
fi

echo "✅ File moved successfully!"
echo "📝 Added redirect_from: $OLD_URL"
echo "🔍 Please verify the redirect works by testing the old URL"
echo ""
echo "Next steps:"
echo "1. Test that /$OLD_URL redirects to the new location"
echo "2. Update any internal links that point to the old file"
echo "3. Commit the changes"