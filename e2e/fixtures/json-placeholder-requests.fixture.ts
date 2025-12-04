import { test as base } from '@playwright/test';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface CreatePost {
  title: string;
  body: string;
  userId: number;
}

interface JsonPlaceholderRequestsFixture {
  getPosts: () => Promise<Post[]>;
  getPost: (id: number) => Promise<Post>;
  createPost: (post: CreatePost) => Promise<Post>;
}

export const test = base.extend<JsonPlaceholderRequestsFixture>({
  getPosts: async ({ page }, use) => {
    await use(async () => {
      const response = await page.request.get(
        'https://jsonplaceholder.typicode.com/posts',
      );
      if (!response.ok()) {
        throw new Error(`Failed to get posts`);
      }
      return response.json();
    });
  },
  getPost: async ({ page }, use) => {
    await use(async (id: number) => {
      const response = await page.request.get(
        `https://jsonplaceholder.typicode.com/posts/${id}`,
      );
      if (!response.ok()) {
        throw new Error(`Failed to get post ${id}`);
      }
      return response.json();
    });
  },
  createPost: async ({ page }, use) => {
    await use(async (post: CreatePost) => {
      const response = await page.request.post(
        'https://jsonplaceholder.typicode.com/posts',
        {
          data: post,
        },
      );
      if (!response.ok()) {
        throw new Error(`Failed to create post`);
      }
      return response.json();
    });
  },
});
