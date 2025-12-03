import { Locator } from '@playwright/test';

export class ArticleItem {
  private readonly header: Locator;
  private readonly link: Locator;
  private readonly source: Locator;
  private readonly category: Locator;
  private readonly description: Locator;
  private readonly publishedDate: Locator;

  constructor(private readonly locator: Locator) {
    this.header = locator.getByRole('heading', { level: 2 }).first();
    this.link = this.header.getByRole('link');
    this.source = locator.getByLabel(/^Source:/);
    this.category = locator.getByLabel(/^Category:/);
    this.description = locator.getByRole('paragraph');
    this.publishedDate = locator.getByLabel(/^Published:/);
  }

  async getHeader() {
    return await this.header.textContent();
  }

  async getLink() {
    return await this.link.getAttribute('href');
  }

  async getSource() {
    return await this.source.textContent();
  }

  async getCategory() {
    return await this.category.textContent();
  }

  async getDescription() {
    return await this.description.textContent();
  }

  async getPublishedDate() {
    return await this.publishedDate.textContent();
  }

  async clickLink() {
    await this.link.click();
  }
}
