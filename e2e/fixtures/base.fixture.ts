import { mergeTests } from '@playwright/test';
import { test as userFixture } from './user.fixture';
import { test as authenticationFixture } from './authentication.fixture';
import { test as pagesFixture } from './pages.fixture';

export const test = mergeTests(
  userFixture,
  authenticationFixture,
  pagesFixture,
);

export { expect } from '@playwright/test';
