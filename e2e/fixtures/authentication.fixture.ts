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
  createUser: async ({ userManagementPage }, use) => {
    await use(async (user: { name: string; email: string; role: string }) => {
      await userManagementPage.goto();
      await userManagementPage.createUser(user);
    });
  },
  countUsers: async ({ userManagementPage }, use) => {
    await use(async () => {
      return userManagementPage.getUserCount();
    });
  },
});

export { expect } from '@playwright/test';
