# GitHub Actions Workflows

**Minimal CI/CD für Solo Developer**

Philosophie:
- **Local-First**: Tests laufen lokal via pre-push hook
- **CI = Safety Net**: Nur Build-Check als Absicherung
- **Ultra-Fast**: ~5 Minuten statt 30+
- **No Infinite Loops**: GITHUB_TOKEN + [skip ci]

---

## Workflows

### 1. CI Pipeline (`ci.yml`)

**Trigger:** Push/PR auf `main` Branch

**Was läuft:**
```
Build Check (~5 min)
└── pnpm install + build + verify
```

**Warum so minimal?**
- ✅ TypeCheck läuft bereits lokal (pre-push hook)
- ✅ Unit Tests laufen bereits lokal (pre-push hook)
- ✅ Infrastructure Tests laufen bereits lokal (pre-push hook)
- → CI nur noch als **finale Absicherung** dass Build funktioniert

**Features:**
- ✅ Ultra-Fast: ~5 Minuten
- ✅ Smart Caching: pnpm dependencies
- ✅ Concurrency: Cancel in-progress runs
- ✅ Minimal: Nur was nötig ist

---

### 2. Deploy Pipeline (`deploy.yml`)

**Trigger:** Nur manuell via `workflow_dispatch`

**Was läuft:**
```
Deploy (~5 min)
├── pnpm install + build
└── Deploy to gh-pages
```

**Features:**
- ✅ Manual Only: Du entscheidest wann
- ✅ [skip ci]: Keine Loops
- ✅ keep_files: trainingsplan.json bleibt erhalten
- ✅ Fast: ~5 Minuten

---

## Verwendung

### CI Pipeline
```bash
git push origin main  # Läuft automatisch
```

### Deployment
```bash
# GitHub UI: Actions → Deploy → Run workflow
gh workflow run deploy.yml  # via CLI
```

---

## Warum so minimal?

**Alte Pipeline:** 30-40 min/Push
**Neue Pipeline:** ~5 min/Push

**Grund:**
- Pre-push hook macht bereits: TypeCheck + Unit Tests + Infrastructure Tests
- CI = nur noch Build-Check als Sicherheitsnetz
- Kein Overkill für Solo-Projekt

**Resource Usage:**
- ~5-10 min/Monat (bei aktivem Development)
- Free Tier: 2000 min/Monat ✅
- **Mehr als genug!**

---

## Anti-Loop Mechanismus

```yaml
# deploy.yml
commit_message: 'deploy: ${{ github.sha }} [skip ci]'
github_token: ${{ secrets.GITHUB_TOKEN }}  # nicht PAT!
```

→ Keine Endlosschleifen mehr!

---

**Minimal, aber effektiv für Solo Developer**
