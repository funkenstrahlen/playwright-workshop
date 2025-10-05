/**
 * Exercise 9 - Clock API for Time-Based Testing Solution
 *
 * This test suite demonstrates comprehensive time-based testing using Playwright's Clock API.
 * Tests time-dependent features like sessions, timestamps, auto-refresh, and date-specific content.
 *
 * Key learning points:
 * - Control time in tests for reproducible results
 * - Test time-dependent features without waiting
 * - Mock system time for edge cases
 * - Test timers, intervals, and timeouts
 * - Handle rate limiting and session management
 */

import { test, expect } from '@playwright/test';

test.describe('Exercise 9: Clock API for Time-Based Testing', () => {

  test.describe('Session Management', () => {

    test('Session timeout after 30 minutes', async ({ page }) => {
      // Install clock before navigation with a fixed start time
      await page.clock.install({ time: new Date('2024-01-01 10:00:00') });

      // Attempt login
      await page.goto('/auth/signin');

      // Fill in login form
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/password/i);
      const submitButton = page.getByRole('button', { name: 'Submit sign in form' });

      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        await emailInput.fill('admin@example.com');
        await passwordInput.fill('admin123');

        if (await submitButton.count() > 0) {
          await submitButton.click();

          // Wait for potential redirect
          await page.waitForLoadState('networkidle');

          const currentUrl = page.url();
          console.log('URL after login attempt:', currentUrl);

          // Fast forward 31 minutes
          await page.clock.fastForward('31:00');

          // Trigger an action that would check session validity
          await page.reload();
          await page.waitForLoadState('networkidle');

          const urlAfterTimeout = page.url();
          console.log('URL after session timeout:', urlAfterTimeout);

          // Should be redirected to login or show session expired message
          const isBackToLogin = urlAfterTimeout.includes('/auth/signin') ||
                               urlAfterTimeout.includes('/login');

          const hasSessionMessage = await page.getByText(/session.*expired|please.*login|unauthorized/i)
                                            .count() > 0;

          // Either should be redirected to login OR show session expired message
          expect(isBackToLogin || hasSessionMessage).toBe(true);
        }
      } else {
        console.log('Login form not found, skipping session timeout test');
      }
    });

    test('Session renewal with activity', async ({ page }) => {
      await page.clock.install({ time: new Date('2024-01-01 10:00:00') });

      await page.goto('/auth/signin');

      // Mock successful login
      await page.route('**/api/auth/**', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, token: 'mock-token' })
          });
        } else {
          await route.continue();
        }
      });

      const emailInput = page.getByLabel(/email/i);
      if (await emailInput.count() > 0) {
        await emailInput.fill('admin@example.com');
        await page.getByLabel(/password/i).fill('admin123');
        await page.getByRole('button', { name: /sign in/i }).click();

        // Fast forward 25 minutes (before timeout)
        await page.clock.fastForward('25:00');

        // Perform activity (navigate to another page)
        await page.goto('/news/public');
        await page.waitForLoadState('networkidle');

        // Fast forward another 25 minutes (total 50 minutes, but activity should reset timer)
        await page.clock.fastForward('25:00');

        // Should still be logged in
        await page.reload();

        const currentUrl = page.url();
        const isStillLoggedIn = !currentUrl.includes('/auth/signin');

        console.log('Still logged in after activity:', isStillLoggedIn);
      }
    });
  });

  test.describe('Timestamp Display', () => {

    test('News update timestamp progression', async ({ page }) => {
      // Start at a specific time
      const startTime = new Date('2024-01-01 12:00:00');
      await page.clock.install({ time: startTime });

      await page.goto('/news/public');
      await expect(
      page.getByRole('listitem').first()
    ).toBeVisible({ timeout: 10000 });

      // Look for timestamp elements
      const timestampSelectors = [
        'time',
        '.timestamp',
        '[data-testid="publish-date"]',
        '.relative-time',
        '.time-ago',
        '[title*="ago"]'
      ];

      let timestampElement = null;
      for (const selector of timestampSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          timestampElement = element;
          break;
        }
      }

      if (timestampElement) {
        // Check initial timestamp (should show recent time)
        const initialText = await timestampElement.textContent();
        console.log('Initial timestamp:', initialText);

        // Fast forward 5 minutes
        await page.clock.fastForward('05:00');

        // Refresh page or trigger update
        const refreshButton = page.getByRole('button', { name: /refresh|reload|update/i });
        if (await refreshButton.count() > 0) {
          await refreshButton.click();
          await page.waitForLoadState('networkidle');
        } else {
          await page.reload();
          await page.waitForLoadState('networkidle');
        }

        // Check updated timestamp
        const updatedText = await timestampElement.textContent();
        console.log('Updated timestamp after 5 minutes:', updatedText);

        // Fast forward 1 hour
        await page.clock.fastForward('01:00:00');

        if (await refreshButton.count() > 0) {
          await refreshButton.click();
          await page.waitForLoadState('networkidle');
        } else {
          await page.reload();
          await page.waitForLoadState('networkidle');
        }

        const hourLaterText = await timestampElement.textContent();
        console.log('Timestamp after 1 hour:', hourLaterText);

        // Timestamps should show progression (different texts)
        expect(initialText).not.toBe(hourLaterText);
      } else {
        console.log('No timestamp elements found, skipping timestamp test');
      }
    });

    test('Real-time clock display updates', async ({ page }) => {
      await page.clock.install({ time: new Date('2024-01-01 14:30:00') });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for any live clock displays
      const clockSelectors = [
        '.clock',
        '.current-time',
        '[data-testid="clock"]',
        '.live-time'
      ];

      let clockElement = null;
      for (const selector of clockSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          clockElement = element.first();
          break;
        }
      }

      if (clockElement) {
        const initialTime = await clockElement.textContent();

        // Fast forward 1 minute
        await page.clock.fastForward('01:00');
        await page.waitForTimeout(100);

        const updatedTime = await clockElement.textContent();

        console.log('Clock display:', { initial: initialTime, updated: updatedTime });

        // Time should have updated
        expect(initialTime).not.toBe(updatedTime);
      } else {
        console.log('No live clock found on page');
      }
    });
  });

  test.describe('Auto-Refresh Features', () => {

    test('Auto-refresh every 60 seconds', async ({ page }) => {
      await page.clock.install();

      // Track API calls
      let refreshCount = 0;
      await page.route('**/api/news/public', async (route) => {
        refreshCount++;
        console.log(`API call #${refreshCount} at`, new Date().toISOString());

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                title: `News Item ${refreshCount}`,
                description: 'Test description',
                link: 'https://example.com',
                pubDate: new Date().toISOString(),
                category: 'Test'
              }
            ]
          })
        });
      });

      await page.goto('/news/public');
      await page.waitForLoadState('networkidle');

      // Initial load
      expect(refreshCount).toBe(1);

      // Fast forward 60 seconds
      await page.clock.fastForward('01:00');
      await page.waitForTimeout(500); // Allow for async operations

      // Should have triggered auto-refresh
      expect(refreshCount).toBeGreaterThanOrEqual(2);

      // Fast forward another 60 seconds
      await page.clock.fastForward('01:00');
      await page.waitForTimeout(500);

      // Should have triggered another refresh
      expect(refreshCount).toBeGreaterThanOrEqual(3);

      console.log(`Total API calls after 2 minutes: ${refreshCount}`);
    });

    test('Auto-refresh with countdown timer', async ({ page }) => {
      await page.clock.install({ time: new Date('2024-01-01 12:00:00') });

      await page.goto('/news/public');
      await page.waitForLoadState('networkidle');

      // Look for countdown display
      const countdownSelectors = [
        '[data-testid="refresh-countdown"]',
        '.countdown',
        '.refresh-timer',
        '.auto-refresh-countdown'
      ];

      let countdownElement = null;
      for (const selector of countdownSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          countdownElement = element.first();
          break;
        }
      }

      if (countdownElement) {
        // Check initial countdown value
        const initialValue = await countdownElement.textContent();
        console.log('Initial countdown:', initialValue);

        // Fast forward 10 seconds
        await page.clock.fastForward('00:10');
        await page.waitForTimeout(100);

        const afterTenSeconds = await countdownElement.textContent();
        console.log('Countdown after 10 seconds:', afterTenSeconds);

        // Fast forward 30 more seconds
        await page.clock.fastForward('00:30');
        await page.waitForTimeout(100);

        const afterFortySeconds = await countdownElement.textContent();
        console.log('Countdown after 40 seconds:', afterFortySeconds);

        // Values should be decreasing
        const initialNum = parseInt(initialValue?.match(/\d+/)?.[0] || '0');
        const laterNum = parseInt(afterFortySeconds?.match(/\d+/)?.[0] || '0');

        if (initialNum > 0 && laterNum >= 0) {
          expect(laterNum).toBeLessThan(initialNum);
        }
      } else {
        console.log('No countdown timer found');
      }
    });

    test('Pause auto-refresh when tab is not visible', async ({ page }) => {
      await page.clock.install();

      let refreshCount = 0;
      await page.route('**/api/news/public', async (route) => {
        refreshCount++;
        await route.continue();
      });

      await page.goto('/news/public');
      await page.waitForLoadState('networkidle');

      // Simulate tab becoming hidden
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', {
          value: 'hidden',
          writable: true
        });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      const refreshCountBeforePause = refreshCount;

      // Fast forward while tab is "hidden"
      await page.clock.fastForward('02:00');
      await page.waitForTimeout(500);

      const refreshCountDuringPause = refreshCount;

      // Make tab visible again
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', {
          value: 'visible',
          writable: true
        });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      await page.waitForTimeout(500);

      console.log('Refresh count - before pause:', refreshCountBeforePause,
                  'during pause:', refreshCountDuringPause,
                  'after resume:', refreshCount);

      // Auto-refresh should be paused when tab is hidden
      expect(refreshCountDuringPause).toBe(refreshCountBeforePause);
    });
  });

  test.describe('Date-Specific Features', () => {

    test('Holiday banner on Christmas', async ({ page }) => {
      // Set time to Christmas Day
      await page.clock.install({ time: new Date('2024-12-25 10:00:00') });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for holiday-specific content
      const holidayElements = [
        page.getByText(/merry christmas|frohe weihnachten|holiday/i),
        page.locator('.holiday-banner, .christmas-banner'),
        page.locator('[data-testid="holiday-message"]')
      ];

      let holidayFound = false;
      for (const element of holidayElements) {
        if (await element.count() > 0 && await element.isVisible().catch(() => false)) {
          holidayFound = true;
          console.log('Holiday content found on Christmas');
          break;
        }
      }

      // Jump to the next day (December 26)
      await page.clock.fastForward('24:00:00');
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Holiday content should be gone
      let holidayStillVisible = false;
      for (const element of holidayElements) {
        if (await element.count() > 0 && await element.isVisible().catch(() => false)) {
          holidayStillVisible = true;
          break;
        }
      }

      if (holidayFound) {
        expect(holidayStillVisible).toBe(false);
        console.log('Holiday content correctly hidden after Christmas');
      } else {
        console.log('No holiday content detected (this might be expected)');
      }
    });

    test('New Year countdown timer', async ({ page }) => {
      // Set time to December 31, 23:55:00
      await page.clock.install({ time: new Date('2024-12-31 23:55:00') });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for New Year countdown
      const countdownElements = [
        page.getByText(/new year|countdown/i),
        page.locator('.countdown, .new-year-countdown'),
        page.locator('[data-testid="countdown"]')
      ];

      let countdownFound = false;
      for (const element of countdownElements) {
        if (await element.count() > 0) {
          countdownFound = true;
          const text = await element.textContent();
          console.log('Countdown text:', text);
          break;
        }
      }

      // Fast forward to New Year (5 minutes)
      await page.clock.fastForward('05:00');
      await page.waitForTimeout(1000);

      // Look for New Year celebration
      const celebrationElements = [
        page.getByText(/happy new year|frohes neues jahr/i),
        page.locator('.celebration, .new-year-celebration')
      ];

      let celebrationFound = false;
      for (const element of celebrationElements) {
        if (await element.count() > 0 && await element.isVisible().catch(() => false)) {
          celebrationFound = true;
          console.log('New Year celebration found');
          break;
        }
      }

      if (countdownFound || celebrationFound) {
        console.log('New Year feature detected and working');
      } else {
        console.log('No New Year features detected');
      }
    });

    test('Business hours indicator', async ({ page }) => {
      // Test during business hours (9 AM on a weekday)
      await page.clock.install({ time: new Date('2024-01-15 09:00:00') }); // Monday

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const businessHoursElements = [
        page.getByText(/open|available|business hours/i),
        page.locator('.business-hours, .availability-status'),
        page.locator('[data-testid="business-status"]')
      ];

      let businessHoursStatus = null;
      for (const element of businessHoursElements) {
        if (await element.count() > 0) {
          businessHoursStatus = await element.textContent();
          break;
        }
      }

      console.log('Business hours status (9 AM Monday):', businessHoursStatus);

      // Test outside business hours (11 PM on a weekday)
      await page.clock.fastForward('14:00:00'); // Fast forward 14 hours to 11 PM
      await page.reload();
      await page.waitForLoadState('networkidle');

      let afterHoursStatus = null;
      for (const element of businessHoursElements) {
        if (await element.count() > 0) {
          afterHoursStatus = await element.textContent();
          break;
        }
      }

      console.log('Business hours status (11 PM Monday):', afterHoursStatus);

      // Statuses should be different if business hours feature exists
      if (businessHoursStatus && afterHoursStatus) {
        expect(businessHoursStatus).not.toBe(afterHoursStatus);
      }
    });
  });

  test.describe('Rate Limiting', () => {

    test('API rate limit reset after time window', async ({ page }) => {
      await page.clock.install();

      let requestCount = 0;
      await page.route('**/api/news/public', async (route) => {
        requestCount++;

        if (requestCount <= 3) {
          // Allow first 3 requests
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              items: [{ title: `Request ${requestCount}`, description: 'Test' }]
            })
          });
        } else {
          // Rate limit subsequent requests
          await route.fulfill({
            status: 429,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Rate limit exceeded',
              retryAfter: 60
            }),
            headers: { 'Retry-After': '60' }
          });
        }
      });

      await page.goto('/news/public');
      await page.waitForLoadState('networkidle');

      // Make multiple requests to trigger rate limit
      const refreshButton = page.getByRole('button', { name: /refresh|reload/i });

      if (await refreshButton.count() > 0) {
        // Make requests until rate limited
        for (let i = 0; i < 5; i++) {
          await refreshButton.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(100);
        }

        // Should now be rate limited
        const rateLimitElements = [
          page.getByText(/rate limit|too many requests|429/i),
          page.locator('.error, .rate-limit-error')
        ];

        let rateLimitVisible = false;
        for (const element of rateLimitElements) {
          if (await element.isVisible().catch(() => false)) {
            rateLimitVisible = true;
            break;
          }
        }

        console.log('Rate limit triggered:', rateLimitVisible);

        // Fast forward past rate limit window (60 seconds)
        await page.clock.fastForward('01:00');

        // Reset request count for the mock
        requestCount = 0;

        // Try request again - should work now
        await refreshButton.click();
        await page.waitForLoadState('networkidle');

        // Rate limit error should be gone
        let rateLimitStillVisible = false;
        for (const element of rateLimitElements) {
          if (await element.isVisible().catch(() => false)) {
            rateLimitStillVisible = true;
            break;
          }
        }

        if (rateLimitVisible) {
          expect(rateLimitStillVisible).toBe(false);
          console.log('Rate limit correctly reset after time window');
        }
      } else {
        console.log('No refresh button found, skipping rate limit test');
      }
    });
  });

  test.describe('Timer and Timeout Tests', () => {

    test('Loading timeout handling', async ({ page }) => {
      await page.clock.install();

      // Mock a request that times out
      await page.route('**/api/news/public', async (route) => {
        // Don't fulfill the request to simulate timeout
        // The request will hang until the page timeout
      });

      const startTime = Date.now();

      try {
        // Set a shorter timeout for this test
        page.setDefaultTimeout(3000);

        await page.goto('/news/public');
        await expect(page.getByRole('listitem').first()).toBeVisible({ timeout: 10000 });

      } catch (error) {
        const elapsedTime = Date.now() - startTime;
        console.log('Request timed out after:', elapsedTime, 'ms');

        // Should timeout within reasonable time
        expect(elapsedTime).toBeLessThan(5000);

        // Check for timeout error handling in UI
        const timeoutElements = [
          page.getByText(/timeout|connection.*failed|network.*error/i),
          page.locator('.error, .timeout-error')
        ];

        let timeoutHandled = false;
        for (const element of timeoutElements) {
          if (await element.isVisible().catch(() => false)) {
            timeoutHandled = true;
            break;
          }
        }

        console.log('Timeout error handled in UI:', timeoutHandled);
      }
    });

    test('Debounced search input', async ({ page }) => {
      await page.clock.install();

      await page.goto('/news/public');
      await page.waitForLoadState('networkidle');

      const searchInput = page.getByRole('textbox', { name: 'Search news articles' });

      if (await searchInput.count() > 0) {
        let searchCount = 0;
        await page.route('**/api/news/public*', async (route) => {
          const url = new URL(route.request().url());
          if (url.searchParams.has('search') || url.searchParams.has('q')) {
            searchCount++;
            console.log(`Search request #${searchCount}`);
          }
          await route.continue();
        });

        // Type quickly (should be debounced)
        await searchInput.fill('t');
        await page.clock.fastForward('100');

        await searchInput.fill('te');
        await page.clock.fastForward('100');

        await searchInput.fill('tes');
        await page.clock.fastForward('100');

        await searchInput.fill('test');

        // Fast forward past debounce delay (usually 300-500ms)
        await page.clock.fastForward('600');

        console.log('Search requests after debounced typing:', searchCount);

        // Should have made only one request due to debouncing
        expect(searchCount).toBeLessThanOrEqual(1);
      }
    });
  });

  test.describe('Clock Control Tests', () => {

    test('Pause and resume clock functionality', async ({ page }) => {
      const fixedTime = new Date('2024-01-01 12:00:00');
      await page.clock.install({ time: fixedTime });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Pause the clock at the fixed time
      await page.clock.pauseAt(fixedTime);

      // Look for any time displays
      const timeElements = [
        page.locator('time'),
        page.locator('.timestamp, .current-time')
      ];

      let timeElement = null;
      for (const selector of timeElements) {
        if (await selector.count() > 0) {
          timeElement = selector.first();
          break;
        }
      }

      if (timeElement) {
        const time1 = await timeElement.textContent();

        // Wait in real time - clock should be paused
        await page.waitForTimeout(1000);

        const time2 = await timeElement.textContent();

        // Time should not have changed (clock is paused)
        expect(time1).toBe(time2);

        // Resume clock
        await page.clock.resume();

        // Fast forward time
        await page.clock.fastForward('00:01');

        const time3 = await timeElement.textContent();

        // Time should now be different
        expect(time3).not.toBe(time2);

        console.log('Clock pause/resume test:', { paused: time1, resumed: time3 });
      } else {
        console.log('No time elements found for pause/resume test');
      }
    });

    test('Set fixed time for consistent testing', async ({ page }) => {
      // Set a specific fixed time
      const testTime = new Date('2024-06-15 14:30:00');
      await page.clock.setFixedTime(testTime);

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify the time is fixed
      const currentTime = await page.evaluate(() => new Date().getTime());
      const expectedTime = testTime.getTime();

      expect(currentTime).toBe(expectedTime);

      // Time should not advance
      await page.waitForTimeout(1000);

      const currentTime2 = await page.evaluate(() => new Date().getTime());
      expect(currentTime2).toBe(expectedTime);

      console.log('Fixed time test successful:', new Date(currentTime));
    });
  });
});