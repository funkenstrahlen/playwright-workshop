import { mockNewsData } from '@/solutions/e2e/mocks/news-mocks';
import { test, expect } from './fixtures/base.fixture';
import { RSSItem } from '@/types/rss';

interface NewsApiResponse {
  items: RSSItem[];
}

test.describe('Public News', () => {
  test('should show public news', async ({ publicNewsPage }) => {
    await publicNewsPage.goto();
    await publicNewsPage.search('Test');
    expect(await publicNewsPage.getArticleCount()).toBeGreaterThan(0);
  });

  test('should show test article', async ({ publicNewsPage }) => {
    await publicNewsPage.goto();
    await publicNewsPage.search('Test');
    expect(await publicNewsPage.getArticleCount()).toBeGreaterThan(0);
    const article = await publicNewsPage.getFirstArticle();
    expect(await article.getHeader()).toContain('Test');
  });

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
    // we have to define the wait for response before the goto call because the page will make the request as soon as we go to the page
    const articlesResponsePromise = page.waitForResponse('/api/news/public');
    await publicNewsPage.goto();
    // now we wait for the response to be fulfilled
    const articlesResponse = await articlesResponsePromise;

    // then we can get the data from the response
    const articlesData = (await articlesResponse.json()) as NewsApiResponse;
    const expectedArticleCount = articlesData.items.length;

    // and compare the data with the page object that the user sees
    expect(await publicNewsPage.getArticleCount()).toBe(expectedArticleCount);
    expect(articlesResponse.status()).toBe(200);
  });
});
