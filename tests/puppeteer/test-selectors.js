// Check what selectors exist on the page
import puppeteer from 'puppeteer'

const browser = await puppeteer.launch({ headless: false })
const page = await browser.newPage()

await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })

// Wait for Alpine
await page.waitForFunction(
  () => window.Alpine !== undefined,
  { timeout: 10000 }
)

// Wait a bit more for data to load
await new Promise(resolve => setTimeout(resolve, 3000))

const selectors = await page.evaluate(() => {
  return {
    dataTrainingCard: document.querySelectorAll('[data-training-card]').length,
    trainingItem: document.querySelectorAll('.training-item').length,
    xDataTrainingsplaner: document.querySelectorAll('[x-data="trainingsplaner"]').length,
    xDataContains: Array.from(document.querySelectorAll('[x-data]'))
      .map(el => el.getAttribute('x-data'))
      .slice(0, 10),
    bodyClasses: document.body.className,
    bodyHTML: document.body.innerHTML.substring(0, 500)
  }
})

console.log('Selectors found:', JSON.stringify(selectors, null, 2))

await browser.close()
