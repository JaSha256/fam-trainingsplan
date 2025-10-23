import { test, expect } from '@playwright/test';

test.describe('Debug: No Trainings Showing Investigation', () => {
  test('capture full page state and diagnose issue', async ({ page }) => {
    // Navigate to the page
    await page.goto('http://localhost:4173');
    
    // Wait for potential loading
    await page.waitForTimeout(3000);
    
    // 1. Take initial screenshot
    await page.screenshot({ 
      path: 'debug-no-trainings-full-page.png', 
      fullPage: true 
    });
    
    // 2. Check browser console for errors
    const consoleMessages = [];
    const consoleErrors = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });
    
    page.on('pageerror', error => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });
    
    // Reload to capture all console messages from start
    await page.reload();
    await page.waitForTimeout(3000);
    
    // 3. Check network requests for trainings data
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('trainingsplan.json') || 
          request.url().includes('data/') ||
          request.url().includes('.json')) {
        requests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    page.on('response', async response => {
      if (response.url().includes('trainingsplan.json')) {
        console.log('Trainingsplan response status:', response.status());
        console.log('Trainingsplan response headers:', await response.allHeaders());
      }
    });
    
    // Trigger a reload to capture network requests
    await page.reload();
    await page.waitForTimeout(3000);
    
    // 4. Check Alpine.js state
    const alpineState = await page.evaluate(() => {
      if (window.Alpine && window.Alpine.store) {
        const ui = window.Alpine.store('ui');
        const trainings = window.Alpine.store('trainings');
        
        return {
          ui: ui ? {
            loading: ui.loading,
            error: ui.error,
            activeView: ui.activeView,
            filters: ui.filters,
            mobileFilterOpen: ui.mobileFilterOpen
          } : 'UI store not found',
          trainings: trainings ? {
            allTrainingsLength: trainings.allTrainings?.length || 0,
            filteredTrainingsLength: trainings.filteredTrainings?.length || 0,
            filteredTrainingsCount: trainings.filteredTrainingsCount || 0,
            favoriteIds: trainings.favoriteIds?.length || 0
          } : 'Trainings store not found',
          alpineVersion: window.Alpine?.version || 'Alpine not found'
        };
      }
      return { error: 'Alpine.js not initialized' };
    });
    
    // 5. Check if DOM elements exist
    const domCheck = await page.evaluate(() => {
      return {
        hasTrainingsContainer: !!document.querySelector('[x-show="activeView === \'list\'"]'),
        hasMapContainer: !!document.querySelector('[x-show="activeView === \'map\'"]'),
        hasLoadingIndicator: !!document.querySelector('[x-show="loading"]'),
        hasErrorMessage: !!document.querySelector('[x-show="error"]'),
        hasFilteredTrainings: !!document.querySelector('[x-for="training in filteredTrainings"]'),
        visibleTrainingCards: document.querySelectorAll('.training-card, [class*="training"]').length,
        bodyClasses: document.body.className,
        htmlContent: document.documentElement.innerHTML.substring(0, 1000)
      };
    });
    
    // 6. Check if JavaScript files loaded
    const scriptsLoaded = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts.map(s => ({
        src: s.src,
        loaded: !s.hasAttribute('defer') || document.readyState === 'complete'
      }));
    });
    
    // 7. Take screenshot of devtools-like state
    await page.screenshot({ 
      path: 'debug-no-trainings-viewport.png'
    });
    
    // Print all collected information
    console.log('\n========== DEBUG REPORT ==========\n');
    console.log('1. CONSOLE ERRORS:');
    console.log(JSON.stringify(consoleErrors, null, 2));
    
    console.log('\n2. CONSOLE MESSAGES:');
    console.log(JSON.stringify(consoleMessages.slice(0, 20), null, 2));
    
    console.log('\n3. NETWORK REQUESTS (JSON files):');
    console.log(JSON.stringify(requests, null, 2));
    
    console.log('\n4. ALPINE.JS STATE:');
    console.log(JSON.stringify(alpineState, null, 2));
    
    console.log('\n5. DOM CHECK:');
    console.log(JSON.stringify(domCheck, null, 2));
    
    console.log('\n6. SCRIPTS LOADED:');
    console.log(JSON.stringify(scriptsLoaded, null, 2));
    
    console.log('\n========== END DEBUG REPORT ==========\n');
    
    // This test always passes - it's just for debugging
    expect(true).toBe(true);
  });
});
