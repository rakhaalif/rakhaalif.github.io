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

test('facts end on their values', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2500);
  expect(await facts(page)).toEqual(['3.80', '5', '90+', '9']);
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
