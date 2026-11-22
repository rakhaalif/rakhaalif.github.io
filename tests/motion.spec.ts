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

for (const reduced of [false, true]) {
  test(`anchor lands below a fixed nav (reduced=${reduced})`, async ({ page }) => {
    if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.addStyleTag({ content: '.nav{position:fixed;top:0;left:0;right:0;height:64px}' });
    await page.getByRole('link', { name: 'Experience' }).click();
    const top = () => page.evaluate(() => Math.round(document.getElementById('experience')!.getBoundingClientRect().top));
    let prev = -1;
    await expect
      .poll(async () => {
        const t = await top();
        const settled = t === prev;
        prev = t;
        return settled;
      }, { timeout: 3000, intervals: [100] })
      .toBe(true);
    const settled = await top();
    expect(settled).toBeGreaterThanOrEqual(60);
    expect(settled).toBeLessThanOrEqual(68);
  });
}

for (const hash of ['#1%E0%A4%A', '#a.b']) {
  test(`odd hash ${hash} loads cleanly`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/' + hash);
    await expect(page.locator('h1')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
