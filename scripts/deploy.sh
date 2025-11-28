#!/bin/bash
# Golden Score Deployment Script

echo "🚀 Golden Score Deployment Script"
echo "================================="

# Check if we're on main branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo "⚠️  Warning: You're not on main branch (current: $BRANCH)"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Run pre-deployment checks
echo "📋 Running pre-deployment checks..."

echo "  ✓ Linting code..."
npm run lint || { echo "❌ Lint failed"; exit 1; }

echo "  ✓ Building project..."
npm run build || { echo "❌ Build failed"; exit 1; }

echo "  ✓ Checking environment variables..."
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found!"
  exit 1
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "📤 Pushing to GitHub..."
git push origin $BRANCH

echo ""
echo "🎉 Done! Vercel will automatically deploy from GitHub."
echo "   Check status at: https://vercel.com/dashboard"
echo ""
