// 해설 글에 적힌 "칸+기물"과 "수순"이 실제 판과 맞는지 기계적으로 점검합니다. (엔진 불필요)
// 사용: node tools/textcheck.js opening-drill.html
//   PIECE  "f1 룩"처럼 칸과 기물을 함께 적었는데 그 칸에 그 기물이 없음
//   SEQ    "dxe5 dxe5 Qxd8+"처럼 이어 적은 수순이 그 자리에서 실제로 둘 수 없음
//   MOVE   잡기·체크 표기가 붙은 수 하나(Nxf7, ...Qh4+)가 그 자리 근처에서 둘 수 없음
// 앞으로의 계획을 말하는 문장도 걸릴 수 있어서, 결과는 사람이 읽고 판단해야 합니다.
const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
eval(scripts[0] + ';global.Chess=Chess');
const src = scripts[1], linesSrc = src.slice(src.indexOf('const LINES'), src.indexOf('const SOON'));
const LINES = eval('(' + linesSrc.replace('const LINES =', '').trim().replace(/;\s*$/, '')+')');
const strip = s => s.replace(/[+#!?]/g, '');
const FILES = 'abcdefgh', PN = { '폰': 'p', '나이트': 'n', '비숍': 'b', '룩': 'r', '퀸': 'q', '킹': 'k' };

function fenOf(g, turn) {
  let rows = [];
  for (let r = 8; r >= 1; r--) {
    let row = '', e = 0;
    for (const f of FILES) { const p = g.get(f + r); if (!p) { e++; continue; } if (e) { row += e; e = 0; } row += p.color === 'w' ? p.type.toUpperCase() : p.type; }
    rows.push(row + (e || ''));
  }
  const at = (sq, t, c) => { const p = g.get(sq); return p && p.type === t && p.color === c; };
  let c = '';
  if (at('e1', 'k', 'w')) { if (at('h1', 'r', 'w')) c += 'K'; if (at('a1', 'r', 'w')) c += 'Q'; }
  if (at('e8', 'k', 'b')) { if (at('h8', 'r', 'b')) c += 'k'; if (at('a8', 'r', 'b')) c += 'q'; }
  return rows.join('/') + ' ' + turn + ' ' + (c || '-') + ' - 0 1';
}
const clone = (g, turn) => new Chess(fenOf(g, turn || g.turn()));
const TOK = /(\.\.\.)?(O-O-O|O-O|[KQRBN][a-h]?[1-8]?x?[a-h][1-8]|[a-h]x[a-h][1-8](?:=[QRBN])?|[a-h][1-8](?:=[QRBN])?)([+#])?/g;

// 글에서 수 표기를 뽑아, 공백이나 쉼표로만 이어진 것끼리 한 묶음으로
function runs(text) {
  const out = []; let cur = null, m; TOK.lastIndex = 0;
  while ((m = TOK.exec(text))) {
    const before = text[m.index - 1] || ' ', after = text[m.index + m[0].length] || ' ';
    if (/[A-Za-z0-9]/.test(before) || /[A-Za-z0-9]/.test(after)) continue; // 다른 글자에 붙은 건 수 표기가 아님
    const tok = { dots: !!m[1], san: m[2], full: m[0], bare: /^[a-h][1-8]$/.test(m[2]) && !m[3], idx: m.index, end: m.index + m[0].length };
    if (cur && /^(, | |,)$/.test(text.slice(cur[cur.length - 1].end, tok.idx))) cur.push(tok); else { cur = [tok]; out.push(cur); }
  }
  return out;
}
// 묶음을 start 자리에서 차례로 둬 본다. 끝까지 두면 길이를, 아니면 둔 개수를 돌려줌
function playRun(run, start) {
  const g = clone(start); let n = 0;
  for (const t of run) { if (t.dots && g.turn() !== 'b') break; if (!g.move(t.san)) break; n++; }
  return n;
}
const flags = [];
for (const L of LINES) {
  const g = new Chess();
  L.moves.forEach((m, i) => {
    const P0 = clone(g), P1 = clone(g); P1.move(m.san);
    const label = L.id + ' ' + (Math.floor(i / 2) + 1) + (i % 2 ? '...' : '.') + m.san;
    const check = (field, text, bases) => {
      if (!text) return;
      // 1) 칸 + 기물
      for (const mm of text.matchAll(/([a-h][1-8])\s?(폰|나이트|비숍|룩|퀸|킹)/g)) {
        const ok = bases.some(b => { const p = b.get(mm[1]); return p && p.type === PN[mm[2]]; });
        if (!ok) flags.push({ kind: 'PIECE', label, field, what: mm[0], text });
      }
      // 2) 수순
      const starts = [];
      for (const b of bases) { starts.push(clone(b, 'w'), clone(b, 'b')); }
      for (const run of runs(text)) {
        if (run.length >= 2) {
          if (run.every(t => t.bare)) continue; // "e4, d5 칸" 같은 칸 나열
          const best = Math.max(...starts.map(s => playRun(run, s)));
          if (best < run.length) flags.push({ kind: 'SEQ', label, field, what: run.map(t => t.full).join(' ') + '  (' + best + '번째까지만 가능)', text });
        } else {
          const t = run[0];
          if (t.bare || !/[x+#]/.test(t.full)) continue;
          if (!starts.some(s => playRun(run, s) === 1)) flags.push({ kind: 'MOVE', label, field, what: t.full, text });
        }
      }
    };
    check('note', m.note, [P1, P0]);
    check('hint', m.hint, [P0, P1]);
    check('wrongDefault', m.wrongDefault, [P0, P1]);
    if (m.why) check('why', m.why.q + ' / ' + m.why.opts.join(' / '), [P1, P0]);
    for (const kind of ['alt', 'wrong']) for (const k in (m[kind] || {})) {
      const Pk = clone(g); Pk.move(k);
      check(kind + ':' + k, m[kind][k], [Pk, P0]);
    }
    g.move(m.san);
  });
}
for (const kind of ['SEQ', 'MOVE', 'PIECE']) {
  const f = flags.filter(x => x.kind === kind);
  console.log('\n== ' + kind + ' (' + f.length + ') ==');
  for (const x of f) console.log('[' + x.label + ' · ' + x.field + '] ' + x.what + '\n    ' + x.text);
}
console.log('\n총 ' + flags.length + '건');
