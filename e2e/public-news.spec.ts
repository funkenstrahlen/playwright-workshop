import { test, expect } from './fixtures/base.fixture';

test.describe('Public News', () => {
  test.beforeEach(async ({ publicNewsPage }) => {
    await publicNewsPage.goto();
  });
  test('should show public news', async ({ publicNewsPage }) => {
    await publicNewsPage.search('Test');
    expect(await publicNewsPage.getArticleCount()).toBeGreaterThan(0);
  });

  test('should show test article', async ({ publicNewsPage }) => {
    await publicNewsPage.search('Test');
    expect(await publicNewsPage.getArticleCount()).toBeGreaterThan(0);
    const article = await publicNewsPage.getFirstArticle();
    expect(await article.getHeader()).toContain('Test');
  });
});
