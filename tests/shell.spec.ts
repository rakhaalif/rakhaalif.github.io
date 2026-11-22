import { test, expect } from '@playwright/test';
import { CV_HREF, LINKS } from '../src/content';

test('CV link is a PDF', async ({ request }) => {
  const res = await request.get(CV_HREF);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('pdf');
});

test('CV is clickable during the bumper', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('.bumper')).toHaveAttribute('aria-hidden', 'true');
  // the nav button hides behind the action bar on a phone, so take whichever copy is visible (the action bar hides while the hero's own button is in view)
  await page.locator('.nav__actions .btn, .actionbar .btn, .hero .btn--primary').locator('visible=true').first().click({ trial: true });
});

test('bumper is gone after 3.5 s', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3500);
  await expect(page.locator('.bumper')).toHaveCount(0);
});

test('footer links', async ({ page }) => {
  await page.goto('/');
  for (const [label, href] of [['GitHub', LINKS.github], ['LinkedIn', LINKS.linkedin], ['Instagram', LINKS.instagram]]) {
    const a = page.locator('footer.closing').getByRole('link', { name: label, exact: true });
    await expect(a).toHaveAttribute('href', href);
    await expect(a).toHaveAttribute('target', '_blank');
    await expect(a).toHaveAttribute('rel', /noopener/);
  }
});

test('credits page loads', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/credits.html');
  await expect(page.locator('h1')).toBeVisible();
  expect(errors).toEqual([]);
});

test('phone menu opens', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone');
  await page.goto('/');
  await page.waitForTimeout(3500);
  await page.locator('.nav__toggle').tap();
  await expect(page.locator('.nav__toggle')).toHaveAttribute('aria-expanded', 'true');
});

for (const width of [320, 390, 1440]) {
  test(`close name fits its box at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    // poll: the name reflows when the web font swaps in
    await expect
      .poll(() => page.locator('.close__word').evaluate((e) => e.scrollWidth <= e.clientWidth))
      .toBe(true);
  });
}
