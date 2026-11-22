import { CERTS } from '../content';
import Photo from '../components/Photo';

export default function Certificates() {
  return (
    <section className="section g2 bg-band bg-bleed" id="certificates" aria-labelledby="certificates-h">
      <div className="wrap">
        <div className="group">
          <div className="section-head">
            <h2 id="certificates-h">Nine data and AI certificates. <span className="muted">Each row opens the credential.</span></h2>
          </div>
          <div className="frame frame--photo fill">
            <Photo src="/assets/img/photo-f112672355.jpg" srcSet="/assets/img/photo-f112672355-500.jpg 500w, /assets/img/photo-f112672355-960.jpg 960w, /assets/img/photo-f112672355.jpg 1280w" sizes="(max-width: 639px) 188vw, 100vw" width={1280} height={853} alt="Graduates in caps and gowns, seen from behind" />
          </div>
        </div>
        <div className="grid">
          <ul className="rows span-12">
            {CERTS.map(c => (
              <li key={c.name}><a className="rows__name link" href={c.href} target="_blank" rel="noopener">{c.name}</a><span className="rows__value">{c.issuer}, {c.when}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
