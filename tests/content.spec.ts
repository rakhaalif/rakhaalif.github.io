import { test, expect } from '@playwright/test';

test('AI projects', async ({ page }) => {
  await page.goto('/');
  const steps = page.locator('#projects .mo-pc__step');
  await expect(steps).toHaveCount(2);
  await expect(steps.nth(0).locator('h3')).toHaveText('Test generation agent at Telkom Indonesia');
  await expect(steps.nth(0).locator('a.link')).toHaveAttribute('href', '#agent');
  await expect(steps.nth(1).locator('h3')).toContainText('Skinalyze');
});

test('GitHub cards', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('#data-projects a.card').evaluateAll(a => a.map(x => x.getAttribute('href')));
  expect(hrefs).toEqual([
    'https://github.com/rakhaalif/Sistem-Rekomendasi-Anime',
    'https://github.com/rakhaalif/analisis-sentimen-tokopedia',
    'https://github.com/rakhaalif/Dashboard-E-Commerce-Brazil',
  ]);
});

test('experience', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('#experience .rows > li');
  await expect(rows).toHaveCount(5);
  await expect(rows.first().locator('.rows__name')).toHaveText('SQA Automation Intern');
});

test('stack leads with QA', async ({ page }) => {
  await page.goto('/');
  const names = page.locator('#stack .tools__group').first().locator('.tools__name');
  await expect(names).toHaveText(['Playwright', 'Squash']);
  await expect(page.locator('#stack .tools__grid li')).toHaveCount(18);
  await expect(page.locator('#stack a:has-text("Playwright")')).toHaveAttribute('href', /actions\/workflows/);
});

test('certificates', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('#certificates .rows a.rows__name');
  await expect(links).toHaveCount(9);
  for (const h of await links.evaluateAll(a => a.map(x => x.getAttribute('href')))) expect(h).toMatch(/^https:\/\//);
});

test('moments mount', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ready', '1', { timeout: 15000 });
  await expect(page.locator('html')).toHaveAttribute('data-moments-ready', /\d/);
  await expect(page.locator('[data-moment-failed]')).toHaveCount(0);
  // both hosts mounted: the close's liquid-type and the pinned chapters (live on a desktop, static rows on a phone)
  expect(await page.evaluate(() => !!(document.querySelector('.close__word') as any).__momentP)).toBe(true);
  if (!isMobile) await expect(page.locator('#projects')).toHaveClass(/is-live/);
  await expect(page.locator('#projects .dg .dg-nodes, #projects .dg svg').first()).toBeAttached();
});
