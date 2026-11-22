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

type FxController = { pause(): void; resume(): void };

/**
 * The kit keeps the hero's moving effect drawing while it is within 12% of the screen (fx.js lifecycle,
 * rootMargin '12% 0px'), so with the demo at the top of the screen the shader still runs beside it.
 * Pause it, through the controller's documented pause()/resume() (effects/README.md), while no part
 * of the hero shows; resume only what this paused, never a run the visitor held with the pause button.
 */
export function pauseHeroFxOffscreen(): () => void {
  const el = document.querySelector<HTMLElement>('.hero [data-fx]');
  if (!el) return () => {};
  const url = '/assets/effects/fx.js'; // the module system.js loads, so the same instance
  let mine = false;
  const io = new IntersectionObserver(async ([e]) => {
    const c: FxController | null = (await import(/* @vite-ignore */ url)).get(el);
    // shortcut: a hero that leaves before the kit mounts its effect is paused only at its next crossing; fine, it mounts at load
    if (!c) return; // not mounted (a phone, reduced motion) or not yet
    if (!e.isIntersecting && !mine && !el.closest('.hero')!.querySelector('.loop-pause.is-paused')) { c.pause(); mine = true; }
    else if (e.isIntersecting && mine) { c.resume(); mine = false; }
  }, { rootMargin: '-4px 0px' }); // a hero whose edge only touches the screen counts as gone
  io.observe(el);
  return () => io.disconnect();
}
