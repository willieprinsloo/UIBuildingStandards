import React from 'react';
import { createRoot } from 'react-dom/client';
import '@/tokens/global.css';
import './App.css';
import { App } from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Demo root element (#root) not found.');
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
