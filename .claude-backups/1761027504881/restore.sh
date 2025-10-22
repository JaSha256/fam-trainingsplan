#!/bin/bash
# Restore claude-code-collective backup from 2025-10-21T06:18:43.923Z

echo "🔄 Restoring claude-code-collective backup..."

# Copy backed up files back to project
cp -r "/home/pseudo/workspace/FAM/fam-trainingsplan/.claude-backups/1761027504881/"* "/home/pseudo/workspace/FAM/fam-trainingsplan/"

echo "✅ Restored successfully!"
echo "💡 You may need to restart Claude Code to reload configurations."
echo ""
echo "Backup location: /home/pseudo/workspace/FAM/fam-trainingsplan/.claude-backups/1761027504881"
