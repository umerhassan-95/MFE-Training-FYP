import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { installNisum } from '@meridian/events';
import { getAppStore } from '@meridian/state';
import { logger } from '@meridian/utilities';
import App from './App';
import './shell.css';

installNisum();
getAppStore();

const log = logger('gateway');
window.addEventListener('error', (event) => {
  log.error(event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  log.error('unhandledrejection', { reason: String(event.reason) });
});

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
