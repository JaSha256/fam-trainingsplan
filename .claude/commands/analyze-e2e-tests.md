# Playwright E2E Test Suite Analysis & Optimization

You are a **Senior Prompt Engineer** and **Senior Test Engineer** with deep expertise in:
- Token-efficient test design for AI-assisted development (Claude Code)
- Playwright MCP Server best practices (2025)
- Test redundancy detection and elimination
- Error detection coverage analysis
- Test suite maintainability and scalability

## Context

**Project**: FAM Trainingsplan (Parkour/Movement Training Platform)
**Test Suite**: 47 Playwright E2E test files (~10,568 LOC)
**Tech Stack**: Alpine.js, Vite, Tailwind CSS, Leaflet Maps
**Development Model**: Solo developer with Claude Code AI assistance
**Token Budget**: Limited - optimize for minimal context usage (~$6/dev/day target)

## Claude Code Best Practices Integration

### Token Optimization Strategy (from Claude Code Docs)
1. **Compact Conversations**: Use `/compact` when test analysis exceeds 95% context
2. **Query Optimization**: Break complex test analysis into focused interactions
3. **Clear History**: Use `/clear` between different test categories
4. **Specific Queries**: "Analyze filter-related tests for redundancy" vs "analyze all tests"

### Playwright MCP Best Practices (2025)
**DO NOT** generate test code based on scenario alone.
**DO** follow this workflow:
1. Navigate to URL using MCP tools
2. Explore functionality one step at a time
3. Implement TypeScript tests using `@playwright/test` with semantic locators
4. Execute and iterate until tests pass

**Specialized Agents** (Playwright ships with 3 agents for Claude Code):
- **Planner Agent**: Explores app and creates test plans
- **Generator Agent**: Knows Playwright best practices, uses semantic locators, implements proper waiting strategies
- **Healer Agent**: Replays failing steps, inspects UI to locate equivalent elements, suggests patches

**Key Principles**:
- Test isolation (each test runs independently)
- Semantic locators (accessibility-first selectors)
- Smart waiting (`page.waitForFunction()` vs `waitForTimeout()`)
- Proper error handling and retry logic
- Readable, maintainable test code

## Analysis Objectives

### 1. Token Efficiency Analysis
Analyze the E2E test suite for token waste:

**Identify:**
- **Redundant test files**: Multiple files testing the same functionality
- **Overly verbose tests**: Excessive comments, logging, or redundant assertions
- **Debug artifacts**: Files with `debug`, `diagnostic`, `validation`, `simplified` in names (likely temporary)
- **Duplicate coverage**: Tests overlapping significantly with unit/integration tests
- **Unnecessary detail**: Tests that could be simplified without losing coverage

**Calculate Token Impact**:
```
Token cost = (LOC × avg_tokens_per_line) + (file_count × file_overhead)
Before: (10,568 × 4) + (47 × 100) = 47,000 tokens
Target: ( ~3,500 × 4) + (~15 × 100) = 15,500 tokens
Savings: 31,500 tokens (67% reduction)
```

**Provide:**
- List of test files to **DELETE** (with justification)
- List of test files to **MERGE** (with suggested new names)
- Token savings estimate per recommendation

### 2. Error Detection Coverage Analysis
Evaluate test effectiveness for catching real bugs:

**Assess:**
- **Critical user flows**: Are most important workflows tested? (filter, favorites, map, PWA)
- **Edge cases**: Boundary conditions, error states, race conditions
- **Browser compatibility**: Is cross-browser testing appropriate or excessive?
- **Regression prevention**: Do tests prevent known bug categories?
- **Failure clarity**: Do test failures provide actionable debugging info?

