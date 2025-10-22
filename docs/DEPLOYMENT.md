# FAM Trainingsplan - Deployment Guide

Vollständige Anleitung für das Deployment auf verschiedenen Plattformen.

## Inhaltsverzeichnis

1. [Voraussetzungen](#voraussetzungen)
2. [Build-Prozess](#build-prozess)
3. [Deployment-Optionen](#deployment-optionen)
4. [Server-Konfiguration](#server-konfiguration)
5. [CI/CD](#cicd)
6. [Troubleshooting](#troubleshooting)

## Voraussetzungen

### Lokale Entwicklung

```bash
# Node.js und npm (Arch Linux)
sudo pacman -S nodejs npm

# Dependencies installieren
npm ci

# Development Server starten
npm run dev
```

### Production Build

```bash
# Production Build erstellen
npm run build

# Build mit Bundle Analyzer
ANALYZE=true npm run build

# Preview des Production Builds
npm run preview
```

## Build-Prozess

### Automatischer Build

Das Projekt nutzt Vite für optimierten Production Build:

- **Minification**: ESBuild (schneller als Terser)
- **Code Splitting**: Vendor chunks (Alpine.js, Leaflet, Fuse.js)
- **Asset Optimization**: Hashed filenames, optimierte Ordnerstruktur
- **PWA**: Service Worker mit Workbox, offline-fähig
- **Compression**: Gzip-ready Assets

### Build-Verzeichnis-Struktur

```
dist/
├── index.html                              # Haupt-HTML (gzipped: ~10KB)
├── manifest.webmanifest                    # PWA Manifest
├── sw.js                                   # Service Worker
├── workbox-*.js                           # Workbox Runtime
└── assets/
    ├── js/
    │   ├── index.[hash].js                # Main bundle (~35KB gzipped)
    │   ├── vendor-alpine.[hash].js        # Alpine.js (~22KB gzipped)
    │   ├── vendor-map.[hash].js           # Leaflet (~44KB gzipped)
    │   └── vendor-utils.[hash].js         # Fuse.js (~7KB gzipped)
    ├── index.[hash].css                   # Styles (~24KB gzipped)
    ├── images/                            # Optimierte Images
    └── fonts/                             # Web Fonts
```

**Total gzipped size**: ~140KB (initial load)

## Deployment-Optionen

### 1. Deployment-Script (Empfohlen)

Nutze das mitgelieferte `deploy.sh` Script:

```bash
# Preview lokal
./deploy.sh preview

# Deploy zu lokalem Server
./deploy.sh --build local

# Deploy zu nginx mit Backup
./deploy.sh --backup nginx

# Deploy zu GitHub Pages
./deploy.sh github
```

### 2. Manuelles Deployment

#### Nginx (Arch Linux)

```bash
# Build erstellen
npm run build

# Zu nginx web root kopieren
sudo rsync -av --delete dist/ /usr/share/nginx/html/

# nginx Config kopieren
sudo cp nginx.conf /etc/nginx/sites-available/fam-trainingsplan

# Site aktivieren
sudo ln -s /etc/nginx/sites-available/fam-trainingsplan /etc/nginx/sites-enabled/

# nginx neu laden
sudo nginx -t
sudo systemctl reload nginx
```

#### Apache

```bash
# Build erstellen
npm run build

# Zu Apache web root kopieren
sudo rsync -av --delete dist/ /var/www/html/fam-trainingsplan/

# .htaccess kopieren
sudo cp .htaccess dist/

# Apache neu starten
sudo systemctl restart apache2  # oder httpd auf Arch
```

#### Static Hosting (Netlify, Vercel, etc.)

```bash
# Build erstellen
npm run build

# dist/ Verzeichnis deployen
# - Netlify: netlify deploy --prod --dir=dist
# - Vercel: vercel --prod
```

### 3. GitHub Pages

#### Via GitHub Actions (Automatisch)

Push zu `main` Branch triggert automatisches Deployment:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

#### Manuell

```bash
# Build erstellen
npm run build

# gh-pages Branch erstellen und pushen
cd dist
git init
git add -A
git commit -m "Deploy"
git branch -M gh-pages
git remote add origin <your-repo-url>
git push -f origin gh-pages
```

## Server-Konfiguration

### nginx (Production-Ready)

Siehe `nginx.conf` für vollständige Konfiguration mit:

- ✅ Gzip Compression
- ✅ Cache Headers (1 Jahr für Assets, no-cache für HTML)
- ✅ Security Headers (X-Frame-Options, CSP, etc.)
- ✅ SPA Routing (fallback zu index.html)
- ✅ PWA Support (Service Worker headers)

**Wichtige Einstellungen:**

```nginx
# Cache für JS/CSS mit Hash
location ~* \.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Kein Cache für HTML und Service Worker
location ~* (\.html|sw\.js)$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}

# SPA Routing
location / {
    try_files $uri $uri/ /index.html;
}
```

### Apache (Production-Ready)

Siehe `.htaccess` für vollständige Konfiguration mit:

- ✅ mod_deflate Compression
- ✅ mod_expires Caching
- ✅ Security Headers
- ✅ SPA Routing (RewriteRule)
- ✅ MIME Types

**Wichtige Module aktivieren:**

```bash
# Arch Linux / Apache
sudo a2enmod rewrite
sudo a2enmod deflate
sudo a2enmod expires
sudo a2enmod headers
sudo systemctl restart httpd
```

## CI/CD

### GitHub Actions Workflows

Das Projekt ist mit 3 GitHub Actions Workflows konfiguriert:

#### 1. **CI** (`.github/workflows/ci.yml`)

Läuft bei jedem Push/PR:

- ✅ Lint (ESLint)
- ✅ Type Check (TypeScript)
- ✅ Unit Tests (Vitest)
- ✅ Integration Tests (Playwright)
- ✅ E2E Tests (Playwright - Chromium)
- ✅ Accessibility Tests (Axe)
- ✅ Build Check

#### 2. **Deploy** (`.github/workflows/deploy.yml`)

Automatisches Deployment bei Push zu `main`:

- ✅ Build Production
- ✅ Run Tests
- ✅ Upload Artifacts
- ✅ Optional: GitHub Pages Deployment

#### 3. **Visual Regression** (`.github/workflows/visual-regression.yml`)

Screenshot-Tests bei PRs:

- ✅ Visual Snapshots
- ✅ Diff bei Änderungen
- ✅ PR Comment mit Ergebnissen

### Dependabot

Automatische Dependency Updates konfiguriert:

- **npm**: Wöchentlich montags (gruppiert nach Kategorie)
- **GitHub Actions**: Wöchentlich montags

## Performance-Optimierungen

### 1. Build-Optimierungen

```bash
# Bereits konfiguriert in vite.config.js
- Code Splitting (vendor chunks)
- Tree Shaking (ESBuild)
- Minification (ESBuild)
- Asset Optimization (Hashed filenames)
```

### 2. Runtime-Optimierungen

```bash
# PWA Caching Strategy
- App Shell: Cache First
- API Data: Network First (1h cache)
- Images: Cache First (30 Tage)
- Fonts: Cache First (1 Jahr)
- Map Tiles: Cache First (7 Tage)
```

### 3. Lighthouse Score Goals

- **Performance**: >90
- **Accessibility**: >95
- **Best Practices**: >95
- **SEO**: >90
- **PWA**: ✓ Installable

### 4. Monitoring

```bash
# Bundle Size Analyse
ANALYZE=true npm run build

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

## Troubleshooting

### Build schlägt fehl

```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install

# Cache leeren
rm -rf node_modules/.vite
npm run build
```

### Server zeigt 404 für Routes

**Problem**: SPA-Routing funktioniert nicht

**Lösung nginx**:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Lösung Apache**:

```apache
RewriteRule ^ index.html [L]
```

### Service Worker aktualisiert nicht

```bash
# Browser Cache leeren
- Hard Refresh: Ctrl+Shift+R (Chrome/Firefox)
- DevTools → Application → Service Workers → Unregister

# Server Headers prüfen
curl -I https://your-domain.com/sw.js
# Sollte sein: Cache-Control: no-cache
```

### Assets werden nicht geladen

**Problem**: Base Path nicht korrekt

**Lösung**: `vite.config.js` anpassen:

```javascript
export default defineConfig({
  base: '/your-subdirectory/' // oder './' für relative paths
})
```

### Deployment zu GitHub Pages

```bash
# Base path für GitHub Pages anpassen
# vite.config.js
base: '/repository-name/',

# Neu builden
npm run build

# Deploy
./deploy.sh github
```

## Checkliste vor Production

- [ ] Tests laufen erfolgreich (`npm test`)
- [ ] Build funktioniert (`npm run build`)
- [ ] Lighthouse Score >90
- [ ] Service Worker funktioniert (offline test)
- [ ] Responsive auf allen Geräten
- [ ] Browser-Kompatibilität getestet
- [ ] Environment-Variablen konfiguriert
- [ ] Server-Konfiguration angepasst
- [ ] SSL-Zertifikat installiert (HTTPS)
- [ ] Analytics/Monitoring eingerichtet
- [ ] Backup-Strategie definiert
- [ ] Rollback-Plan vorhanden

## Weitere Ressourcen

- [Vite Deployment Guide](https://vite.dev/guide/static-deploy.html)
- [nginx Documentation](https://nginx.org/en/docs/)
- [Apache mod_rewrite](https://httpd.apache.org/docs/current/mod/mod_rewrite.html)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [PWA Deployment Best Practices](https://web.dev/progressive-web-apps/)

---

**Erstellt**: 2025-10-21 **Autor**: Setup-Automatisierung
