import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import App from '@/App';
import './index.css';

// Ensure SW is registered (needed for Push subscription + push events).
try {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', type: 'module' })
      .catch(() => {});
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
