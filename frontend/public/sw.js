self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', (event) => {
  // Basic fetch handler to satisfy PWA requirements
  // In a more complex PWA, you would add caching logic here
  event.respondWith(fetch(event.request));
});
