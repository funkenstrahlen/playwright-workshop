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

test('search for Ukraine article', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('menuitem', { name: 'Navigate to Public News' }).click();
  await page
    .getByRole('textbox', { name: 'Search news articles' })
    .fill('Ukraine');
  await page
    .getByRole('textbox', { name: 'Search news articles' })
    .press('Enter');

  const article = page
    .getByRole('list', { name: 'News Articles' })
    .getByRole('article', { name: 'Ukraine' })
    .first();

  await expect(article).toBeVisible();
  await expect(article.getByRole('heading')).toContainText('Ukraine');
});
