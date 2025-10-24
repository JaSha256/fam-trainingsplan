import { test } from '@playwright/test';

test('Check live deployment for errors', async ({ page }) => {
  const errors = [];
  const warnings = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      errors.push(text);
    } else if (type === 'warning') {
      warnings.push(text);
    }
  });

  page.on('pageerror', err => {
    errors.push('Page error: ' + err.message);
  });

  await page.goto('https://jasha256.github.io/fam-trainingsplan/', {
    waitUntil: 'networkidle',
    timeout: 15000
  });

  await page.waitForTimeout(2000);

  console.log('\n🔍 Deployment Test Results:\n');

  if (errors.length > 0) {
    console.log('❌ Errors found:');
    errors.forEach(err => console.log('  -', err));
  } else {
    console.log('✅ No JavaScript errors');
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    const maxShow = 5;
    warnings.slice(0, maxShow).forEach(warn => console.log('  -', warn));
    if (warnings.length > maxShow) {
      console.log('  ... and ' + (warnings.length - maxShow) + ' more warnings');
    }
  }

  const hasContent = await page.locator('[x-data*="trainingsplaner"]').count();
  console.log('\n📦 Content loaded:', hasContent > 0 ? '✅' : '❌');

  if (errors.length > 0) {
    throw new Error('Found ' + errors.length + ' errors in live deployment');
  }
});
