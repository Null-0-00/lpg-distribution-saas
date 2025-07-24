/**
 * Service Worker for Progressive Web App
 * Handles offline functionality, caching, and background sync
 */

const CACHE_NAME = 'lpg-distributor-v1.0.0';
const STATIC_CACHE_NAME = 'lpg-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'lpg-dynamic-v1.0.0';
const API_CACHE_NAME = 'lpg-api-v1.0.0';

// Define cache strategies for different resource types
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Static assets to cache immediately (only existing ones)
const STATIC_ASSETS = ['/', '/manifest.json'];

// API endpoints to cache with different strategies
const API_CACHE_PATTERNS = [
  {
    pattern: /\/api\/dashboard\/metrics/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    ttl: 300000,
  }, // 5 minutes
  {
    pattern: /\/api\/products/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    ttl: 3600000,
  }, // 1 hour
  {
    pattern: /\/api\/companies/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    ttl: 3600000,
  }, // 1 hour
  {
    pattern: /\/api\/drivers/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    ttl: 600000,
  }, // 10 minutes
  {
    pattern: /\/api\/sales/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    ttl: 60000,
  }, // 1 minute
  {
    pattern: /\/api\/inventory/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    ttl: 300000,
  }, // 5 minutes
];

// Background sync queue for offline operations
const BACKGROUND_SYNC_TAGS = {
  SALES_SYNC: 'sales-sync',
  INVENTORY_SYNC: 'inventory-sync',
  OFFLINE_ACTIONS: 'offline-actions',
};

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    Promise.all([
      // Cache static assets safely
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return Promise.all(
          STATIC_ASSETS.map((url) =>
            fetch(url)
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch((error) => {
                console.log('Failed to cache:', url, error);
              })
          )
        );
      }),

      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== API_CACHE_NAME
            ) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Take control of all open tabs
      self.clients.claim(),
    ])
  );
});

/**
 * Fetch Event Handler
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip caching for authentication requests
  if (request.url.includes('/api/auth/') || request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (request.url.includes('/api/')) {
    event.respondWith(handleAPIRequest(request));
  } else if (request.destination === 'document') {
    event.respondWith(handleNavigationRequest(request));
  } else if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleStaticAssetRequest(request));
  }
});

/**
 * Handle API requests with caching strategies
 */
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const cachePattern = API_CACHE_PATTERNS.find((pattern) =>
    pattern.pattern.test(url.pathname)
  );

  if (!cachePattern) {
    return handleNetworkFirst(request, API_CACHE_NAME);
  }

  switch (cachePattern.strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return handleCacheFirst(request, API_CACHE_NAME, cachePattern.ttl);
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return handleNetworkFirst(request, API_CACHE_NAME);
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return handleStaleWhileRevalidate(
        request,
        API_CACHE_NAME,
        cachePattern.ttl
      );
    default:
      return handleNetworkFirst(request, API_CACHE_NAME);
  }
}

/**
 * Handle navigation requests (HTML pages)
 */
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to offline page
    return caches.match('/offline');
  }
}

/**
 * Handle image requests with cache first strategy
 */
async function handleImageRequest(request) {
  return handleCacheFirst(request, STATIC_CACHE_NAME, 86400000); // 24 hours
}

/**
 * Handle static asset requests
 */
async function handleStaticAssetRequest(request) {
  return handleCacheFirst(request, STATIC_CACHE_NAME, 86400000); // 24 hours
}

/**
 * Cache First Strategy
 */
async function handleCacheFirst(request, cacheName, ttl = 3600000) {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return fetch(request);
  }

  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cache is still valid
    const cacheTime = cachedResponse.headers.get('cache-time');
    if (cacheTime && Date.now() - parseInt(cacheTime) < ttl) {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Add cache timestamp
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('cache-time', Date.now().toString());

      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });

      cache.put(request, modifiedResponse);
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed, serving from cache:', error);
  }

  return cachedResponse || new Response('Offline', { status: 503 });
}

/**
 * Network First Strategy
 */
async function handleNetworkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);

    // Only try cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);

      if (cachedResponse) {
        return cachedResponse;
      }

      // For API requests, return offline data structure
      if (request.url.includes('/api/')) {
        return new Response(
          JSON.stringify({
            offline: true,
            message: 'This data was requested while offline',
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }

    return new Response('Offline', { status: 503 });
  }
}

/**
 * Stale While Revalidate Strategy
 */
async function handleStaleWhileRevalidate(request, cacheName, ttl = 300000) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Always try to fetch from network in background
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // Return cached response immediately if available and valid
  if (cachedResponse) {
    const cacheTime = cachedResponse.headers.get('cache-time');
    if (!cacheTime || Date.now() - parseInt(cacheTime) < ttl) {
      // Start network request in background but don't wait
      networkPromise;
      return cachedResponse;
    }
  }

  // Wait for network if cache is stale or missing
  const networkResponse = await networkPromise;
  return (
    networkResponse ||
    cachedResponse ||
    new Response('Offline', { status: 503 })
  );
}

