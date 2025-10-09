// Simple Puppeteer test to verify installation
import puppeteer from 'puppeteer'

console.log('Starting simple Puppeteer test...')

const browser = await puppeteer.launch({
  headless: 'new'
})

console.log('Browser launched!')

const page = await browser.newPage()
await page.goto('https://example.com')

const title = await page.title()
console.log('Page title:', title)

await browser.close()

console.log('✅ Puppeteer works!')
