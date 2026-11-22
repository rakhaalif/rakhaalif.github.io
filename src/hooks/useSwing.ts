import { useEffect, type RefObject } from 'react';
import { reducedMotion } from '../lib/motion';

// The ID card pendulum, ported unchanged from the old js/main.js.
export function useSwing(ref: RefObject<HTMLElement | null>, bodyRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    let angle = reducedMotion() ? 0 : 0.15;
    let angleVel = 0;
    const DAMPING = 0.975;
    const GRAVITY = 0.004;
    let dragging = false;
    let startX = 0;
    let startAngle = 0;
    let running = false;
    let raf = 0;

    const render = () => {
      card.style.transform = `translateX(-50%) rotate(${angle}rad)`;
      bodyRef.current?.style.setProperty('--swing', angle.toFixed(4));
    };
    const step = () => {
      if (!dragging) {
        angleVel += -GRAVITY * Math.sin(angle);
        angleVel *= DAMPING;
        angle += angleVel;
      }
      render();
      if (dragging || Math.abs(angle) > 0.0005 || Math.abs(angleVel) > 0.0005) {
        raf = requestAnimationFrame(step);
      } else {
        angle = 0;
        angleVel = 0;
        render();
        running = false;
      }
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(step);
    };
    const down = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startAngle = angle;
      angleVel = 0;
      start();
      card.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const move = (e: PointerEvent) => {
      if (dragging) angle = Math.max(-0.9, Math.min(0.9, startAngle - (e.clientX - startX) * 0.004));
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      angleVel = -(e.clientX - startX) * 0.0006;
      dragging = false;
    };
    card.addEventListener('pointerdown', down);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerup', up);
    card.addEventListener('pointercancel', up);
    render();
    if (!reducedMotion()) start();
    return () => {
      cancelAnimationFrame(raf);
      card.removeEventListener('pointerdown', down);
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerup', up);
      card.removeEventListener('pointercancel', up);
    };
  }, [ref, bodyRef]);
}
