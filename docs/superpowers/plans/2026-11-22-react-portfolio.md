# React Portfolio Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild rakhaalif.github.io as a React (Vite) site whose centerpiece is a scripted AI test agent demo and which ships with its own Playwright test suite, deployed by GitHub Actions.

**Architecture:** One-page React app (plus a static `credits.html` entry). The taste-skill kit is served as plain files from `public/assets` and its scripts are injected after React's first render. Lenis owns scrolling and drives GSAP ScrollTrigger; GSAP runs the hero entrance, the agent demo timeline and the experience line. Playwright tests run against `vite preview` of the built site, locally and in CI, and gate the deploy.

**Tech Stack:** React 19.3, Vite 8.3, TypeScript, plain CSS, gsap 3.15.1 + @gsap/react 2.1.2, lenis 1.3.27, @playwright/test 1.65, @axe-core/playwright 4.14, GitHub Actions + Pages.

**Spec:** `docs/superpowers/specs/2026-11-22-react-portfolio-design.md`

## Global Constraints

- Hosting: GitHub Pages at `https://rakhaalif.github.io/`, Vite `base: '/'`, deployed only by `.github/workflows/deploy.yml`, deploy only if tests pass and only on `main`.
- **Do not merge to `main` until Rakha confirms the Pages source is set to "GitHub Actions".** Work stays on branch `react-rebuild`.
- GSAP and Lenis are the only animation libraries. No `motion`/`framer-motion`, no Tailwind, no npm package named `react-bits`.
- React Bits pieces live as source in `src/components/bits/` (SplitText, Magnet, CountUp-as-GSAP).
- Total JS gzipped under 200 KB; mobile Lighthouse performance ≥ 90; portrait (LCP) preloaded.
- Zero serious/critical axe violations; everything works by keyboard; no horizontal scroll at 390 px (and 320 px).
- `prefers-reduced-motion: reduce`: no Lenis, no entrance, demo shows its final state with a "Play anyway" button.
- CV download reachable from the first screen and the nav at all times; the CV path is `/assets/CV_ATS_Rakha%20Alif%20Athallah.pdf`.
- Copy: reuse the current site's copy; facts only from the current site and the CV. New copy only for the demo, the badge and the QA stack group, written under the taste skill's copy rules.
- Kept at the owner's request from the old site: the bumper intro and the draggable ID card.
- The demo is labeled as a replay of how the agent works, never as a live AI.

## Review Focus

- A recruiter clicks "Download CV" during the bumper intro or mid-demo: the click must work (bumper never blocks pointer events) → test in Task 4.
- Replay pressed twice quickly, or the demo scrolled away and back mid-run: it must finish once, cleanly, with exactly 13 result lines, never two timelines → test in Task 6.
- Phone widths 390 and 320 with the demo finished: the demo stacks, nothing overflows, nothing pins → test in Task 8.
- A shared deep link (`/#experience`) opened cold: the page lands on that section despite the bumper and Lenis → test in Task 3.
- The kit's scripts fail to load (404 or blocked): all content is still visible and readable → test in Task 8.

---

### Task 1: Scaffold Vite + React, move the kit, smoke test

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `playwright.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/lib/kit.ts`, `src/styles/page.css`, `tests/smoke.spec.ts`, `.gitignore`
- Replace: `index.html` (becomes the Vite entry)
- Move: `assets/` → `public/assets/` (git mv; includes img, icons, CV PDF, kit), `favicon.svg`, `share.jpg` → `public/`
- Delete: `public/assets/vendor/` (the stopgap GSAP/Lenis copies), `js/main.js`, `shots/`

**Interfaces:**
- Produces: `loadKit(): void` in `src/lib/kit.ts` — appends `<script type="module">` tags for `/assets/system.js`, `/assets/motion/motion.js`, `/assets/layout/layout.js` once (guarded by a module-level flag); called from `App`'s first `useEffect`.
- Produces: npm scripts `dev`, `build` (`vite build`), `preview` (`vite preview --port 4173 --strictPort`), `test` (`playwright test`), `typecheck` (`tsc --noEmit`).
- Produces: Playwright `webServer` = `npm run build && npm run preview`, `baseURL: http://localhost:4173`, projects `desktop` (1440×900) and `phone` (390×844).

