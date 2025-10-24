# GitHub Pages Deployment Debugging Guide

## Problem: "Deployed" aber nicht sichtbar

### Häufigste Ursachen:

#### 1. Browser-Cache (80% der Fälle)
**Symptome:** Alte Version wird angezeigt, obwohl GitHub Pages aktualisiert wurde

**Lösung:**
```bash
# In Browser (Chrome/Brave/Firefox):
Ctrl+Shift+R    # Hard Reload (Linux/Windows)
Cmd+Shift+R     # Hard Reload (Mac)

# Oder im DevTools:
1. F12 öffnen
2. Rechtsklick auf Reload-Button
3. "Empty Cache and Hard Reload" wählen
```

**Alternative:**
```bash
# Inkognito-Modus testen
Ctrl+Shift+N    # Chrome/Brave
Ctrl+Shift+P    # Firefox
```

#### 2. GitHub Pages CDN Cache (15% der Fälle)
**Symptome:** Selbst nach Hard Reload alte Version

**Lösung:**
- Warte 1-5 Minuten nach Deployment
- GitHub Pages nutzt CDN mit eigenem Cache
- CDN wird automatisch invalidated, braucht Zeit

**Überprüfung:**
```bash
# Timestamp im deployed Code prüfen
curl -I https://jasha256.github.io/fam-trainingsplan/ | grep -i "last-modified"
```

#### 3. Build enthält nicht den erwarteten Code (5% der Fälle)
**Symptome:** Code ist weder lokal noch remote vorhanden

**Debug-Befehle:**

```bash
# 1. Prüfe main branch hat den Commit
git log origin/main --oneline -5

# 2. Prüfe gh-pages wurde deployed
git fetch origin gh-pages
git log origin/gh-pages -1 --oneline

# 3. Prüfe Datei-Hashes (bei Vite mit hashed names)
git ls-tree -r origin/gh-pages --name-only | grep "assets/js"

# 4. Extrahiere und inspiziere deployed JavaScript
git show origin/gh-pages:assets/js/index.HASH.js > /tmp/deployed.js
grep -n "dein-such-string" /tmp/deployed.js

# 5. Vergleiche mit lokalem Build
npm run build
grep -n "dein-such-string" dist/assets/js/index-*.js
```

## Vollständiger Debugging-Workflow

### Schritt 1: Verify Deployment Success
```bash
# GitHub Actions Status
gh run list --workflow=deploy.yml --limit 1
gh run list --workflow="pages-build-deployment" --limit 1

# Sollte beide "completed success" zeigen
```

### Schritt 2: Verify Code is on gh-pages
```bash
# Fetch latest gh-pages
git fetch origin gh-pages

# Check commit message und Zeit
git log origin/gh-pages -1 --pretty=format:"%h %s%n%ar by %an"

# List deployed files
git ls-tree -r origin/gh-pages --name-only | head -20
```

### Schritt 3: Verify Your Code is in Build
```bash
# Find main JS file (Vite uses hashed names)
JS_FILE=$(git ls-tree -r origin/gh-pages --name-only | grep "assets/js/index.*js")

# Check if your code is present
git show origin/gh-pages:$JS_FILE | grep -C 3 "your-search-term"
```

### Schritt 4: Test Live Site
```bash
# Get live URL
gh api repos/$(gh repo view --json nameWithOwner -q .nameWithOwner)/pages --jq '.html_url'

# Fetch with cache bypass
curl -H "Cache-Control: no-cache" https://jasha256.github.io/fam-trainingsplan/ > /tmp/live.html

# Check if new code is referenced
grep -o 'assets/js/[^"]*' /tmp/live.html
```

### Schritt 5: Browser Testing
1. **Hard Reload:** Ctrl+Shift+R
2. **DevTools Network Tab:**
   - Disable cache checkbox aktivieren
   - Alle Requests prüfen (sollten 200 sein, nicht 304)
3. **Inkognito-Modus:** Frische Session ohne Cache
4. **Service Worker Reset:**
   ```javascript
   // In Browser Console:
   navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))
   location.reload()
   ```

## Spezifische Checks für dieses Projekt

### Check Distance Filter Fix
```bash
# 1. Ist der Fix im main branch?
git show main:src/js/trainingsplaner/geolocation-manager.js | grep -A 2 "this.state.userPosition"

# 2. Ist der Fix in gh-pages deployed?
JS_FILE=$(git ls-tree -r origin/gh-pages --name-only | grep "assets/js/index.*js")
git show origin/gh-pages:$JS_FILE | grep "this.state.userPosition" | wc -l
# Sollte > 0 sein (aktuell: 5)

# 3. Live site check
curl -s https://jasha256.github.io/fam-trainingsplan/ | grep -o "assets/js/index[^\"]*"
```

## Service Worker Issues (PWA-spezifisch)

**Problem:** PWA cached alte Version

**Lösung:**
```javascript
// In Browser DevTools Console:

// 1. Check aktueller Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Registered:', regs.length)
  regs.forEach(r => console.log(r.scope, r.active?.scriptURL))
})

// 2. Force Update
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.update())
})

// 3. Komplett entfernen
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister())
  console.log('Unregistered all service workers')
})

// 4. Reload
location.reload()
```

## Quick Reference Commands

```bash
# Status Check (alle auf einmal)
echo "=== Main Branch ===" && git log origin/main -1 --oneline && \
echo -e "\n=== GH-Pages Branch ===" && git log origin/gh-pages -1 --oneline && \
echo -e "\n=== Recent Deployments ===" && gh run list --limit 3 && \
echo -e "\n=== Live URL ===" && gh api repos/$(gh repo view --json nameWithOwner -q .nameWithOwner)/pages --jq '.html_url'

# Full Deployment Verification
git fetch origin gh-pages && \
JS_FILE=$(git ls-tree -r origin/gh-pages --name-only | grep "assets/js/index.*js") && \
echo "Deployed JS: $JS_FILE" && \
echo "Fix present: $(git show origin/gh-pages:$JS_FILE | grep -c 'this.state.userPosition') occurrences"

# Live Site Cache Bust
curl -H "Cache-Control: no-cache, no-store, must-revalidate" \
     -H "Pragma: no-cache" \
     -H "Expires: 0" \
     https://jasha256.github.io/fam-trainingsplan/ | head -50
```

## Für dein aktuelles Problem

**Status:** ✅ Code ist deployed

```bash
# Verifiziert:
- main branch hat Commit 68edba4 ✓
- gh-pages hat diesen Code ✓
- Fix ist im JavaScript (5 occurrences) ✓
- Workflows sind erfolgreich ✓
```

**Nächster Schritt:** Browser-Cache leeren

1. Öffne https://jasha256.github.io/fam-trainingsplan/
2. Drücke `Ctrl+Shift+R` (Hard Reload)
3. Oder DevTools → Network → "Disable cache" → F5
4. Teste "Mein Standort" Button

**Falls immer noch nicht sichtbar:**
```bash
# Service Worker komplett zurücksetzen
# In Browser Console:
navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))
location.reload()
```

---

**Live URL:** https://jasha256.github.io/fam-trainingsplan/
**Deployed Commit:** 68edba4 (fix: Alpine.js Reaktivität für Distance-Filter)
**Deployment Zeit:** ~2-5 Minuten für CDN Propagation
