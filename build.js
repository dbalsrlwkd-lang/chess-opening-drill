// src/ 의 조각들을 하나의 HTML로 합칩니다.  사용: node build.js
// 결과: opening-drill.html (단일 파일 앱) 과 deploy/index.html (배포용, 같은 내용)
// Stockfish 엔진 파일 2개는 node_modules/stockfish 에서 deploy/ 로 복사합니다(먼저 npm install).
const fs = require('fs'), path = require('path');
const rd = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const out = rd('index.template.html')
  .replace('/*__STYLES__*/', () => rd('styles.css'))
  .replace('/*__ENGINE__*/', () => rd('engine.js'))
  .replace('/*__SF__*/', () => rd('sf.js'))
  .replace('/*__OPENINGS__*/', () => rd('openings.js'))
  .replace('/*__PLAN__*/', () => rd('plan.js'))
  .replace('/*__APP__*/', () => rd('app.js'));
fs.writeFileSync(path.join(__dirname, 'opening-drill.html'), out);
fs.writeFileSync(path.join(__dirname, 'deploy', 'index.html'), out);
console.log('built', Buffer.byteLength(out), 'bytes → opening-drill.html, deploy/index.html');

const SF = ['stockfish-19-lite-single.js', 'stockfish-19-lite-single.wasm'];
const bin = path.join(__dirname, 'node_modules', 'stockfish', 'bin');
if (SF.every(f => fs.existsSync(path.join(bin, f)))) {
  for (const f of SF) fs.copyFileSync(path.join(bin, f), path.join(__dirname, 'deploy', f));
  console.log('engine → deploy/' + SF.join(', deploy/'));
} else if (!SF.every(f => fs.existsSync(path.join(__dirname, 'deploy', f)))) {
  console.log('주의: Stockfish 파일이 없어요. "npm install" 을 먼저 실행하세요. (엔진 기능만 꺼지고 나머지는 동작해요)');
}
