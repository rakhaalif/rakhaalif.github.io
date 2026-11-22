import { useRef } from 'react';
import { reducedMotion } from '../lib/motion';
import MockApp from './MockApp';
import Terminal from './Terminal';
import { BOARD, BUTTONS, CAPTION, HEADING, REAL_SYSTEM, SUMMARY } from './script';
import { useDemoTimeline } from './useDemoTimeline';
import './demo.css';

export default function AgentDemo() {
  const root = useRef<HTMLElement>(null);
  const { state, play } = useDemoTimeline(root);
  const label = reducedMotion() ? BUTTONS.reduced : state === 'idle' ? BUTTONS.run : BUTTONS.replay;
  return (
    <section ref={root} className="section" id="agent" data-state={state} aria-labelledby="agent-h">
      <div className="wrap">
        <div className="grid agent__head">
          <div className="span-5">
            <h2 id="agent-h">{HEADING}</h2>
            <p className="agent__caption">{CAPTION}</p>
          </div>
          <div className="span-6 start-7 agent__side">
            <div className="agent__actions">
              <button type="button" className="btn btn--secondary" onClick={play}>{label}</button>
              <a className="link" href={BOARD.href} target="_blank" rel="noopener">{BOARD.label}</a>
            </div>
            <div className="agent__summary">
              <p>{SUMMARY}</p>
              <p>{REAL_SYSTEM}</p>
            </div>
          </div>
        </div>
        <div className="ui app fill" role="region" aria-labelledby="agent-h">
          <div className="app__pane app__pane--list"><MockApp /></div>
          <div className="app__pane app__pane--open"><Terminal /></div>
        </div>
      </div>
    </section>
  );
}
