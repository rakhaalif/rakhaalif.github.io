import { test, expect, type Page } from '@playwright/test';

const inView = (page: Page) =>
  page.evaluate(() => {
    const r = document.getElementById('experience')!.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  });

test('nav link scrolls to its section', async ({ page }) => {
  await page.goto('/');
  expect(await inView(page)).toBe(false);
  await page.getByRole('link', { name: 'Experience' }).click();
  await expect.poll(() => inView(page), { timeout: 3000 }).toBe(true);
});

test('deep link lands on its section', async ({ page }) => {
  await page.goto('/#experience');
  await page.waitForTimeout(4000);
  expect(await inView(page)).toBe(true);
});

test('reduced motion has no Lenis', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => (window as any).__lenis)).toBeUndefined();
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
});
