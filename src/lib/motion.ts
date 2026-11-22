import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const navHeight = () => document.querySelector('.nav')?.getBoundingClientRect().height ?? 0;

/** Scroll an element to just below the nav; nav height is measured now, not at setup. */
function goTo(el: Element, immediate = false) {
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(el as HTMLElement, { immediate, offset: -navHeight() });
  else window.scrollTo(0, el.getBoundingClientRect().top + scrollY - navHeight());
}

/** Element for a "#hash"; null for empty, malformed or missing ids so native behavior applies. */
function target(hash: string): HTMLElement | null {
  try {
    return hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  } catch {
    return null;
  }
}

export function startMotion(): () => void {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest?.('a[href^="#"]');
    if (!a || a.hasAttribute('target')) return;
    const id = a.getAttribute('href')!;
    const el = target(id);
    if (!el) return;
    e.preventDefault();
    if (location.hash !== id) history.pushState(null, '', id);
    goTo(el);
  };
  document.addEventListener('click', onClick);
  if (reducedMotion()) return () => document.removeEventListener('click', onClick);
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis();
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    document.removeEventListener('click', onClick);
    gsap.ticker.remove(tick);
    lenis.destroy();
    if (window.__lenis === lenis) delete window.__lenis;
  };
}

/** Land on the URL hash after mount, whether or not Lenis runs. */
export function scrollToHash() {
  const el = target(location.hash);
  if (el) goTo(el, true);
}
