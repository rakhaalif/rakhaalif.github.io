# Portfolio rebuild in React (Vite): design

Date: 2026-11-22. Site: https://rakhaalif.github.io/ (repo root, branch `main`).

## Intent

Rakha's portfolio is read by recruiters hiring for QA and AI engineering roles. The rebuild has two
goals, in Rakha's words: **keep recruiters on the page longer**, and **feel more impressive while
showing off QA and AI skills**. The site should *prove* those skills, not just list them: a recruiter
should watch an AI test agent work, and should be able to see that the portfolio itself is tested.

Rakha chose the stack: **React with Vite**, using **GSAP**, **React Bits**, **Lenis** and the
**taste skill** (the design system that built the current site).

## Goals

- A centerpiece interactive demo of the AI test agent (Rakha's thesis and Telkom internship work)
  that a recruiter starts with one click and watches run in about 20 to 30 seconds.
- The site ships with its own automated test suite (Playwright + axe accessibility checks), run in
  GitHub Actions on every push, with a visible "tests passing" badge on the page that links to the run.
- Motion that makes the page feel crafted: Lenis smooth scrolling, GSAP scroll scenes, a few
  React Bits accents.
- All current content carried over: hero facts, thesis, Telkom and DBS projects, three GitHub data
  projects, experience, tech stack, nine certificates, CV download, contact links, photo credits page.

## Non-goals

- No live LLM calls. The demo is a scripted replay (the site is static on GitHub Pages, with no
  backend and no API keys).
- No CMS, blog, i18n, or contact form.
- No new content beyond the demo, the test badge and the two QA tools; existing copy is reused (it already passed the
  taste skill's copy lint), edited only where the new layout needs it.

## Anti-goals (failure even if it works)

- **Looks like a template.** Heavy React Bits backgrounds, glitch text, 3D tilt cards everywhere.
  React Bits stays limited to a few accents.
- **Motion that slows the recruiter down.** Nothing may hide content behind a long animation, hijack
  scroll for more than one pinned section, or delay the CV button. The CV download is reachable
  from the first screen and from the nav at all times.
- **A dishonest demo.** The demo must be labeled as a replay of how the agent works, not presented
  as a live AI.
- **A slower, heavier site.** It must stay fast on a phone (see Constraints).
- **Broken under reduced motion.** `prefers-reduced-motion` gets a still, fully readable page, and
  the demo shows its final state with a "Play anyway" option.

## Constraints

- Hosting: GitHub Pages, static build, same URL (`rakhaalif.github.io/`, so Vite `base: '/'`).
  Deployed by a GitHub Actions workflow. **Rakha must switch the repo's Pages source to "GitHub
  Actions"** once (Settings → Pages); the builder can't do this. **The switch must happen before
  the branch merges to `main`**: otherwise Pages serves the unbuilt Vite `index.html` and the live
  site goes blank. The plan's merge step waits for Rakha to confirm the switch.
- The taste skill's rule for framework projects: the kit lives in `public/assets` and loads as plain
  files; React components use the starter's markup and classes. Its finish gate runs against the
  built page (`--start dist/index.html --root dist`) at 1440, 390 and 320 px.
- Performance: Lighthouse performance score of 90 or higher on mobile for the built page; LCP image
  (the portrait) preloaded; GSAP and Lenis are the only animation libraries; total JS (gzipped)
  under 200 KB.
- Accessibility: zero axe violations (serious or critical); every interactive part works by keyboard;
  the demo terminal is an `aria-live="polite"` region with a text summary.
- Mobile at 390 px with no horizontal scroll.

## Approaches considered

1. **Port the current design to React, add motion on top.** Lowest risk and keeps the approved look,
   but it would feel like the same site with more animation, so it does little for "stay longer".
2. **Redesign around one centerpiece that proves the skills (chosen).** A new layout built with the
   taste skill, centered on an interactive AI test agent demo, plus a visibly tested site. More
   work, but it's the only option where the page shows QA and AI skill instead of describing it.
3. **Build mostly from React Bits.** Fastest flash, but these components appear on thousands of
   portfolios, so it reads as a template and doesn't signal QA or AI.

Rakha picked approach 2.

## Decided

- React + Vite, TypeScript, plain CSS (the taste skill's `system.css` tokens and classes, no Tailwind).
- Approach 2 (above).
- Deploy via GitHub Actions to GitHub Pages.
- Keep all current content.
- React Bits components are added as source files (its `TS-CSS` variants, via the shadcn CLI
  registry URLs or copied by hand) into `src/components/bits/`. Not the npm package called
  `react-bits`, which belongs to someone else.

## Builder's calls (settled during review)

- React Bits `CountUp` depends on `motion/react`, which would add a third animation library.
  Use a small GSAP count-up instead (same behavior); `SplitText` and `Magnet` are used as published
  if they need only GSAP or nothing, otherwise ported to GSAP the same way.
- The badge's "N checks" number is written in at build time from `playwright test --list`, since
  GitHub's status badge only shows pass/fail. It stays honest because the site deploys only when
  every test passes.
- The vendored `assets/vendor/` GSAP and Lenis files and their tags in the old `index.html`
  (added earlier as a stopgap, uncommitted) are dropped; the rebuild installs both from npm.

## Page outline

The order is chosen so the strongest proof arrives on the second screen.

1. **Nav.** Name, section links, "Download CV" button (always visible).
2. **Hero.** Current h1 ("Rakha Alif Athallah, QA and AI engineer"), lead, the facts row (GPA 3.80,
   projects, members led, certificates), and the ID card on its lanyard (port the pendulum physics
   from `js/main.js` into a React hook). The h1 enters with GSAP SplitText (React Bits `SplitText`);
   the facts count up (React Bits `CountUp`); primary buttons get React Bits `Magnet` (small pull).
3. **Agent demo (centerpiece).** Heading in the vein of "Watch my AI test agent test a web app".
   Left: a small mock web app (a login and a checkout screen, drawn in HTML/CSS). Right: a terminal.
   Pressing **Run the agent** plays a GSAP timeline:
   1. the agent "crawls" the mock app (a highlight moves across its elements),
   2. the LLM + RAG step generates functional test cases (lines type into the terminal),
   3. it generates visual test cases,
   4. it runs them: passes tick green one by one, and **one visual test fails** because a button in
      the mock app is misaligned. The failure is circled on the mock app with a diff overlay.
   5. A summary: e.g. "12 passed, 1 failed", with a short line on what the real system does
      (Python, Gemini API, RAG; PT Telkom Indonesia, Jul to Sep 2025).
   It autoplays once when 60% of it is in view, then shows **Replay**. A caption says it's a replay
   of how the agent works. The script (steps, test names, timings) lives in one data file so copy
   can change without touching the animation code.
4. **AI projects.** Telkom test agent (links back to the demo) and Skinalyze (DBS skin cancer
   classifier), as now, with photos.
5. **Data projects on GitHub.** The three cards, each opening its repo.
6. **Experience.** The five roles as a timeline whose line draws with scroll (GSAP ScrollTrigger,
   scrubbed), with the existing lecture-hall photo.
7. **Tech stack.** The icon tiles as now, grouped (QA and testing / AI and ML / data / tools) so
   QA tools are visible first. **QA and testing: Playwright and Squash** (Rakha's real QA tools,
   confirmed 2026-11-22; these are the only additions to the stack). Playwright's icon is in the
   taste kit's icon index (`logos:playwright`); Squash has none there, so use its official logo if
   its license allows, otherwise a plain text tile. Since the site's own tests use Playwright, the
   Playwright tile can link to the site's test workflow.
8. **Certificates.** The nine rows, each opening its credential.
9. **Closing + footer.** "Open to QA and AI engineering roles", CV button, big name, links, and the
   **test badge**: "This site is tested: N Playwright checks passing", linking to the latest
   Actions run (GitHub's workflow status badge SVG plus a link to the workflow).

`credits.html` stays a separate page (a second Vite HTML entry), not a router route.

## Motion system

- **Lenis** owns scrolling; GSAP ScrollTrigger is driven from Lenis (`lenis.on('scroll',
  ScrollTrigger.update)` and GSAP's ticker runs Lenis), so scroll scenes don't stutter. Lenis is off
  under reduced motion. Anchor links in the nav scroll through Lenis.
- **GSAP** (with `@gsap/react`'s `useGSAP` for cleanup) runs: the hero entrance, the agent demo
  timeline, the experience line, and section reveals.
- **The taste kit's own motion layer** (`motion.js`: nav menus, hovers, button arrows) stays for
  micro-interactions. Its hero entrance and counter moment are replaced by GSAP/React Bits, so they
  must not both run on the same element.
- At most one pinned section (the agent demo may pin briefly on desktop; never on phones).

## Testing (part of the product)

- `tests/` with Playwright, run against `vite preview` of the built site, covering:
  - every nav link scrolls to its section; the CV link returns a PDF (HTTP 200);
  - the agent demo runs to its summary and Replay restarts it;
  - reduced motion: the demo shows its final state, no Lenis;
  - no console errors; no horizontal scroll at 390 px;
  - axe accessibility scan with no serious or critical violations;
  - all outbound links (GitHub, LinkedIn, certificates) have valid `href`s.
- GitHub Actions workflow: install → typecheck → build → Playwright → deploy to Pages (deploy only if
  tests pass, only on `main`).
- The taste skill's finish gate passes on the built page.

## Repo layout (target)

```
index.html, credits.html        Vite entries
src/main.tsx, src/App.tsx
src/sections/                   one component per page section
src/components/bits/            React Bits sources (SplitText, CountUp, Magnet)
src/demo/                       agent demo: MockApp, Terminal, timeline, script.ts (data)
src/lib/motion.ts               Lenis + ScrollTrigger wiring
public/assets/                  the taste kit, photos, icons, CV PDF (moved from assets/)
tests/                          Playwright specs
.github/workflows/deploy.yml
```

The old static files (`index.html` markup, `js/main.js`, `shots/`) are replaced; they remain in git
history. Work happens on a branch and is merged to `main` when the gate and tests pass.

## Left to the builder

- Exact copy for the demo heading, caption and terminal lines (within the taste skill's copy rules,
  facts only from the current site and CV).
- Exact layout of each section, as dealt by the taste skill's layout and palette commands (the dark
  green palette may change if the deal says so).
- Demo timings and the mock app's look.
- Whether the demo pins on desktop.
