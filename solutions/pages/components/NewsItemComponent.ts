import { Locator } from '@playwright/test';

export class NewsItemComponent {
  constructor(private readonly locator: Locator) {}

  // Getter for sub-elements
  get title() {
    // News items have the heading with the link text
    return this.locator.getByRole('heading', { level: 2 }).first();
  }

  get description() {
    // Description is in a paragraph element
    return this.locator.locator('p').first();
  }

  get link() {
    // Link is within the heading
    return this.locator.getByRole('link').first();
  }

  get author() {
    // Source is in a generic element with role doc-subtitle and contains "Source:"
    return this.locator.locator('[role="doc-subtitle"]').filter({ hasText: 'Source:' }).first();
  }

  get date() {
    // Date is in a generic element with role doc-publication-date
    return this.locator.locator('[role="doc-publication-date"]').first();
  }

  get image() {
    return this.locator.getByRole('img').first();
  }

  get category() {
    // Category is in a generic element with role doc-subtitle and contains "Category:"
    return this.locator.locator('[role="doc-subtitle"]').filter({ hasText: 'Category:' }).first();
  }

  // Actions with fluent interface
  async hover(): Promise<this> {
    await this.locator.hover();
    return this;
  }

  async click(): Promise<this> {
    await this.locator.click();
    return this;
  }

  async clickLink(): Promise<this> {
    await this.link.click();
    return this;
  }

  // Data extraction methods
  async getTitle(): Promise<string> {
    try {
      // Get the text from the heading element, not the link inside it
      const heading = this.locator.getByRole('heading', { level: 2 }).first();
      const text = await heading.textContent({ timeout: 5000 });
      return text || '';
    } catch (error) {
      // If heading not found, try alternative selectors
      try {
        const linkText = await this.locator.getByRole('link').first().textContent({ timeout: 2000 });
        return linkText || '';
      } catch {
        return '';
      }
    }
  }

  async getDescription(): Promise<string> {
    try {
      return await this.description.textContent() || '';
    } catch {
      return '';
    }
  }

  async getAuthor(): Promise<string> {
    try {
      const sourceText = await this.author.textContent() || '';
      // Extract just the source name without "Source: " prefix
      return sourceText.replace('Source: ', '').trim();
    } catch {
      return '';
    }
  }

  async getDate(): Promise<string> {
    try {
      return await this.date.textContent() || '';
    } catch {
      return '';
    }
  }

  async getCategory(): Promise<string> {
    try {
      const categoryText = await this.category.textContent() || '';
      // Extract just the category name without "Category: " prefix
      return categoryText.replace('Category: ', '').trim();
    } catch {
      return '';
    }
  }

  async getImageUrl(): Promise<string | null> {
    return await this.image.getAttribute('src');
  }

  async getLinkUrl(): Promise<string | null> {
    return await this.link.getAttribute('href');
  }

  // Status checks
  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  async hasImage(): Promise<boolean> {
    return await this.image.isVisible().catch(() => false);
  }

  async hasCategory(category: string): Promise<boolean> {
    const categoryText = await this.getCategory();
    return categoryText.toLowerCase().includes(category.toLowerCase());
  }

  // Complex interactions with chaining
  async expandAndRead(): Promise<this> {
    await this.hover();
    const expandButton = this.locator.getByRole('button', { name: /expand|more|read/i });
    if (await expandButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expandButton.click();
    }
    return this;
  }

  async shareVia(platform: 'twitter' | 'facebook' | 'linkedin'): Promise<this> {
    await this.hover();
    const shareButton = this.locator.getByRole('button', { name: new RegExp(platform, 'i') });
    if (await shareButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await shareButton.click();
    }
    return this;
  }

  // Get all data as object
  async getData() {
    return {
      title: await this.getTitle(),
      description: await this.getDescription(),
      author: await this.getAuthor(),
      date: await this.getDate(),
      category: await this.getCategory(),
      imageUrl: await this.getImageUrl(),
      linkUrl: await this.getLinkUrl()
    };
  }
}