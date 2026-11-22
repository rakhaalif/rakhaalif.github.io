import { test, expect } from '@playwright/test';

const CV = '/assets/CV_ATS_Rakha%20Alif%20Athallah.pdf';
const facts = (page: import('@playwright/test').Page) => page.locator('.hero__facts dd').allTextContents();

test('hero copy', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Rakha Alif Athallah, QA and AI engineer');
  await expect(page.locator('h1')).toHaveAccessibleName('Rakha Alif Athallah, QA and AI engineer');
});

test('hero is exactly one screen', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(500);
  const { h, vh, bottom } = await page.evaluate(() => {
    const hero = document.querySelector('section.hero')!;
    const last = [...hero.querySelectorAll('.hero__text, .hero__art')].map((e) => e.getBoundingClientRect().bottom);
    return { h: hero.getBoundingClientRect().height, vh: innerHeight, bottom: Math.max(...last) };
  });
  expect(Math.abs(h - vh)).toBeLessThanOrEqual(2);
  expect(bottom).toBeLessThanOrEqual(vh);
});

test('facts count up, then end on their values', async ({ page }, info) => {
  test.skip(info.project.name === 'phone', 'facts are display:none under 640px');
  await page.goto('/');
  const first = page.locator('.hero__facts dd').first();
  const seen = new Set<string>();
  for (let i = 0; i < 12; i++) {
    seen.add((await first.textContent()) ?? '');
    await page.waitForTimeout(100);
  }
  expect([...seen].some((t) => t !== '3.80')).toBe(true);
  await page.waitForTimeout(2000);
  expect(await facts(page)).toEqual(['3.80', '5', '90+', '9']);
});

test('facts finish without scrolling at 1024x768', async ({ page }, info) => {
  test.skip(info.project.name === 'phone', 'facts are display:none under 640px');
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await page.waitForTimeout(2500);
  expect(await facts(page)).toEqual(['3.80', '5', '90+', '9']);
});

test('h1 shows even if fonts never arrive', async ({ page }) => {
  await page.route(/fonts\.gstatic\.com/, () => {});
  await page.goto('/'); // load event does not wait for fonts
  await expect(page.locator('h1')).toBeVisible({ timeout: 2500 });
});

test('ID card follows a drag and settles', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await page.waitForTimeout(6000);
  const card = page.locator('#idcard-hang');
  const rot = () => card.evaluate((e) => (e as HTMLElement).style.transform);
  const box = (await card.locator('.idcard-body').boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 80, y, { steps: 5 });
  expect(await rot()).not.toContain('rotate(0rad)');
  const dragged = await rot();
  await page.mouse.up();
  expect(await rot()).not.toBe(dragged);
  const angle = async () => Math.abs(parseFloat((await rot()).match(/rotate\(([-\d.e]+)rad/)![1]));
  await expect.poll(angle, { timeout: 20_000 }).toBeLessThan(0.02);
});

test('ID card swings and settles', async ({ page }) => {
  await page.goto('/');
  const t = () => page.locator('#idcard-hang').evaluate((e) => (e as HTMLElement).style.transform);
  const a = await t();
  await page.waitForTimeout(200);
  expect(await t()).not.toBe(a);
});

test('reduced motion: card still, facts static', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.locator('#idcard-hang').evaluate((e) => (e as HTMLElement).style.transform)).toContain('rotate(0rad)');
  expect(await facts(page)).toEqual(['3.80', '5', '90+', '9']);
});

test('CV button in hero', async ({ page }) => {
  await page.goto('/');
  const a = page.locator('section.hero a.btn--primary');
  await expect(a).toHaveAttribute('href', CV);
  await expect(a).toHaveAttribute('download', '');
});
