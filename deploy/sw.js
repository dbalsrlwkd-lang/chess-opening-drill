// 오프닝 연습장 서비스 워커: 한 번 접속하면 인터넷 없이도 열려요.
// 앱을 고쳐서 다시 올릴 때는 아래 버전 숫자를 하나 올려 주세요.
const CACHE = 'opening-drill-cache-v15';
const ASSETS = ['./', './index.html', './stockfish-19-lite-single.js', './stockfish-19-lite-single.wasm','./manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  // 내 파일만 다뤄요. 다른 사이트 요청(기보 불러오기 등)은 그대로 통과시켜요.
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // 인터넷이 되면 최신본을 받고, 안 되면 저장해 둔 것을 써요.
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
