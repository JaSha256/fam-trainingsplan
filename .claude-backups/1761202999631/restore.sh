#!/bin/bash
# Restore claude-code-collective backup from 2025-10-23T07:04:20.086Z

echo "🔄 Restoring claude-code-collective backup..."

# Copy backed up files back to project
cp -r "/home/pseudo/workspace/FAM/fam-trainingsplan/.claude-backups/1761202999631/"* "/home/pseudo/workspace/FAM/fam-trainingsplan/"

echo "✅ Restored successfully!"
echo "💡 You may need to restart Claude Code to reload configurations."
echo ""
echo "Backup location: /home/pseudo/workspace/FAM/fam-trainingsplan/.claude-backups/1761202999631"
