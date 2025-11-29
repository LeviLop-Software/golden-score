#!/bin/bash

# Bump Version Script
# Usage: ./scripts/bump-version.sh [patch|minor|major]
# Default: patch (0.0.1 -> 0.0.2)

set -e

VERSION_TYPE=${1:-patch}

echo "🔢 Bumping version ($VERSION_TYPE)..."

# Bump version in package.json
npm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")

echo "✅ Version bumped to: v$NEW_VERSION"

# Generate version.js
node scripts/generate-version.js

# Commit the changes
git add package.json src/lib/version.js
git commit -m "chore: bump version to v$NEW_VERSION"

echo "📦 Version v$NEW_VERSION committed"
echo ""
echo "Next steps:"
echo "1. git push origin main"
echo "2. Vercel will auto-deploy with new version"