- [ ] **Step 1:** Write `tests/smoke.spec.ts`: `test('page loads without console errors')` — collect `console` errors and `pageerror`, `goto('/')`, expect `page` title to be `Rakha Alif Athallah: QA and AI engineer` (copy the old `<title>` exactly if it differs), expect `h1` visible, expect errors array empty.
- [ ] **Step 2:** Run `npx playwright test tests/smoke.spec.ts` → FAIL (no app yet / no server).
- [ ] **Step 3:** Scaffold. `index.html` head keeps, in order: the old meta/OG/canonical tags, the `:root` palette `<style>` block (old lines 27-40), font links, the kit CSS links (now `/assets/...`), `/assets/backgrounds/backgrounds.js` as a plain script, and `<link rel="preload" as="image" href="/assets/img/rakha-portrait-560.webp">`. Drop the `m-enter` and `mo-js` inline scripts and all `modulepreload` moment links (the GSAP entrance replaces them). The old second `<style>` block (lines 53-172: ID card, shimmer, bumper) moves to `src/styles/page.css`. Body: `<div id="root"></div><script type="module" src="/src/main.tsx"></script>`. `vite.config.ts` sets `build.rollupOptions.input` to `index.html` and `credits.html`. Move `credits.html` to the repo root as a static entry with paths fixed to `/assets/...`. `App` renders an empty `<main id="top"><h1>` placeholder with the current h1 text.
- [ ] **Step 4:** Run `npx playwright install chromium && npm test` → PASS.
- [ ] **Step 5:** Commit: `git add -A && git commit -m "Scaffold Vite React app and move the kit to public"`.

### Task 2: Taste-skill page plan and copy (no product code)

**Files:**
- Create: `docs/superpowers/plans/2026-11-22-page-plan.md`, `.taste-skill/` history files (committed)

- [ ] **Step 1:** Invoke the `taste-skill:design-taste-frontend` skill. Read `copy.md`, `copy-voice.md`, `system.md`, `layout-v4.md`, `sections.md` in full, as it requires.
- [ ] **Step 2:** Arm the gate: `node <skill>/scripts/gate.mjs --start dist/index.html --root dist --kind portfolio --category "QA and AI engineering" --primary "Download CV"` (use the `--kind` value the skill lists that fits a personal portfolio; tech page, so effects and scenes are allowed).
- [ ] **Step 3:** Run the skill's deal commands (`deal.mjs` for the hero with `--has photo,ui`, `start.mjs deal` for palette and type) and record the results. If the dealt palette differs from the current one, record both; use the dealt one.
- [ ] **Step 4:** Write the page plan: one line per section from the spec's outline (nav, hero, agent demo, AI projects, data projects, experience, stack, certificates, closing), each with its id, idea, picture, screens, and which kit classes/recipe from `sections-library.md` it uses. Write all new copy here: demo heading, demo caption (states it is a replay), the 13 demo test names (12 pass, 1 visual fail on a misaligned button), the demo summary line, the QA stack group label, the badge line. Run the skill's copy-lint on this file; zero FAILs.
- [ ] **Step 5:** Commit: `git commit -m "Add taste-skill page plan and copy"`.

### Task 3: Motion wiring (Lenis + ScrollTrigger)

**Files:**
- Create: `src/lib/motion.ts`, `tests/motion.spec.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `startMotion(): () => void` in `src/lib/motion.ts` — under reduced motion returns a no-op and creates nothing; otherwise registers ScrollTrigger, creates `new Lenis({ anchors: { offset: -<nav height> } })`, `lenis.on('scroll', ScrollTrigger.update)`, adds `lenis.raf(time*1000)` to `gsap.ticker`, `gsap.ticker.lagSmoothing(0)`; returns a cleanup that destroys Lenis and removes the ticker callback. Exposes the instance as `window.__lenis` for tests.
- Produces: `reducedMotion(): boolean` in the same file.

- [ ] **Step 1:** Write tests: `test('nav link scrolls to its section')` — click nav "Experience", expect `#experience` in viewport within 3 s. `test('deep link lands on its section')` — `goto('/#experience')`, wait 4 s (bumper), expect `#experience` in viewport. `test('reduced motion has no Lenis')` — `page.emulateMedia({ reducedMotion: 'reduce' })`, expect `window.__lenis` undefined and `html` without class `lenis`. (Add stub `<section id="experience">` blocks in App if sections don't exist yet.)
- [ ] **Step 2:** Run `npx playwright test tests/motion.spec.ts` → FAIL.
- [ ] **Step 3:** Implement `startMotion` and call it in App's mount effect with cleanup. For the deep link, after mount scroll to `location.hash` via `lenis.scrollTo(hash, { immediate: true })` (or `el.scrollIntoView()` under reduced motion).
- [ ] **Step 4:** Run tests → PASS.
- [ ] **Step 5:** Commit.

