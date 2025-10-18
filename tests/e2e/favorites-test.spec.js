// Quick Favorites Test
import { test, expect } from '@playwright/test'

test('favorites should work', async ({ page }) => {
  await page.goto('/')

  // Wait for data
  await page.waitForFunction(() => {
    const component = window.Alpine?.$data(document.querySelector('[x-data]'))
    return component?.loading === false && component?.allTrainings?.length > 0
  }, { timeout: 10000 })

  await page.waitForSelector('.training-card', { state: 'visible' })

  console.log('✓ Page and data loaded')

  // Get initial favorites count
  let favCount = await page.evaluate(() => {
    const component = window.Alpine?.$data(document.querySelector('[x-data]'))
    return component?.favorites?.length || 0
  })
  console.log(`Initial favorites: ${favCount}`)

  // Click first favorite button
  const firstFavButton = page.locator('.training-card button[aria-label*="Favoriten"]').first()
  await firstFavButton.click()
  await page.waitForTimeout(500)

  // Check favorites count again
  favCount = await page.evaluate(() => {
    const component = window.Alpine?.$data(document.querySelector('[x-data]'))
    return component?.favorites?.length || 0
  })
  console.log(`After click: ${favCount}`)

  expect(favCount).toBe(1)
})
