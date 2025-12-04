import { test as base } from '@playwright/test';
import { LoginPage } from '../pom/login-page.pom';
import { PublicNewsPage } from '../pom/public-news-page.pom';
import { UserManagementPage } from '../pom/user-management-page.pom';
import { ClockPage } from '../pom/clock-page.pom';

interface PagesFixture {
  loginPage: LoginPage;
  publicNewsPage: PublicNewsPage;
  userManagementPage: UserManagementPage;
  clockPage: ClockPage;
}

// this fixture allows using the POM pages in the tests without having to instantiate them in each test
export const test = base.extend<PagesFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  publicNewsPage: async ({ page }, use) => {
    const publicNewsPage = new PublicNewsPage(page);
    await use(publicNewsPage);
  },
  userManagementPage: async ({ page }, use) => {
    const userManagementPage = new UserManagementPage(page);
    await use(userManagementPage);
  },
  clockPage: async ({ page }, use) => {
    const clockPage = new ClockPage(page);
    await use(clockPage);
  },
});

export { expect } from '@playwright/test';
