// LineGap offline support. Change VERSION when you upload a new index.html.
const VERSION = "linegap-v5";
const FILES = ["./", "./index.html", "./terms.html", "./privacy.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  // only clean up LineGap's own old caches (other apps on the same GitHub address keep theirs)
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("linegap-") && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (e.request.mode === "navigate") {
    // newest version when online, saved copy when offline
    const isApp = /\/(index\.html)?$/.test(url.pathname);
    const key = isApp ? "./index.html" : e.request;
    e.respondWith(fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(key, copy)); } return r; })
      .catch(() => caches.match(key, { ignoreSearch: true }).then(hit => hit || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
