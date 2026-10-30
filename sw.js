// ホーム画面に置けるようにするための最小の仕組み。データはためない（いつも最新のゲームを読む）
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',()=>{});
