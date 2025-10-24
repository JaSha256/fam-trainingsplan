#!/bin/bash
# Quick test runner for development iteration

echo "⚡ Quick Test Suite"
echo "=================="
echo ""

# Run tests in parallel for speed
echo "🏃 Running tests in parallel..."
echo ""

# TypeScript check (fast)
(
    echo "📝 TypeScript..."
    pnpm run typecheck 2>&1 | tail -3
) &
TS_PID=$!

# Infrastructure tests (fast, ~350ms)
(
    echo "🔧 Infrastructure..."
    pnpm run test:infrastructure --reporter=basic 2>&1 | grep -E "(passed|failed|FAIL)" | tail -5
) &
INFRA_PID=$!

# Unit tests (slower, ~3-4s)
(
    echo "🧪 Unit Tests..."
    pnpm run test:unit --reporter=basic 2>&1 | grep -E "(passed|failed|FAIL)" | tail -5
) &
UNIT_PID=$!

# Wait for all and check exit codes
TS_EXIT=0
INFRA_EXIT=0
UNIT_EXIT=0

wait $TS_PID || TS_EXIT=$?
wait $INFRA_PID || INFRA_EXIT=$?
wait $UNIT_PID || UNIT_EXIT=$?

echo ""
echo "=================="
echo "📊 Results:"

if [ $TS_EXIT -eq 0 ]; then
    echo "  ✅ TypeScript"
else
    echo "  ❌ TypeScript"
fi

if [ $INFRA_EXIT -eq 0 ]; then
    echo "  ✅ Infrastructure"
else
    echo "  ❌ Infrastructure"
fi

if [ $UNIT_EXIT -eq 0 ]; then
    echo "  ✅ Unit Tests"
else
    echo "  ❌ Unit Tests"
fi

if [ $TS_EXIT -eq 0 ] && [ $INFRA_EXIT -eq 0 ] && [ $UNIT_EXIT -eq 0 ]; then
    echo ""
    echo "🎉 All tests passed! Ready to push."
    exit 0
else
    echo ""
    echo "❌ Some tests failed. Run full suite for details:"
    echo "   pnpm run typecheck"
    echo "   pnpm run test:infrastructure"
    echo "   pnpm run test:unit"
    exit 1
fi
