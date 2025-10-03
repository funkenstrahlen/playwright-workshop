import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly navigation: Locator;
  readonly newsLink: Locator;
  readonly aboutLink: Locator;
  readonly blogLink: Locator;
  readonly pricingLink: Locator;
  readonly signInLink: Locator;
  readonly logo: Locator;
  readonly themeToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Navigation Elements - use exact selectors
    this.navigation = page.getByRole('navigation', { name: 'Main navigation' });
    this.newsLink = page.getByRole('menuitem', { name: 'Navigate to Public News' });
    this.aboutLink = page.getByRole('menuitem', { name: 'Navigate to About' });
    this.blogLink = page.getByRole('menuitem', { name: 'Navigate to Blog' });
    this.pricingLink = page.getByRole('menuitem', { name: 'Navigate to Pricing' });
    this.signInLink = page.getByRole('link', { name: 'Navigate to sign in page' });
    this.logo = page.getByRole('link', { name: 'Go to homepage' });
    this.themeToggle = page.getByRole('switch').first();
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Navigation Methods
  async navigateToNews() {
    await this.newsLink.click();
    await this.page.waitForURL('/news/public');
  }

  async navigateToAbout() {
    await this.aboutLink.click();
    await this.page.waitForURL('/about');
  }

  async navigateToBlog() {
    await this.blogLink.click();
    await this.page.waitForURL('/blog');
  }

  async navigateToPricing() {
    await this.pricingLink.click();
    await this.page.waitForURL('/pricing');
  }

  async navigateToSignIn() {
    await this.signInLink.click();
    await this.page.waitForURL('**/auth/signin');
  }

  async navigateToHome() {
    await this.logo.click();
    await this.page.waitForURL('/');
  }

  // Theme Actions
  async toggleTheme() {
    await this.themeToggle.click();
    await this.page.waitForTimeout(100); // Small delay for theme transition
  }

  async getCurrentTheme(): Promise<string> {
    const htmlElement = this.page.locator('html');
    const classAttribute = await htmlElement.getAttribute('class') || '';
    const dataTheme = await htmlElement.getAttribute('data-theme') || '';
    return classAttribute.includes('dark') || dataTheme.includes('dark') ? 'dark' : 'light';
  }

  // Status Checks
  async isUserLoggedIn(): Promise<boolean> {
    const signOutButton = this.page.getByRole('button', { name: /sign out|logout/i })
      .or(this.page.getByRole('link', { name: /sign out|logout/i }));
    return await signOutButton.isVisible({ timeout: 3000 }).catch(() => false);
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }
}