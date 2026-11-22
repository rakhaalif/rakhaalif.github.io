import { useEffect, useState } from 'react';

export default function Bumper() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGone(true), 3400);
    return () => clearTimeout(t);
  }, []);
  if (gone) return null;
  return (
    <div className="bumper" aria-hidden="true">
      <div>
        <div className="bumper__icons"><span className="bumper__icon">&lt;/&gt;</span><span className="bumper__icon">👤</span><span className="bumper__icon">🌐</span></div>
        <p className="bumper__title">Welcome to my<br />portfolio website</p>
        <span className="bumper__url">rakhaalif.github.io</span>
      </div>
    </div>
  );
}
