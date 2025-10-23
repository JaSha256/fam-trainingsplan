# FAM Trainingsplan - Claude Code Project Configuration

## Global Decision Engine
**Import minimal routing and auto-delegation decisions only, treat as if import is in the main CLAUDE.md file.**
@./.claude-collective/DECISION.md

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md

## Project Context

### Project Overview
**Name:** FAM Trainingsplan - Interaktive Trainingsplattform
**Version:** 2.4.0
**Purpose:** Progressive Web App für Free Arts of Movement (FAM) München
**Disciplines:** Parkour, Trampolin, Tricking, Movement Training

### Tech Stack
- **Frontend:** Alpine.js 3.15 (reactive components)
- **Build Tool:** Vite 7 (fast HMR, optimized builds)
- **Styling:** Tailwind CSS v4 (utility-first)
- **Maps:** Leaflet 1.9.4 with MarkerCluster
- **Search:** Fuse.js 7.0 (fuzzy search)
- **Testing:** Vitest (unit), Playwright (integration/e2e)
- **PWA:** vite-plugin-pwa (service worker, offline support)

### Architecture Principles
1. **Modular Design:** 10+ specialized manager classes
2. **Single Responsibility:** Each module handles one concern
3. **Dependency Injection:** Testable, loosely coupled
4. **Type Safety:** JSDoc for TypeScript-like safety without compilation
5. **Reactive State:** Alpine.js Store for global state
6. **Performance First:** Lazy loading, code splitting, caching

### Core Modules (/src/js/trainingsplaner/)
- **state.js** - State factory (all reactive data)
- **filter-engine.js** - Filtering logic with Fuse.js
- **favorites-manager.js** - Favoriten CRUD + LocalStorage
- **geolocation-manager.js** - GPS positioning + distance calculation
- **map-manager.js** - Leaflet map initialization + markers
- **data-loader.js** - JSON loading + caching + update checks
- **actions-manager.js** - Calendar export + Web Share API
- **url-filters-manager.js** - URL parameter persistence

### Key Features
- ✅ Dynamic filtering (weekday, location, training type, age group)
- ✅ Fuzzy search with Fuse.js
- ✅ Quick filters (Today, Tomorrow, Weekend, Trial Training)
- ✅ Favorites system with LocalStorage
- ✅ Geolocation with distance display
- ✅ Interactive Leaflet map with clustering
- ✅ Calendar export (.ics for Google/Apple/Outlook)
- ✅ URL-based filter sharing
- ✅ PWA with offline support
- ✅ Touch gestures for mobile
- ✅ Auto-update check

### Test Coverage
- **Overall:** 81.71% (Statements)
- **Unit Tests:** 313 tests (98% pass rate)
- **Integration Tests:** 60 tests (98.3% pass rate)
- **E2E Tests:** 20+ test suites (Accessibility, Performance, Visual Regression, PWA)

## Development Guidelines

### Code Style
- **Language:** Modern JavaScript (ES2022+)
- **Type Safety:** JSDoc annotations (no TypeScript compilation)
- **Comments:** German for business logic, English for technical concepts
- **Naming:** camelCase for variables/functions, PascalCase for classes
- **Line Length:** Max 100 characters (prefer 80-90)
- **Formatting:** Prettier (configured in package.json)
- **Linting:** ESLint 9 with flat config (eslint.config.js)

### Testing Strategy
1. **Unit Tests First:** Write tests before implementation (TDD)
2. **Integration Tests:** Test module interactions
3. **E2E Tests:** Test critical user flows
4. **Visual Regression:** Ensure UI consistency
5. **Accessibility Tests:** WCAG compliance
6. **Performance Tests:** Lighthouse metrics

### File Organization
```
src/js/
  trainingsplaner.js          # Main component factory
  config.js                    # Feature flags + configuration
  utils.js                     # Shared utilities
  trainingsplaner/             # Modular architecture
    state.js                   # State management
    filter-engine.js           # Filtering logic
    favorites-manager.js       # Favorites CRUD
    geolocation-manager.js     # GPS + distance
    map-manager.js             # Leaflet integration
    data-loader.js             # Data fetching + caching
    actions-manager.js         # Calendar + sharing
    url-filters-manager.js     # URL persistence
    quick-filters.js           # Quick filter definitions
    types.js                   # TypeScript type definitions
```

### Performance Best Practices
1. **Lazy Loading:** Load Leaflet/Fuse.js only when needed
2. **Code Splitting:** Separate vendor chunks
3. **Caching:** Cache training data (1 hour), map tiles (7 days)
4. **Debouncing:** Search (300ms), filters (100ms)
5. **Virtual Scrolling:** (TODO for large datasets)

