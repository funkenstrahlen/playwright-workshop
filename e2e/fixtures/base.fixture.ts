import { mergeTests } from '@playwright/test';
import { test as userFixture } from './user.fixture';
import { test as authenticationFixture } from './authentication.fixture';
import { test as pagesFixture } from './pages.fixture';

// we merge the fixtures into a single test fixture to make the import in the tests cleaner
export const test = mergeTests(
  userFixture,
  authenticationFixture,
  pagesFixture,
);

export { expect } from '@playwright/test';