**Identify gaps:**
- Missing error scenarios (network failures, invalid data, async race conditions)
- Insufficient assertions (tests pass but don't validate correctly)
- Flaky tests (unreliable, causing false positives/negatives)

**Apply Playwright MCP Healer Agent mindset**:
- Can failing tests self-diagnose UI changes?
- Are locators resilient to minor UI changes?
- Do tests use accessibility tree for element location?

### 3. Maintainability & Best Practices
Review against Playwright and Claude Code best practices:

**Check for:**
- **Test independence**: No shared state or execution order dependency
- **Selector fragility**: Prefer `getByRole()`, `getByLabel()` over CSS selectors
- **Setup/teardown**: Proper test isolation enforced
- **Page Object Pattern**: Should common interactions be abstracted?
- **Parallel execution**: Tests safe to run concurrently?
- **CI/CD integration**: Configurations optimized for local and CI

**Flag anti-patterns**:
- Hard-coded waits (`waitForTimeout(3000)`) instead of smart waiting
- Excessive use of `page.waitForTimeout()`
- Missing screenshot/trace capture on failure
- Tests > 30s execution time
- Brittle CSS selectors instead of semantic locators

## Deliverables

### Phase 1: Quick Wins (Token Optimization)
```markdown
## Immediate Deletions (No Value Loss)
1. **tests/e2e/debug-*.spec.js** (X files, ~XXX LOC)
   - Reason: Debug files left from development
   - Coverage: Duplicated in main test suites
   - Token savings: ~X,XXX tokens

2. **tests/e2e/*-diagnostic.spec.js** (X files, ~XXX LOC)
   - Reason: Temporary diagnostic tests
   - Coverage: Not needed in final suite
   - Token savings: ~X,XXX tokens

... (continue for all candidates)

**Total Token Savings**: ~X,XXX LOC removed = XX% reduction
**Estimated Cost Savings**: ~$X.XX per analysis session
```

### Phase 2: Consolidation Opportunities
```markdown
## Merge Candidates
1. **Merge**: `filter-chips.spec.js` + `filter-chips-ux.spec.js` + `filter-chips-ux-enhancement.spec.js`
   - **New name**: `filter-chips-complete.spec.js`
   - **Reason**: All test filter chip UI/UX behavior
   - **Consolidation**: Extract common setup/teardown, merge assertions
   - **Token savings**: 3 files → 1 file, ~X,XXX LOC reduction

2. **Merge**: `map-*.spec.js` files (identify specific candidates)
   - **New name**: `map-integration.spec.js` + `map-visual-validation.spec.js`
   - **Apply Page Object Pattern**: Create `MapViewPage` helper
   - **Token savings**: ~X,XXX LOC extraction + consolidation

... (continue for all merge opportunities)

**Total Token Savings**: ~X,XXX LOC consolidation = XX% reduction
```

### Phase 3: Coverage Gaps & Recommendations
```markdown
## Missing Critical Tests (Playwright MCP Planner Agent approach)
1. **Network Failure Handling**
   - Scenario: trainingsplan.json fails to load (404, timeout, malformed JSON)
   - Expected: User sees error message, app doesn't crash, retry mechanism works
   - Implementation: Add to `smoke-test.spec.js` using `page.route()` to mock failures
   - Locator strategy: `page.getByRole('alert')` for error messages

2. **Async Race Conditions**
   - Scenario: Rapid filter changes before data loads
   - Expected: No UI crashes, correct final state
   - Implementation: Add to `user-flows.spec.js`
   - Use: `page.waitForFunction()` instead of `waitForTimeout()`

3. **Browser Compatibility Edge Cases**
   - Current: Tests run on Chromium, Firefox, Webkit
   - Issue: Safari date picker quirks not tested
   - Recommendation: Add Safari-specific tests OR remove Webkit from matrix (save tokens)

... (continue for all gaps)
```

### Phase 4: Refactoring Recommendations
```markdown
## Page Object Pattern (Reduce Token Duplication)
Create shared page objects for:

### `FilterPanelPage` - Used in 15+ test files
```javascript
// tests/page-objects/FilterPanelPage.js
export class FilterPanelPage {
  constructor(page) {
    this.page = page
    // Semantic locators (Playwright MCP Generator Agent best practice)
    this.weekdayFilter = page.getByRole('group', { name: 'Wochentag' })
    this.locationFilter = page.getByRole('group', { name: 'Ort' })
    this.clearButton = page.getByRole('button', { name: 'Filter zurücksetzen' })
  }

  async selectWeekday(day) {
    await this.weekdayFilter.getByLabel(day).check()
  }

  async clearFilters() {
    await this.clearButton.click()
    // Smart waiting (not waitForTimeout)
    await this.page.waitForFunction(() =>
      !document.querySelector('[data-active-filters]')
    )
  }
}
```

**Token Savings**: Extract ~2,000 LOC of duplicate selectors/interactions

### `MapViewPage` - Used in 20+ test files
### `TrainingCardPage` - Used in 10+ test files

## Flaky Test Fixes (Playwright MCP Healer Agent approach)
1. **tests/e2e/map-zoom-location.spec.js**
   - Issue: Race condition with Leaflet initialization
   - Current: `await page.waitForTimeout(3000)`
   - Fix:
   ```javascript
   await page.waitForFunction(() => {
     const map = window.mapInstance
     return map && map.getZoom() === 13
   })
   ```

2. **tests/e2e/filter-chips-ux.spec.js**
   - Issue: Brittle CSS selector `.filter-chip`
   - Current: `await page.locator('.filter-chip').click()`
   - Fix: `await page.getByRole('button', { name: /Montag/ }).click()`
```

### Phase 5: Final Recommendations
```markdown
## Optimal Test Suite Structure
Recommended reduction: **47 files → 15 core files**

**Core Test Categories** (Token-Optimized):
1. ✅ `smoke-test.spec.js` - App loads, critical paths work (KEEP, ~200 LOC)
2. ✅ `accessibility.spec.js` - WCAG compliance (KEEP, ~150 LOC)
3. ✅ `performance.spec.js` - Lighthouse scores (KEEP, ~100 LOC)
4. ✅ `user-flows.spec.js` - End-to-end workflows (EXPAND with merged tests, ~500 LOC)
5. ✅ `pwa-offline.spec.js` - PWA functionality (KEEP, ~150 LOC)
6. ✅ `visual-regression.spec.js` - UI consistency (KEEP, ~200 LOC)
7. ✅ `filter-complete.spec.js` - All filter functionality (MERGE from 8 files, ~400 LOC)
8. ✅ `map-integration.spec.js` - Map interactions (MERGE from 15 files, ~350 LOC)
9. ✅ `favorites-complete.spec.js` - Favorites workflow (MERGE from 3 files, ~250 LOC)
10. ✅ `mobile-responsive.spec.js` - Mobile UX (MERGE from 4 files, ~300 LOC)
11. ✅ `touch-targets.spec.js` - Touch interaction (KEEP, ~100 LOC)
12. ✅ `sticky-sidebar.spec.js` - Sidebar behavior (KEEP, ~150 LOC)
13. ✅ `split-view.spec.js` - View switching (MERGE from 2 files, ~200 LOC)
14. ✅ `header-footer.spec.js` - Navigation (MERGE from 2 files, ~150 LOC)
15. ✅ `error-handling.spec.js` - Edge cases & errors (NEW, ~200 LOC)

**Token Efficiency**:
- Before: ~10,568 LOC across 47 files = ~47,000 tokens per analysis
- After: ~3,500 LOC across 15 files = ~15,500 tokens per analysis
- Reduction: **67% fewer tokens** (~31,500 tokens saved)
- Coverage: Maintained or improved (added error handling tests)

**Execution Time**:
- Before: ~15-20 minutes (all tests, all browsers)
- After: ~5-7 minutes (optimized suite, selective browser matrix)

**Cost Impact** (Claude Code pricing):
- Token savings per test analysis: ~31,500 tokens × $0.003/1K = **~$0.09 saved**
- With 20 test analysis sessions/month: **~$1.80/month savings**
- Plus faster feedback loop: **~10-15 min saved per session**
```

## Analysis Methodology

### Step 1: Inventory & Categorization
For each of 47 test files, list:
- File name
- Line count (`wc -l`)
- Primary test category (filters, map, PWA, accessibility, UI, etc.)
- Browser specificity (all browsers, chromium-only, etc.)
- Suspected redundancy level (high, medium, low)
- Debug/diagnostic indicator (has `debug`, `validation`, `simplified` in name?)

### Step 2: Redundancy Matrix
Create overlap matrix:
```
                     filter.spec  complete-feat  user-flows  quick-test
Filter clearing         100%          80%           40%         60%
Favorites toggle         50%          90%           60%         30%
Map interaction          20%          70%          100%         10%
Error states             40%          50%           80%          0%
```

### Step 3: Coverage Analysis
For each user story, identify:
- Which tests cover it (primary + redundant)
- Whether coverage is excessive (3+ files testing same thing)
- Recommended primary test location
- Gap analysis (what's NOT tested?)

### Step 4: Token Impact Calculation
Calculate reduction impact:
```
Current: (10,568 LOC × 4 tokens/LOC) + (47 files × 100 tokens overhead) = 47,000 tokens
Target:  ( 3,500 LOC × 4 tokens/LOC) + (15 files × 100 tokens overhead) = 15,500 tokens
Savings: 31,500 tokens (67% reduction)

Cost savings: 31,500 tokens × $0.003/1K tokens = $0.09 per analysis
```

### Step 5: Playwright MCP Best Practices Check
For each test file, verify:
- ✅ Uses semantic locators (`getByRole`, `getByLabel`) vs CSS selectors
- ✅ Uses smart waiting (`waitForFunction`) vs hard-coded timeouts
- ✅ Has proper error handling and screenshots on failure
- ✅ Tests are isolated (no shared state)
- ✅ Locators are resilient to UI changes (accessibility tree)

### Step 6: Apply Heuristics
Auto-flag files that match patterns:
- `debug-*.spec.js` → DELETE (debug artifacts)
- `*-diagnostic.spec.js` → DELETE (temporary validation)
- `*-validation.spec.js` → REVIEW (may be redundant)
- `*-simplified.spec.js` → MERGE (duplicate of non-simplified version)
- Files with > 500 LOC → CHECK for verbosity
- Files with < 50 LOC → CHECK if trivial/redundant
- Multiple files testing same component → MERGE candidates

## Execution Instructions

1. **Read test files systematically** (use `/compact` if context > 95%)
2. **Categorize** by functionality (use table format for clarity)
3. **Identify patterns**: Similar names, duplicate assertions, debug files
4. **Cross-reference** with unit/integration test coverage
5. **Apply heuristics** to flag deletion/merge candidates
6. **Generate report** following deliverable structure
7. **Use `/clear`** between major analysis sections if needed

## Success Criteria

- ✅ Identify at least **20 files for deletion or merger** (40% reduction minimum)
- ✅ Maintain or improve **error detection coverage** (no regressions, add gaps)
- ✅ Reduce **token consumption by 50-70%** without losing critical tests
- ✅ Provide **actionable recommendations** implementable immediately
- ✅ Align with **solo developer + Claude Code workflow**
- ✅ Apply **Playwright MCP 2025 best practices** (semantic locators, smart waiting)
- ✅ Include **Page Object Pattern** recommendations for token efficiency

---

**Now analyze the E2E test suite at `tests/e2e/` and provide the comprehensive analysis following this structure.**

Use the following commands during analysis:
- `/compact` when context approaches 95%
- `/clear` between major analysis sections
- Focus queries: "Analyze filter-related tests" not "analyze all tests"
