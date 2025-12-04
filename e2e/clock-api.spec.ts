import { test, expect } from './fixtures/base.fixture';

test.describe('Clock API', () => {
  // sets the timezone to Berlin for this describe block
  test.use({ timezoneId: 'Europe/Berlin' });

  test.beforeEach(async ({ page, clockPage }) => {
    // we have to call install before we can use pauseAt and fastForward functions
    // we set the time to a date far in the past to be able to fast forward because fast forward does not allow to move back in time
    await page.clock.install({ time: new Date('1990-01-01') });
    await clockPage.goto();
  });
  test('should correctly display the current time', async ({
    page,
    clockPage,
  }) => {
    await page.clock.pauseAt(new Date('2024-01-15T14:30:00Z'));
    await expect(clockPage.currentTime).toContainText('15:30');
  });

  test('should correctly display the current date', async ({
    page,
    clockPage,
  }) => {
    await page.clock.pauseAt(new Date('2024-01-15T14:30:00Z'));

    const currentTime = await page.evaluate(() => new Date());
    console.log('currentTime Europe/Berlin', currentTime.toISOString());

    await expect(clockPage.currentDate).toContainText(
      'Montag, 15. Januar 2024',
    );
  });

  test.describe('other timezone', () => {
    test.use({ timezoneId: 'Asia/Tokyo' });

    test('should correctly display the current time in the other timezone', async ({
      page,
      clockPage,
    }) => {
      await page.clock.pauseAt(new Date('2024-01-15T14:30:00Z'));
      // debugging tip:
      const currentTime = await page.evaluate(() => new Date());
      console.log('currentTime Asia/Tokyo', currentTime.toISOString());

      console.log(
        'currentTime Asia/Tokyo',
        await clockPage.currentTime.textContent(),
      );
      console.log(
        'currentDate Asia/Tokyo',
        await clockPage.currentDate.textContent(),
      );

      await expect(clockPage.currentTime).toContainText('23:30');
      await expect(clockPage.currentDate).toContainText(
        'Montag, 15. Januar 2024',
      );
    });
  });
});
