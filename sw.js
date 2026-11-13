// Vỏ app: luôn lấy bản mới từ mạng (bỏ qua HTTP cache của GitHub Pages, max-age=600); chỉ dùng bản lưu khi mất mạng.
// KHÔNG bao giờ lưu phản hồi api.github.com (dữ liệu). 0cc08816ed được deploy-app.sh thay bằng mã bản dựng.
const CACHE = "ship-shell-0cc08816ed";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-192.png", "apple-touch-icon.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: "reload" })))));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== "GET") return;  // GitHub API, font: đi thẳng mạng
  e.respondWith(fetch(e.request, { cache: "no-store" })
    .then((r) => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then((x) => x.put(e.request, c)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
