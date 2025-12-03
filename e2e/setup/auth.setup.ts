import { test as setup, expect } from '../fixtures/base.fixture';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup(
  'should sign in with valid credentials',
  async ({ page, user, loginUser }) => {
    const { email, password } = user;

    await loginUser(email, password);

    await page.context().storageState({ path: userFile });
  },
);
