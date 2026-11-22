import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

const toDemo = (p: Page) => p.evaluate(() => scrollTo(0, document.getElementById('agent')!.getBoundingClientRect().top + scrollY));
async function demoDone(page: Page) {
  await page.goto('/');
  await toDemo(page);
  await expect(page.locator('#agent')).toHaveAttribute('data-state', 'done', { timeout: 40_000 });
}

test.describe('with the demo run', () => {
  test.describe.configure({ timeout: 60_000 });

  test('no serious or critical axe violations', async ({ page }) => {
    await demoDone(page);
    const found = (await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(found.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  });

  for (const width of [390, 320]) {
    test(`no horizontal scroll at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await demoDone(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });
  }
});

test('content readable without kit scripts', async ({ page }) => {
  await page.route('**/assets/**/*.js', (r) => r.abort());
  await page.goto('/');
  for (const sel of ['h1', '#agent', '#experience', '#certificates']) await expect(page.locator(sel)).toBeVisible();
});

test('no console errors across the page', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  for (let y = 0; y < 12; y++) { await page.mouse.wheel(0, 1500); await page.waitForTimeout(150); }
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test('badge shows the test count', async ({ page }) => {
  await page.goto('/');
  const badge = page.locator('footer.closing a', { hasText: 'Playwright checks passing' });
  await expect(badge).toHaveText(/This site is tested: \d+ Playwright checks passing/);
  expect(Number((await badge.textContent())!.match(/(\d+) Playwright/)![1])).toBe(JSON.parse(readFileSync('src/test-count.json', 'utf8')).count); // read now: CI's prebuild rewrites it after this file loads
  await expect(badge).toHaveAttribute('href', '/tests/');
});

test.describe('gate findings', () => {
  test('hero h1 words are not clipped by the h1', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3500);
    // no ancestor of the h1 may cut a word: any clipping box must contain every word
    const cut = await page.evaluate(() => {
      const h1 = document.querySelector('h1')!;
      const words = [...h1.querySelectorAll('.split-word')].map((w) => w.getBoundingClientRect());
      let n = words.length ? 0 : 1; // no .split-word at all counts as a failure
      for (let a: Element | null = h1; a && a !== document.documentElement; a = a.parentElement) {
        if (getComputedStyle(a).overflow === 'visible') continue;
        const r = a.getBoundingClientRect();
        n += words.filter((w) => w.top < r.top - 0.5 || w.bottom > r.bottom + 0.5 || w.left < r.left - 0.5 || w.right > r.right + 0.5).length;
      }
      return n;
    });
    expect(cut).toBe(0);
    expect(await page.locator('h1').evaluate((e) => getComputedStyle(e).overflow)).toBe('visible');
  });

  test('pause button shows a two-tone focus ring (black ring, white halo)', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('.hero button.loop-pause, .hero button.ui-pause').first();
    test.skip(!(await btn.waitFor({ timeout: 10_000 }).then(() => true, () => false)), 'no pause button on this screen');
    await btn.focus();
    const s = await btn.evaluate((e) => { const c = getComputedStyle(e); return { color: c.outlineColor, w: c.outlineWidth, style: c.outlineStyle, halo: c.boxShadow }; });
    expect(s).toMatchObject({ color: 'rgb(0, 0, 0)', w: '2px', style: 'solid' });
    expect(s.halo).toContain('rgb(255, 255, 255)');
  });

  test('Download CV is drawn the same way everywhere', async ({ page }) => {
    await page.goto('/');
    const looks = await page.locator('a[download]', { hasText: 'Download CV' }).evaluateAll((els) => els.filter((e) => e.getClientRects().length).map((e) => {
      const c = getComputedStyle(e);
      return { where: e.closest('header, footer, nav, section')?.className ?? '', bg: c.backgroundColor, color: c.color, h: c.height, r: c.borderRadius,
        px: c.paddingInline, fs: parseFloat(c.fontSize), fw: c.fontWeight, arrow: !!e.querySelector('.m-arrow') };
    }));
    expect(looks.length).toBeGreaterThanOrEqual(3);
    const ref = looks.find((l) => l.where.includes('hero'))!;
    for (const l of looks) {
      const { where, fs, ...rest } = l; const { where: _w, fs: rfs, ...want } = ref;
      expect(rest, where).toEqual(want);
      expect(fs, where).toBeGreaterThanOrEqual(rfs - 1);
      expect(fs, where).toBeLessThanOrEqual(rfs);
    }
  });

  test('footer links are big enough and spaced', async ({ page }) => {
    await page.goto('/');
    const boxes = await page.locator('.footer__col a').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: r.height }; }));
    expect(boxes.length).toBe(5);
    for (const b of boxes) expect(b.h).toBeGreaterThanOrEqual(24);
    for (let i = 1; i < boxes.length; i++) if (boxes[i].top > boxes[i - 1].top) expect(boxes[i].top - boxes[i - 1].bottom).toBeGreaterThanOrEqual(8);
  });

  test('footer links hold at 320x640', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    const boxes = await page.locator('.footer__col a').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: r.height }; }));
    expect(boxes.length).toBe(5);
    for (const b of boxes) expect(b.h).toBeGreaterThanOrEqual(24);
    for (let i = 1; i < boxes.length; i++) if (boxes[i].top > boxes[i - 1].top) expect(boxes[i].top - boxes[i - 1].bottom).toBeGreaterThanOrEqual(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });

  test('stack tiles and names sit on shared left edges', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'checked at 1440');
    await page.goto('/');
    const lefts = await page.locator('#stack .ic-tile, #stack .tools__name').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
    const uniq = [...new Set(lefts)].sort((a, b) => a - b);
    for (let i = 1; i < uniq.length; i++) expect(uniq[i] - uniq[i - 1], `edges ${uniq}`).toBeGreaterThan(6);
  });

  test('skin photo is not blown up', async ({ page }) => {
    await page.goto('/');
    const img = page.locator('#projects img[alt^="A skin lesion"]');
    await img.evaluate((e: HTMLImageElement) => { e.loading = 'eager'; return e.decode(); });
    const scale = await img.evaluate((e: HTMLImageElement) => Math.max(e.clientWidth / e.naturalWidth, e.clientHeight / e.naturalHeight));
    expect(scale).toBeLessThanOrEqual(1.05);
  });
});
