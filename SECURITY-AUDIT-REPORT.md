# Security Audit Report - FAM Trainingsplan

**Audit Date:** 2025-10-22  
**Auditor:** Security Auditor (Claude Code)  
**Project:** Free Arts of Movement - Trainingsplan  
**Version:** 2.4.0

---

## Executive Summary

Das FAM Trainingsplan Projekt wurde einem umfassenden Security Audit unterzogen.
Das Projekt zeigt insgesamt eine **gute Sicherheitshaltung** mit mehreren Best
Practices bereits implementiert. Es wurden **keine kritischen
Sicherheitslücken** gefunden.

**Overall Security Score: 8.5/10**

### Key Findings:

- ✅ Keine hardcoded Secrets im Source Code
- ✅ Keine Secrets in Git History
- ✅ .gitignore korrekt konfiguriert
- ✅ Keine npm Vulnerabilities
- ⚠️ Fehlende Security Headers
- ⚠️ postMessage ohne vollständige Origin-Validierung (partiell implementiert)
- ⚠️ Keine .env.example Datei

---

## 1. Sensitive Daten im Repository

### 1.1 API Keys & Secrets

**Status:** ✅ PASS

**Findings:**

- Keine echten API Keys im Source Code gefunden
- MCP Configuration Dateien (.mcp.json, opencode.json) enthalten nur
  Placeholder:
  - `YOUR_ANTHROPIC_API_KEY_HERE`
  - `YOUR_PERPLEXITY_API_KEY_HERE`
  - etc.

**Evidence:**

```bash
# Gescannte Dateien:
- .mcp.json
- opencode.json
- src/js/config.js
- vite.config.js
```

**Severity:** LOW  
**Recommendation:** Trotzdem sollten diese Dateien in .env ausgelagert werden
(siehe Empfehlungen).

---

### 1.2 .env Dateien

**Status:** ✅ PASS

**Findings:**

- Keine .env Dateien im Repository gefunden
- .gitignore korrekt konfiguriert für:
  - `.env`
  - `.env.local`
  - `.env.production`
  - `.env.development`

**Evidence:**

```bash
# .gitignore (Zeilen 12-16)
# Environment variables
.env
.env.local
.env.production
.env.development
```

**Severity:** N/A  
**Recommendation:** ✅ Bereits korrekt implementiert.

---

### 1.3 .env.example Datei

**Status:** ⚠️ WARNING

**Findings:**

- Keine .env.example Datei vorhanden
- Entwickler wissen nicht, welche Umgebungsvariablen benötigt werden

**Severity:** LOW  
**Recommendation:** .env.example Datei erstellen für bessere Developer
Experience.

**Suggested .env.example:**

```env
# API Endpoints
VITE_API_URL=https://jasha256.github.io/fam-trainingsplan/trainingsplan.json
VITE_VERSION_URL=https://jasha256.github.io/fam-trainingsplan/version.json

# Development
NODE_ENV=development

# Optional: Analytics (if implemented)
# VITE_ANALYTICS_ID=
```

---

## 2. Git History Analysis

### 2.1 Git History Scan

**Status:** ✅ PASS

**Findings:**

- Keine .env Dateien in Git History gefunden
- Keine gelöschten Secret-Dateien gefunden
- Commit `479c31d` enthält keine sensitiven Daten (nur vite.config.js und
  package.json)

**Evidence:**

```bash
git log --all --full-history -- "*.env*" "*.key" "*.pem" "*.p12" "credentials*" "secrets*"
# Ergebnis: Keine kritischen Dateien gefunden
```

**Severity:** N/A  
**Recommendation:** ✅ Git History ist sauber.

---

### 2.2 Hardcoded Credentials Pattern Search

**Status:** ✅ PASS

**Findings:**

- Keine API Key Patterns gefunden (sk-, ghp*, gho*, AIza, xai-)
- Keine Passwörter oder Auth Tokens im Code

**Evidence:**

