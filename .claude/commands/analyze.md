---
description: Analysiert Codebase und identifiziert Verbesserungen
---

Führe eine umfassende Code-Analyse durch:

## 1. Projektstruktur

Analysiere die aktuelle Struktur:
- `src/js/` - JavaScript Module
- `src/style.css` - Tailwind CSS
- `public/` - Statische Assets
- `tests/` - Test-Dateien

## 2. Code Quality Checks

**Alpine.js Komponenten**:
- Sind alle Components modular aufgebaut?
- Werden x-data Scopes richtig genutzt?
- Alpine Plugins korrekt eingebunden?

**JavaScript**:
- ESLint Regeln befolgt?
- Moderne ES6+ Features genutzt?
- Error Handling implementiert?
- Code-Duplikation vorhanden?

**CSS/Tailwind**:
- Tailwind v4 korrekt konfiguriert?
- Custom CSS minimiert?
- Responsive Design optimiert?
- Unused Classes entfernt?

## 3. Performance Analyse

**Bundle Size**:
- Vendor Chunks optimiert? (Alpine, Leaflet, Fuse.js)
- Tree-shaking aktiv?
- Dynamic Imports genutzt?

**Caching**:
- LocalStorage effizient genutzt?
- Service Worker Strategien optimal?
- Cache-Duration angemessen?

## 4. Best Practices

**PWA**:
- Offline-First Strategie
- Update-Mechanismus
- Icon-Größen vollständig

**Accessibility**:
- ARIA Labels gesetzt?
- Keyboard Navigation möglich?
- Color Contrast ausreichend?

**SEO**:
- Meta Tags vorhanden?
- Open Graph Tags?
- Structured Data?

## 5. Verbesserungsvorschläge

Basierend auf der Analyse:
1. Quick Wins (sofort umsetzbar)
2. Medium Priority (nächste Iteration)
3. Long Term (zukünftige Features)

Zeige konkrete Code-Beispiele für Verbesserungen.
