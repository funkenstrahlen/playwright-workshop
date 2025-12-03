import { test as base } from './pages.fixture';

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
  loginUser: async ({ loginPage }, use) => {
    await use(async (email: string, password: string) => {
      await loginPage.goto();
      await loginPage.login(email, password);
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
