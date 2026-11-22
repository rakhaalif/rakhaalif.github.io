import { iconFor } from '../content';

export default function Chips({ tags }: { tags: string[] }) {
  return (
    <div className="ic-chip-row">
      {tags.map(t => {
        const icon = iconFor(t);
        return (
          <span className="ic-chip" key={t}>
            {icon && <img className="ic" src={`/assets/icons/${icon}`} alt="" width={18} height={18} loading="lazy" decoding="async" />}
            {t}
          </span>
        );
      })}
    </div>
  );
}
