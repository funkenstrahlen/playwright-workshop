import { test as base, expect } from '@playwright/test';

interface AuthenticationFixture {
  loginUser: (email: string, password: string) => Promise<void>;
  createUser: (user: {
    name: string;
    email: string;
    role: string;
  }) => Promise<void>;
  countUsers: () => Promise<number>;
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
  createUser: async ({ page }, use) => {
    await use(async (user: { name: string; email: string; role: string }) => {
      await page.goto('/fixtures-demo');
      await page.getByLabel('Name').fill(user.name);
      await page.getByLabel('Email').fill(user.email);
      await page.getByLabel('Role').selectOption({ value: user.role });
      await page.getByRole('button', { name: 'Add User' }).click();
    });
  },
  countUsers: async ({ page }, use) => {
    await use(async () => {
      let userCountString =
        (await page.getByTestId('user-count').textContent()) || '';
      userCountString = userCountString?.replace(' users', '');
      return parseInt(userCountString);
    });
  },
});

export { expect } from '@playwright/test';
