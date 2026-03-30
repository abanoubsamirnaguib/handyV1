import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import App from '@/App';
import './index.css';

// Ensure SW is registered in production only (needed for Push + offline).
try {
  if ('serviceWorker' in navigator) {
    if (import.meta.env && import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', type: 'module' })
        .catch(() => {});
    } else {
      // In dev, unregister any existing service workers and clear caches
      // to avoid stale service worker interference with HMR / dev reloads.
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});

      if (typeof caches !== 'undefined' && caches.keys) {
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
          .catch(() => {});
      }
    }
  }
} catch (e) {
  // ignore
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);