```bash
# Regex Patterns gescannt:
- API Key Patterns: sk-[a-zA-Z0-9]{48}, ghp_[a-zA-Z0-9]{36}, AIza[a-zA-Z0-9_-]{35}
- Keyword Search: password, secret, private_key, auth_token
# Ergebnis: Keine Treffer im Source Code
```

**Severity:** N/A  
**Recommendation:** ✅ Kein Handlungsbedarf.

---

## 3. .gitignore Validierung

### 3.1 .gitignore Completeness

**Status:** ✅ PASS

**Findings:**

- Alle sensitiven Dateien korrekt ignoriert
- Build Artifacts (dist/) ignoriert
- node_modules ignoriert
- IDE-spezifische Dateien ignoriert
- Test-Reports ignoriert

**Evidence:**

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.production
.env.development

# Testing
coverage/
playwright-report/
test-results/

# Cache
.cache/
.temp/

# Claude Code
.claude/settings.local.json
.claude/.session/
.claude/memory/
```

**Severity:** N/A  
**Recommendation:** ✅ .gitignore ist optimal konfiguriert.

---

## 4. Hardcoded Secrets im Source Code

### 4.1 JavaScript/TypeScript Files

**Status:** ✅ PASS

**Findings:**

- Keine hardcoded credentials gefunden
- Config verwendet environment variables korrekt:
  ```javascript
  // src/js/config.js:80
  jsonUrl: import.meta.env.VITE_API_URL ||
    'https://jasha256.github.io/fam-trainingsplan/trainingsplan.json'
  ```

**Evidence:**

```javascript
// Gute Praxis: Default mit Fallback
export const CONFIG = Object.freeze({
  jsonUrl: import.meta.env.VITE_API_URL || 'https://...',
  versionUrl: import.meta.env.VITE_VERSION_URL || 'https://...'
})
```

**Severity:** N/A  
**Recommendation:** ✅ Best Practice bereits implementiert.

---

### 4.2 Configuration Files

**Status:** ⚠️ WARNING

**Findings:**

- MCP Config Dateien (.mcp.json, opencode.json) enthalten Placeholder-Keys im
  Repository
- Diese sollten in .env.example dokumentiert und aus dem Repo entfernt werden

**Files:**

- `.mcp.json` (Zeilen 8-16): API Key Placeholder
- `opencode.json` (Zeilen 9-17): API Key Placeholder

**Severity:** LOW  
**Recommendation:** Diese Dateien mit .env ersetzen oder API Keys in .env
auslagern.

**Suggested Fix:**

```json
// .mcp.json
{
  "mcpServers": {
    "task-master-ai": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}",
        "PERPLEXITY_API_KEY": "${PERPLEXITY_API_KEY}"
      }
    }
  }
}
```

---

## 5. GitHub Pages Deployment Security

### 5.1 Build Artifacts

**Status:** ✅ PASS

**Findings:**

- Nur dist/ wird deployed (GitHub Actions Workflow)
- Keine .env Dateien im dist/ Ordner
- Source Maps deaktiviert (`sourcemap: false` in vite.config.js)

**Evidence:**

```javascript
// vite.config.js:231
build: {
  outDir: 'dist',
  sourcemap: false,  // ✅ Keine Source Maps in Production
  minify: 'esbuild'
}
```

**dist/ Contents:**

```
drwxr-xr-x assets/
drwxr-xr-x icons/
-rw-r--r-- index.html (166k)
-rw-r--r-- trainingsplan.json
-rw-r--r-- manifest.json
-rw-r--r-- sw.js
```

**Severity:** N/A  
**Recommendation:** ✅ Deployment ist sicher konfiguriert.

---

### 5.2 GitHub Actions Deployment

**Status:** ✅ PASS

**Findings:**

- Deployment Workflow testet vor Deployment (unit tests)
- Nur dist/ Artifacts werden deployed
- Keine Secrets im Workflow YAML

**Evidence:**

```yaml
# .github/workflows/deploy.yml:35-38
- name: Build for production
  run: npm run build
  env:
    NODE_ENV: production
