// deploy/ 폴더를 내 PC에서 열어 보는 작은 서버.  사용: node tools/serve.js  →  http://localhost:8765
// (엔진은 파일을 직접 열면 안 돌아가서, PC에서 시험할 때는 이 서버로 열어요.)
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'deploy'), port = +process.argv[2] || 8765;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.wasm': 'application/wasm', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log('http://localhost:' + port));
