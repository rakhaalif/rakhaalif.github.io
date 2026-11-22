import { DATA_PROJECTS } from '../content';
import Photo from '../components/Photo';
import Chips from './Chips';

export default function DataProjects() {
  return (
    <section className="section bg-mist" id="data-projects" aria-labelledby="data-projects-h">
      <div className="wrap">
        <div className="section-head">
          <h2 id="data-projects-h">Data projects on GitHub. <span className="muted">Each card opens the code.</span></h2>
        </div>
        <div className="grid row-2">
          {DATA_PROJECTS.map(p => (
            <a className="card card--row card--open span-4" href={p.href} target="_blank" rel="noopener" key={p.href}>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              <Chips tags={p.tags} />
              <div className="panel"><Photo src={p.img} srcSet={p.srcSet} sizes="(max-width: 1023px) 100vw, 33vw" width={p.width} height={p.height} alt={p.alt} /></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
