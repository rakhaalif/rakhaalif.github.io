import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ROLES } from '../content';
import Photo from '../components/Photo';
import { reducedMotion } from '../lib/motion';

export default function Experience() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (reducedMotion()) return; // the line stays full
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo('.tl__fill', { scaleY: 0 }, {
      scaleY: 1, ease: 'none', transformOrigin: 'top',
      scrollTrigger: { trigger: '.tl', start: 'top 70%', end: 'bottom 50%', scrub: true },
    });
  }, { scope: root });
  return (
    <section className="section ground-surface" id="experience" ref={root} aria-labelledby="experience-h">
      <div className="wrap">
        <div className="section-head">
          <h2 id="experience-h">Experience since 2024</h2>
        </div>
        <div className="grid grid--top fill">
          <div className="tl span-6">
            <span className="tl__track" aria-hidden="true" /><span className="tl__fill" aria-hidden="true" />
            <ul className="rows">
              {ROLES.map(r => (
                <li key={r.title}><span className="rows__name">{r.title}</span><p>{r.org}. {r.text}</p><span className="rows__value">{r.when}</span></li>
              ))}
            </ul>
          </div>
          <div className="frame frame--photo frame--fill span-6 start-7">
            <Photo src="/assets/img/photo-f102898347.jpg" srcSet="/assets/img/photo-f102898347-500.jpg 500w, /assets/img/photo-f102898347-960.jpg 960w, /assets/img/photo-f102898347.jpg 1280w" sizes="(max-width: 639px) 260vw, (max-width: 1279px) 100vw, 50vw" width={1280} height={853} alt="A university lecture theatre seen from the back row" />
          </div>
        </div>
      </div>
    </section>
  );
}
