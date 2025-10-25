#!/bin/bash
# GitHub Pages Deployment Verification Script
# Usage: ./verify-deployment.sh [search-term]

set -e

SEARCH_TERM="${1:-this.state.userPosition}"
REPO_NAME=$(gh repo view --json nameWithOwner -q .nameWithOwner)
PAGES_URL=$(gh api repos/$REPO_NAME/pages --jq '.html_url')

echo "=========================================="
echo "GitHub Pages Deployment Verification"
echo "=========================================="
echo

# 1. Check main branch
echo "📌 Main Branch Status:"
git fetch origin main -q
MAIN_COMMIT=$(git log origin/main -1 --pretty=format:"%h %s")
MAIN_TIME=$(git log origin/main -1 --pretty=format:"%ar")
echo "   Latest: $MAIN_COMMIT"
echo "   When:   $MAIN_TIME"
echo

# 2. Check gh-pages branch
echo "📦 GH-Pages Branch Status:"
git fetch origin gh-pages -q
PAGES_COMMIT=$(git log origin/gh-pages -1 --pretty=format:"%h %s")
PAGES_TIME=$(git log origin/gh-pages -1 --pretty=format:"%ar")
echo "   Latest: $PAGES_COMMIT"
echo "   When:   $PAGES_TIME"
echo

# 3. Check recent workflows
echo "🔄 Recent Workflow Runs:"
echo "   Deploy Workflow:"
gh run list --workflow=deploy.yml --limit 1 --json conclusion,status,displayTitle,createdAt | \
  jq -r '.[] | "      \(.status) - \(.conclusion // "N/A") - \(.displayTitle) (\(.createdAt | split("T")[0]))"'

echo "   Pages Build:"
gh run list --workflow="pages-build-deployment" --limit 1 --json conclusion,status,createdAt | \
  jq -r '.[] | "      \(.status) - \(.conclusion // "N/A") (\(.createdAt | split("T")[0]))"'
echo

# 4. Check deployed files
echo "📄 Deployed Files:"
JS_FILES=$(git ls-tree -r origin/gh-pages --name-only | grep "assets/js/index.*\.js$")
if [ -z "$JS_FILES" ]; then
    echo "   ❌ No JavaScript files found!"
    exit 1
fi

echo "   Found JS files:"
echo "$JS_FILES" | sed 's/^/      /'
echo

# 5. Check if code is present
echo "🔍 Searching for: '$SEARCH_TERM'"
FOUND=0
for JS_FILE in $JS_FILES; do
    COUNT=$(git show origin/gh-pages:"$JS_FILE" 2>/dev/null | grep -c "$SEARCH_TERM" || true)
    if [ $COUNT -gt 0 ]; then
        echo "   ✅ Found $COUNT occurrence(s) in: $JS_FILE"
        FOUND=1
    fi
done

if [ $FOUND -eq 0 ]; then
    echo "   ❌ Search term not found in any JS files"
    echo "   💡 Tip: Check if your code is in main branch first"
    exit 1
fi
echo

# 6. Live site check
echo "🌐 Live Site Status:"
echo "   URL: $PAGES_URL"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PAGES_URL")
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Site is accessible (HTTP $HTTP_CODE)"
else
    echo "   ❌ Site returned HTTP $HTTP_CODE"
fi

# Check which JS file is referenced in live HTML
LIVE_JS=$(curl -s "$PAGES_URL" | grep -o 'assets/js/index[^"]*' | head -1)
if [ -n "$LIVE_JS" ]; then
    echo "   Referenced JS: $LIVE_JS"

    # Compare with deployed files
    if echo "$JS_FILES" | grep -q "$LIVE_JS"; then
        echo "   ✅ JS file matches gh-pages"
    else
        echo "   ⚠️  JS file differs from gh-pages (CDN cache?)"
        echo "      Expected: $(echo "$JS_FILES" | head -1)"
        echo "      Got:      $LIVE_JS"
    fi
fi
echo

# 7. Cache check
echo "🕐 Cache Status:"
LAST_MODIFIED=$(curl -sI "$PAGES_URL" | grep -i "last-modified" | cut -d' ' -f2-)
if [ -n "$LAST_MODIFIED" ]; then
    echo "   Last Modified: $LAST_MODIFIED"
else
    echo "   No Last-Modified header found"
fi

CACHE_CONTROL=$(curl -sI "$PAGES_URL" | grep -i "cache-control" | cut -d' ' -f2-)
if [ -n "$CACHE_CONTROL" ]; then
    echo "   Cache-Control: $CACHE_CONTROL"
fi
echo

# 8. Summary
echo "=========================================="
echo "📊 Summary:"
echo "=========================================="

if [ $FOUND -eq 1 ] && [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Deployment looks good!"
    echo
    echo "If you still see old code in browser:"
    echo "  1. Hard Reload: Ctrl+Shift+R"
    echo "  2. Clear Service Worker:"
    echo "     DevTools → Application → Service Workers → Unregister"
    echo "  3. Try Incognito: Ctrl+Shift+N"
    echo "  4. Wait 2-5 minutes for CDN propagation"
else
    echo "⚠️  Potential issues detected"
    echo
    echo "Troubleshooting:"
    echo "  1. Check if code is in main branch"
    echo "  2. Re-run deployment: gh workflow run deploy.yml"
    echo "  3. Check workflow logs: gh run list --limit 5"
fi
echo

echo "🔗 Quick Links:"
echo "   Live Site:  $PAGES_URL"
echo "   Repository: https://github.com/$REPO_NAME"
echo "   Actions:    https://github.com/$REPO_NAME/actions"
