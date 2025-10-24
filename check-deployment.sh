#!/bin/bash
# Check deployment status after push

echo "📊 Checking deployment status..."
sleep 10

# Get the latest deploy workflow run
LATEST_RUN=$(gh run list --workflow=deploy.yml --limit 1 --json status,conclusion,databaseId,createdAt --jq '.[0]')

if [ -z "$LATEST_RUN" ]; then
    echo "⚠️  No deployment workflow found"
    exit 1
fi

RUN_ID=$(echo "$LATEST_RUN" | jq -r '.databaseId')
STATUS=$(echo "$LATEST_RUN" | jq -r '.status')
CREATED=$(echo "$LATEST_RUN" | jq -r '.createdAt')

echo "🔄 Deployment workflow: $RUN_ID"
echo "   Created: $CREATED"
echo "   Status: $STATUS"

if [ "$STATUS" == "completed" ]; then
    CONCLUSION=$(echo "$LATEST_RUN" | jq -r '.conclusion')
    if [ "$CONCLUSION" == "success" ]; then
        echo "✅ Deployment already completed successfully!"
        exit 0
    else
        echo "❌ Deployment failed: $CONCLUSION"
        gh run view "$RUN_ID"
        exit 1
    fi
fi

echo "⏳ Waiting for deployment to complete (max 5 minutes)..."

# Wait for workflow to complete
TIMEOUT=300
ELAPSED=0

while [ "$ELAPSED" -lt "$TIMEOUT" ]; do
    CURRENT=$(gh run view "$RUN_ID" --json status,conclusion --jq '.')
    CURRENT_STATUS=$(echo "$CURRENT" | jq -r '.status')
    CONCLUSION=$(echo "$CURRENT" | jq -r '.conclusion')
    
    if [ "$CURRENT_STATUS" == "completed" ]; then
        echo ""
        if [ "$CONCLUSION" == "success" ]; then
            echo "✅ Deployment succeeded!"
            echo "🌐 Live at: https://jasha256.github.io/fam-trainingsplan/"
            
            # Check gh-pages branch was updated
            echo "📦 Checking gh-pages branch..."
            git fetch origin gh-pages
            LAST_COMMIT=$(git log origin/gh-pages --oneline -1)
            echo "   Latest: $LAST_COMMIT"
            exit 0
        else
            echo "❌ Deployment failed with conclusion: $CONCLUSION"
            echo ""
            echo "🔍 Error details:"
            gh run view "$RUN_ID" --log-failed
            exit 1
        fi
    fi
    
    echo -n "."
    sleep 10
    ELAPSED=$((ELAPSED + 10))
done

echo ""
echo "⏱️  Timeout after 5 minutes"
echo "🔗 Check status: gh run view $RUN_ID"
exit 1