```

**Severity:** N/A  
**Recommendation:** ✅ Workflow ist sicher.

---

## 6. Code Security (OWASP Top 10)

### 6.1 XSS Prevention (A03:2021 - Injection)

**Status:** ✅ PASS

**Findings:**

- Kein `innerHTML` Usage im Source Code
- Alpine.js verwendet automatisches Escaping
- Kein `eval()` oder `dangerouslySetInnerHTML`

**Evidence:**

```bash
# Scan Results:
rg "innerHTML|eval|dangerouslySetInnerHTML" src/
# Ergebnis: Keine Treffer
```

**Severity:** N/A  
**Recommendation:** ✅ XSS Prevention gut implementiert.

**OWASP Reference:**
[A03:2021 – Injection](https://owasp.org/Top10/A03_2021-Injection/)

---

### 6.2 postMessage Security (A05:2021 - Security Misconfiguration)

**Status:** ⚠️ WARNING

**Findings:**

- `postMessage` wird in iframe-resize.js verwendet
- Origin Validation ist implementiert (`isOriginAllowed()`)
- Aber: Whitelist enthält auch `*` als Fallback in bestimmten Szenarien

**Evidence:**

```javascript
// src/js/iframe-resize.js:138-146
function isOriginAllowed(origin) {
  const config = CONFIG
  if (!config.iframe?.allowedOrigins) {
    return true // ⚠️ Keine Restrictions als Fallback
  }
  return config.iframe.allowedOrigins.includes(origin)
}

// src/js/iframe-resize.js:289
window.parent.postMessage(message, targetOrigin)
```

**Allowed Origins:**

```javascript
// src/js/config.js:250-254
allowedOrigins: Object.freeze([
  'https://www.freeartsofmovement.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
])
```

**Severity:** MEDIUM  
**Recommendation:**

1. Niemals `*` als targetOrigin verwenden
2. Immer spezifische Origin validieren
3. Message Events ebenfalls validieren

**Secure Implementation:**

```javascript
// Improved: Always validate origin
function sendHeightToParent(origin = null) {
  const targetOrigin = origin || detectParentOrigin()

  // Never use '*' - always require valid origin
  if (targetOrigin === '*' || !isOriginAllowed(targetOrigin)) {
    log('error', 'Invalid or missing parent origin')
    return
  }

  window.parent.postMessage(message, targetOrigin)
}

// Add message validation
function handleParentMessage(event) {
  if (!isOriginAllowed(event.origin)) {
    log('warn', 'Message from unknown origin', { origin: event.origin })
    return
  }

  // ✅ Validate message structure
  if (!event.data || typeof event.data !== 'object') {
    return
  }

  // ✅ Only accept specific message types
  const allowedTypes = ['init', 'requestHeight']
  if (!allowedTypes.includes(event.data.type)) {
    return
  }

  // Process message...
}
```

**OWASP Reference:**
[A05:2021 – Security Misconfiguration](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/)

---

### 6.3 Insecure Data Storage (A02:2021 - Cryptographic Failures)

**Status:** ⚠️ LOW

**Findings:**

- localStorage wird für nicht-sensitive Daten verwendet:
  - Cache für Trainingsplan JSON
  - Favoriten
  - Manuelle Location
- Keine Verschlüsselung implementiert

**Files:**

```javascript
// src/js/trainingsplaner/data-loader.js:145
const cached = localStorage.getItem(CONFIG.cacheKey)

// src/js/trainingsplaner/geolocation-manager.js:149
localStorage.removeItem('manualLocation')
```

**Severity:** LOW  
**Recommendation:**

- Aktuelle Implementation ist OK für öffentliche Trainingsdaten
- Falls in Zukunft persönliche Daten gespeichert werden: Verschlüsselung
  implementieren
- Keine sensitiven User-Daten (Passwords, Tokens) in localStorage speichern

**OWASP Reference:**
[A02:2021 – Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)

---

### 6.4 Insecure HTTP Usage

**Status:** ✅ PASS

**Findings:**

- Alle externen Ressourcen über HTTPS
- Nur localhost über HTTP (Development)

**Evidence:**

```javascript
// Alle HTTPS (Production):
jsonUrl: 'https://jasha256.github.io/...'
tileLayerUrl: 'https://{s}.tile.openstreetmap.org/...'
Leaflet CDN: 'https://unpkg.com/leaflet@1.9.4/...'

