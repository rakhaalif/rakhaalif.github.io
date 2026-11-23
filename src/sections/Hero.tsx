import CountUp from '../components/bits/CountUp';
import Magnet from '../components/bits/Magnet';
import SplitText from '../components/bits/SplitText';
import Arrow from './Arrow';
import IdCard from '../components/IdCard';
import { CV_HREF, LINKS, TESTS_REPORT } from '../content';
import tests from '../test-count.json';

declare const __BUILD_DATE__: string;

const FACTS = [['GPA', '3.80'], ['Projects', '5'], ['Members led', '90+'], ['Certificates', '9']];

export default function Hero() {
  return (
    <section className="hero hero--collage" data-enter aria-labelledby="hero-h">
      <div className="wrap">
        <div className="hero-text grid hero__grid">
          <div className="hero__text span-5">
            <SplitText tag="h1" text="Rakha Alif Athallah, QA and AI engineer" className="hero-h1" textAlign="left"
              splitType="words" trigger="load" duration={0.9} delay={60} />
            <p className="hero__lead">I build AI that tests software: LLM agents that write and run functional and visual test cases. Informatics Engineering, Universitas Brawijaya, GPA 3.80.</p>
            <div className="btn-row">
              <Magnet padding={40} magnetStrength={4}>
                <a className="btn btn--primary" href={CV_HREF} download>Download CV<Arrow />
                </a>
              </Magnet>
              <Magnet padding={40} magnetStrength={4}>
                <a className="btn btn--secondary" href={LINKS.linkedin} target="_blank" rel="noopener">Message on LinkedIn</a>
              </Magnet>
            </div>
            <dl className="hero__facts">
              {FACTS.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd><CountUp to={v} /></dd></div>
              ))}
            </dl>
            <div className="hero__run">
              <p className="hero__run-cmd"><span aria-hidden="true">$ </span>npm run release</p>
              <ul>
                <li>{tests.count} Playwright checks passed, run on desktop and phone</li>
                <li>0 serious accessibility issues (axe)</li>
                <li>Published {__BUILD_DATE__}</li>
              </ul>
              <a href={TESTS_REPORT} target="_blank" rel="noopener">See the test report<Arrow /></a>
            </div>
          </div>
          <div className="hero__art span-6 start-7" data-fx="fluted-glass" data-fx-seed="11">
            <IdCard />
          </div>
        </div>
      </div>
    </section>
  );
}
