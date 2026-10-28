import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { legalHref } from './config/site';

// Old links such as /#/privacy now go to the page's own address (/privacy/).
const oldLegalLink = window.location.hash.match(/^#\/(privacy|terms)$/);

if (oldLegalLink) {
  window.location.replace(legalHref(oldLegalLink[1]));
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
