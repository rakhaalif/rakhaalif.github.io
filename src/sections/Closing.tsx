import { createPortal } from 'react-dom';
import { CV_HREF, LINKS, TESTS_WORKFLOW } from '../content';
import tests from '../test-count.json';
import Arrow from './Arrow';
import { useIsClient } from '../lib/useIsClient';
import { ICONS } from './icons';

const SOCIALS = [['GitHub', LINKS.github, ICONS.github], ['LinkedIn', LINKS.linkedin, ICONS.linkedin], ['Instagram', LINKS.instagram, ICONS.instagram]];

export default function Closing() {
  // false while hydrating the prerendered page (it has no portal), true after
  const client = useIsClient();
  return (
    <>
      <footer className="closing footer--statement" id="contact" aria-labelledby="close-h">
        <div className="wrap">
          <div className="closing__cta close--word">
            <div className="section-head--split">
              <div><h2 id="close-h">Open to QA and AI engineering roles</h2><p className="t-lead">The CV lists every project, role and certificate on this page.</p></div>
              <a className="btn btn--primary" href={CV_HREF} download>Download CV<Arrow /></a>
            </div>
            <p className="close__word mo-lt__type" aria-hidden="true" data-moment="liquid-type">Rakha Alif Athallah</p>
          </div>
          <div className="closing__links">
            <div className="grid">
              <div className="span-8 stack-4">
                <a className="nav__logo" href="#top">Rakha Alif Athallah</a>
                <p className="footer__lede">Quality assurance and AI engineer, Informatics Engineering at Universitas Brawijaya.</p>
              </div>
              <div className="span-2 footer__col"><h3>Work</h3><ul><li><a href="#agent">Demo</a></li><li><a href="#projects">Projects</a></li><li><a href="#experience">Experience</a></li></ul></div>
              <div className="span-2 footer__col"><h3>Skills</h3><ul><li><a href="#stack">Stack</a></li><li><a href="#certificates">Certificates</a></li></ul></div>
            </div>
            <p className="footer__tested">
              <a href={TESTS_WORKFLOW} target="_blank" rel="noopener">This site is tested: {tests.count} Playwright checks passing</a>
              <img src={`${TESTS_WORKFLOW}/badge.svg`} alt="Deploy workflow status" height={20} loading="lazy" />
            </p>
            <div className="footer__legal">
              <span>&copy; 2026 Rakha Alif Athallah</span>
              <div className="socials">
                {SOCIALS.map(([label, href, d]) => (
                  <a key={label} href={href} target="_blank" rel="noopener" aria-label={label}>
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg>
                  </a>
                ))}
              </div>
              <span>Product names and logos are trademarks of their owners. <a className="credits" href="/credits.html">Photographs via Wikimedia Commons</a></span>
            </div>
          </div>
        </div>
      </footer>
      {/* a direct child of body, which the kit's :root:has(> body > nav.actionbar) rules expect */}
      {client && createPortal(
        <nav className="actionbar" aria-label="Quick actions"><a className="btn btn--primary" href={CV_HREF} download>Download CV<Arrow /></a></nav>,
        document.body,
      )}
    </>
  );
}
