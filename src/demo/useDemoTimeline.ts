import { useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { useGSAP } from '@gsap/react';
import { reducedMotion } from '../lib/motion';
import { SCRIPT, TIMING as T } from './script';

gsap.registerPlugin(TextPlugin, useGSAP);

export type DemoState = 'idle' | 'running' | 'done';

/** One timeline from SCRIPT over the demo's DOM (MockApp + Terminal). Reverting it restores the idle look. */
function build(root: HTMLElement, onComplete: () => void) {
  const q = gsap.utils.selector(root);
  const one = (s: string) => q(s)[0] as HTMLElement;
  const view = one('[data-mock-view]'), hl = one('[data-mock-hl]'), url = one('[data-mock-url]');
  const screens = q('[data-screen]') as HTMLElement[];
  const rows = q('.term__row') as HTMLElement[];
  const tl = gsap.timeline({ paused: true, onComplete });
  let screen = 'login', lit = false;

  const showScreen = (name: string) => {
    if (name === screen) return;
    screen = name;
    tl.set(screens, { autoAlpha: (_: number, el: HTMLElement) => (el.dataset.screen === name ? 1 : 0) })
      .set(url, { text: `mock-shop.local/${name}` });
  };
  // the highlight moves onto a target; its box is measured when the move starts, so a resize is fine
  const hop = (name: string, duration: number) => {
    const el = one(`[data-target="${name}"]`);
    showScreen(el.closest<HTMLElement>('[data-screen]')!.dataset.screen!);
    const box = () => { const r = el.getBoundingClientRect(), v = view.getBoundingClientRect(); return { r, v }; };
    const to = {
      x: () => { const { r, v } = box(); return r.left - v.left - 4; },
      y: () => { const { r, v } = box(); return r.top - v.top - 4; },
      width: () => box().r.width + 8,
      height: () => box().r.height + 8,
    };
    if (!lit) { lit = true; tl.set(hl, to).to(hl, { autoAlpha: 1, duration }); }
    else tl.to(hl, { ...to, duration, ease: 'power3.inOut' });
  };
  const show = (row: HTMLElement, at?: string) => tl.set(row, { display: 'flex' }, at);
  const type = (row: HTMLElement) => {
    const typed = row.querySelector<HTMLElement>('[data-typed]')!, text = typed.dataset.typed!;
    const note = row.querySelector('.term__note');
    show(row, `+=${T.pause}`)
      .fromTo(typed, { text: '' }, { text, duration: text.length * T.char, ease: 'none' })
      .set(row.querySelector('.ui-term__caret'), { display: 'none' }, '+=0.15');
    if (note) tl.fromTo(note, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
  };
  // a meter line streams what the agent is doing, then settles on the line's own text
  const meter = (row: HTMLElement, steps: { text: string; target?: string }[], final: string) => {
    const count = row.querySelector('.ui-term__count')!, bar = row.querySelector('.ui-term__bar i')!;
    show(row, `+=${T.pause}`).set(bar, { scaleX: 0 });
    steps.forEach((s, k) => {
      tl.set(count, { text: s.text });
      if (s.target) { hop(s.target, T.hop); tl.to(bar, { scaleX: (k + 1) / steps.length, duration: T.hop }, '<'); }
      else tl.to(bar, { scaleX: (k + 1) / steps.length, duration: T.write, ease: 'none' });
    });
    tl.set(count, { text: final });
  };

  const tests = SCRIPT.filter((l) => l.result);
  const targets = [...new Set((q('[data-target]') as HTMLElement[]).map((e) => e.dataset.target!))];
  SCRIPT.forEach((line, i) => {
    const row = rows[i];
    if (line.text.startsWith('$ ')) type(row);
    else if (line.phase === 'crawl') meter(row, targets.map((t) => ({ text: `found ${t}`, target: t })), line.text);
    else if (line.phase === 'functional' || line.phase === 'visual') {
      const mine = tests.filter((t) => t.text.includes('_visual_') === (line.phase === 'visual'));
      meter(row, mine.map((t) => ({ text: `writing ${t.text}` })), line.text);
    } else if (line.result === 'pass') { hop(line.target!, T.hop); show(row, `+=${T.test - T.hop}`); }
    else if (line.result === 'fail') {
      tl.set(hl, { attr: { 'data-tone': 'fail' } });
      hop(line.target!, T.hop);
      show(row, `+=${T.test - T.hop}`)
        .set(q('.mock__circle'), { autoAlpha: 1 })
        .fromTo(q('.mock__circle'), { '--a': '0deg' }, { '--a': '360deg', duration: 0.6, ease: 'power2.inOut' })
        .fromTo(q('.mock__ghost, .mock__diff'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, '-=0.2');
    } else if (line.phase === 'run') { show(row, '+=0.2'); tl.set(hl, { attr: { 'data-tone': 'ok' } }, `+=${T.fail}`); }
    else { tl.to(hl, { autoAlpha: 0, duration: 0.3 }, `+=${T.pause}`); show(row); }
  });
  return tl;
}

export function useDemoTimeline(root: RefObject<HTMLElement | null>): { state: DemoState; play(): void } {
  const [state, setState] = useState<DemoState>('idle');
  const tl = useRef<gsap.core.Timeline | null>(null);
  const autoplay = useRef<IntersectionObserver | null>(null);

  const { contextSafe } = useGSAP(() => {
    if (reducedMotion()) {
      tl.current = build(root.current!, () => {}).progress(1); // the finished run, at once
      setState('done');
      return;
    }
    // autoplay once, when the demo fills 60% of the screen (the section is taller than one on a phone)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) play(); }, { rootMargin: '0px 0px -60% 0px' });
    io.observe(root.current!);
    autoplay.current = io;
    return () => io.disconnect();
  }, { scope: root });

  // one timeline at a time: a new run reverts the old one (its lines, highlight and circle) first.
  // Any run, the autoplay's or a press, ends the autoplay, so it can never restart a run later.
  const play = contextSafe(() => {
    autoplay.current?.disconnect();
    tl.current?.revert();
    tl.current = build(root.current!, () => setState('done'));
    setState('running');
    tl.current.play();
  });

  return { state, play };
}