// HTTP nur für localhost (Development):
allowedOrigins: ['http://localhost:5173', 'http://127.0.0.1:5173']
```

**Severity:** N/A  
**Recommendation:** ✅ Korrekt implementiert.

---

## 7. Security Headers

### 7.1 Missing Security Headers

**Status:** ❌ FAIL

**Findings:**

- **Keine Security Headers** im index.html oder via Server konfiguriert
- GitHub Pages unterstützt keine Custom Headers via .htaccess

**Missing Headers:**

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https:; connect-src 'self' https://jasha256.github.io https://tile.openstreetmap.org
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self)
```

**Severity:** MEDIUM  
**Recommendation:**

1. **Meta Tags hinzufügen** (limitiert, aber besser als nichts):

```html
<!-- index.html -->
<head>
  <!-- Security Headers via Meta Tags -->
  <meta
    http-equiv="Content-Security-Policy"
    content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com;
    style-src 'self' 'unsafe-inline' https://unpkg.com;
    img-src 'self' data: https:;
    font-src 'self' https://unpkg.com;
    connect-src 'self' https://jasha256.github.io https://*.tile.openstreetmap.org;
  "
  />
  <meta http-equiv="X-Content-Type-Options" content="nosniff" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
</head>
```

2. **Alternative: Cloudflare Pages** (unterstützt \_headers Datei):

```
# _headers
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
```

**OWASP Reference:**
[A05:2021 – Security Misconfiguration](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/)

---

### 7.2 CORS Configuration

**Status:** ⚠️ WARNING

**Findings:**

- Vite Dev Server hat CORS aktiviert (`cors: true`)
- Production (GitHub Pages) sendet CORS Headers automatisch
- Aber: Keine explizite CORS Policy definiert

**Evidence:**

```javascript
// vite.config.js:273
server: {
  port: 5173,
  strictPort: false,
  open: false,
  cors: true  // ⚠️ Zu permissiv
}
```

**Severity:** LOW  
**Recommendation:**

```javascript
// Restrictive CORS Policy
server: {
  cors: {
    origin: ['https://www.freeartsofmovement.com'],
    methods: ['GET', 'POST'],
    credentials: true
  }
}
```

---

## 8. Dependency Security

### 8.1 npm audit

**Status:** ✅ PASS

**Findings:**

```bash
npm audit --audit-level=moderate
# Result: found 0 vulnerabilities
```

**Severity:** N/A  
**Recommendation:**

- ✅ Dependencies sind aktuell und sicher
- Regelmäßig `npm audit` ausführen
- Dependabot aktivieren (GitHub Security)

---

## 9. Additional Security Checks

### 9.1 Subresource Integrity (SRI)

**Status:** ✅ PASS

**Findings:**

