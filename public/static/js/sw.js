// Files to cache
const cacheName = 'blinkies.cafe-v1';

function isCacheable(url) {
    const slug = url.split('/').slice(3).join('/');
    let cacheable = false;
    if (slug.substring(0,10) == 'b/display/') cacheable = true;
    return cacheable;
}

// Fetching content using Service Worker
self.addEventListener('fetch', (e) => {
    if (isCacheable(e.request.url)) {
        e.respondWith((async () => {
          const r = await caches.match(e.request);
          if (r) return r;
          const response = await fetch(e.request);
          const cache = await caches.open(cacheName);
          cache.put(e.request, response.clone());
          return response;
        })());
    }
    else {
        e.respondWith((async () => {
          const response = await fetch(e.request);
          return response;
        })());
    }
});

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" });
  }
};

registerServiceWorker();
