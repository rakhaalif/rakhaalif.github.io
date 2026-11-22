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
  for (const i of [0, 4, 8]) {
    const row = rows.nth(i);
    await row.evaluate(e => { const r = e.getBoundingClientRect(); const y = r.top + scrollY - innerHeight / 2; (window as any).__lenis ? (window as any).__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); });
    await page.waitForTimeout(500);
    for (const sel of ['.rows__name', '.rows__value']) {
      const el = row.locator(sel);
      // computed colours may be oklab(): let a canvas turn it into sRGB
      const color = await el.evaluate(e => {
        const c = document.createElement('canvas'); c.width = c.height = 1;
        const x = c.getContext('2d')!; x.fillStyle = getComputedStyle(e).color; x.fillRect(0, 0, 1, 1);
        return Array.from(x.getImageData(0, 0, 1, 1).data.slice(0, 3));
      });
      const box = (await el.boundingBox())!;
      // background: hide the text, shoot the pixels where it sat, take the darkest/lightest worst case
      await el.evaluate(e => ((e as HTMLElement).style.visibility = 'hidden'));
      const png = await page.screenshot({ clip: { x: box.x, y: box.y, width: Math.max(1, box.width), height: Math.max(1, box.height) } });
      await el.evaluate(e => ((e as HTMLElement).style.visibility = ''));
      const bg = await page.evaluate(async b64 => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const x = c.getContext('2d')!; x.drawImage(img, 0, 0);
        const d = x.getImageData(0, 0, c.width, c.height).data; const out: number[][] = [];
        for (let p = 0; p < d.length; p += 4 * 7) out.push([d[p], d[p + 1], d[p + 2]]);
        return out;
      }, png.toString('base64'));
      const worst = Math.min(...bg.map(b => ratio(color, b)));
      expect(worst, `${sel} of row ${i}`).toBeGreaterThanOrEqual(4.5);
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