/**
 * Background Sync Event Handler
 */
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);

  switch (event.tag) {
    case BACKGROUND_SYNC_TAGS.SALES_SYNC:
      event.waitUntil(syncOfflineSales());
      break;
    case BACKGROUND_SYNC_TAGS.INVENTORY_SYNC:
      event.waitUntil(syncOfflineInventory());
      break;
    case BACKGROUND_SYNC_TAGS.OFFLINE_ACTIONS:
      event.waitUntil(syncOfflineActions());
      break;
  }
});

/**
 * Sync offline sales data
 */
async function syncOfflineSales() {
  try {
    const offlineSales = await getOfflineData('sales');

    for (const sale of offlineSales) {
      try {
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sale.data),
        });

        if (response.ok) {
          await removeOfflineData('sales', sale.id);
          console.log('Synced offline sale:', sale.id);
        }
      } catch (error) {
        console.error('Failed to sync sale:', sale.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed for sales:', error);
  }
}

/**
 * Sync offline inventory data
 */
async function syncOfflineInventory() {
  try {
    const offlineInventory = await getOfflineData('inventory');

    for (const item of offlineInventory) {
      try {
        const response = await fetch('/api/inventory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item.data),
        });

        if (response.ok) {
          await removeOfflineData('inventory', item.id);
          console.log('Synced offline inventory:', item.id);
        }
      } catch (error) {
        console.error('Failed to sync inventory:', item.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed for inventory:', error);
  }
}

/**
 * Sync offline actions
 */
async function syncOfflineActions() {
  try {
    const offlineActions = await getOfflineData('actions');

    for (const action of offlineActions) {
      try {
        const response = await fetch(action.endpoint, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          await removeOfflineData('actions', action.id);
          console.log('Synced offline action:', action.id);
        }
      } catch (error) {
        console.error('Failed to sync action:', action.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed for actions:', error);
  }
}

/**
 * Push notification event handler
 */
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');

  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New notification from LPG Distributor',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/images/icons/view-icon.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/icons/close-icon.png',
      },
    ],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'LPG Distributor', options)
  );
});

/**
 * Notification click event handler
 */
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'view' || !action) {
    event.waitUntil(clients.openWindow(data.url || '/dashboard'));
  }
});

/**
 * Message event handler for communication with main thread
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(payload.urls));
      break;
    case 'CLEAR_CACHE':
      event.waitUntil(clearCache(payload.cacheName));
      break;
    case 'STORE_OFFLINE_DATA':
      event.waitUntil(storeOfflineData(payload.type, payload.data));
      break;
    case 'GET_CACHE_SIZE':
      event.waitUntil(
        getCacheSize().then((size) => {
          event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
        })
      );
      break;
  }
});

/**
 * Utility functions for offline data management
 */
async function getOfflineData(type) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offline'], 'readonly');
    const store = transaction.objectStore('offline');
    const index = store.index('type');
    const data = await index.getAll(type);
    return data || [];
  } catch (error) {
    console.error('Failed to get offline data:', error);
    return [];
  }
}

async function storeOfflineData(type, data) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offline'], 'readwrite');
    const store = transaction.objectStore('offline');

    const record = {
      id: Date.now() + Math.random(),
      type,
      data,
      timestamp: Date.now(),
    };

    await store.add(record);
    console.log('Stored offline data:', type, record.id);
  } catch (error) {
    console.error('Failed to store offline data:', error);
  }
}

async function removeOfflineData(type, id) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offline'], 'readwrite');
    const store = transaction.objectStore('offline');
    await store.delete(id);
  } catch (error) {
    console.error('Failed to remove offline data:', error);
  }
}

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LPGDistributorDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('offline')) {
        const store = db.createObjectStore('offline', { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  return Promise.all(
    urls.map((url) =>
      fetch(url)
        .then((response) => {
          if (response.ok) {
            return cache.put(url, response);
          }
        })
        .catch(console.error)
    )
  );
}

async function clearCache(cacheName) {
  if (cacheName) {
    return caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    return Promise.all(cacheNames.map((name) => caches.delete(name)));
  }
}

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();

    for (const key of keys) {
      const response = await cache.match(key);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}

/**
 * Periodic cache cleanup
 */
async function performCacheCleanup() {
  const cacheSize = await getCacheSize();
  const maxCacheSize = 50 * 1024 * 1024; // 50MB

  if (cacheSize > maxCacheSize) {
    console.log('Cache size exceeded, performing cleanup');

    // Remove oldest dynamic cache entries
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const keys = await cache.keys();

    // Remove 25% of entries (oldest first)
    const toRemove = Math.floor(keys.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// Perform cache cleanup every hour
setInterval(performCacheCleanup, 3600000);
