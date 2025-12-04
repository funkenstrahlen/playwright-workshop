import { Locator, Page } from '@playwright/test';

export class ClockPage {
  readonly currentTime: Locator;
  readonly currentDate: Locator;

  constructor(private readonly page: Page) {
    this.currentTime = page.getByTestId('current-time');
    this.currentDate = page.getByTestId('current-date');
  }

  async goto() {
    await this.page.goto('/clock');
    await this.page.waitForURL('/clock');
  }
}
