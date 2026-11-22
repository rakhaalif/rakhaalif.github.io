import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reducedMotion } from '../../lib/motion';

gsap.registerPlugin(ScrollTrigger);

/** GSAP count-up from 0 to the number in `to`, keeping prefix, suffix and decimals ("3.80", "90+"). */
export default function CountUp({ to, duration = 1.6 }: { to: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    const m = /^(\D*)(\d+(?:\.(\d+))?)(.*)$/.exec(to);
    if (!el || !m || reducedMotion()) return;
    const [, pre, num, dec = '', suf] = m;
    const o = { v: 0 };
    const draw = () => (el.textContent = pre + o.v.toFixed(dec.length) + suf);
    draw();
    const tween = gsap.to(o, {
      v: Number(num), duration, ease: 'power2.out', onUpdate: draw, paused: true,
      onComplete: () => (el.textContent = to),
    });
    const st = ScrollTrigger.create({ trigger: el, start: 'top bottom', once: true, onEnter: () => tween.play() });
    return () => {
      st.kill();
      tween.kill();
    };
  }, [to, duration]);
  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums', display: 'inline-block', minWidth: `${to.length}ch` }}>
      {to}
    </span>
  );
}
