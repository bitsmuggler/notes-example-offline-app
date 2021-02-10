const CACHE_NAME = 'notes-app-cache-v1';

const filesToCache = [
    '/',
    '/app.js',
    '/index.html',
    '/note.component.js',
    '/status.component.js',
    '/sw.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css',
    'https://code.jquery.com/jquery-3.4.1.slim.min.js',
    'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', () => {

    console.log('Service Worker activated');
    const cacheKeys = await caches.keys();

    cacheKeys.forEach(cacheKey => {
        if (cacheKey !== CACHE_NAME) {
            caches.delete(cacheKey);
        }
    });
});

self.addEventListener('fetch', event => {
    console.log('fetching...');
    console.dir(event);
    event.respondWith(caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
            let fetchPromise = fetch(event.request).then(networkResponse => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            }).catch(error => {
                console.warn('Could not fetch at the moment.');
                console.error(error);
            });

            return response || fetchPromise;
        });
    }))

});