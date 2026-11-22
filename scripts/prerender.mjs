// Renders <App/> to HTML after `vite build` and writes it into dist/index.html, so the first paint does not
// wait for the JS bundle; src/main.tsx then hydrates it.
import { readFileSync, writeFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const file = new URL('../dist/index.html', import.meta.url);
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { default: App } = await vite.ssrLoadModule('/src/App.tsx');
  // React puts image preloads first; index.html already preloads the portrait, so drop them
  const body = renderToString(createElement(App)).replace(/^(<link rel="preload"[^>]*\/>)+/, '');
  const html = readFileSync(file, 'utf8');
  if (!html.includes('<div id="root"></div>')) throw new Error('dist/index.html has no empty #root');
  writeFileSync(file, html.replace('<div id="root"></div>', () => `<div id="root">${body}</div>`));
  console.log(`prerendered ${body.length} chars into dist/index.html`);
} finally {
  await vite.close();
}
