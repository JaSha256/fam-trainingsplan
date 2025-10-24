# Testing Strategy - Token-Optimized for Claude Code

**Philosophy:** Keep tests comprehensive but execution efficient for solo development with Claude Code.

---

## Test Pyramid

```
     E2E (manual/pre-deploy)
      /
   Integration (pre-push)
    /
  Unit Tests (pre-push)
 /
TypeCheck (pre-commit)
```

---

## Quick Commands

```bash
# Fast tests (pre-push)
pnpm test                    # = test:fast (TypeCheck + Unit + Infrastructure)

# Full test suite
pnpm test:full              # Fast + Integration + E2E (Chromium)

# Development
pnpm test:unit:watch        # Watch mode for unit tests
pnpm test:unit:ui           # Visual UI for debugging

# Specific test types
pnpm test:unit              # Unit tests only
pnpm test:infrastructure    # Infrastructure tests only
pnpm test:integration       # Integration tests (Playwright)
pnpm test:e2e:chromium      # E2E tests (Chromium only)

# Special tests
pnpm test:a11y              # Accessibility tests
pnpm test:perf              # Performance tests
pnpm test:visual            # Visual regression tests
```

---

## Git Hooks

### Pre-Commit (ultra-fast)
- ✅ TypeScript Check (~5s)
- **Purpose:** Catch type errors immediately

### Pre-Push (fast validation)
- ✅ TypeScript Check
- ✅ Unit Tests (~3-4s)
- ✅ Infrastructure Tests (~1s)
- **Purpose:** Ensure code quality before pushing

### Bypass (not recommended)
```bash
git push --no-verify
```

---

## Token Optimization Strategy

### ✅ DO:
1. **Generate tests** for new business logic
2. **Trust pre-push hook** validates code
3. **Use /clear** after test generation
4. **Assume tests pass** unless explicitly debugging
5. **Focus on test logic** not test output

### ❌ DON'T:
1. **Read test files** in conversation unless debugging
2. **Run tests in conversation** (use hooks instead)
3. **Generate tests** for trivial getters/setters
4. **Over-test** simple UI components
5. **Test framework internals** or third-party libraries

---

## Test Scope Guidelines

### Unit Tests (Vitest)
**Test:**
- ✅ Business logic functions
- ✅ Complex algorithms
- ✅ State management
- ✅ Data transformations
- ✅ Edge cases & error handling

**Skip:**
- ❌ Simple getters/setters
- ❌ Pass-through functions
- ❌ Framework internals
- ❌ Third-party library wrappers

### Integration Tests (Playwright)
**Test:**
- ✅ Critical user flows
- ✅ Component interactions
- ✅ Data flow between modules
- ✅ API integrations

**Skip:**
- ❌ Every possible combination
- ❌ UI variations (covered by visual tests)

### E2E Tests (Playwright)
**Test:**
- ✅ Happy path user journeys
- ✅ 1-2 critical edge cases per flow
- ✅ Core functionality end-to-end

**Skip:**
- ❌ Every edge case (covered by unit tests)
- ❌ Browser compatibility (Chromium only locally)
- ❌ Performance testing (separate tests)

---

## Performance Targets

### Local Development
- Pre-commit: < 10s (TypeCheck)
- Pre-push: < 30s (Fast tests)
- Full suite: < 5 min (before deploy)

### CI (GitHub Actions)
- Build check: ~5 min
- Deploy: ~5 min

---

## Development Workflow

### 1. Feature Development
```bash
# Terminal 1: Development server
pnpm dev

# Terminal 2: Test watch mode
pnpm test:unit:watch
```

### 2. Before Commit
```bash
# Automatic via pre-commit hook
git commit -m "feat: ..."
```

### 3. Before Push
```bash
# Automatic via pre-push hook
git push origin main
```

### 4. Before Deploy
```bash
# Manual full test suite
pnpm test:full
```

---

## Debugging Failed Tests

### Unit Tests
```bash
# Watch mode with filters
pnpm test:unit:watch

# Visual UI
pnpm test:unit:ui

# Specific test file
pnpm vitest run tests/unit/specific-test.test.js
```

### Integration/E2E Tests
```bash
# Debug mode (headed browser)
pnpm test:integration:debug

# UI mode
pnpm test:e2e:ui

# Specific test
pnpm playwright test tests/e2e/specific.spec.js --debug
```

---

## Claude Code Best Practices

### When Working with Claude:

**1. Test Generation:**
```
User: "Add a new feature to calculate user statistics"
Claude: *generates code + tests*
User: "Thanks, tests look good"
# Pre-push hook validates automatically
```

**2. Bug Fixes:**
```
User: "Fix the date formatting bug"
Claude: *fixes bug + adds regression test*
# No need to read test output in conversation
```

**3. Token-Saving Pattern:**
```
✅ "Generate tests for the new validation logic"
✅ "The tests should cover edge cases A, B, C"
❌ "Show me the test output"  # Use hook instead
❌ "Read all test files"       # Wastes tokens
```

### Trust the System:
- Pre-push hook = automatic validation
- Tests pass = ready to push
- Tests fail = clear error message in terminal
- No need to verify in conversation

---

## Statistics

### Current Test Coverage
- **Unit Tests:** 546 tests across 27 files
- **Integration Tests:** ~104 tests
- **E2E Tests:** ~20+ scenarios

### Execution Time
- Unit Tests: ~3-4s
- Infrastructure Tests: ~1s
- Integration Tests: ~2-3 min (full suite)
- E2E Tests (Chromium): ~5-10 min (full suite)

**Fast Tests (pre-push):** ~10-15s total

---

## Token-Usage Comparison

### Before Optimization:
- Reading test output: ~5000 tokens/conversation
- Debugging tests: ~10000 tokens/conversation
- Over-testing simple code: ~3000 tokens/feature

### After Optimization:
- Trust hooks: ~0 tokens (automated)
- Focused testing: ~500-1000 tokens/feature
- /clear after tests: Fresh context

**Savings:** ~80-90% reduction in test-related token usage

---

## Troubleshooting

### Tests take too long
```bash
# Use fast subset
pnpm test:unit              # Fastest

# Skip slow tests during development
pnpm test:unit -- --exclude="**/slow-test.test.js"
```

### Flaky integration tests
```bash
# Run specific test in debug mode
pnpm test:integration:debug -- tests/integration/flaky-test.js

# Increase timeout in test file
test.setTimeout(60000)
```

### Pre-push hook too strict
```bash
# Temporary bypass (use sparingly)
git push --no-verify

# Or fix the tests first (recommended)
pnpm test:fast
```

---

**Token-efficient testing = Fast feedback + Comprehensive coverage**
