import { useEffect } from 'react';
import { loadKit } from './lib/kit';
import Bumper from './sections/Bumper';
import Hero from './sections/Hero';
import Closing from './sections/Closing';
import Nav from './sections/Nav';
import { scrollToHash, startMotion } from './lib/motion';

export default function App() {
  useEffect(() => {
    loadKit();
    const stop = startMotion();
    scrollToHash();
    return stop;
  }, []);
  return (
    <>
      <Bumper />
      <Nav />
      <main id="top" tabIndex={-1}>
        <Hero />
        <section id="experience" style={{ marginTop: '150vh', minHeight: '100vh' }}>
          Experience
        </section>
      </main>
      <Closing />
    </>
  );
}
