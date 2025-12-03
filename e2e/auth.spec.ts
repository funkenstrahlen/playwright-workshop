import test, { expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page, browser }) => {
    // clear context to avoid cached auth state
    await browser.newContext();
    await page.goto('/auth/signin');
  });

  test('should display sign in page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const email = page.getByLabel('Email');
    const password = page.getByLabel('Password');

    await email.fill('test@demo.de');
    await password.fill('password123');
    await page.getByRole('button', { name: 'Submit sign in form' }).click();

    const alert = page.getByText('Invalid email or password.');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText(
      'Invalid email or password. Please try again.',
    );
  });
});
