/**
 * Simple Validation: Trainings Display Correctly
 */

import { test, expect } from '@playwright/test'

test('Trainings are displaying correctly', async ({ page }) => {
  await page.goto('http://localhost:5173/fam-trainingsplan/')
  await page.waitForTimeout(2000)
  
  // Count training cards
  const trainingCards = await page.locator('[data-training-card]')
  const count = await trainingCards.count()
  
  console.log('\n========================================')
  console.log('TRAINING DISPLAY VALIDATION')
  console.log('========================================')
  console.log(`Training cards in DOM: ${count}`)
  console.log('Status: ' + (count > 0 ? '✓ PASS' : '✗ FAIL'))
  console.log('========================================\n')
  
  // Take screenshot
  await page.screenshot({ 
    path: '/home/pseudo/workspace/FAM/fam-trainingsplan/simple-validation.png',
    fullPage: true
  })
  
  // Assert
  expect(count).toBeGreaterThan(0)
})
