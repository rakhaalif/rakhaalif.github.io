import { CV_HREF } from '../content';

const ITEMS = [['Demo', '#agent'], ['Projects', '#projects'], ['Experience', '#experience'], ['Stack', '#stack'], ['Certificates', '#certificates']];

export default function Nav() {
  return (
    <header className="nav nav--centre">
      <div className="wrap nav__bar">
        <a className="skip-link" href="#top">Skip to content</a>
        <a className="nav__logo" href="#top"><span className="mark mark--initial" aria-hidden="true">R</span>Rakha Alif Athallah</a>
        <nav className="nav__links" aria-label="Main">
          {ITEMS.map(([name, href]) => (
            <div className="nav__item" key={href}><a className="nav__link" href={href}>{name}</a></div>
          ))}
        </nav>
        <div className="nav__actions">
          <a className="btn btn--primary" href={CV_HREF} download>Download CV</a>
        </div>
        <button className="nav__toggle" type="button" aria-expanded="false" aria-label="Menu">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>
    </header>
  );
}
