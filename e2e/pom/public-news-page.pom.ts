import { Locator, Page } from '@playwright/test';
import { ArticleItem } from './article-item.pom';

export class PublicNewsPage {
  private readonly page: Page;
  private readonly searchInput: Locator;
  private readonly articles: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole('textbox', {
      name: 'Search news articles',
    });
    this.articles = page
      .getByRole('list', { name: 'News Articles' })
      .getByRole('article');
  }

  async goto() {
    await this.page.goto('/news/public');
    await this.page.waitForURL('/news/public');
    await this.page.waitForLoadState('networkidle');
  }

  async search(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  async getArticles() {
    return (await this.articles.all()).map(
      (article: Locator) => new ArticleItem(article),
    );
  }

  async getArticleCount() {
    return await this.articles.count();
  }

  async getArticle(index: number) {
    return new ArticleItem(this.articles.nth(index));
  }

  async getFirstArticle() {
    return new ArticleItem(this.articles.first());
  }

  async getLastArticle() {
    return new ArticleItem(this.articles.last());
  }

  async getArticleByText(text: string) {
    return new ArticleItem(this.articles.filter({ hasText: text }));
  }
}
