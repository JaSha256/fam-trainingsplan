# Lessons Learned - FAM Trainingsplan

This directory contains **critical lessons learned** from production issues and bugs.

## Purpose
- Prevent recurring issues
- Document anti-patterns
- Provide quick reference for future development

## Files

### VITE-PLUGIN-LOADING.md
**Problem:** Leaflet MarkerCluster fails in production builds  
**Occurred:** 3 times (2025-10-24, 2025-10-25)  
**Solution:** Dynamic imports at point of use  
**Status:** ✅ SOLVED - DO NOT TRY STATIC IMPORTS AGAIN

## When to Add New Lessons

1. **Production bug occurs** → Document root cause
2. **Bug recurs** → Create detailed anti-pattern guide
3. **Complex fix** → Explain technical details

## Format

Each lesson should include:
- Problem statement
- Root cause analysis
- Failed attempts (what didn't work)
- Definitive solution
- Verification checklist
- Permanent rules

## Related Documentation

- `ARCHITECTURE.md` - Architecture-level warnings
- `docs/` - Feature-specific documentation
- `DEPLOYMENT_FIX.md` - Specific fix documentation
