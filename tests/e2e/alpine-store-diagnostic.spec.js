import { test, expect } from '@playwright/test';

test('Alpine.js Store Deep Diagnostic', async ({ page }) => {
  await page.goto('http://localhost:4173');
  await page.waitForTimeout(3000);
  
  const deepDiagnostic = await page.evaluate(() => {
    const result = {
      alpineExists: !!window.Alpine,
      alpineVersion: window.Alpine?.version,
      storeFunction: typeof window.Alpine?.store,
      availableStores: [],
      trainingsStoreDetails: null,
      windowTrainingsplaner: !!window.trainingsplaner,
      dataLoadError: null
    };
    
    // Check what stores exist
    if (window.Alpine && window.Alpine.store) {
      try {
        const ui = window.Alpine.store('ui');
        if (ui) result.availableStores.push('ui');
      } catch (e) {
        result.availableStores.push('ui-error: ' + e.message);
      }
      
      try {
        const trainings = window.Alpine.store('trainings');
        if (trainings) {
          result.availableStores.push('trainings');
          result.trainingsStoreDetails = {
            allTrainings: Array.isArray(trainings.allTrainings),
            allTrainingsLength: trainings.allTrainings?.length,
            filteredTrainings: Array.isArray(trainings.filteredTrainings),
            filteredTrainingsLength: trainings.filteredTrainings?.length,
            metadata: trainings.metadata,
            hasGetters: {
              filteredTrainings: typeof trainings.filteredTrainings,
              filteredTrainingsCount: typeof trainings.filteredTrainingsCount
            }
          };
        }
      } catch (e) {
        result.availableStores.push('trainings-error: ' + e.message);
        result.dataLoadError = e.message;
      }
    }
    
    return result;
  });
  
  console.log('\n========== ALPINE STORE DIAGNOSTIC ==========');
  console.log(JSON.stringify(deepDiagnostic, null, 2));
  console.log('==============================================\n');
  
  expect(true).toBe(true);
});
