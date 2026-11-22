let loaded = false;

// The kit's behavior scripts are plain modules served from /assets; load them once.
export function loadKit(): void {
  if (loaded) return;
  loaded = true;
  for (const src of ['/assets/system.js', '/assets/motion/motion.js', '/assets/layout/layout.js']) {
    const s = document.createElement('script');
    s.type = 'module';
    s.src = src;
    document.body.appendChild(s);
  }
}
