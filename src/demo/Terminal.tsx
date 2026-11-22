import { useEffect, useRef } from 'react';
import { SCRIPT, TITLE, WAITING, type Line } from './script';

// Every line is in the DOM from the start, hidden; the timeline shows them in order. Text that
// changes while it plays (typed commands, streaming meters) is aria-hidden beside a fixed copy
// for screen readers, so the polite log reads each line once.
function Row({ line, n }: { line: Line; n: number }) {
  if (line.text.startsWith('$ ')) {
    const [cmd, note] = line.text.slice(2).split(/\s{2,}/);
    return (
      <div className="ui-term__ln ui-term__cmd term__row">
        <span className="ui-term__sig" aria-hidden="true">$</span>
        <span className="ui-term__typed" aria-hidden="true" data-typed={cmd}>{cmd}</span>
        <i className="ui-term__caret" aria-hidden="true" />
        {note && <span className="ui-term__dim term__note" aria-hidden="true">{note}</span>}
        <span className="sr-only">{line.text.slice(2).replace(/\s{2,}/, ' ')}</span>
      </div>
    );
  }
  if (line.result) {
    const fail = line.result === 'fail';
    return (
      <div className={`ui-term__ln term__row term__res ${fail ? 'is-fail' : 'is-pass'}`}>
        <span className="term__n">{String(n).padStart(2)}</span>
        <span className="term__st">{fail ? 'FAIL' : 'pass'}</span>
        <span className="ui-term__path">{line.text}</span>
      </div>
    );
  }
  if (line.phase === 'run') return <div className="ui-term__ln term__row term__detail"><span>{line.text}</span></div>;
  if (line.phase === 'summary') return <div className="ui-term__ln term__row term__sum"><span>{line.text}</span></div>;
  return (
    <div className="ui-term__ln term__row term__meter">
      <span className="ui-term__bar" aria-hidden="true"><i /></span>
      <span className="ui-term__count" aria-hidden="true">{line.text}</span>
      <span className="sr-only">{line.text}</span>
    </div>
  );
}

export default function Terminal() {
  const screen = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  // keep the newest line in view as lines appear
  useEffect(() => {
    const ro = new ResizeObserver(() => { const s = screen.current!; s.scrollTop = s.scrollHeight; });
    ro.observe(track.current!);
    return () => ro.disconnect();
  }, []);
  let n = 0;
  return (
    <div className="ui-panel ui-term term">
      <div className="ui-term__head">
        <span className="ui-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="ui-term__title">{TITLE[0]}</span>
        <span className="ui-spacer" />
        <span className="ui-chip ui-chip--plain">{TITLE[1]}</span>
      </div>
      <div ref={screen} className="ui-term__screen term__screen" role="log" aria-live="polite" aria-label="Agent run"
        tabIndex={0} data-lenis-prevent>
        <div ref={track} className="ui-term__track">
          <div className="ui-term__ln term__wait">
            <span className="ui-term__dim">{WAITING}</span>
          </div>
          {SCRIPT.map((line, i) => <Row key={i} line={line} n={line.result ? ++n : 0} />)}
        </div>
      </div>
    </div>
  );
}
