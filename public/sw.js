/**
 * Service Worker for Bazar PWA
 * 
 * This service worker handles:
 * 1. Caching static assets for offline use
 * 2. Push notifications from the Web Push API (when app is closed)
 * 3. Background sync for when connection is restored
 * 
 * PUSH NOTIFICATIONS:
 * - When the app is OPEN: Pusher handles real-time notifications
 * - When the app is CLOSED: Web Push API sends notifications through this service worker
 * 
 * The push notification payload should be JSON with:
 * {
 *   title: 'Notification title',
 *   body: 'Notification message',
 *   icon: '/path/to/icon.png',
 *   badge: '/path/to/badge.png',
 *   data: { url: '/target-url', type: 'notification-type', id: 123 },
 *   actions: [{ action: 'action-id', title: 'Action Title' }],
 *   requireInteraction: false,
 *   tag: 'unique-tag-for-grouping'
 * }
 */

const CACHE_NAME = 'bazar-pwa-v2';
const OFFLINE_URL = '/offline.html';

// Resources to cache
const CACHE_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon/favicon-16x16.png',
  '/favicon/favicon-32x32.png',
  '/favicon/android-chrome-192x192.png',
  '/favicon/android-chrome-512x512.png',
  '/favicon/apple-touch-icon.png',
  '/favicon/favicon.ico',
  '/Artboard 5.png',
  '/Asset_12.svg',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell...');
        return cache.addAll(CACHE_RESOURCES);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      // Ensure the service worker takes control immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API requests - let them fail gracefully
  if (event.request.url.includes('/api/') || event.request.url.includes('/backend/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Try to fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched resource
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // Return a fallback for other requests
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Add background sync logic here if needed
      Promise.resolve()
    );
  }
});

/**
 * Push Notification Handler
 * 
 * Handles push notifications from the Web Push API.
 * This is triggered when the app is closed and a push message is received.
 * 
 * The backend sends notifications via WebPushService when:
 * 1. A new notification is created
 * 2. The user has subscribed to web push notifications
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) {
    console.log('[SW] Push event has no data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('[SW] Failed to parse push data:', e);
    // Fallback for text data
    data = {
      title: 'بازار',
      body: event.data.text() || 'لديك إشعار جديد'
    };
  }

  // Notification options
  const title = data.title || 'بازار';
  const options = {
    body: data.body || 'لديك إشعار جديد',
    icon: data.icon || '/favicon/android-chrome-192x192.png',
    badge: data.badge || '/favicon/favicon-32x32.png',
    image: data.image || null,
    data: {
      url: data.data?.url || data.url || '/',
      type: data.data?.type || data.type || 'notification',
      id: data.data?.id || data.id || null,
      timestamp: Date.now()
    },
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    tag: data.tag || `bazar-notification-${Date.now()}`,
    renotify: !!data.tag, // If tag is set, allow renotification
    vibrate: [200, 100, 200], // Vibration pattern
    dir: 'rtl', // Right-to-left for Arabic
    lang: 'ar'
  };

  // Remove null/undefined values from options
  Object.keys(options).forEach(key => {
    if (options[key] === null || options[key] === undefined) {
      delete options[key];
    }
  });

  console.log('[SW] Showing notification:', title, options);

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Notification Click Handler
 * 
 * Handles when user clicks on a notification.
 * Opens the app and navigates to the relevant URL.
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/';
  
  // Handle action buttons
  if (event.action) {
    console.log('[SW] Notification action clicked:', event.action);
    // You can handle specific actions here
    // For example: 'mark-read', 'view-order', etc.
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window/tab open
      for (const client of clientList) {
        // If the app is already open, focus it and navigate
        if ('focus' in client) {
          return client.focus().then((focusedClient) => {
            // Send message to navigate to the URL
            if (focusedClient && focusedClient.postMessage) {
              focusedClient.postMessage({
                type: 'NOTIFICATION_CLICK',
                url: urlToOpen,
                data: event.notification.data
              });
            }
            return focusedClient;
          });
        }
      }

      // If no existing window/tab, open a new one
      if (clients.openWindow) {
        // Build full URL
        const fullUrl = new URL(urlToOpen, self.location.origin).href;
        return clients.openWindow(fullUrl);
      }
    })
  );
});

/**
 * Notification Close Handler
 * 
 * Handles when user dismisses a notification without clicking it.
 * Can be used for analytics or cleanup.
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
  // You can track dismissed notifications here if needed
});

/**
 * Message Handler
 * 
 * Handles messages from the main app thread.
 * Used for communication between the app and service worker.
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data?.type);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle subscription updates
  if (event.data && event.data.type === 'PUSH_SUBSCRIPTION_UPDATE') {
    console.log('[SW] Push subscription updated');
  }
});