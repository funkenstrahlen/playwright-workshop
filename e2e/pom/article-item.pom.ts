import { Locator } from '@playwright/test';

export class ArticleItem {
  private readonly header: Locator;
  constructor(private readonly locator: Locator) {
    this.header = locator.getByRole('heading', { level: 2 }).first();
  }

  async getHeader() {
    return await this.header.textContent();
  }
}
