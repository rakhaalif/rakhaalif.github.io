import { test, expect, type Page } from '@playwright/test';

const inView = (page: Page) =>
  page.evaluate(() => {
    const r = document.getElementById('experience')!.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  });

// the real nav link: on a phone it sits in the sheet, so open the menu first
const clickNavExperience = async (page: Page) => {
  const toggle = page.locator('.nav__toggle');
  if (await toggle.isVisible()) await toggle.click();
  await page.locator('.nav__links a[href="#experience"]').click();
};

test('nav link scrolls to its section', async ({ page }) => {
  await page.goto('/');
  // the prerendered nav is clickable before hydration; wait for the smooth scroll to be wired, as the other tests do
  await page.waitForFunction(() => !!(window as any).__lenis, null, { timeout: 15000 });
  expect(await inView(page)).toBe(false);
  await clickNavExperience(page);
  await expect.poll(() => inView(page), { timeout: 5000 }).toBe(true);
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
    const top = () => page.evaluate(() => Math.round(document.getElementById('experience')!.getBoundingClientRect().top));
    const before = await top();
    await clickNavExperience(page);
    // the position must leave its pre-click value, then hold for 3 reads 100 ms apart
    let reads: number[] = [];
    await expect
      .poll(async () => {
        reads = [...reads, await top()].slice(-3);
        return reads.length === 3 && reads.every((r) => r === reads[0]) && reads[0] !== before;
      }, { timeout: 5000, intervals: [100] })
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
