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
  await expect(page.locator('#stack a:has-text("Playwright")')).toHaveAttribute('href', '/tests/');
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

const SECTIONS = ['projects', 'data-projects', 'experience', 'stack', 'certificates'];

test('content sections are one or two screens tall', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ready', '1', { timeout: 15000 });
  const vh = page.viewportSize()!.height;
  for (const id of SECTIONS) {
    const h = await page.evaluate(i => document.getElementById(i)!.getBoundingClientRect().height, id);
    const screens = Math.round(h / vh);
    expect([1, 2], `${id} is ${h}px`).toContain(screens);
    expect(Math.abs(h - screens * vh), `${id} is ${h}px`).toBeLessThanOrEqual(2);
  }
});

const lum = (c: number[]) => {
  const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
};
const ratio = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('certificate rows read at 4.5:1 and clear the action bar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ready', '1', { timeout: 15000 });
  const sec = page.locator('#certificates');
  await sec.evaluate(el => { const y = el.getBoundingClientRect().bottom + scrollY - innerHeight; (window as any).__lenis ? (window as any).__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); });
  await page.waitForTimeout(1200);
  const rows = page.locator('#certificates .rows > li');
  // computed colours (oklab) → sRGB through a 1px canvas; the band behind the rows is the section's flat ground,
  // and no picture may sit under the text. Read from styles, not a screenshot: a late smooth scroll moved the shot
  const rgb = (css: string) => page.evaluate(c => {
    const x = document.createElement('canvas').getContext('2d')!; x.fillStyle = c; x.fillRect(0, 0, 1, 1);
    return Array.from(x.getImageData(0, 0, 1, 1).data.slice(0, 3));
  }, css);
  const ground = await rgb(await sec.evaluate(e => getComputedStyle(e).backgroundColor));
  for (const i of [0, 4, 8]) {
    for (const sel of ['.rows__name', '.rows__value']) {
      const el = rows.nth(i).locator(sel);
      const color = await rgb(await el.evaluate(e => getComputedStyle(e).color));
      expect(ratio(color, ground), `${sel} of row ${i}`).toBeGreaterThanOrEqual(4.5);
      await el.evaluate(e => e.scrollIntoView({ block: 'center' }));
      const under = await el.evaluate(e => {
        const r = e.getBoundingClientRect();
        return document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)
          .filter(n => n.closest('#certificates') && /^(IMG|PICTURE|VIDEO|CANVAS)$/.test(n.tagName)).length;
      });
      expect(under, `no picture under ${sel} of row ${i}`).toBe(0);
    }
  }
  // the last row ends above the fixed bar (phone only)
  const bar = page.locator('nav.actionbar');
  if (await bar.isVisible()) {
    await sec.evaluate(el => { const y = el.getBoundingClientRect().bottom + scrollY - innerHeight; (window as any).__lenis ? (window as any).__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); });
    await page.waitForTimeout(800);
    const last = (await rows.last().boundingBox())!;
    const top = (await bar.boundingBox())!.y;
    expect(last.y + last.height).toBeLessThanOrEqual(top);
  }
});

test('Projects stays put: the frame keeps its figures', async ({ page, isMobile }) => {
  test.skip(isMobile, 'frame is only used live on desktop');
  await page.goto('/');
  await expect(page.locator('#projects')).toHaveClass(/is-live/, { timeout: 15000 });
  await page.waitForTimeout(3000); // the bumper ends, the demo may autoplay: nothing may rebuild the section
  await expect(page.locator('#projects .mo-pc__visuals .mo-pc__visual')).toHaveCount(2);
});
