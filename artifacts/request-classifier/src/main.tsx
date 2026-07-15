import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// In production (Render static site), point API calls directly at the backend.
// Set VITE_API_BASE_URL in Render's Static Site environment variables.
const apiBase = import.meta.env.VITE_API_BASE_URL;
if (apiBase) {
  setBaseUrl(apiBase);
}

createRoot(document.getElementById('root')!).render(<App />);
