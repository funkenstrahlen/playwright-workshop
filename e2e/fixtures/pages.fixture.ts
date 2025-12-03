import { test as base } from '@playwright/test';
import { LoginPage } from '../pom/login-page.pom';
import { PublicNewsPage } from '../pom/public-news-page.pom';

interface PagesFixture {
  loginPage: LoginPage;
  publicNewsPage: PublicNewsPage;
}

export const test = base.extend<PagesFixture>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  publicNewsPage: async ({ page }, use) => {
    const publicNewsPage = new PublicNewsPage(page);
    await use(publicNewsPage);
  },
});

export { expect } from '@playwright/test';
