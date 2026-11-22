import type { ImgHTMLAttributes } from 'react';

// The frame around a photograph waits with a shimmer (.is-loading, page.css) until the image has loaded.
export default function Photo(props: ImgHTMLAttributes<HTMLImageElement> & { alt: string; width: number; height: number }) {
  const done = (e: { currentTarget: HTMLImageElement }) => e.currentTarget.parentElement?.classList.remove('is-loading');
  return (
    <img
      className="frame__img"
      loading="lazy"
      decoding="async"
      {...props}
      ref={img => {
        if (img && !img.complete) img.parentElement?.classList.add('is-loading');
      }}
      onLoad={done}
      onError={done}
    />
  );
}
