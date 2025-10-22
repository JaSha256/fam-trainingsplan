# FAM Trainingsplan - Just Task Runner
# Run 'just' or 'just --list' to see available commands

# Default recipe (shows available commands)
default:
    @just --list

# -----------------------------------------------------
# Development
# -----------------------------------------------------

# Start development server
dev:
    npm run dev

# Start development server and open in browser
dev-open:
    npm run dev -- --open

# Build for production
build:
    npm run build

# Build with bundle analysis
build-analyze:
    ANALYZE=true npm run build

# Preview production build
preview:
    npm run preview

# -----------------------------------------------------
# Testing
# -----------------------------------------------------

# Run all tests
test:
    npm test

# Run unit tests only
test-unit:
    npm run test:unit

# Run unit tests in watch mode
test-unit-watch:
    npm run test:unit:watch

# Run unit tests with UI
test-unit-ui:
    npm run test:unit:ui

# Run integration tests
test-integration:
    npm run test:integration

# Run integration tests with UI
test-integration-ui:
    npm run test:integration:ui

# Run E2E tests
test-e2e:
    npm run test:e2e

# Run E2E tests with UI
test-e2e-ui:
    npm run test:e2e:ui

# Run E2E tests with UI using system browsers (Arch Linux)
test-e2e-system:
    USE_SYSTEM_BROWSERS=true npm run test:e2e:ui

# Run E2E tests in debug mode
test-e2e-debug:
    npm run test:e2e:debug

# Run visual regression tests
test-visual:
    npm run test:visual

# Update visual regression snapshots
test-visual-update:
    npm run test:visual:update

# Run accessibility tests
test-a11y:
    npm run test:a11y

# Run performance tests
test-perf:
    npm run test:perf

# Run PWA offline tests
test-pwa:
    npm run test:pwa

# Run user flow tests
test-flows:
    npm run test:flows

# Run Puppeteer tests (headless)
test-puppeteer:
    npm run test:puppeteer:headless

# Run test coverage
test-coverage:
    npm run test:coverage

# -----------------------------------------------------
# Code Quality
# -----------------------------------------------------

# Run TypeScript type checking
typecheck:
    npm run typecheck

# Run TypeScript type checking in watch mode
typecheck-watch:
    npm run typecheck:watch

# Run ESLint
lint:
    npm run lint

# Format code with Prettier
format:
    npm run format

# Run all quality checks (typecheck + lint)
check:
    npm run typecheck
    npm run lint

# -----------------------------------------------------
# Dependencies
# -----------------------------------------------------

# Install dependencies
install:
    npm install

# Clean install (remove node_modules first)
clean-install:
    rm -rf node_modules package-lock.json
    npm install

# Update dependencies (interactive)
update:
    npm update

# Check for outdated dependencies
outdated:
    npm outdated

# -----------------------------------------------------
# Maintenance
# -----------------------------------------------------

# Clean build artifacts
clean:
    rm -rf dist .vite-temp .vite

# Clean everything (build artifacts + node_modules)
clean-all:
    rm -rf dist .vite-temp .vite node_modules package-lock.json

# Show project info
info:
    @echo "📦 FAM Trainingsplan"
    @echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    @echo "Version:    $(jq -r '.version' package.json)"
    @echo "Node:       $(node --version)"
    @echo "npm:        $(npm --version)"
    @echo "Directory:  $(pwd)"
    @echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# -----------------------------------------------------
# Git Helpers
# -----------------------------------------------------

# Show git status with enhanced output
status:
    git status -sb
    @echo ""
    git --no-pager diff --stat

# Commit with message
commit message:
    git add -A
    git commit -m "{{message}}"

# Push to current branch
push:
    git push origin $(git branch --show-current)

# Pull with rebase
pull:
    git pull --rebase origin $(git branch --show-current)

# Show git log
log:
    git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative -10

# -----------------------------------------------------
# Playwright Specific
# -----------------------------------------------------

# Install Playwright browsers
playwright-install:
    npx playwright install

# Install Playwright browsers with dependencies
playwright-install-deps:
    npx playwright install --with-deps

# Show Playwright report
playwright-report:
    npx playwright show-report

# -----------------------------------------------------
# Quick Workflows
# -----------------------------------------------------

# Development workflow: install deps, typecheck, run dev server
setup:
    npm install
    npm run typecheck
    @echo "✅ Setup complete! Run 'just dev' to start development."

# CI workflow: install, typecheck, lint, test, build
ci:
    npm ci
    npm run typecheck
    npm run lint
    npm test
    npm run build
    @echo "✅ CI checks passed!"

# Full test suite (all test types)
test-all:
    npm run test:coverage
    npm run test:e2e
    npm run test:visual
    npm run test:a11y
    npm run test:pwa
    @echo "✅ All tests complete!"

# Pre-release checks
pre-release:
    npm run typecheck
    npm run lint
    npm run test:coverage
    npm run build
    @echo "✅ Pre-release checks passed!"