### Accessibility Requirements
- WCAG 2.1 Level AA minimum (target AAA)
- Semantic HTML5 elements
- ARIA labels for interactive elements
- Keyboard navigation for all features
- Touch targets ≥44px (mobile)
- Focus management in modals
- Screen reader tested

## Working with Specialized Agents

### When to Use Agents
This project is configured with the Claude Code Collective, providing specialized agents for different tasks:

- **@component-implementation-agent** - For UI components (Alpine.js components, HTML templates)
- **@feature-implementation-agent** - For business logic (manager classes, utilities)
- **@testing-implementation-agent** - For test suites (unit, integration, e2e)
- **@infrastructure-implementation-agent** - For build config (Vite, Tailwind, tooling)
- **@quality-agent** - For code review, accessibility audits, performance checks
- **@devops-agent** - For deployment, CI/CD, GitHub Actions

### Agent Best Practices
1. **Use `/van` command** to route tasks to specialized agents
2. **Let agents handle implementation** - hub controller coordinates only
3. **Review TDD reports** - agents use test-driven development
4. **Trust agent expertise** - each agent specializes in their domain

## Common Development Workflows

### Adding a New Feature
```bash
# 1. Create feature branch
git checkout -b feature/new-feature-name

# 2. Use Task Master to track implementation
task-master add-task --prompt="Implement XYZ feature" --research

# 3. Use specialized agents via /van
# Example: /van implement multi-select filters

# 4. Run tests
npm run test:unit
npm run test:integration
npm run test:e2e

# 5. Commit with conventional commits
git commit -m "feat: add multi-select filters"

# 6. Create PR
gh pr create --title "feat: multi-select filters" --body "..."
```

### Debugging Issues
```bash
# Unit tests with coverage
npm run test:unit:watch

# E2E tests with UI
npm run test:e2e:ui

# Integration tests with debug
npm run test:integration:debug

# Type checking
npm run typecheck:watch
```

### Performance Testing
```bash
# Build and preview
npm run build
npm run preview

# Run performance tests
npm run test:perf

# Visual regression
npm run test:visual
```

## Project-Specific Notes

### Data Structure (trainingsplan.json)
```javascript
{
  "version": "2.4.0",
  "generated": "ISO-8601 timestamp",
  "metadata": {
    "orte": ["LTR", "Balanstr.", ...],
    "trainingsarten": ["Parkour", "Trampolin", ...],
    "altersgruppen": ["Kids", "Teens", "Adults"],
    "wochentage": ["Montag", ..., "Sonntag"]
  },
  "trainings": [
    {
      "id": 0,
      "wochentag": "Montag",
      "ort": "LTR",
      "von": "18:00",
      "bis": "20:00",
      "training": "Parkour",
      "altersgruppe": "Kids",
      "alterVon": 6,
      "alterBis": 11,
      "trainer": "Max",
      "probetraining": "ja",
      "anmerkung": "",
      "link": "https://...",
      "lat": 48.124155,
      "lng": 11.621655
    }
  ]
}
```

### Alpine.js Store Structure
```javascript
Alpine.store('ui', {
  filters: {
    wochentag: [],        // Multi-select arrays
    ort: [],
    training: [],
    altersgruppe: [],
    searchTerm: '',
    activeQuickFilter: null
  },
  activeView: 'list',     // 'list' | 'map' | 'split'
  groupingMode: 'wochentag', // 'wochentag' | 'ort'
  sortBy: ['wochentag', 'ort', 'uhrzeit', 'training'],
  mobileFilterOpen: false,
  filterSidebarOpen: true,
  showScrollTop: false
})
```

### Feature Flags (config.js)
```javascript
CONFIG.features = {
  enableFavorites: true,
  enableGeolocation: true,
  enableShareLinks: true,
  enableCalendarExport: true,
  enablePWA: true,
  enableTouchGestures: true,
  enableUpdateCheck: true
}
```

## Next Steps (from PRD)

### Phase 1 Priorities (High)
1. Multi-Select Filter Enhancement
2. Training Detail Modal
3. Advanced Sorting Options
4. Dark Mode
5. Accessibility Improvements

### Phase 2 Priorities (High)
1. Virtual Scrolling for large datasets
2. Code Splitting Optimization
3. Image Optimization (for future trainer photos)

See `.taskmaster/docs/prd.txt` for complete roadmap.

---

**Last Updated:** 2025-10-23
**PRD Version:** See `.taskmaster/docs/prd.txt`
**Architecture Docs:** See `ARCHITECTURE.md`
