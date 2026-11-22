// Release without GitHub Actions: test, build, publish dist/ to the gh-pages branch.
// Usage: npm run release   (needs a clean working tree on the branch you want to ship)
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const run = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', ...opts });
const out = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();

if (out('git status --porcelain')) throw new Error('commit or stash your changes first: the release must match a commit');
const sha = out('git rev-parse --short HEAD');

// the footer prints this number, so count before the tests build the page
run('node scripts/count-tests.mjs');
if (out('git status --porcelain')) throw new Error('src/test-count.json changed: commit it, then release again');

// any failing check stops the release; the tests build dist/ (build + prerender) through the webServer
// 4 workers: the timing checks (scroll, entrance) flake when 8 browsers share one laptop's CPU
run('npx playwright test --workers=4 --reporter=list,html', { env: { ...process.env, PW_TEST_HTML_REPORT_OPEN: 'never' } });

cpSync('playwright-report', 'dist/tests', { recursive: true }); // the footer links to /tests/
writeFileSync('dist/.nojekyll', ''); // without it Pages' Jekyll drops the _app/ bundle folder

const dir = mkdtempSync(join(tmpdir(), 'gh-pages-'));
try {
  const remote = out('git ls-remote --heads origin gh-pages');
  if (remote) {
    run(`git fetch origin gh-pages`);
    run(`git worktree add "${dir}" origin/gh-pages --detach`);
  } else {
    run(`git worktree add "${dir}" --detach`);
    run('git checkout --orphan gh-pages-new', { cwd: dir });
  }
  for (const f of readdirSync(dir)) if (f !== '.git') rmSync(join(dir, f), { recursive: true, force: true });
  cpSync('dist', dir, { recursive: true });
  run('git add -A', { cwd: dir });
  if (!out(`git -C "${dir}" status --porcelain`)) { console.log('nothing changed since the last release'); }
  else {
    run(`git commit -m "Release ${sha}"`, { cwd: dir });
    run('git push origin HEAD:gh-pages', { cwd: dir });
    console.log(`released ${sha} to gh-pages`);
  }
} finally {
  run(`git worktree remove --force "${dir}"`);
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  if (out('git branch --list gh-pages-new')) run('git branch -D gh-pages-new');
}