- Leaflet CSS verwendet SRI Hash:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossorigin="anonymous"
/>
```

**Severity:** N/A  
**Recommendation:** ✅ Best Practice implementiert.

---

### 9.2 robots.txt & security.txt

**Status:** ⚠️ INFO

**Findings:**

- Keine robots.txt gefunden
- Keine security.txt gefunden

**Severity:** INFO  
**Recommendation:** Optional hinzufügen:

```txt
# security.txt (RFC 9116)
Contact: security@freeartsofmovement.com
Expires: 2026-12-31T23:59:59.000Z
Preferred-Languages: de, en
Canonical: https://www.freeartsofmovement.com/.well-known/security.txt
```

---

## 10. Security Checklist

### 10.1 OWASP Top 10 Mapping

| OWASP Risk                              | Status     | Finding                             |
| --------------------------------------- | ---------- | ----------------------------------- |
| A01:2021 – Broken Access Control        | ✅ N/A     | Keine Auth implementiert            |
| A02:2021 – Cryptographic Failures       | ✅ PASS    | Keine sensitive Daten verschlüsselt |
| A03:2021 – Injection                    | ✅ PASS    | Keine XSS Vulnerabilities           |
| A04:2021 – Insecure Design              | ✅ PASS    | Gutes Design Pattern                |
| A05:2021 – Security Misconfiguration    | ⚠️ WARNING | Missing Security Headers            |
| A06:2021 – Vulnerable Components        | ✅ PASS    | 0 npm vulnerabilities               |
| A07:2021 – Identification/Auth Failures | ✅ N/A     | Keine Auth implementiert            |
| A08:2021 – Software & Data Integrity    | ✅ PASS    | SRI implementiert                   |
| A09:2021 – Security Logging Failures    | ✅ INFO    | Console Logging vorhanden           |
| A10:2021 – Server-Side Request Forgery  | ✅ N/A     | Keine SSRF Möglichkeit              |

---

## 11. Prioritized Recommendations

### 🔴 HIGH Priority

**Keine High Priority Issues gefunden.**

---

### 🟡 MEDIUM Priority

#### 1. Security Headers implementieren

**Issue:** Keine HTTP Security Headers konfiguriert  
**Impact:** Erhöhtes XSS/Clickjacking Risiko  
**Effort:** 30 Minuten

**Fix:**

```html
<!-- index.html <head> section -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https:; connect-src 'self' https://jasha256.github.io https://*.tile.openstreetmap.org"
/>
<meta http-equiv="X-Content-Type-Options" content="nosniff" />
<meta name="referrer" content="strict-origin-when-cross-origin" />
```

#### 2. postMessage Origin Validation verbessern

**Issue:** Fallback zu `*` möglich  
**Impact:** Potentielle Message Injection  
**Effort:** 1 Stunde

**Fix:** Siehe Kapitel 6.2 für vollständige Implementation.

---

### 🟢 LOW Priority

#### 1. .env.example erstellen

**Issue:** Keine Dokumentation der Umgebungsvariablen  
**Impact:** Developer Experience  
**Effort:** 15 Minuten

#### 2. MCP Config in .env auslagern

**Issue:** API Key Placeholder im Repository  
**Impact:** Best Practice Compliance  
**Effort:** 30 Minuten

#### 3. CORS Policy restriktiver konfigurieren

**Issue:** `cors: true` zu permissiv  
**Impact:** Geringes Sicherheitsrisiko  
**Effort:** 15 Minuten

#### 4. security.txt hinzufügen

**Issue:** Keine Security Contact Information  
**Impact:** Responsible Disclosure  
**Effort:** 10 Minuten

---

## 12. Conclusion

### Summary

Das FAM Trainingsplan Projekt zeigt eine **solide Sicherheitsgrundlage**:

- ✅ Keine kritischen Vulnerabilities
- ✅ Gute Code Quality
- ✅ Dependencies aktuell
- ✅ Secrets Management korrekt
- ⚠️ Fehlende Security Headers (GitHub Pages Limitation)
- ⚠️ postMessage könnte sicherer sein

### Security Score Breakdown

- **Code Security:** 9/10
- **Configuration:** 8/10
- **Dependency Management:** 10/10
- **Deployment Security:** 8/10
- **Security Headers:** 5/10 (GitHub Pages Limitation)

**Overall: 8.5/10** - Gut mit Verbesserungspotential

### Next Steps

1. Security Headers via Meta Tags hinzufügen (30 Min)
2. postMessage Origin Validation härten (1h)
3. .env.example erstellen (15 Min)
4. Regelmäßige Security Reviews einplanen (quartalsweise)

---

## 13. References

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [RFC 9116 - security.txt](https://www.rfc-editor.org/rfc/rfc9116.html)
- [npm Audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

**Report Generated:** 2025-10-22  
**Valid Until:** 2025-04-22 (6 Monate)  
**Next Audit:** Q2 2026
