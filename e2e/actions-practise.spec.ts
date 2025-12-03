import test, { expect } from '@playwright/test';

test('toggle theme', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('list')
    .filter({ hasText: 'Sign In' })
    .getByLabel('Switch to light mode')
    .click();
  await expect(
    page
      .getByRole('list')
      .filter({ hasText: 'Sign In' })
      .getByLabel('Switch to dark mode'),
  ).toBeVisible();
});

test('search for Test article', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('menuitem', { name: 'Navigate to Public News' }).click();
  await page
    .getByRole('textbox', { name: 'Search news articles' })
    .fill('Test');

  const articles = page
    .getByRole('list', { name: 'News Articles' })
    .getByRole('article', { name: 'Test' });

  const article = articles.first();
  const numberOfArticles = await articles.count();

  expect(numberOfArticles).toBeGreaterThan(0);
  await expect(article).toBeVisible();
  await expect(article.getByRole('heading')).toContainText('Test');
});
