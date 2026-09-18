import React from 'react';
import { createRoot } from 'react-dom/client';
import { installNisum } from '@meridian/events';
import App from './App';
import '@meridian/shared-ui';

installNisum();
createRoot(document.getElementById('root')!).render(<App />);
