import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup.beforeEach(async ({ page }) => {
  await page.goto('/auth/signin');
});

setup('should sign in with valid credentials', async ({ page }) => {
  const username = process.env.TEST_USERNAME;
  const userPassword = process.env.TEST_PASSWORD;

  setup.skip(
    !username || !userPassword,
    'Missing TEST_USERNAME or TEST_PASSWORD env variables',
  );

  const email = page.getByLabel('Email');
  const password = page.getByLabel('Password');
  await email.fill(username!);
  await password.fill(userPassword!);
  await page.getByRole('button', { name: 'Submit sign in form' }).click();

  await expect(page).toHaveURL('/');

  await page.context().storageState({ path: userFile });
});
