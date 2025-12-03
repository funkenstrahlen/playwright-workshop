import { test as base, expect } from '@playwright/test';

interface AuthenticationFixture {
  loginUser: (email: string, password: string) => Promise<void>;
}

export const test = base.extend<AuthenticationFixture>({
  loginUser: async ({ page }, use) => {
    await use(async (email: string, password: string) => {
      await page.goto('/auth/signin');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Submit sign in form' }).click();

      await expect(page).toHaveURL('/');
    });
  },
});

export { expect } from '@playwright/test';
