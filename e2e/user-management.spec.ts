import { test, expect } from './fixtures/base.fixture';

test.describe('User Management', () => {
  test('should create a new user', async ({ page, createUser, countUsers }) => {
    await page.goto('/fixtures-demo');
    const initialCount = await countUsers();
    await createUser({
      name: 'Test User',
      email: 'test2@example.com',
      role: 'user',
    });

    const finalCount = await countUsers();
    expect(finalCount).toBe(initialCount + 1);
  });
});
