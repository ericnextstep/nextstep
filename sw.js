const CACHE = ‘nextstep-v4’;
const ASSETS = [’/nextstep/’, ‘/nextstep/index.html’, ‘/nextstep/manifest.json’, ‘/nextstep/icon.svg’];

self.addEventListener(‘install’, function(e) {
self.skipWaiting();
});

self.addEventListener(‘activate’, function(e) {
e.waitUntil(
caches.keys().then(function(keys) {
return Promise.all(
keys.map(function(k) { return caches.delete(k); })
);
}).then(function() {
return self.clients.claim();
})
);
});

self.addEventListener(‘fetch’, function(e) {
// Always go to network first, fall back to cache
e.respondWith(
fetch(e.request).catch(function() {
return caches.match(e.request);
})
);
});

self.addEventListener(‘message’, function(e) {
if (e.data && e.data.type === ‘SKIP_WAITING’) self.skipWaiting();
});

self.addEventListener(‘push’, function(e) {
var data = {};
try { data = e.data ? e.data.json() : {}; } catch(err) {}
var title = data.title || ‘NextStep’;
var options = {
body: data.body || ‘Your daily plan is waiting.’,
icon: ‘/nextstep/icon.svg’,
badge: ‘/nextstep/icon.svg’,
vibrate: [100, 50, 100],
data: { url: ‘/nextstep/’ },
};
e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener(‘notificationclick’, function(e) {
e.notification.close();
e.waitUntil(
clients.matchAll({ type: ‘window’, includeUncontrolled: true }).then(function(list) {
for (var i = 0; i < list.length; i++) {
if (‘focus’ in list[i]) return list[i].focus();
}
if (clients.openWindow) return clients.openWindow(’/nextstep/’);
})
);
});
