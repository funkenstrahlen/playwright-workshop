import { test as base } from '@playwright/test';

interface UserFixture {
  user: {
    email: string;
    password: string;
  };
}

export const test = base.extend<UserFixture>({
  user: async ({}, use) => {
    const username = process.env.TEST_USERNAME || '';
    const userPassword = process.env.TEST_PASSWORD || '';

    const user = {
      email: username,
      password: userPassword,
    };

    await use(user);
  },
});

export { expect } from '@playwright/test';