### Task 4: Shell — bumper, nav, closing/footer, credits

**Files:**
- Create: `src/sections/Bumper.tsx`, `src/sections/Nav.tsx`, `src/sections/Closing.tsx`, `src/content.ts`, `tests/shell.spec.ts`

**Interfaces:**
- Produces in `src/content.ts`: `export const CV_HREF = '/assets/CV_ATS_Rakha%20Alif%20Athallah.pdf'`; `export const LINKS = { github: 'https://github.com/rakhaalif', linkedin: 'https://www.linkedin.com/in/rakhaalif/', instagram: 'https://www.instagram.com/rakhaa.athallah/' }`; `export const TESTS_WORKFLOW = 'https://github.com/rakhaalif/rakhaalif.github.io/actions/workflows/deploy.yml'`.
- `Nav` and `Closing` keep the old markup and classes (taste-kit `system.js` drives the phone sheet and menus).

- [ ] **Step 1:** Write tests: `test('CV link is a PDF')` — `request.get(CV_HREF)` status 200 and `content-type` contains `pdf`. `test('CV is clickable during the bumper')` — at `goto('/')` immediately, `click` nav "Download CV" with `trial: true` succeeds (no element intercepts) and bumper has `aria-hidden="true"`. `test('bumper is gone after 3.5 s')` — expect `.bumper` count 0 after 3.5 s. `test('footer links')` — GitHub/LinkedIn/Instagram hrefs equal `LINKS`, `target=_blank`, `rel` contains `noopener`. `test('credits page loads')` — `goto('/credits.html')`, h1 visible, no console errors. `test('phone menu opens')` (phone project only) — tap `.nav__toggle`, expect `aria-expanded="true"`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Port the bumper (CSS fade from `page.css`, `pointer-events: none` on `.bumper`, unmount after 3400 ms), nav (old lines 190-219 as JSX), closing and footer (old lines 426-457) with `CV_HREF`/`LINKS`. Badge placeholder comes in Task 8.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit.

### Task 5: Hero — SplitText, count-up facts, magnet buttons, ID card

**Files:**
- Create: `src/sections/Hero.tsx`, `src/components/IdCard.tsx`, `src/hooks/useSwing.ts`, `src/components/bits/SplitText.tsx`, `src/components/bits/Magnet.tsx`, `src/components/bits/CountUp.tsx`, `tests/hero.spec.ts`

**Interfaces:**
- `useSwing(ref: RefObject<HTMLElement>, bodyRef: RefObject<HTMLElement>): void` — the pendulum from old `js/main.js` lines 13-90 unchanged in behavior (DAMPING 0.975, GRAVITY 0.004, drag clamp ±0.9, initial angle 0.15, 0 under reduced motion, loop stops at rest), cleaned up on unmount.
- `CountUp({ to: string, duration?: number }): JSX.Element` — GSAP tween from 0 to the number in `to`, keeping prefix/suffix/decimals ("3.80", "90+"); renders `to` as-is under reduced motion; starts when 60% visible (ScrollTrigger `start: 'top 60%'` or IntersectionObserver). Width reserved with `font-variant-numeric: tabular-nums` and `min-width: <len>ch`.
- `SplitText` from React Bits `SplitText-TS-CSS` (uses `gsap/SplitText` + `@gsap/react`); `Magnet` from React Bits `Magnet-TS-CSS` (no deps), `padding` small, `magnetStrength` gentle; both inert under reduced motion.

