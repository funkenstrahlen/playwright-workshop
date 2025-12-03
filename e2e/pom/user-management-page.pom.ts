import { Locator, Page } from '@playwright/test';

export class UserManagementPage {
  private readonly page: Page;
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly roleSelect: Locator;
  private readonly submitButton: Locator;
  private readonly cancelButton: Locator;
  private readonly userCount: Locator;
  private readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel('Name');
    this.emailInput = page.getByLabel('Email');
    this.roleSelect = page.getByLabel('Role');
    this.submitButton = page.getByTestId('submit-user-button');
    this.cancelButton = page.getByTestId('cancel-edit-button');
    this.userCount = page.getByTestId('user-count');
    this.emptyState = page.getByTestId('empty-state');
  }

  async goto() {
    await this.page.goto('/fixtures-demo');
    await this.page.waitForURL('/fixtures-demo');
  }

  async createUser(user: { name: string; email: string; role: string }) {
    await this.nameInput.fill(user.name);
    await this.emailInput.fill(user.email);
    await this.roleSelect.selectOption({ value: user.role });
    await this.submitButton.click();
  }

  async editUser(
    userId: number,
    user: { name: string; email: string; role: string }
  ) {
    await this.page.getByTestId(`edit-user-${userId}`).click();
    await this.nameInput.fill(user.name);
    await this.emailInput.fill(user.email);
    await this.roleSelect.selectOption({ value: user.role });
    await this.submitButton.click();
  }

  async deleteUser(userId: number) {
    await this.page.getByTestId(`delete-user-${userId}`).click();
  }

  async cancelEdit() {
    await this.cancelButton.click();
  }

  async getUserCount(): Promise<number> {
    const text = (await this.userCount.textContent()) || '';
    return parseInt(text.replace(' users', ''));
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.emptyState.isVisible();
  }

  getUserItem(userId: number): Locator {
    return this.page.getByTestId(`user-item-${userId}`);
  }

  getUserName(userId: number): Locator {
    return this.page.getByTestId(`user-name-${userId}`);
  }

  getUserEmail(userId: number): Locator {
    return this.page.getByTestId(`user-email-${userId}`);
  }

  getUserRole(userId: number): Locator {
    return this.page.getByTestId(`user-role-${userId}`);
  }
}
