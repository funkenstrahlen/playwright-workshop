import test, { expect } from '@playwright/test';

test.describe('Private News Access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/news/private');
  });

  test('should allow access to private news for authenticated users', async ({
    page,
  }) => {
    await expect(page.getByText('Your private News Feed')).toBeVisible();
  });

  test.describe('Unauthenticated Access', () => {
    // this is how we reset the login state to simulate an unauthenticated user
    // it is better to use it like this instead of browser.newContext() because
    // it preserves other context settings like viewport, locale, timezone, etc.
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should deny access to private news for unauthenticated users', async ({
      page,
    }) => {
      await expect(page.getByText('Access Denied')).toBeVisible();
    });
  });
});
