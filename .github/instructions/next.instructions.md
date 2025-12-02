---
applyTo: "**/*.tsx,**/*.ts,**/app/**,**/pages/**,**/next.config.*"
---

# Next.js 16 Guidelines

## App Router Architecture

Next.js 16 uses the App Router with file-system based routing where folders define routes and special files define UI components.

```
app/
  layout.tsx      # Root layout (required)
  page.tsx        # Root page
  loading.tsx     # Loading UI
  error.tsx       # Error handling
  not-found.tsx   # 404 page
  dashboard/
    layout.tsx    # Nested layout
    page.tsx      # Dashboard page
    [id]/
      page.tsx    # Dynamic route
```

## Server and Client Components

- **Server Components (default):** Components in the `app` directory are Server Components by default
- **Client Components:** Use `'use client'` directive for interactive components

```typescript
// Server Component (default) - Can fetch data directly
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  const posts = await data.json();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

```typescript
// Client Component - For interactivity
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## Layouts

```typescript
// app/layout.tsx - Root layout (required)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// app/dashboard/layout.tsx - Nested layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav>{/* Dashboard navigation */}</nav>
      {children}
    </section>
  );
}
```

## Data Fetching

```typescript
// Server Component with fetch API
export default async function Page() {
  const data = await fetch('https://api.example.com/posts');
  const posts = await data.json();

  return <PostList posts={posts} />;
}

// With ORM/Database directly
import { db, posts } from '@/lib/db';

export default async function Page() {
  const allPosts = await db.select().from(posts);
  return <PostList posts={allPosts} />;
}

// Streaming with Suspense
import { Suspense } from 'react';
import Posts from '@/app/ui/posts';

export default function Page() {
  const posts = getPosts(); // Don't await

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Posts posts={posts} />
    </Suspense>
  );
}
```

## Server Actions

```typescript
// app/actions.ts
'use server';

import { revalidateTag } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  const content = formData.get('content');

  // Mutate data in database
  await db.insert(posts).values({ title, content });

  // Revalidate cache
  revalidateTag('posts', 'max');
}
```

```typescript
// Using Server Action in a form
import { createPost } from '@/app/actions';

export function CreatePostForm() {
  return (
    <form action={createPost}>
      <input type="text" name="title" placeholder="Title" />
      <textarea name="content" placeholder="Content" />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

## Server Actions with useActionState

```typescript
'use client';

import { useActionState } from 'react';
import { createPost } from '@/app/actions';

export function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(createPost, null);

  return (
    <form action={formAction}>
      <input type="text" name="title" placeholder="Title" disabled={isPending} />
      <textarea name="content" placeholder="Content" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Post'}
      </button>
      {state?.error && <p className="error">{state.error}</p>}
    </form>
  );
}
```

## Caching and Revalidation

```typescript
// Time-based revalidation
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 }, // Revalidate every hour
});

// Tag-based revalidation
const data = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] },
});

// On-demand revalidation in Server Action
import { revalidateTag, revalidatePath } from 'next/cache';

export async function updatePost(id: string) {
  // Update data...

  // Revalidate by tag (recommended with stale-while-revalidate)
  revalidateTag('posts', 'max');

  // Or revalidate by path
  revalidatePath('/posts');
}

// Using unstable_cache for custom caching
import { unstable_cache } from 'next/cache';

const getCachedUser = unstable_cache(
  async (userId: string) => {
    return getUserById(userId);
  },
  ['user'],
  {
    tags: ['user'],
    revalidate: 3600,
  }
);
```

## Dynamic Routes

```typescript
// app/blog/[slug]/page.tsx
export default async function Page(
  props: PageProps<'/blog/[slug]'>
) {
  const { slug } = await props.params;
  const post = await getPost(slug);

  return <article>{post.content}</article>;
}

// Generate static params
export async function generateStaticParams() {
  const posts = await getPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

## Parallel Routes

```typescript
// app/layout.tsx with parallel routes
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <>
      {children}
      {analytics}
      {team}
    </>
  );
}

// app/@analytics/page.tsx - Parallel route slot
export default function AnalyticsPage() {
  return <Analytics />;
}
```

## Intercepting Routes

```typescript
// app/@modal/(.)photo/[id]/page.tsx - Intercept photo route for modal
export default function PhotoModal({ params }: { params: { id: string } }) {
  return (
    <Modal>
      <Photo id={params.id} />
    </Modal>
  );
}
```

## Metadata

```typescript
// Static metadata
export const metadata = {
  title: 'My App',
  description: 'My application description',
};

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  };
}
```

## Route Handlers

```typescript
// app/api/posts/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const posts = await getPosts();
  return Response.json(posts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const post = await createPost(body);
  return Response.json(post, { status: 201 });
}

// With revalidation config
export const revalidate = 60; // Revalidate every 60 seconds

// Dynamic route handler
// app/api/posts/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await getPost(id);
  return Response.json(post);
}
```

## Loading and Error States

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>;
}

// app/dashboard/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}

// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  );
}
```

## Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

## Image Optimization

```typescript
import Image from 'next/image';

export default function Avatar() {
  return (
    <Image
      src="/avatar.png"
      alt="User avatar"
      width={64}
      height={64}
      priority // Load immediately for LCP images
    />
  );
}

// Responsive image
export default function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      className="object-cover"
    />
  );
}
```

## Link Component

```typescript
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/blog/hello-world">Blog Post</Link>
      <Link href={{ pathname: '/blog', query: { sort: 'date' } }}>
        Blog
      </Link>
    </nav>
  );
}
```

## useRouter Hook

```typescript
'use client';

import { useRouter } from 'next/navigation';

export default function LoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    // Perform login...
    router.push('/dashboard');
    router.refresh(); // Refresh server components
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

## Best Practices

- **Use Server Components by default:** Only add `'use client'` when you need interactivity, event handlers, or React hooks
- **Colocate data fetching:** Fetch data in the components that need it, Server Components handle deduplication
- **Use Server Actions for mutations:** Prefer Server Actions over API routes for form submissions
- **Leverage streaming:** Use Suspense boundaries for progressive loading
- **Cache appropriately:** Use time-based or tag-based revalidation based on data freshness requirements
- **Keep Client Components at the leaves:** Push interactivity to the smallest possible components
- **Use `loading.tsx` for route-level loading states:** Provides automatic Suspense boundaries
- **Handle errors gracefully:** Use `error.tsx` for error boundaries at route level
- **Optimize images:** Always use `next/image` for automatic optimization
- **Prefetch links:** Next.js automatically prefetches `<Link>` components in viewport

## Anti-patterns to Avoid

- Using `'use client'` at the top of every file
- Fetching data in Client Components when Server Components would work
- Not using Suspense boundaries for async operations
- Hardcoding API URLs instead of using environment variables
- Not implementing proper error boundaries
- Using `useEffect` for data fetching in Client Components when Server Components are available
- Not leveraging the built-in caching mechanisms
- Creating unnecessary API routes when Server Actions would suffice
