import { test as base } from '@playwright/test';

interface UserFixture {
  user: {
    email: string;
    password: string;
  };
}

export const test = base.extend<UserFixture>({
  /**
   * Fixture Lifecycle:
   * 1. Setup (before `use`) - runs once when the fixture is first requested
   * 2. `await use(value)` - provides the value to the test
   * 3. Test executes - can access the yielded value as many times as needed
   * 4. Teardown (after `use`) - runs once AFTER the test completes (pass or fail)
   *
   * The code after `use` is NOT executed after each property access,
   * but only after the entire test case finishes.
   */
  user: async ({ page }, use) => {
    const username = process.env.TEST_USERNAME || '';
    const userPassword = process.env.TEST_PASSWORD || '';

    const user = {
      email: username,
      password: userPassword,
    };

    await use(user);

    // Teardown code runs here - after the test completes
  },
});

export { expect } from '@playwright/test';
