import { test, expect } from './fixtures/base.fixture';

test.describe('User Management', () => {
  test.beforeEach(async ({ userManagementPage }) => {
    await userManagementPage.goto();
  });
  test('should create a new user', async ({
    userManagementPage,
    createUser,
    countUsers,
  }) => {
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
