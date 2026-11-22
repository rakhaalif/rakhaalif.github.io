import { useEffect } from 'react';
import { loadKit } from './lib/kit';
import Bumper from './sections/Bumper';
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
      <main id="top">
        <h1>Rakha Alif Athallah, QA and AI engineer</h1>
        <section id="experience" style={{ marginTop: '150vh', minHeight: '100vh' }}>
          Experience
        </section>
      </main>
      <Closing />
    </>
  );
}
