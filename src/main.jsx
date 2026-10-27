import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

const PFPStudio = lazy(() => import('./components/PFPStudio.jsx'));
const path = window.location.pathname.replace(/\/$/,'') || '/';
const isStudio = path === '/pfp-studio';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isStudio
      ? <Suspense fallback={<div style={{padding:'3rem',background:'#0b0a11',minHeight:'100vh',color:'#eee'}}>Opening PFP Studio…</div>}><PFPStudio /></Suspense>
      : <App />}
  </React.StrictMode>
);
