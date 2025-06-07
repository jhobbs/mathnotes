#!/bin/bash

# Script to set up the pre-commit hook for checking missing redirects
# Usage: ./scripts/setup_precommit_hook.sh

HOOK_FILE=".git/hooks/pre-commit"

echo "🔧 Setting up pre-commit hook for redirect checking..."

# Create the pre-commit hook
cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash

# Pre-commit hook to check for potential missing redirects

# Check if there are any staged file moves or deletions
MOVED_FILES=$(git diff --cached --name-status --diff-filter=R | grep '\.md$' || true)
DELETED_FILES=$(git diff --cached --name-status --diff-filter=D | grep '\.md$' || true)

# Check if we have moves or deletions to warn about
if [ -n "$MOVED_FILES" ] || [ -n "$DELETED_FILES" ]; then
    
    if [ -n "$MOVED_FILES" ]; then
        echo "🔍 Checking for moved markdown files..."
        echo ""
        echo "⚠️  WARNING: You're committing moved markdown files!"
        echo "📝 Make sure you've added redirect_from entries for:"
        echo "$MOVED_FILES"
        echo ""
    fi
    
    if [ -n "$DELETED_FILES" ]; then
        echo "🔍 Checking for deleted markdown files..."
        echo ""
        echo "⚠️  WARNING: You're deleting markdown files!"
        echo "📝 Consider if these files had external links pointing to them:"
        echo "$DELETED_FILES"
        echo ""
    fi
    
    echo "💡 Tips:"
    echo "  - Use ./scripts/move_file.sh to move files safely"
    echo "  - Add redirect_from: [old/path] to the frontmatter of moved files"
    echo "  - Test that old URLs redirect properly"
    echo ""
    
    # Try to automatically fix missing redirects if python modules are available
    if command -v python3 >/dev/null && python3 -c "import yaml" 2>/dev/null; then
        echo "🔧 Automatically fixing missing redirects..."
        
        # Capture the output to see if any fixes were applied
        REDIRECT_OUTPUT=$(python3 scripts/check_redirects.py --fix 2>&1)
        echo "$REDIRECT_OUTPUT"
        
        # If fixes were applied, stage the modified files
        if echo "$REDIRECT_OUTPUT" | grep -q "Applied.*redirect fixes"; then
            echo ""
            echo "📝 Staging files with added redirects..."
            
            # Get list of markdown files that were modified and stage them
            git add *.md **/*.md 2>/dev/null || true
            
            echo "✅ Modified files have been staged and will be included in this commit"
        fi
        echo ""
    fi
    
    echo "✅ Proceeding with commit..."
fi

exit 0
EOF

# Make the hook executable
chmod +x "$HOOK_FILE"

echo "✅ Pre-commit hook installed at $HOOK_FILE"
echo ""
echo "The hook will now:"
echo "  - Detect moved markdown files and automatically fix missing redirects"
echo "  - Detect deleted markdown files and warn about broken links"
echo "  - Stage any files with added redirects automatically"
echo "  - Proceed with commits automatically (no manual confirmation needed)"
echo ""
echo "💡 To bypass the hook for a specific commit, use:"
echo "   git commit --no-verify -m \"Your message\""