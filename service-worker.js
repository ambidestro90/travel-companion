
const CACHE='travel-companion-v0.1.0';
const ASSETS=['./','./index.html','./manifest.webmanifest','./assets/css/app.css','./assets/js/app.js','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./data/trips.json','./docs/sharm-2026/libretto-assicurativo-parte1.pdf','./docs/sharm-2026/libretto-assicurativo-parte2.pdf'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp}).catch(()=>caches.match('./index.html')))));
