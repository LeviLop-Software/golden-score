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

# Update .env.local with new version
if [ -f ".env.local" ]; then
  if grep -q "NEXT_PUBLIC_APP_VERSION=" .env.local; then
    # Update existing version
    sed -i '' "s/NEXT_PUBLIC_APP_VERSION=.*/NEXT_PUBLIC_APP_VERSION=$NEW_VERSION/" .env.local
  else
    # Add version after APP_NAME
    sed -i '' "/NEXT_PUBLIC_APP_NAME=/a\\
NEXT_PUBLIC_APP_VERSION=$NEW_VERSION
" .env.local
  fi
  echo "📝 Updated .env.local with version v$NEW_VERSION"
fi

# Commit the changes
git add package.json .env.local
git commit -m "chore: bump version to v$NEW_VERSION"

echo "📦 Version v$NEW_VERSION committed"
echo ""
echo "Next steps:"
echo "1. git push origin main"
echo "2. Update NEXT_PUBLIC_APP_VERSION in Vercel to: $NEW_VERSION"
echo "3. Vercel will auto-deploy with new version"
