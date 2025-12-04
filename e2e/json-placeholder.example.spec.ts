import { test, expect } from './fixtures/base.fixture';

test.describe('Json Placeholder', () => {
  test('should get posts', async ({ getPost }) => {
    const post = await getPost(5);
    expect(post.id).toBe(5);
  });

  test('should create post', async ({ createPost }) => {
    const post = await createPost({
      title: 'Test Post',
      body: 'Test Body',
      userId: 1,
    });
    expect(post.title).toBe('Test Post');
    expect(post.body).toBe('Test Body');
    expect(post.userId).toBe(1);
    expect(post.id).toBeDefined();
  });
});
