import { useEffect } from 'react';
import { loadKit } from './lib/kit';

export default function App() {
  useEffect(() => {
    loadKit();
  }, []);
  return (
    <main id="top">
      <h1>Rakha Alif Athallah, QA and AI engineer</h1>
    </main>
  );
}
