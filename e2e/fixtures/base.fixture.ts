import { mergeTests } from '@playwright/test';
import { test as userFixture } from './user.fixture';
import { test as authenticationFixture } from './authentication.fixture';

export const test = mergeTests(userFixture, authenticationFixture);

export { expect } from '@playwright/test';
