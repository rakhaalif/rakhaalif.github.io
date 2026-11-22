import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function startMotion(): () => void {
  if (reducedMotion()) return () => {};
  gsap.registerPlugin(ScrollTrigger);
  const navH = document.querySelector('.nav')?.getBoundingClientRect().height ?? 0;
  const lenis = new Lenis({ anchors: { offset: -navH } });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
    if (window.__lenis === lenis) delete window.__lenis;
  };
}

/** Land on the URL hash after mount, with the nav offset, whether or not Lenis runs. */
export function scrollToHash() {
  const hash = location.hash;
  const el = hash.length > 1 ? document.querySelector(hash) : null;
  if (!el) return;
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(el as HTMLElement, { immediate: true, offset: -(document.querySelector('.nav')?.getBoundingClientRect().height ?? 0) });
  else el.scrollIntoView();
}
