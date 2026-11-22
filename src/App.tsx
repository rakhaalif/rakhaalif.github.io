import { useEffect } from 'react';
import { loadKit, pauseHeroFxOffscreen } from './lib/kit';
import Bumper from './sections/Bumper';
import Hero from './sections/Hero';
import AgentDemo from './demo/AgentDemo';
import Projects from './sections/Projects';
import DataProjects from './sections/DataProjects';
import Experience from './sections/Experience';
import Stack from './sections/Stack';
import Certificates from './sections/Certificates';
import Closing from './sections/Closing';
import Nav from './sections/Nav';
import { scrollToHash, startMotion } from './lib/motion';

export default function App() {
  useEffect(() => {
    loadKit();
    const stop = startMotion();
    const unwatch = pauseHeroFxOffscreen();
    scrollToHash();
    return () => { stop(); unwatch(); };
  }, []);
  return (
    <>
      <Bumper />
      <Nav />
      <main id="top" tabIndex={-1}>
        <Hero />
        <AgentDemo />
        <Projects />
        <DataProjects />
        <Experience />
        <Stack />
        <Certificates />
      </main>
      <Closing />
    </>
  );
}
