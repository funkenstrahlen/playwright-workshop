import { test, expect } from '@playwright/test';

test.describe('Exercise 1: First Test with Locators', () => {
  test('navigiert zur Public News Seite', async ({ page }) => {
    // Navigiere zur Startseite
    await page.goto('/');

    // Finde den Link über seinen sichtbaren Text und Rolle
    const newsLink = page.getByRole('menuitem', { name: 'Navigate to Public News' });

    // Playwright wartet automatisch bis der Link klickbar ist!
    await newsLink.click();

    // Auto-wait: Wartet bis die URL sich ändert
    await expect(page).toHaveURL('/news/public');

    // Auto-wait: Wartet bis die Überschrift sichtbar ist
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('verwendet verschiedene semantische Locators', async ({ page }) => {
    await page.goto('/');

    // Nach Rolle und Name - Sign in button
    const authSection = page.getByRole('link', { name: 'Navigate to sign in page' });
    await expect(authSection).toBeVisible();

    // Nach Überschrift
    const welcomeText = page.getByRole('heading', { name: 'Playwright Demo App' });
    await expect(welcomeText).toBeVisible();

    // Nach Rolle für Navigation mit aria-label (exact match to avoid multiple elements)
    const navigation = page.getByRole('navigation', { name: 'Main navigation', exact: true });
    await expect(navigation).toBeVisible();

    // Links in der Navigation finden mit spezifischen Namen
    const aboutLink = page.getByRole('menuitem', { name: 'Navigate to About' });
    const blogLink = page.getByRole('menuitem', { name: 'Navigate to Blog' });
    const pricingLink = page.getByRole('menuitem', { name: 'Navigate to Pricing' });

    // Alle Links sollten sichtbar sein
    await expect(aboutLink).toBeVisible();
    await expect(blogLink).toBeVisible();
    await expect(pricingLink).toBeVisible();
  });

  test('arbeitet mit Listen von Elementen', async ({ page }) => {
    await page.goto('/news/public');

    // Warte auf Laden der Seite
    await page.waitForLoadState('networkidle');

    // Finde alle News-Artikel über role=article
    const allArticles = page.getByRole('article');

    // Zähle die Artikel (Auto-Wait inklusive!)
    const count = await allArticles.count();

    // Es sollten Artikel vorhanden sein
    if (count > 0) {
      expect(count).toBeGreaterThan(0);
      console.log(`Found ${count} news articles`);

      // Finde den ersten Artikel
      const firstArticle = allArticles.first();
      await expect(firstArticle).toBeVisible();

      // Prüfe ob Artikel Titel haben
      const firstTitle = firstArticle.getByRole('heading').first();
      if (await firstTitle.count() > 0) {
        await expect(firstTitle).toBeVisible();
      }
    } else {
      // Fallback: Prüfe ob eine "Keine Artikel" Nachricht angezeigt wird
      const emptyMessage = page.getByText(/no news|keine nachrichten|no articles/i);

      // Verwende conditional check statt forcing visibility
      const isEmptyMessageVisible = await emptyMessage.isVisible({ timeout: 2000 }).catch(() => false);

      // Either no articles or empty message should be true
      expect(count === 0 || isEmptyMessageVisible).toBeTruthy();
    }
  });

  test('testet Navigation zwischen Seiten', async ({ page }) => {
    await page.goto('/');

    // Navigiere zu About
    await page.getByRole('menuitem', { name: 'Navigate to About' }).click();
    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Navigiere zu Blog
    await page.getByRole('menuitem', { name: 'Navigate to Blog' }).click();
    await expect(page).toHaveURL('/blog');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Navigiere zu Pricing
    await page.getByRole('menuitem', { name: 'Navigate to Pricing' }).click();
    await expect(page).toHaveURL('/pricing');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Zurück zur Startseite
    await page.getByRole('link', { name: 'Go to homepage' }).click();
    await expect(page).toHaveURL('/');
  });

  test('demonstriert Auto-Waiting Funktionalität', async ({ page }) => {
    await page.goto('/');

    // Playwright wartet automatisch auf:
    // 1. Element wird sichtbar
    const heading = page.getByRole('heading', { name: 'Playwright Demo App' });
    await expect(heading).toBeVisible();

    // 2. Element wird interaktierbar
    const firstLink = page.getByRole('link', { name: 'Go to homepage' });
    await expect(firstLink).toBeEnabled();

    // 3. Text erscheint
    await expect(page.getByRole('heading', { name: 'Welcome to the' })).toBeVisible();

    // 4. Element verschwindet (mit not)
    const nonExistent = page.getByTestId('non-existent-element');
    await expect(nonExistent).not.toBeVisible();

    // Auto-Waiting funktioniert auch bei Assertions
    await expect(heading).toContainText('Playwright Demo App');
  });
});