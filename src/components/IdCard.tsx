import { useRef } from 'react';
import { useSwing } from '../hooks/useSwing';

export default function IdCard() {
  const hang = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  useSwing(hang, body);
  return (
    <div className="idcard-scene" role="img" aria-label="Rakha Alif Athallah's ID card on a lanyard; drag it sideways and it swings back">
      <div className="idcard-hang" id="idcard-hang" ref={hang}>
        <div className="idcard-strap" aria-hidden="true" />
        <div className="idcard-clip" aria-hidden="true" />
        <div className="idcard-body" id="idcard-body" ref={body}>
          <div className="idc-top"><span className="idc-mark">R</span><span className="idc-site">rkh.dev</span><span className="idc-chip" /></div>
          <div className="idc-photo">
            <img src="/assets/img/rakha-portrait-560.webp" srcSet="/assets/img/rakha-portrait-560.webp 560w, /assets/img/rakha-portrait.webp 1000w"
              sizes="(max-width: 639px) 134px, (max-width: 1023px) 178px, 232px" alt="" width={560} height={511}
              fetchPriority="high" draggable={false} data-source="client" data-subject="portrait" />
          </div>
          <p className="idc-name">Rakha Alif Athallah</p>
          <p className="idc-role">QA &amp; AI engineer</p>
          <div className="idc-foot"><span className="idc-status">Checks passed</span><span className="idc-code" /></div>
          <span className="idc-holo" />
        </div>
      </div>
    </div>
  );
}