- [ ] **Step 1:** Write tests: `test('hero copy')` — h1 text `Rakha Alif Athallah, QA and AI engineer`; `test('facts end on their values')` — after 2.5 s, facts read `3.80`, `5`, `90+`, `9`; `test('ID card swings and settles')` — the card's transform changes between two frames 200 ms apart on load; `test('reduced motion: card still, facts static')` — emulate reduce, transform contains `rotate(0rad)`, facts already final; `test('CV button in hero')` — hero primary link `href` = `CV_HREF` and has `download`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Add the bits (`npx shadcn@latest add https://reactbits.dev/r/SplitText-TS-CSS` and `.../Magnet-TS-CSS`, or copy by hand; move into `src/components/bits/`; write `CountUp` with GSAP). Build `Hero` with the layout from the page plan; the h1 must stay real text for screen readers (SplitText keeps `aria-label` or the original text).
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit.

### Task 6: Agent demo (the centerpiece)

**Files:**
- Create: `src/demo/script.ts`, `src/demo/MockApp.tsx`, `src/demo/Terminal.tsx`, `src/demo/AgentDemo.tsx`, `src/demo/useDemoTimeline.ts`, `src/demo/demo.css`, `tests/demo.spec.ts`

**Interfaces:**
- `script.ts`:
  ```ts
  export type Phase = 'crawl' | 'functional' | 'visual' | 'run' | 'summary';
  export type Line = { phase: Phase; text: string; result?: 'pass' | 'fail'; target?: string };
  export const SCRIPT: Line[];           // copy from the page plan; 13 lines with result, exactly 1 'fail'
  export const SUMMARY: string;          // "12 passed, 1 failed" + the real-system line
  ```
  `target` names a `data-target` element in `MockApp` (the crawl highlight and the fail circle use it).
- `useDemoTimeline(root: RefObject<HTMLElement>): { state: 'idle' | 'running' | 'done'; play(): void }` — builds one GSAP timeline from `SCRIPT` (total 20–30 s); `play()` kills any existing timeline before building a new one; autoplays once when 60% in view; under reduced motion sets state `done` immediately with all lines shown.
- `AgentDemo` renders `<section id="agent">` with `data-state={state}` on its root, a "Run the agent" button (idle) / "Replay" (done) / "Play anyway" (reduced motion), `MockApp`, `Terminal` (`role="log"`, `aria-live="polite"`), the replay caption, and the summary. Never pinned below 900 px width.

- [ ] **Step 1:** Write tests (timeout 45 s): `test('autoplays on view and finishes')` — scroll `#agent` into view, expect `data-state` `running` then `done`; terminal has 13 result lines, 12 `.is-pass`, 1 `.is-fail`; summary contains `12 passed, 1 failed`; mock app shows the fail circle on the misaligned button. `test('replay twice quickly finishes once')` — after done, click Replay twice within 100 ms, wait for `done`, expect exactly 13 result lines. `test('scroll away mid-run and back')` — start, scroll to footer for 2 s, scroll back, expect `done` eventually with 13 lines. `test('keyboard runs it')` — focus the run button via Tab, press Enter, expect `running`. `test('reduced motion shows the final state')` — emulate reduce, expect `done` immediately, 13 lines, a "Play anyway" button. `test('caption says replay')` — caption text matches `/replay/i`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. Use `useGSAP` with `scope: root` for cleanup; GSAP `TextPlugin` or per-character reveal for typing (both in `gsap`).
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit.

### Task 7: Content sections

**Files:**
- Create: `src/sections/Projects.tsx`, `src/sections/DataProjects.tsx`, `src/sections/Experience.tsx`, `src/sections/Stack.tsx`, `src/sections/Certificates.tsx`, `tests/content.spec.ts`
- Modify: `src/content.ts`, `src/App.tsx`

