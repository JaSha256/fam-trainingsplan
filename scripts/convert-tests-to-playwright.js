#!/usr/bin/env node
/**
 * Convert Vitest browser mode integration tests to Playwright tests
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const testsDir = join(process.cwd(), 'tests/integration')
const testFiles = readdirSync(testsDir).filter(f => f.endsWith('.test.js') && f !== 'test-helpers.js')

console.log(`Converting ${testFiles.length} test files to Playwright syntax...\n`)

testFiles.forEach(file => {
  const filePath = join(testsDir, file)
  let content = readFileSync(filePath, 'utf8')

  console.log(`Converting: ${file}`)

  // Replace imports
  content = content.replace(
    /import \{ describe, it, expect, beforeEach \} from 'vitest'/g,
    "import { test, expect } from '@playwright/test'"
  )

  content = content.replace(
    /import \{ page \} from '@vitest\/browser\/context'/g,
    "// Playwright provides page via test context"
  )

  content = content.replace(
    /import \{ waitForAlpineAndData \} from '\.\/test-helpers\.js'/g,
    "// Helper functions inlined"
  )

  // Replace describe with test.describe
  content = content.replace(/\bdescribe\(/g, 'test.describe(')

  // Replace it( with test(
  content = content.replace(/\bit\(/g, 'test(')

  // Replace beforeEach callbacks to include { page }
  content = content.replace(
    /beforeEach\(async \(\) => \{/g,
    'test.beforeEach(async ({ page }) => {'
  )

  // Replace all test callbacks to include { page }
  content = content.replace(
    /test\('([^']+)', async \(\) => \{/g,
    "test('$1', async ({ page }) => {"
  )

  content = content.replace(
    /test\("([^"]+)", async \(\) => \{/g,
    'test("$1", async ({ page }) => {'
  )

  // Replace waitForAlpineAndData calls with inline code
  content = content.replace(
    /await waitForAlpineAndData\(page\)/g,
    `// Wait for Alpine and data
    await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 5000 })
    await page.waitForFunction(() => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return component?.allTrainings?.length > 0
    }, { timeout: 5000 })`
  )

  // Write back
  writeFileSync(filePath, content, 'utf8')
  console.log(`✓ Converted: ${file}\n`)
})

console.log('✅ All test files converted to Playwright syntax!')
