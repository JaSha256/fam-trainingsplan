#!/bin/bash
# Post-push hook: Check if deployment succeeds after push to main

BRANCH=$(git branch --show-current)

if [[ "$BRANCH" == "main" ]] || [[ "$BRANCH" == "master" ]]; then
    echo "📊 Waiting for GitHub Actions deployment to start..."
    sleep 10
    
    # Get the latest deploy workflow run
    LATEST_RUN=$(gh run list --workflow=deploy.yml --limit 1 --json status,conclusion,databaseId,name --jq '.[0]')
    
    if [ -z "$LATEST_RUN" ]; then
        echo "⚠️  No deployment workflow found"
        exit 0
    fi
    
    RUN_ID=$(echo "$LATEST_RUN" | jq -r '.databaseId')
    STATUS=$(echo "$LATEST_RUN" | jq -r '.status')
    
    echo "🔄 Deployment workflow started (ID: $RUN_ID)"
    echo "   Waiting for completion..."
    
    # Wait for workflow to complete (max 5 minutes)
    TIMEOUT=300
    ELAPSED=0
    
    while [ "$ELAPSED" -lt "$TIMEOUT" ]; do
        CURRENT=$(gh run view "$RUN_ID" --json status,conclusion --jq '.')
        CURRENT_STATUS=$(echo "$CURRENT" | jq -r '.status')
        CONCLUSION=$(echo "$CURRENT" | jq -r '.conclusion')
        
        if [ "$CURRENT_STATUS" == "completed" ]; then
            if [ "$CONCLUSION" == "success" ]; then
                echo "✅ Deployment succeeded!"
                echo "🌐 Live at: https://jasha256.github.io/fam-trainingsplan/"
                exit 0
            else
                echo "❌ Deployment failed with conclusion: $CONCLUSION"
                echo "🔗 View details: gh run view $RUN_ID"
                exit 1
            fi
        fi
        
        sleep 10
        ELAPSED=$((ELAPSED + 10))
        echo -n "."
    done
    
    echo ""
    echo "⏱️  Deployment timeout after 5 minutes"
    echo "🔗 Check status manually: gh run view $RUN_ID"
fi
