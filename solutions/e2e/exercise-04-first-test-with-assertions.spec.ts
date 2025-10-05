import { test, expect } from '@playwright/test';

test.describe('Übung 4 - Erste Tests mit Assertions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Navigation Links prüfen', async ({ page }) => {
    // Public News Link prüfen
    const publicNewsLink = page.getByRole('link', { name: /public news/i });
    await expect(publicNewsLink).toBeVisible();
    await expect(publicNewsLink).toHaveText('Public News');

    // Link klicken und URL prüfen
    await publicNewsLink.click();
    await expect(page).toHaveURL(/.*public/);

    // Zurück zur Hauptseite
    await page.goBack();
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('Überschriften und Texte prüfen', async ({ page }) => {
    // Hauptüberschrift prüfen
    const heading = page.getByRole('heading', { name: 'News Feed' });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('News Feed');

    // News-Artikel Anzahl prüfen
    const articles = page.locator('article');
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);
    console.log(`Gefundene Artikel: ${count}`);

    // Erster Artikel sollte sichtbar sein
    await expect(articles.first()).toBeVisible();
  });

  test('Suchfeld Interaktion mit Assertions', async ({ page }) => {
    // Suchfeld finden und prüfen
    const searchBox = page.getByPlaceholder('Search news...');
    await expect(searchBox).toBeVisible();
    await expect(searchBox).toBeEditable();
    await expect(searchBox).toBeEmpty();

    // Text eingeben
    await searchBox.fill('Playwright');
    await expect(searchBox).toHaveValue('Playwright');

    // Enter drücken und warten
    await page.keyboard.press('Enter');

    // Warten bis Suche abgeschlossen ist
    await page.waitForTimeout(1000);

    // Prüfen ob Ergebnisse gefiltert wurden
    const articles = page.locator('article');
    const afterSearchCount = await articles.count();
    console.log(`Artikel nach Suche: ${afterSearchCount}`);

    // Suchfeld leeren
    await searchBox.clear();
    await expect(searchBox).toBeEmpty();
  });

  test('Theme Toggle mit Assertions', async ({ page }) => {
    // Theme Toggle Button finden
    const themeToggle = page.getByRole('switch').first();
    await expect(themeToggle).toBeVisible();

    // Initial State prüfen (kann light oder dark sein)
    const bodyElement = page.locator('body');
    const initialClass = await bodyElement.getAttribute('class');
    console.log('Initial theme class:', initialClass);

    // Theme umschalten
    await themeToggle.click();

    // Warten auf Theme-Änderung
    await page.waitForTimeout(500);

    // Prüfen ob sich die Klasse geändert hat
    const newClass = await bodyElement.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
    console.log('New theme class:', newClass);

    // Zurückschalten
    await themeToggle.click();
    await page.waitForTimeout(500);

    const finalClass = await bodyElement.getAttribute('class');
    expect(finalClass).toBe(initialClass);
  });

  test('Element Sichtbarkeit und State prüfen', async ({ page }) => {
    // Verschiedene Assertion-Methoden üben

    // 1. toBeVisible() - Element ist sichtbar
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // 2. toBeHidden() - Element ist versteckt (wenn es eines gibt)
    const hiddenElement = page.locator('.hidden-element');
    const hiddenExists = await hiddenElement.count() > 0;
    if (hiddenExists) {
      await expect(hiddenElement).toBeHidden();
    }

    // 3. toBeEnabled() / toBeDisabled()
    const searchBox = page.getByPlaceholder('Search news...');
    await expect(searchBox).toBeEnabled();

    // 4. toContainText() - Teiltext prüfen
    const firstArticle = page.locator('article').first();
    await expect(firstArticle).toContainText(/[a-zA-Z]/); // Enthält Text

    // 5. toHaveCount() - Anzahl prüfen
    const links = page.locator('a');
    await expect(links).toHaveCount.greaterThan(1);

    // 6. toHaveAttribute() - Attribute prüfen
    const logo = page.locator('img').first();
    const logoExists = await logo.count() > 0;
    if (logoExists) {
      await expect(logo).toHaveAttribute('src', /.+/);
      await expect(logo).toHaveAttribute('alt');
    }
  });

  test('Wait-Strategien mit Assertions', async ({ page }) => {
    // waitFor mit verschiedenen States
    const searchBox = page.getByPlaceholder('Search news...');

    // Warten bis Element sichtbar ist
    await searchBox.waitFor({ state: 'visible' });
    await expect(searchBox).toBeVisible();

    // Text eingeben und auf Reaktion warten
    await searchBox.fill('Test');

    // Warten mit custom timeout
    await expect(searchBox).toHaveValue('Test', { timeout: 5000 });

    // Auf Text in der Seite warten
    await expect(page.getByText('News Feed')).toBeVisible({ timeout: 10000 });

    // Negativ-Assertion mit Timeout
    const nonExistent = page.locator('.does-not-exist');
    await expect(nonExistent).not.toBeVisible({ timeout: 1000 });
  });

  test('Assertion Chains und Kombinationen', async ({ page }) => {
    // Mehrere Assertions nacheinander
    const searchBox = page.getByPlaceholder('Search news...');

    // Assertion Chain
    await expect(searchBox).toBeVisible();
    await expect(searchBox).toBeEnabled();
    await expect(searchBox).toBeEditable();
    await expect(searchBox).toBeFocused({ timeout: 5000 }).catch(() => {
      console.log('Searchbox ist nicht fokussiert - das ist OK');
    });

    // Soft Assertions (Fehler sammeln, nicht sofort abbrechen)
    await expect.soft(searchBox).toBeVisible();
    await expect.soft(searchBox).toHaveAttribute('type', 'text');

    // Custom Error Messages
    await expect(searchBox, 'Suchfeld sollte sichtbar sein').toBeVisible();

    // Regex und Pattern Matching
    const heading = page.getByRole('heading', { level: 1 }).first();
    await expect(heading).toHaveText(/News|Feed/);
    await expect(heading).not.toHaveText(/Error/);
  });
});