**Interfaces:**
- In `src/content.ts`: `ROLES: { title: string; org: string; when: string; text: string }[]` (5, from old lines 350-368), `CERTS: { name: string; issuer: string; when: string; href: string }[]` (9, old lines 399-424), `DATA_PROJECTS: { title: string; text: string; tags: string[]; href: string; img: string; alt: string }[]` (3), `STACK: { group: string; tools: { name: string; icon: string }[] }[]` with the first group the QA label from the page plan holding `Playwright` (icon `logos:playwright` from the kit's icon index, tile links to `TESTS_WORKFLOW`) and `Squash` (official logo if its license allows, else a text tile), then AI and ML / data / tools holding the existing 16 tools.
- Experience line: an SVG/CSS line whose `scaleY` is scrubbed by ScrollTrigger over the section; static (full) under reduced motion.

- [ ] **Step 1:** Write tests: `test('AI projects')` — 2 cards: "Test generation agent at Telkom Indonesia" and the Skinalyze card, the Telkom card links to `#agent`; `test('GitHub cards')` — 3 links with hrefs `…/Sistem-Rekomendasi-Anime`, `…/analisis-sentimen-tokopedia`, `…/Dashboard-E-Commerce-Brazil`; `test('experience')` — 5 roles, first "SQA Automation Intern"; `test('stack leads with QA')` — first group contains `Playwright` then `Squash`; total tools = 18; `test('certificates')` — 9 rows, each `href` starts with `https://`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement each section with the page plan's layout and the old copy; images use the old `src`/`width`/`height`/`alt`, `loading="lazy"`; port the skeleton shimmer as a small `onLoad` handler on a shared `Photo` component in `src/components/Photo.tsx`. Section reveals: one `useReveal(ref)` hook in `src/hooks/useReveal.ts` (GSAP `from` opacity/y on the section heading and first row, ScrollTrigger `once: true`, skipped under reduced motion) used by every content section.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit.

### Task 8: Quality suite and test badge

**Files:**
- Create: `tests/quality.spec.ts`, `scripts/count-tests.mjs`, `src/test-count.json`
- Modify: `src/sections/Closing.tsx`, `package.json`

**Interfaces:**
- `scripts/count-tests.mjs` runs `npx playwright test --list --project=desktop`, counts test lines, writes `{"count": N}` to `src/test-count.json`. npm script `prebuild` runs it in CI only (`if (process.env.CI)`); the committed file keeps the last count for local builds.
- Badge in `Closing`: text `This site is tested: {count} Playwright checks passing` (or the page plan's wording with the same number), linking to `TESTS_WORKFLOW`, beside GitHub's status SVG `…/actions/workflows/deploy.yml/badge.svg` with alt text.

- [ ] **Step 1:** Write tests: `test('no serious or critical axe violations')` — `new AxeBuilder({ page }).analyze()` after the demo is `done`, filter impact `serious|critical`, expect `[]`; `test('no horizontal scroll')` at 390 and 320 widths with the demo done — `scrollWidth <= clientWidth`; `test('content readable without kit scripts')` — `page.route('**/assets/**/*.js', r => r.abort())`, `goto('/')`, expect h1, `#agent`, `#experience`, `#certificates` visible; `test('no console errors across the page')` — scroll to bottom, no errors; `test('badge shows the test count')` — text matches `/\d+ Playwright checks passing/` and the number equals `src/test-count.json`.
- [ ] **Step 2:** Run → FAIL (badge missing; fix any real violations found).
- [ ] **Step 3:** Implement the script and badge; fix what the axe/overflow tests find.
- [ ] **Step 4:** Run `npm test` (full suite, both projects) → all PASS.
- [ ] **Step 5:** Commit.

### Task 9: CI, performance, taste gate, cutover

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: whatever the gate and perf checks flag

- [ ] **Step 1:** Write `deploy.yml`: on `push` (all branches) and `workflow_dispatch`; job `test`: checkout, setup-node 22 with npm cache, `npm ci`, `npm run typecheck`, `npx playwright install --with-deps chromium`, `npm test` (with `CI=true`, so `prebuild` writes the count), upload `dist` with `actions/upload-pages-artifact`; job `deploy` (needs `test`, `if: github.ref == 'refs/heads/main'`), permissions `pages: write`, `id-token: write`, `actions/deploy-pages`.
- [ ] **Step 2:** Push the branch; expect the `test` job green and `deploy` skipped. `gh run watch`.
- [ ] **Step 3:** Budgets: `npm run build`, then sum gzipped `dist/assets/*.js` → under 200 KB; run the taste skill's `scripts/perf.mjs` and a Lighthouse mobile run on `vite preview` → performance ≥ 90. Fix and re-run until both pass.
- [ ] **Step 4:** Taste gate: `npm run build && node <skill>/scripts/gate.mjs --start dist/index.html --root dist` → pass (FAILs fixed; any waiver written down with why).
- [ ] **Step 5:** Commit and push; CI green.
- [ ] **Step 6:** Stop. Ask Rakha to set Settings → Pages → Source to "GitHub Actions" and confirm. Only after the confirmation, follow superpowers:finishing-a-development-branch to merge into `main`, then verify the live site loads and the deploy run is green.
