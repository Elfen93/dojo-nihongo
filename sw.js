const CACHE='dojo-v4';
const ASSETS=['./','./index.html','./config.js','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/garden.svg'];
// Librería de la cuenta: se guarda en caché para poder abrir la app sin conexión
const CDN=['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/dist/umd/supabase.js'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).then(()=>Promise.all(CDN.map(u=>c.add(u).catch(()=>{}))))).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  if (e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  if (CDN.includes(e.request.url)){ // caché primero, red como respaldo
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{ if(res.ok){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); } return res; })));
    return;
  }
  if (u.origin!==location.origin) return;
  // red primero para la app (solo se guardan respuestas correctas), caché como respaldo; la portada solo para navegaciones
  e.respondWith(fetch(e.request).then(r=>{ if(r.ok){ const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); } return r; }).catch(()=>caches.match(e.request).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
// Notificaciones push
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: 'Dojo 日本語', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Dojo 日本語', { body: d.body || '', icon: './icons/icon-192.png', badge: './icons/icon-192.png', data: { url: d.url || './' }, tag: 'dojo' }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => { for (const c of cs) { if ('focus' in c) return c.focus(); } return clients.openWindow(e.notification.data && e.notification.data.url || './'); }));
});
