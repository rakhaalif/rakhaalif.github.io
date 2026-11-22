import { memo, type CSSProperties } from 'react';
import Chips from './Chips';
import Photo from '../components/Photo';

const DIAGRAM = '{"layout": "lanes", "alt": "Pages of a web app go to an LLM with retrieval-augmented generation, which writes functional test cases, writes visual test cases and runs them.", "input": {"label": "Web app", "icon": "ui:globe", "sub": "Screens and flows"}, "core": {"label": "LLM + RAG", "icon": "gemini"}, "lanes": [{"label": "Functional", "icon": "ui:list-checks", "done": true, "sub": "Steps and checks"}, {"label": "Visual", "icon": "ui:image", "done": true, "sub": "Layout and look"}, {"label": "Test run", "icon": "ui:play", "done": true, "sub": "Pass or fail"}]}';

// pinned-chapters: the kit's moment.js moves each figure into the shared frame while it holds the section
function Projects() {
  return (
    <section className="section" id="projects" style={{ '--h': 2 } as CSSProperties} data-moment="pinned-chapters" aria-labelledby="projects-h">
      <div className="wrap mo-pc__grid">
        <div className="mo-pc__text">
          <h2 id="projects-h">AI projects at Telkom and DBS. <span className="muted">One tests software, one reads skin images.</span></h2>
          <ol className="mo-pc__steps">
            <li className="mo-pc__step">
              <h3>Test generation agent at Telkom Indonesia</h3>
              <p>Automated Test Case Generator: an agent that writes functional and visual test cases and runs them, built in my SQA internship.</p>
              <Chips tags={['Python', 'Gemini API', 'RAG']} />
              <a className="link" href="#agent">Watch the agent demo</a>
              <figure className="mo-pc__visual">
                <div className="dg" data-diagram data-ground="dark"><script type="application/json" dangerouslySetInnerHTML={{ __html: DIAGRAM }} /></div>
              </figure>
            </li>
            <li className="mo-pc__step">
              <h3>Skinalyze, a skin cancer detection app</h3>
              <p>Skin Cancer Early Detection: a deep learning classifier from the DBS Coding Camp capstone, live as a web app.</p>
              <Chips tags={['TensorFlow', 'Python']} />
              <a className="link" href="https://capstone-dbs-skinalyze.vercel.app" target="_blank" rel="noopener">See Skinalyze live</a>
              <figure className="mo-pc__visual">
                <Photo src="/assets/img/photo-f84892807.jpg" srcSet="/assets/img/photo-f84892807-500.jpg 500w, /assets/img/photo-f84892807-960.jpg 960w, /assets/img/photo-f84892807.jpg 1280w" sizes="(max-width: 1023px) 100vw, 50vw" width={1280} height={962} alt="A skin lesion seen close up through a dermatoscope" />
              </figure>
            </li>
          </ol>
        </div>
        {/* shortcut: the kit moves the figures above into this frame, so React must never re-render this subtree (no props or state, memo); upgrade = mount the moment inside a ref'd container React leaves empty */}
        <div className="mo-pc__visuals frame" />
      </div>
    </section>
  );
}

export default memo(Projects);
