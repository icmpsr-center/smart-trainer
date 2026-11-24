// منصة المحاضر الذكية — Service Worker
// الواجهة: تُعرض فوراً من الذاكرة ثم تُحدَّث في الخلفية. المكتبات والخطوط الخارجية: تُحفظ بعد أول تحميل.
// لا يخزّن أي طلب لـ Supabase أو الذكاء الاصطناعي.
const CACHE = "smart-trainer-v52";
const LIBS = "smart-trainer-libs-v1";
const SHELL = ["./", "./index.html", "./manifest.json", "./logo.jpg", "./icon-192.png", "./icon-512.png", "./icon-192-maskable.png", "./icon-512-maskable.png"];
const CDN = /^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== LIBS).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (CDN.test(req.url)) {
    e.respondWith(caches.open(LIBS).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(req, { ignoreSearch: req.mode === "navigate" }).then(hit => {
    const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit || caches.match("./index.html"));
    return hit || net;
  })));
});
