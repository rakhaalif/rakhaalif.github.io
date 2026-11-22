import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import 'lenis/dist/lenis.css';
import './styles/page.css';

const root = document.getElementById('root')!;
// the build prerenders the page (scripts/prerender.mjs); the dev server serves an empty root
if (root.hasChildNodes()) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
