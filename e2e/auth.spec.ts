import test, { expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
  });

  test('should display sign in page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('should sign in with valid credentials', async ({ page }) => {
    const email = page.getByRole('textbox', {
      name: 'Email address for sign in',
    });
    const password = page.getByRole('textbox', {
      name: 'Password for sign in',
    });

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
