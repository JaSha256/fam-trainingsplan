import { test, expect } from '@playwright/test';

test.describe('Active Filter Chips Bar - Task 15', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/fam-trainingsplan/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('1. Initial State - No chips visible', async ({ page }) => {
    const chipsSection = await page.locator('text="Aktive Filter:"').first();
    const isVisible = await chipsSection.isVisible().catch(() => false);
    
    console.log('✓ PASS: Filter chips section hidden on initial load:', !isVisible);
    expect(isVisible).toBe(false);
    
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/tests/e2e/screenshots/chips-initial-state.png',
      fullPage: true 
    });
  });

  test('2. Single Filter Activation', async ({ page }) => {
    // Expand Wochentag filter section by clicking button
    const wochentagButton = await page.locator('button:has-text("Wochentag")').first();
    await wochentagButton.click();
    await page.waitForTimeout(800);
    
    // Check Montag checkbox
    await page.locator('input[value="Montag"]').first().check({ force: true });
    await page.waitForTimeout(1000);
    
    // Verify filter chips section appears
    const chipsSection = await page.locator('text="Aktive Filter:"').first();
    await expect(chipsSection).toBeVisible();
    
    // Verify chip with correct text
    const chip = await page.locator('button:has-text("Wochentag: Montag")');
    await expect(chip).toBeVisible();
    
    // Verify X icon exists
    const removeIcon = await chip.locator('svg');
    await expect(removeIcon).toBeVisible();
    
    console.log('✓ PASS: Single filter creates chip with remove button');
    
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/tests/e2e/screenshots/chips-single-filter.png',
      fullPage: true 
    });
  });

  test('3. Multi-Value Filter - Multiple Chips', async ({ page }) => {
    const wochentagButton = await page.locator('button:has-text("Wochentag")').first();
    await wochentagButton.click();
    await page.waitForTimeout(800);
    
    // Select multiple days
    await page.locator('input[value="Montag"]').first().check({ force: true });
    await page.waitForTimeout(500);
    await page.locator('input[value="Mittwoch"]').first().check({ force: true });
    await page.waitForTimeout(500);
    await page.locator('input[value="Freitag"]').first().check({ force: true });
    await page.waitForTimeout(1000);
    
    // Verify separate chips for each value
    const montagChip = await page.locator('button:has-text("Wochentag: Montag")');
    const mittwochChip = await page.locator('button:has-text("Wochentag: Mittwoch")');
    const freitagChip = await page.locator('button:has-text("Wochentag: Freitag")');
    
    await expect(montagChip).toBeVisible();
    await expect(mittwochChip).toBeVisible();
    await expect(freitagChip).toBeVisible();
    
    console.log('✓ PASS: Multi-value filter creates separate chips');
    
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/tests/e2e/screenshots/chips-multi-value.png',
      fullPage: true 
    });
  });

  test('4. Display Limiting - Max 3 Chips with Overflow', async ({ page }) => {
    const wochentagButton = await page.locator('button:has-text("Wochentag")').first();
    await wochentagButton.click();
    await page.waitForTimeout(800);
    
    // Add 5 filters
    const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
    for (const day of days) {
      await page.locator(`input[value="${day}"]`).first().check({ force: true });
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(1000);
    
    // Count visible chip buttons
    const chipButtons = await page.locator('button[aria-label^="Filter entfernen"]').all();
    console.log('Visible chip buttons:', chipButtons.length);
    expect(chipButtons.length).toBeLessThanOrEqual(3);
    
    // Verify overflow indicator
    const overflowIndicator = await page.locator('text=/\\+\\d+ weitere/');
    await expect(overflowIndicator).toBeVisible();
    
    const overflowText = await overflowIndicator.textContent();
    console.log('✓ PASS: Display limited to 3 chips with overflow:', overflowText);
    expect(overflowText).toContain('+2 weitere');
    
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/tests/e2e/screenshots/chips-overflow.png',
      fullPage: true 
    });
  });

  test('5. Chip Removal', async ({ page }) => {
    const wochentagButton = await page.locator('button:has-text("Wochentag")').first();
    await wochentagButton.click();
    await page.waitForTimeout(800);
    
    await page.locator('input[value="Montag"]').first().check({ force: true });
    await page.waitForTimeout(500);
    await page.locator('input[value="Mittwoch"]').first().check({ force: true });
    await page.waitForTimeout(1000);
    
    // Verify both chips exist
    const montagChip = await page.locator('button:has-text("Wochentag: Montag")');
    await expect(montagChip).toBeVisible();
    
    // Click chip to remove
    await montagChip.click();
    await page.waitForTimeout(1000);
    
    // Verify chip removed
    const montagChipExists = await montagChip.isVisible().catch(() => false);
    expect(montagChipExists).toBe(false);
    
    // Verify checkbox unchecked
    const montagCheckbox = await page.locator('input[value="Montag"]').first();
    const isChecked = await montagCheckbox.isChecked();
    expect(isChecked).toBe(false);
    
    // Verify other chip still visible
    const mittwochChip = await page.locator('button:has-text("Wochentag: Mittwoch")');
    await expect(mittwochChip).toBeVisible();
    
    console.log('✓ PASS: Chip removal works correctly');
    
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/tests/e2e/screenshots/chips-after-removal.png',
      fullPage: true 
    });
  });

  test('6. "Alle löschen" Button', async ({ page }) => {
    const wochentagButton = await page.locator('button:has-text("Wochentag")').first();
    await wochentagButton.click();
    await page.waitForTimeout(800);
    
    await page.locator('input[value="Montag"]').first().check({ force: true });
    await page.waitForTimeout(300);
    await page.locator('input[value="Mittwoch"]').first().check({ force: true });
    await page.waitForTimeout(300);
    await page.locator('input[value="Freitag"]').first().check({ force: true });
    await page.waitForTimeout(1000);
    
    const clearAllBtn = await page.locator('button:has-text("Alle löschen")');
    await expect(clearAllBtn).toBeVisible();
    
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/tests/e2e/screenshots/chips-before-clear-all.png',
      fullPage: true 
    });
    
    // Click clear all
    await clearAllBtn.click();
    await page.waitForTimeout(1000);
    
    // Verify chips hidden
    const chipsSection = await page.locator('text="Aktive Filter:"').first();
    const isVisible = await chipsSection.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
    
    // Verify filters cleared
    const montagChecked = await page.locator('input[value="Montag"]').first().isChecked();
    const mittwochChecked = await page.locator('input[value="Mittwoch"]').first().isChecked();
    const freitagChecked = await page.locator('input[value="Freitag"]').first().isChecked();
    
    expect(montagChecked).toBe(false);
    expect(mittwochChecked).toBe(false);
    expect(freitagChecked).toBe(false);
    
    console.log('✓ PASS: "Alle löschen" clears all filters');
    
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/tests/e2e/screenshots/chips-after-clear-all.png',
      fullPage: true 
    });
  });

  test('7. Accessibility - Touch Targets & ARIA', async ({ page }) => {
    const wochentagButton = await page.locator('button:has-text("Wochentag")').first();
    await wochentagButton.click();
    await page.waitForTimeout(800);
    
    await page.locator('input[value="Montag"]').first().check({ force: true });
    await page.waitForTimeout(1000);
    
    const chip = await page.locator('button:has-text("Wochentag: Montag")');
    
    // Check dimensions (WCAG 44px minimum)
    const chipBox = await chip.boundingBox();
    console.log('Chip dimensions:', {
      width: Math.round(chipBox.width),
      height: Math.round(chipBox.height)
    });
    expect(chipBox.height).toBeGreaterThanOrEqual(44);
    
    // Check ARIA label
    const ariaLabel = await chip.getAttribute('aria-label');
    console.log('Chip aria-label:', ariaLabel);
    expect(ariaLabel).toBeTruthy();
    
    // Check tooltip
    const title = await chip.getAttribute('title');
    console.log('Chip title:', title);
    expect(title).toBeTruthy();
    
    console.log('✓ PASS: Accessibility features verified');
    
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/tests/e2e/screenshots/chips-accessibility.png',
      fullPage: true 
    });
  });

  test('8. Responsive Design - Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(2000);
    
    // On mobile, sidebar is hidden - use top filter button
    const filterButton = await page.locator('button:has-text("Filter aktiv")').or(page.locator('svg:has(path[d*="M3 4a1"])').locator('..')).first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);
    }
    
    const wochentagButton = await page.locator('button:has-text("Wochentag")').first();
    await wochentagButton.click();
    await page.waitForTimeout(800);
    
    await page.locator('input[value="Montag"]').first().check({ force: true });
    await page.waitForTimeout(500);
    await page.locator('input[value="Mittwoch"]').first().check({ force: true });
    await page.waitForTimeout(1000);
    
    // Close filter panel if open
    const closeBtn = await page.locator('button[aria-label="Schließen"]');
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
    
    // Verify chips visible
    const chipsSection = await page.locator('text="Aktive Filter:"').first();
    await expect(chipsSection).toBeVisible();
    
    const chips = await page.locator('button[aria-label^="Filter entfernen"]').count();
    console.log('✓ PASS: Mobile responsive design works, chips visible:', chips);
    
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/tests/e2e/screenshots/chips-mobile.png',
      fullPage: true 
    });
  });

  test('9. Responsive Design - Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await page.waitForTimeout(2000);
    
    const wochentagButton = await page.locator('button:has-text("Wochentag")').first();
    await wochentagButton.click();
    await page.waitForTimeout(800);
    
    await page.locator('input[value="Montag"]').first().check({ force: true });
    await page.waitForTimeout(500);
    await page.locator('input[value="Mittwoch"]').first().check({ force: true });
    await page.waitForTimeout(500);
    await page.locator('input[value="Freitag"]').first().check({ force: true });
    await page.waitForTimeout(1000);
    
    const chipsSection = await page.locator('text="Aktive Filter:"').first();
    await expect(chipsSection).toBeVisible();
    
    const chips = await page.locator('button[aria-label^="Filter entfernen"]').count();
    console.log('✓ PASS: Desktop responsive design works, chips visible:', chips);
    expect(chips).toBe(3);
    
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/tests/e2e/screenshots/chips-desktop.png',
      fullPage: true 
    });
  });

  test('10. Prominent Clear Button with 3+ Filters', async ({ page }) => {
    const wochentagButton = await page.locator('button:has-text("Wochentag")').first();
    await wochentagButton.click();
    await page.waitForTimeout(800);
    
    // Add 2 filters first
    await page.locator('input[value="Montag"]').first().check({ force: true });
    await page.waitForTimeout(500);
    await page.locator('input[value="Mittwoch"]').first().check({ force: true });
    await page.waitForTimeout(1000);
    
    const clearBtn1 = await page.locator('button:has-text("Alle löschen")');
    const classes1 = await clearBtn1.getAttribute('class');
    const isProminent1 = classes1?.includes('red') || classes1?.includes('bg-red');
    console.log('Clear button with 2 filters - Prominent:', isProminent1);
    
    // Add 3rd filter
    await page.locator('input[value="Freitag"]').first().check({ force: true });
    await page.waitForTimeout(1000);
    
    const clearBtn2 = await page.locator('button:has-text("Alle löschen")');
    const classes2 = await clearBtn2.getAttribute('class');
    const isProminent2 = classes2?.includes('red') || classes2?.includes('bg-red');
    console.log('✓ PASS: Clear button with 3+ filters - Prominent (RED):', isProminent2);
    expect(isProminent2).toBe(true);
    
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/tests/e2e/screenshots/chips-prominent-clear.png',
      fullPage: true 
    });
  });
});
