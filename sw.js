/* My Game BD: সার্ভিস ওয়ার্কার (সবসময় নতুন ভার্সন আগে, নেট না থাকলে ক্যাশ থেকে) */
const CACHE = "mgbd-v1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(r, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(r).then(m => m || caches.match("./index.html")))
  );
});
