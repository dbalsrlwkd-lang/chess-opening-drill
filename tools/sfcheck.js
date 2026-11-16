// Stockfish로 오프닝 데이터를 전수 점검합니다(앱 밖, PC에서만).
// 사용: node tools/sfcheck.js opening-drill.html [깊이=14] [오프닝 id ...]
// 점검 내용 (점수 단위는 폰 1개 = 1.00, 항상 "그 수를 두는 쪽" 기준)
//   MAIN  내가 두는 본수순이 엔진 최선보다 0.8 이상 나쁨
//   OPP   상대 본수순이 최선보다 1.2 이상 나쁨 (함정 줄에서는 일부러 넣은 실수라 참고만)
//   WRONG 오답으로 분류한 수가 본수순과 0.3 이내로 비슷하거나 더 좋음
//   ALT   "좋은 수"라고 한 대안이 본수순보다 1.0 이상 나쁨
// 결과는 화면과 tools/sfcheck-result.json 에 남깁니다.
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(process.argv[2], 'utf8');
const depth = +process.argv[3] || 14, only = process.argv.slice(4);
// 빨리 끝내려면 여러 창에서 나눠 돌려요: 환경변수 PART=0/4, 1/4, 2/4, 3/4 (결과 파일 이름에 번호가 붙어요)
const part = (process.env.PART || '').split('/').map(Number), inPart = i => part.length !== 2 || i % part[1] === part[0];
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
eval(scripts[0] + ';global.Chess=Chess');
const src = scripts[1], linesSrc = src.slice(src.indexOf('const LINES'), src.indexOf('const SOON'));
const LINES = eval('(' + linesSrc.replace('const LINES =', '').trim().replace(/;\s*$/, '') + ')');
const strip = s => s.replace(/[+#!?]/g, '');

let waiting = null;
const out = { cp: null, mate: null, best: null };
const sf = require('stockfish')('lite-single', l => {
  let m;
  if (l.startsWith('info ') && !/bound/.test(l) && (m = / score (cp|mate) (-?\d+)/.exec(l))) { out.cp = m[1] === 'cp' ? +m[2] : null; out.mate = m[1] === 'mate' ? +m[2] : null; }
  else if (l.startsWith('bestmove') && waiting) { const w = waiting; waiting = null; w(l.split(' ')[1]); }
});
const cache = {};
// 그 자리에서 "둘 차례인 쪽" 기준 점수(센티폰)와 최선수
async function search(uci) {
  const k = uci.join(' ');
  if (cache[k]) return cache[k];
  out.cp = out.mate = null;
  sf.processCommand('position startpos' + (uci.length ? ' moves ' + k : ''));
  const best = await new Promise(res => { waiting = res; sf.processCommand('go depth ' + depth); });
  const v = out.mate !== null ? (out.mate > 0 ? 1 : -1) * (10000 - Math.abs(out.mate)) : (out.cp || 0);
  return (cache[k] = { v, best: best === '(none)' ? null : best });
}
const fmt = v => Math.abs(v) > 9000 ? (v > 0 ? '+M' : '-M') + (10000 - Math.abs(v)) : (v >= 0 ? '+' : '') + (v / 100).toFixed(2);
const cl = v => Math.max(-1500, Math.min(1500, v));
const u = m => m.from + m.to + (m.promotion || '');

(async () => {
  sf.processCommand('uci');
  const flags = [], t0 = Date.now();
  for (const L of LINES) {
    if ((only.length && !only.includes(L.id)) || !inPart(LINES.indexOf(L))) continue;
    const g = new Chess(), hist = [];
    for (let i = 0; i < L.moves.length; i++) {
      const m = L.moves[i], mine = (i % 2 === 0 ? 'w' : 'b') === L.side, label = L.id + ' ' + i + ' ' + (Math.floor(i / 2) + 1) + (i % 2 ? '...' : '.') + m.san;
      const pre = await search(hist);
      const legal = g.moves({ verbose: true });
      const after = async san => { const mv = legal.find(x => strip(x.san) === strip(san)); return mv ? -(await search(hist.concat(u(mv)))).v : null; };
      const book = await after(m.san);
      const bestMv = legal.find(x => u(x) === pre.best), bestSan = bestMv ? bestMv.san : pre.best;
      const loss = cl(pre.v) - cl(book);
      if (mine && loss >= 80) flags.push({ kind: 'MAIN', id: L.id, ply: i, san: m.san, text: label + '  본수순 ' + fmt(book) + ' / 엔진 최선 ' + bestSan + ' ' + fmt(pre.v) });
      if (!mine && loss >= 120) flags.push({ kind: 'OPP', id: L.id, ply: i, san: m.san, trap: L.group === 'trap', text: label + '  상대 수 ' + fmt(book) + ' / 엔진 최선 ' + bestSan + ' ' + fmt(pre.v) + (L.group === 'trap' ? '  (함정 줄)' : '') });
      for (const k in (m.wrong || {})) { const w = await after(k); if (w !== null && cl(book) - cl(w) < 30) flags.push({ kind: 'WRONG', id: L.id, ply: i, san: m.san, key: k, text: label + '  오답 ' + k + ' ' + fmt(w) + ' / 본수순 ' + fmt(book) + '  ← "' + m.wrong[k] + '"' }); }
      for (const k in (m.alt || {})) { const a = await after(k); if (a !== null && cl(book) - cl(a) >= 100) flags.push({ kind: 'ALT', id: L.id, ply: i, san: m.san, key: k, text: label + '  대안 ' + k + ' ' + fmt(a) + ' / 본수순 ' + fmt(book) + '  ← "' + m.alt[k] + '"' }); }
      const r = g.move(m.san); hist.push(u(r));
    }
    const end = await search(hist), s = (g.turn() === L.side ? 1 : -1) * end.v;
    console.log(L.id.padEnd(18), '끝 자리 평가(내 기준)', fmt(s), '  ' + Math.round((Date.now() - t0) / 1000) + 's');
    flags.push({ kind: 'END', id: L.id, v: s, text: L.id + '  끝 자리 ' + fmt(s) });
  }
  for (const kind of ['MAIN', 'OPP', 'WRONG', 'ALT']) {
    const f = flags.filter(x => x.kind === kind);
    console.log('\n== ' + kind + ' (' + f.length + ') ==');
    f.forEach(x => console.log(x.text));
  }
  fs.writeFileSync(path.join(__dirname, 'sfcheck-result' + (part.length === 2 ? '-' + part[0] : '') + '.json'), JSON.stringify({ depth, at: new Date().toISOString(), flags }, null, 1));
  sf.terminate();
})();
