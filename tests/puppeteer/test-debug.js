// Quick debug test to see Alpine state
import puppeteer from 'puppeteer'

const browser = await puppeteer.launch({ headless: false })
const page = await browser.newPage()

await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })

// Wait a bit for Alpine to load
await new Promise(resolve => setTimeout(resolve, 3000))

const state = await page.evaluate(() => {
  return {
    hasAlpine: !!window.Alpine,
    hasStore: typeof window.Alpine?.store === 'function',
    trainingsplanerStore: window.Alpine?.store('trainingsplaner'),
    uiStore: window.Alpine?.store('ui'),
    allData: window.Alpine?.$data
  }
})

console.log('Alpine State:', JSON.stringify(state, null, 2))

await browser.close()
