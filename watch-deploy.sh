#!/bin/bash
# Quick deployment status checker for development

echo "🚀 Watching deployment status..."
echo ""

# Get latest deploy run
LATEST=$(gh run list --workflow=deploy.yml --limit 1 --json databaseId,status,conclusion,createdAt --jq '.[0]')

if [ -z "$LATEST" ]; then
    echo "❌ No deployment found"
    exit 1
fi

RUN_ID=$(echo "$LATEST" | jq -r '.databaseId')
STATUS=$(echo "$LATEST" | jq -r '.status')

echo "📦 Deployment ID: $RUN_ID"
echo "⏱️  Status: $STATUS"
echo ""

if [ "$STATUS" == "completed" ]; then
    CONCLUSION=$(echo "$LATEST" | jq -r '.conclusion')
    if [ "$CONCLUSION" == "success" ]; then
        echo "✅ Deployment succeeded!"
        echo "🌐 Live: https://jasha256.github.io/fam-trainingsplan/"
    else
        echo "❌ Deployment failed: $CONCLUSION"
        echo ""
        echo "📋 Error details:"
        gh run view "$RUN_ID" --log-failed
    fi
    exit 0
fi

echo "⏳ Waiting for completion (max 2 minutes)..."
timeout 120 gh run watch "$RUN_ID" || {
    echo "⚠️  Still running after 2 minutes"
    echo "🔗 View: gh run view $RUN_ID"
}
