import { test, expect, type Page } from '@playwright/test';

test.describe.configure({ timeout: 45_000 });

const demo = (p: Page) => p.locator('#agent');
const results = (p: Page, cls = '') => p.locator(`#agent .term__res${cls}`).filter({ visible: true });
const RUN = 40_000; // one run is 20 to 30 s
// Scroll the demo in, 120 px past its top: the hero's effect (backgrounds.js, 80 px root margin) then
// stops, so a 25 s run does not keep a software-rendered shader busy beside the other workers' tests.
const toDemo = (p: Page) => p.evaluate(() => scrollTo(0, document.getElementById('agent')!.offsetTop + 120));

async function finished(page: Page) {
  await expect(demo(page)).toHaveAttribute('data-state', 'done', { timeout: RUN });
  await expect(results(page)).toHaveCount(13);
  await expect(results(page, '.is-pass')).toHaveCount(12);
  await expect(results(page, '.is-fail')).toHaveCount(1);
  await expect(demo(page).locator('.agent__summary')).toBeVisible();
  await expect(demo(page).locator('.agent__summary')).toContainText('12 passed, 1 failed');
}

/** Polls until done, keeping every result-line count seen on the way. */
async function countsUntilDone(page: Page) {
  const counts: number[] = [];
  await expect
    .poll(async () => {
      counts.push(await results(page).count());
      return demo(page).getAttribute('data-state');
    }, { timeout: RUN, intervals: [200] })
    .toBe('done');
  return counts;
}

test('autoplays on view and finishes', async ({ page }) => {
  await page.goto('/');
  await expect(demo(page)).toHaveAttribute('data-state', 'idle');
  await expect(demo(page).locator('.mock__circle')).toBeHidden();
  await toDemo(page);
  await expect(demo(page)).toHaveAttribute('data-state', 'running');
  await finished(page);
  // the fail circle sits on the misaligned Pay button
  const circle = demo(page).locator('.mock__circle');
  await expect(circle).toBeVisible();
  const c = (await circle.boundingBox())!;
  const p = (await demo(page).locator('[data-target="pay-button"]').boundingBox())!;
  const [px, py] = [p.x + p.width / 2, p.y + p.height / 2];
  expect(px > c.x && px < c.x + c.width && py > c.y && py < c.y + c.height).toBe(true);
  await expect(demo(page).getByRole('button', { name: /Replay/ })).toBeVisible();
});

test('replay twice quickly finishes once', async ({ page }) => {
  test.setTimeout(90_000); // two full runs
  await page.goto('/');
  await toDemo(page);
  await expect(demo(page)).toHaveAttribute('data-state', 'done', { timeout: RUN });
  await demo(page).getByRole('button', { name: /Replay/ }).dblclick(); // two clicks a few ms apart
  const counts = await countsUntilDone(page);
  expect(counts[0]).toBeLessThan(13); // the replay really restarted
  expect(counts).toEqual([...counts].sort((a, b) => a - b)); // never went back: one timeline
  await finished(page);
});

test('scroll away mid-run and back', async ({ page }) => {
  await page.goto('/');
  await toDemo(page);
  await expect(demo(page)).toHaveAttribute('data-state', 'running');
  await page.locator('footer.closing').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  const before = await results(page).count();
  await toDemo(page);
  const counts = await countsUntilDone(page);
  expect(counts[0]).toBeGreaterThanOrEqual(before); // coming back did not restart it
  expect(counts).toEqual([...counts].sort((a, b) => a - b));
  await finished(page);
});

test('keyboard runs it', async ({ page }) => {
  await page.goto('/');
  // focusing the button scrolls the demo into view, which may start the autoplay (on a phone it does),
  // so the button reads Run the agent or Replay the run; Enter must start a fresh run either way
  const run = demo(page).locator('button.btn');
  for (let i = 0; i < 40 && !(await run.evaluate((e) => e === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(run).toBeFocused();
  await expect(run).toHaveText(/Run the agent|Replay/);
  expect(await run.evaluate((e) => getComputedStyle(e).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(demo(page)).toHaveAttribute('data-state', 'running');
  expect(await results(page).count()).toBe(0); // a fresh run: no result lines yet
});

test('reduced motion shows the final state', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(demo(page)).toHaveAttribute('data-state', 'done', { timeout: 1000 });
  await finished(page);
  await expect(demo(page).locator('.mock__circle')).toBeVisible();
  await expect(demo(page).getByRole('button', { name: 'Play anyway' })).toBeVisible();
});

test('caption says replay', async ({ page }) => {
  await page.goto('/');
  await expect(demo(page).locator('.agent__caption')).toHaveText(/replay/i);
});

test('terminal is a polite log', async ({ page }) => {
  await page.goto('/');
  const log = demo(page).getByRole('log');
  await expect(log).toHaveAttribute('aria-live', 'polite');
  await expect(log).toContainText('Press Run the agent to start the replay.');
});

test('the Pay button really sits 12 px out of the form column', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const left = (s: string) => demo(page).locator(`[data-target="${s}"]`).evaluate((e) => e.getBoundingClientRect().left);
  expect(Math.round((await left('pay-button')) - (await left('checkout-address')))).toBe(12);
});

for (const width of [320, 390]) {
  test(`demo stacks without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' }); // the finished run: every line shown
    await page.goto('/');
    await expect(demo(page)).toHaveAttribute('data-state', 'done');
    const m = await page.evaluate(() => {
      const r = (s: string) => document.querySelector(s)!.getBoundingClientRect();
      const s = document.getElementById('agent')!;
      return {
        page: document.documentElement.scrollWidth, vw: innerWidth, sec: s.scrollWidth - s.clientWidth,
        mockBottom: r('#agent .app__pane--list').bottom, termTop: r('#agent .app__pane--open').top,
      };
    });
    expect(m.page).toBeLessThanOrEqual(m.vw);
    expect(m.sec).toBeLessThanOrEqual(0);
    expect(m.mockBottom).toBeLessThanOrEqual(m.termTop + 1);
  });
}
