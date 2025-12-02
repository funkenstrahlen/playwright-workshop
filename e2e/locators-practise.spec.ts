import test, { expect } from '@playwright/test';

test('Smoke test', async ({ page }) => {
  await page.goto('/');

  const publicNews = page.getByRole('menuitem', {
    name: 'Navigate to Public News',
  });
  await publicNews.click();

  const newsFeedHeader = page.getByText('News Feed');
  await expect(newsFeedHeader).toBeVisible();

  const searchInput = page.getByPlaceholder('Search news...');
  await expect(searchInput).toBeVisible();
});
