import { test, expect } from '@playwright/test';

test.describe('Übung 2 - Locators kennenlernen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('verschiedene Locator-Strategien verwenden', async ({ page }) => {
    // 1. Den "Public News" Link mit getByRole() finden
    const publicNewsLink = page.getByRole('link', { name: /public news/i });
    console.log('Public News link gefunden:', await publicNewsLink.isVisible());

    // 2. Die Überschrift "News Feed" mit getByText() finden
    const heading = page.getByText('News Feed');
    console.log('News Feed Überschrift gefunden:', await heading.isVisible());

    // 3. Das Suchfeld mit getByPlaceholder() finden
    const searchBox = page.getByPlaceholder('Search news...');
    console.log('Suchfeld gefunden:', await searchBox.isVisible());

    // 4. Den Theme-Toggle Button mit getByLabel() finden
    const themeToggle = page.getByLabel('Toggle theme');
    console.log('Theme Toggle gefunden:', await themeToggle.isVisible());

    // 5. News-Artikel mit getByTestId() finden (falls vorhanden)
    const articles = page.locator('[data-testid="news-article"]');
    const articleCount = await articles.count();
    console.log(`Anzahl der News-Artikel: ${articleCount}`);

    // 6. Mit CSS-Selektoren experimentieren
    const header = page.locator('header');
    console.log('Header gefunden:', await header.isVisible());

    // 7. Mit XPath experimentieren (nicht empfohlen, aber gut zu kennen)
    const firstArticle = page.locator('xpath=//article[1]');
    console.log('Erster Artikel mit XPath gefunden:', await firstArticle.isVisible());

    // Hinweis: Dies ist nur zum Üben - normalerweise würden wir assertions verwenden
    // Aber Assertions kommen erst in Übung 4!
  });

  test('Locator-Verkettung üben', async ({ page }) => {
    // Locators können verkettet werden für präzisere Auswahl
    const newsSection = page.locator('main').locator('section');
    console.log('News Section gefunden:', await newsSection.isVisible());

    // Filter und Pseudo-Selektoren
    const firstNewsItem = page.locator('.news-item').first();
    console.log('Erstes News-Item gefunden:', await firstNewsItem.isVisible());

    const lastNewsItem = page.locator('.news-item').last();
    console.log('Letztes News-Item gefunden:', await lastNewsItem.isVisible());

    // Mit Filter arbeiten
    const filteredItems = page.locator('.news-item').filter({ hasText: 'Playwright' });
    const filteredCount = await filteredItems.count();
    console.log(`News-Items mit "Playwright": ${filteredCount}`);
  });
});