
const CACHE='travel-companion-v0.2.0';
const ASSETS=['./','./index.html','./manifest.webmanifest','./assets/css/app.css','./assets/js/app.js','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./data/trips.json','./docs/sharm-2026/libretto-assicurativo-parte1.pdf','./docs/sharm-2026/libretto-assicurativo-parte2.pdf'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{if(e.request.method==='GET'){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return resp}).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):undefined))));
