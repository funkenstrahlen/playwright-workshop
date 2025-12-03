import { mockNewsData } from '@/solutions/e2e/mocks/news-mocks';
import { test, expect } from './fixtures/base.fixture';
import { RSSItem } from '@/types/rss';

interface NewsApiResponse {
  items: RSSItem[];
}

test.describe('Public News', () => {
  test.describe('no mocking', () => {
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

  test.describe('network requests mocking', () => {
    test('should handle empty response', async ({ publicNewsPage, page }) => {
      await page.route('/api/news/public', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          json: { items: [] },
        });
      });
      await publicNewsPage.goto();
      expect(await publicNewsPage.getArticleCount()).toBe(0);
    });

    test('should show error message when request fails', async ({
      publicNewsPage,
      page,
    }) => {
      await page.route('/api/news/public', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          json: { error: 'Internal Server Error' },
        });
      });

      await publicNewsPage.goto();
      await expect(publicNewsPage.errorAlert).toBeVisible();
    });

    test('should show articles when response is successful', async ({
      publicNewsPage,
      page,
    }) => {
      await page.route('/api/news/public', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          json: mockNewsData.success,
        });
      });

      await publicNewsPage.goto();
      expect(await publicNewsPage.getArticleCount()).toBeGreaterThan(0);
      const article = await publicNewsPage.getFirstArticle();
      expect(await article.getHeader()).toContain('Test');
    });

    test('should correctly count news items', async ({
      publicNewsPage,
      page,
    }) => {
      const articlesResponsePromise = page.waitForResponse('/api/news/public');
      await publicNewsPage.goto();
      const articlesResponse = await articlesResponsePromise;
      const articlesData = (await articlesResponse.json()) as NewsApiResponse;
      const expectedArticleCount = articlesData.items.length;

      expect(await publicNewsPage.getArticleCount()).toBe(expectedArticleCount);
      expect(articlesResponse.status()).toBe(200);
    });
  });
});
