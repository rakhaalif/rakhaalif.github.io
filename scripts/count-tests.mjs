// Writes the number of desktop Playwright checks to src/test-count.json (the footer badge reads it).
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const out = execSync('npx playwright test --list --project=desktop', { encoding: 'utf8' });
const count = out.split('\n').filter((l) => /^\s*\[desktop\]/.test(l)).length;
if (!count) throw new Error('no tests listed');
writeFileSync(new URL('../src/test-count.json', import.meta.url), JSON.stringify({ count }) + '\n');
console.log(`${count} tests`);
