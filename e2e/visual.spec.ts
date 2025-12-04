import { expect, test } from './fixtures/base.fixture';

test.describe('Visual Regression Tests', () => {
  test(
    'Login Page Screenshot',
    { tag: '@visual' },
    async ({ loginPage, page }) => {
      await loginPage.goto();
      const nextJSDebug = page.getByRole('button', {
        name: 'Open Next.js Dev Tools',
      });
      await expect(page).toHaveScreenshot({
        mask: [nextJSDebug],
        maskColor: '#FF00FF',
      });
    },
  );
});
