# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Playwright workshop project built with Next.js 16 and HeroUI. It serves as a training environment for learning Playwright E2E testing with exercises and solutions.

## Common Commands

```bash
# Development
npm run dev          # Start Next.js dev server with Turbopack (localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint with auto-fix

# E2E Testing
npm run e2e          # Run all Playwright tests
npm run e2e:ui       # Open Playwright UI mode
npm run e2e:debug    # Run tests in debug mode
npm run e2e:report   # Show HTML test report

# Run single test file
npx playwright test e2e/example.spec.ts

# Run tests matching pattern
npx playwright test -g "test name pattern"

# Run in specific browser
npx playwright test --project=chromium
```

## Architecture

### Directory Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - React components (HeroUI-based)
- `lib/` - Business logic, database access, utilities
  - `lib/db/` - SQLite database models and repositories
  - `lib/api/` - API middleware (auth)
- `e2e/` - Playwright test files (your exercises go here)
- `solutions/` - Complete exercise solutions
  - `solutions/e2e/` - Solution test specs (exercise-01 through exercise-13)
  - `solutions/pages/` - Page Object examples

### Playwright Configuration

- Test directory: `./e2e`
- Base URL: `http://localhost:3000`
- Browsers: Chromium, Firefox, WebKit
- Web server auto-starts via `npm run dev`
- HTML reporter enabled

### Page Object Pattern

Solutions use Page Objects in `solutions/pages/`. Example pattern:
```typescript
export class HomePage {
  readonly page: Page;
  readonly newsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newsLink = page.getByRole('link', { name: /public news/i });
  }

  async goto() {
    await this.page.goto('/');
  }
}
```

## Code Style

- ESLint with TypeScript, React, and Next.js rules
- E2E tests require `@typescript-eslint/no-floating-promises: error` - always await Playwright promises
- Prettier formatting via lint-staged on commit
- Avoid code comments unless requested

## GitHub

Repository: danielsogl/playwright-workshop
