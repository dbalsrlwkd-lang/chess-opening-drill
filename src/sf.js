/* ---------- Stockfish 연결 (선택 기능) ----------
   엔진 파일(stockfish-19-lite-single.js + .wasm)을 백그라운드 작업자로 띄우고 UCI 글자 명령으로 대화해요.
   처음 쓸 때만 불러와요. 파일을 직접 연 경우(file://)에는 브라우저가 작업자를 막아서 쓸 수 없어요.
   SF.go(['e2e4','e7e5'], { depth: 10 })  →  Promise<{ cp, mate, best, pv }>
     cp/mate 는 "둘 차례인 쪽" 기준. best 는 'g1f3' 같은 UCI 표기(둘 수가 없으면 null). */
var SF = (function () {
  var FILE = 'stockfish-19-lite-single.js';
  var w = null, boot = null, job = null, chain = Promise.resolve();
  function fail(e) { var j = job; job = null; boot = null; if (w) { try { w.terminate(); } catch (x) {} w = null; } if (j) j.rej(e); }
  function start() {
    if (boot) return boot;
    boot = new Promise(function (res, rej) {
      if (!/^https?:$/.test(location.protocol)) { boot = null; return rej(new Error('file')); }
      try { w = new Worker(FILE); } catch (e) { boot = null; return rej(new Error('load')); }
      var t = setTimeout(function () { fail(new Error('load')); rej(new Error('load')); }, 30000);
      w.onerror = function () { clearTimeout(t); fail(new Error('load')); rej(new Error('load')); };
      w.onmessage = function (ev) {
        var l = String(ev.data);
        if (l === 'uciok') { clearTimeout(t); res(); }
        else if (job) line(l);
      };
      w.postMessage('uci');
    });
    return boot;
  }
  function line(l) {
    var m;
    if (l.indexOf('info ') === 0) {
      if (/ (upper|lower)bound/.test(l)) return;
      if ((m = / multipv (\d+)/.exec(l)) && m[1] !== '1') return;
      if (!(m = / score (cp|mate) (-?\d+)/.exec(l))) return;
      job.out.cp = m[1] === 'cp' ? +m[2] : null;
      job.out.mate = m[1] === 'mate' ? +m[2] : null;
      job.out.pv = l.indexOf(' pv ') > 0 ? l.split(' pv ')[1].split(' ') : [];
    } else if (l.indexOf('bestmove') === 0) {
      var j = job, b = l.split(' ')[1]; job = null;
      j.out.best = b && b !== '(none)' ? b : null;
      j.res(j.out);
    }
  }
  function go(moves, o) {
    o = o || {};
    var run = function () {
      return start().then(function () {
        return new Promise(function (res, rej) {
          job = { res: res, rej: rej, out: { cp: null, mate: null, pv: [], best: null } };
          w.postMessage('setoption name Skill Level value ' + (o.skill == null ? 20 : o.skill));
          w.postMessage('position startpos' + (moves.length ? ' moves ' + moves.join(' ') : ''));
          w.postMessage('go ' + (o.depth ? 'depth ' + o.depth : 'movetime ' + (o.movetime || 400)));
        });
      });
    };
    var p = chain.then(run, run);
    chain = p.catch(function () {});
    return p;
  }
  return { go: go };
})();
