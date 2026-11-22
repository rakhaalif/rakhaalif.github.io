import type { CSSProperties } from 'react';
import { STACK } from '../content';

const LANDSCAPE = ['playwright.svg', 'scikitlearn.svg'];
// 3 + 4 + 5 columns on the first row, the long group on the second: every row runs the container's full width
const SPAN = ['span-3', 'span-4', 'span-5', 'span-12'];

export default function Stack() {
  return (
    <section className="section ground-surface" id="stack" aria-labelledby="stack-h">
      <div className="wrap">
        <div className="section-head">
          <h2 id="stack-h">Tech stack for QA engineering and data work. <span className="muted">The tools behind the projects above.</span></h2>
        </div>
        <div className="tools grid" data-visual>
          {STACK.map((g, i) => (
            <div className={`tools__group ${SPAN[i]}`} key={g.group}>
              <p className="t-label muted">{g.group}</p>
              <ul className="tools__grid" style={{ '--cols': Math.min(g.tools.length, 8) } as CSSProperties}>
                {g.tools.map(t => {
                  const tile = (
                    <>
                      <span className="ic-tile">
                        {t.icon
                          ? <img className={LANDSCAPE.includes(t.icon) ? 'ic ic-land' : 'ic'} src={`/assets/icons/${t.icon}`} alt="" width={40} height={40} loading="lazy" decoding="async" />
                          : <span className="tools__text" aria-hidden="true">Sq</span>}
                      </span>
                      <span className="t-small tools__name">{t.name}</span>
                    </>
                  );
                  return <li key={t.name}>{t.href ? <a className="tools__link" href={t.href} target="_blank" rel="noopener">{tile}</a> : tile}</li>;
                })}
              </ul>
            </div>
          ))}
        </div>
        <p className="measure tools__more">Also SQL Server Management Studio and Google Sheets, and the methods behind them: data visualisation, deep learning, NLP, computer vision and MLOps.</p>
      </div>
    </section>
  );
}
