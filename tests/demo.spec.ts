import { test, expect, type Page } from '@playwright/test';

test.describe.configure({ timeout: 45_000 });

const demo = (p: Page) => p.locator('#agent');
const results = (p: Page, cls = '') => p.locator(`#agent .term__res${cls}`).filter({ visible: true });
const rows = (p: Page) => p.locator('#agent .term__row').filter({ visible: true });
const RUN = 40_000; // one run is 20 to 30 s

/** Scrolls so #agent's top sits `y` px below the top of the screen (0: the demo fills the screen). */
const scrollAgent = (p: Page, y = 0) =>
  p.evaluate((y) => scrollTo(0, document.getElementById('agent')!.getBoundingClientRect().top + scrollY - y), y);
const toDemo = (p: Page) => scrollAgent(p, 0);

async function finished(page: Page) {
  await expect(demo(page)).toHaveAttribute('data-state', 'done', { timeout: RUN });
  await expect(results(page)).toHaveCount(13);
  await expect(results(page, '.is-pass')).toHaveCount(12);
  await expect(results(page, '.is-fail')).toHaveCount(1);
  await expect(demo(page).locator('.agent__summary')).toBeVisible();
  await expect(demo(page).locator('.agent__summary')).toContainText('12 passed, 1 failed');
}

/** Polls until done, keeping every visible-line count seen on the way. */
async function countsUntilDone(page: Page, lines = results(page)) {
  const counts: number[] = [];
  await expect
    .poll(async () => {
      counts.push(await lines.count());
      return demo(page).getAttribute('data-state');
    }, { timeout: RUN, intervals: [200] })
    .toBe('done');
  return counts;
}
const rising = (counts: number[]) => expect(counts).toEqual([...counts].sort((a, b) => a - b));

/** From now on, records every data-state #agent takes (read back with states()). */
const watchStates = (p: Page) =>
  p.evaluate(() => {
    const el = document.getElementById('agent')!, w = window as unknown as { __states: string[] };
    w.__states = [];
    new MutationObserver(() => w.__states.push(el.dataset.state!)).observe(el, { attributes: true, attributeFilter: ['data-state'] });
  });
const states = (p: Page) => p.evaluate(() => (window as unknown as { __states: string[] }).__states);

/** Done, and nothing in the demo changes for 2 s more: a surviving timeline would keep moving lines,
 *  text, the highlight or the state. */
async function staysDone(page: Page) {
  await page.waitForTimeout(300);
  const changes = await page.evaluate(() => new Promise<string[]>((res) => {
    const seen: string[] = [];
    const mo = new MutationObserver((ms) => ms.forEach((m) => seen.push(`${m.type} ${(m.target as Element).className ?? ''}`)));
    mo.observe(document.getElementById('agent')!, { subtree: true, childList: true, attributes: true, characterData: true });
    setTimeout(() => { mo.disconnect(); res(seen); }, 2000);
  }));
  expect(changes).toEqual([]);
  await expect(demo(page)).toHaveAttribute('data-state', 'done');
  await expect(results(page)).toHaveCount(13);
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

test('autoplay starts at its line: the demo filling 60% of the screen', async ({ page }) => {
  await page.goto('/');
  const line = Math.round(page.viewportSize()!.height * 0.4);
  await scrollAgent(page, line + 12); // just short of the line
  await page.waitForTimeout(800);
  await expect(demo(page)).toHaveAttribute('data-state', 'idle');
  await scrollAgent(page, line - 12); // just past it
  await expect(demo(page)).toHaveAttribute('data-state', 'running');
});

test('a press below the autoplay line is not restarted by the autoplay', async ({ page }) => {
  await page.goto('/');
  await scrollAgent(page, Math.round(page.viewportSize()!.height * 0.6)); // in view, below the 40% line
  await page.waitForTimeout(500);
  await expect(demo(page)).toHaveAttribute('data-state', 'idle');
  await watchStates(page);
  await demo(page).getByRole('button', { name: 'Run the agent' }).click();
  await expect(demo(page)).toHaveAttribute('data-state', 'running');
  await expect.poll(() => rows(page).count(), { timeout: RUN }).toBeGreaterThan(2);
  const before = await rows(page).count();
  await toDemo(page); // now past the autoplay line
  const counts = await countsUntilDone(page, rows(page));
  expect(counts[0]).toBeGreaterThanOrEqual(before); // the autoplay did not restart the run
  rising(counts);
  expect(await states(page)).toEqual(['running', 'done']);
  await finished(page);
  await staysDone(page);
});

test('replay twice quickly finishes once', async ({ page }) => {
  test.setTimeout(90_000); // two full runs
  await page.goto('/');
  await toDemo(page);
  await expect(demo(page)).toHaveAttribute('data-state', 'done', { timeout: RUN });
  await watchStates(page);
  await demo(page).getByRole('button', { name: /Replay/ }).dblclick(); // two clicks a few ms apart
  const counts = await countsUntilDone(page);
  expect(counts[0]).toBeLessThan(13); // the replay really restarted
  rising(counts); // never went back
  expect(await states(page)).toEqual(['running', 'done']); // one run after the clicks
  await finished(page);
  await staysDone(page);
});

test('scroll away mid-run and back', async ({ page }) => {
  await page.goto('/');
  await watchStates(page);
  await toDemo(page);
  await expect(demo(page)).toHaveAttribute('data-state', 'running');
  await page.locator('footer.closing').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  const before = await results(page).count();
  await toDemo(page);
  const counts = await countsUntilDone(page);
  expect(counts[0]).toBeGreaterThanOrEqual(before); // coming back did not restart it
  rising(counts);
  expect(await states(page)).toEqual(['running', 'done']);
  await finished(page);
  await staysDone(page);
});

test('keyboard runs it', async ({ page }) => {
  await page.goto('/');
  const run = demo(page).locator('button.btn');
  for (let i = 0; i < 40 && !(await run.evaluate((e) => e === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(run).toBeFocused();
  expect(await run.evaluate((e) => getComputedStyle(e).outlineStyle)).not.toBe('none');
  // focusing the button scrolls the demo in, which may start the autoplay (on a phone it does); the
  // button is aria-disabled while a run plays, so wait for it to end, then Enter starts a fresh run
  await expect(demo(page)).not.toHaveAttribute('data-state', 'running', { timeout: RUN });
  await expect(run).toHaveText(/Run the agent|Replay/);
  await page.keyboard.press('Enter');
  await expect(demo(page)).toHaveAttribute('data-state', 'running');
  expect(await results(page).count()).toBe(0); // a fresh run: no result lines yet
  // while it plays: not labelled Replay, aria-disabled, the log busy
  await expect(run).toHaveText('Run the agent');
  await expect(run).toHaveAttribute('aria-disabled', 'true');
  await expect(demo(page).getByRole('log')).toHaveAttribute('aria-busy', 'true');
  await page.keyboard.press('Enter'); // ignored while running
  await expect(demo(page)).toHaveAttribute('data-state', 'running');
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
