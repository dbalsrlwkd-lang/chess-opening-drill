/* ---------- 체스 규칙 엔진 (파일 내장, 인터넷 불필요) ----------
   chess.js와 같은 방식으로 쓰는 최소 구현: turn, get, moves, move, undo, history, fen */
var Chess = (function () {
  var FILES = 'abcdefgh';
  var START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  var N_D = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  var K_D = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  var B_D = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  var R_D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  var name = function (i) { return FILES[i & 7] + ((i >> 3) + 1); };
  var idx = function (s) { return FILES.indexOf(s[0]) + (s.charCodeAt(1) - 49) * 8; };
  var clean = function (s) { return String(s).replace(/[+#!?]/g, '').replace(/=/g, ''); };

  function Chess(fen) {
    var board, turn, cast, ep, hist;

    function load(f) {
      var p = f.split(/\s+/), rows = p[0].split('/');
      board = new Array(64).fill(null);
      for (var r = 0; r < 8; r++) {
        var x = 0;
        for (var k = 0; k < rows[r].length; k++) {
          var ch = rows[r][k];
          if (ch >= '1' && ch <= '8') x += +ch;
          else { board[(7 - r) * 8 + x] = { type: ch.toLowerCase(), color: ch === ch.toLowerCase() ? 'b' : 'w' }; x++; }
        }
      }
      turn = p[1] || 'w';
      cast = p[2] && p[2] !== '-' ? p[2] : '';
      ep = p[3] && p[3] !== '-' ? idx(p[3]) : -1;
      hist = [];
    }

    function attacked(sq, by) {
      var f = sq & 7, r = sq >> 3, i, k, ff, rr, t;
      var pr = r + (by === 'w' ? -1 : 1);
      if (pr >= 0 && pr < 8) for (i = -1; i <= 1; i += 2) {
        ff = f + i;
        if (ff >= 0 && ff < 8) { t = board[pr * 8 + ff]; if (t && t.color === by && t.type === 'p') return true; }
      }
      for (i = 0; i < 8; i++) {
        ff = f + N_D[i][0]; rr = r + N_D[i][1];
        if (ff >= 0 && ff < 8 && rr >= 0 && rr < 8) { t = board[rr * 8 + ff]; if (t && t.color === by && t.type === 'n') return true; }
        ff = f + K_D[i][0]; rr = r + K_D[i][1];
        if (ff >= 0 && ff < 8 && rr >= 0 && rr < 8) { t = board[rr * 8 + ff]; if (t && t.color === by && t.type === 'k') return true; }
      }
      for (i = 0; i < 8; i++) {
        var d = K_D[i], diag = d[0] !== 0 && d[1] !== 0;
        for (k = 1; k < 8; k++) {
          ff = f + d[0] * k; rr = r + d[1] * k;
          if (ff < 0 || ff > 7 || rr < 0 || rr > 7) break;
          t = board[rr * 8 + ff];
          if (t) { if (t.color === by && (t.type === 'q' || t.type === (diag ? 'b' : 'r'))) return true; break; }
        }
      }
      return false;
    }
    function kingSq(c) { for (var i = 0; i < 64; i++) { var t = board[i]; if (t && t.type === 'k' && t.color === c) return i; } return -1; }
    function inCheck(c) { var k = kingSq(c); return k >= 0 && attacked(k, c === 'w' ? 'b' : 'w'); }

    function pseudo() {
      var out = [], us = turn, them = us === 'w' ? 'b' : 'w';
      var add = function (from, to, flags, promo) {
        var pc = board[from], cap = flags.indexOf('e') >= 0 ? 'p' : (board[to] ? board[to].type : undefined);
        var m = { color: us, from: from, to: to, flags: flags, piece: pc.type };
        if (cap) m.captured = cap;
        if (promo) { m.promotion = promo; m.flags += 'p'; }
        out.push(m);
      };
      for (var s = 0; s < 64; s++) {
        var pc = board[s]; if (!pc || pc.color !== us) continue;
        var f = s & 7, r = s >> 3, i, k, ff, rr, t;
        if (pc.type === 'p') {
          var dir = us === 'w' ? 1 : -1, startR = us === 'w' ? 1 : 6, lastR = us === 'w' ? 7 : 0;
          var pushes = function (to, flags) {
            if ((to >> 3) === lastR) ['q', 'r', 'b', 'n'].forEach(function (p) { add(s, to, flags, p); });
            else add(s, to, flags);
          };
          var one = s + 8 * dir;
          if (!board[one]) {
            pushes(one, 'n');
            if (r === startR && !board[one + 8 * dir]) add(s, one + 8 * dir, 'b');
          }
          for (i = -1; i <= 1; i += 2) {
            ff = f + i; if (ff < 0 || ff > 7) continue;
            var to = (r + dir) * 8 + ff; t = board[to];
            if (t && t.color === them) pushes(to, 'c');
            else if (to === ep) add(s, to, 'e');
          }
        } else if (pc.type === 'n' || pc.type === 'k') {
          var D = pc.type === 'n' ? N_D : K_D;
          for (i = 0; i < 8; i++) {
            ff = f + D[i][0]; rr = r + D[i][1];
            if (ff < 0 || ff > 7 || rr < 0 || rr > 7) continue;
            t = board[rr * 8 + ff];
            if (!t) add(s, rr * 8 + ff, 'n'); else if (t.color === them) add(s, rr * 8 + ff, 'c');
          }
          if (pc.type === 'k') {
            var home = us === 'w' ? 4 : 60;
            if (s === home && !attacked(home, them)) {
              var rk = board[home + 3], rq = board[home - 4];
              if (cast.indexOf(us === 'w' ? 'K' : 'k') >= 0 && rk && rk.type === 'r' && rk.color === us &&
                !board[home + 1] && !board[home + 2] && !attacked(home + 1, them) && !attacked(home + 2, them)) add(s, home + 2, 'k');
              if (cast.indexOf(us === 'w' ? 'Q' : 'q') >= 0 && rq && rq.type === 'r' && rq.color === us &&
                !board[home - 1] && !board[home - 2] && !board[home - 3] && !attacked(home - 1, them) && !attacked(home - 2, them)) add(s, home - 2, 'q');
            }
          }
        } else {
          var S = pc.type === 'b' ? B_D : pc.type === 'r' ? R_D : K_D;
          for (i = 0; i < S.length; i++) for (k = 1; k < 8; k++) {
            ff = f + S[i][0] * k; rr = r + S[i][1] * k;
            if (ff < 0 || ff > 7 || rr < 0 || rr > 7) break;
            t = board[rr * 8 + ff];
            if (!t) add(s, rr * 8 + ff, 'n');
            else { if (t.color === them) add(s, rr * 8 + ff, 'c'); break; }
          }
        }
      }
      return out;
    }

    function make(m) {
      var us = m.color, pc = board[m.from];
      var st = { m: m, cast: cast, ep: ep, cap: board[m.to], pc: pc };
      board[m.to] = m.promotion ? { type: m.promotion, color: us } : pc;
      board[m.from] = null;
      if (m.flags.indexOf('e') >= 0) { var cs = m.to + (us === 'w' ? -8 : 8); st.epCap = board[cs]; st.epSq = cs; board[cs] = null; }
      if (m.flags.indexOf('k') >= 0) { board[m.to - 1] = board[m.to + 1]; board[m.to + 1] = null; }
      if (m.flags.indexOf('q') >= 0) { board[m.to + 1] = board[m.to - 2]; board[m.to - 2] = null; }
      ep = m.flags.indexOf('b') >= 0 ? (m.from + m.to) / 2 : -1;
      if (cast) {
        var rm = '';
        if (pc.type === 'k') rm += us === 'w' ? 'KQ' : 'kq';
        [m.from, m.to].forEach(function (q) { if (q === 0) rm += 'Q'; if (q === 7) rm += 'K'; if (q === 56) rm += 'q'; if (q === 63) rm += 'k'; });
        if (rm) cast = cast.split('').filter(function (c) { return rm.indexOf(c) < 0; }).join('');
      }
      turn = us === 'w' ? 'b' : 'w';
      hist.push(st);
    }
    function unmake() {
      var st = hist.pop(); if (!st) return null;
      var m = st.m;
      turn = m.color; cast = st.cast; ep = st.ep;
      board[m.from] = st.pc; board[m.to] = st.cap || null;
      if (m.flags.indexOf('e') >= 0) { board[m.to] = null; board[st.epSq] = st.epCap; }
      if (m.flags.indexOf('k') >= 0) { board[m.to + 1] = board[m.to - 1]; board[m.to - 1] = null; }
      if (m.flags.indexOf('q') >= 0) { board[m.to - 2] = board[m.to + 1]; board[m.to + 1] = null; }
      return m;
    }
    function legal() {
      var us = turn;
      return pseudo().filter(function (m) { make(m); var ok = !inCheck(us); unmake(); return ok; });
    }
    function san(m, all) {
      var s;
      if (m.flags.indexOf('k') >= 0) s = 'O-O';
      else if (m.flags.indexOf('q') >= 0) s = 'O-O-O';
      else {
        s = '';
        if (m.piece !== 'p') {
          s = m.piece.toUpperCase();
          var same = all.filter(function (o) { return o.piece === m.piece && o.to === m.to && o.from !== m.from; });
          if (same.length) {
            var fileClash = same.some(function (o) { return (o.from & 7) === (m.from & 7); });
            var rankClash = same.some(function (o) { return (o.from >> 3) === (m.from >> 3); });
            if (!fileClash) s += FILES[m.from & 7];
            else if (!rankClash) s += (m.from >> 3) + 1;
            else s += name(m.from);
          }
        }
        if (m.captured) { if (m.piece === 'p') s += FILES[m.from & 7]; s += 'x'; }
        s += name(m.to);
        if (m.promotion) s += '=' + m.promotion.toUpperCase();
      }
      make(m);
      if (inCheck(turn)) s += legal().length ? '+' : '#';
      unmake();
      return s;
    }
    function pub(m, s) {
      var o = { color: m.color, from: name(m.from), to: name(m.to), flags: m.flags, piece: m.piece, san: s };
      if (m.captured) o.captured = m.captured;
      if (m.promotion) o.promotion = m.promotion;
      return o;
    }
    function listed() { var all = legal(); return all.map(function (m) { return { m: m, san: san(m, all) }; }); }

    load(fen || START);

    return {
      turn: function () { return turn; },
      get: function (sq) { var t = board[idx(sq)]; return t ? { type: t.type, color: t.color } : null; },
      moves: function (o) {
        o = o || {};
        var L = listed();
        if (o.square) L = L.filter(function (x) { return name(x.m.from) === o.square; });
        return o.verbose ? L.map(function (x) { return pub(x.m, x.san); }) : L.map(function (x) { return x.san; });
      },
      move: function (mv) {
        var L = listed(), hit = null;
        if (typeof mv === 'string') {
          var key = clean(mv);
          hit = L.filter(function (x) { return clean(x.san) === key; })[0];
        } else if (mv) {
          hit = L.filter(function (x) {
            return name(x.m.from) === mv.from && name(x.m.to) === mv.to && (!x.m.promotion || x.m.promotion === (mv.promotion || 'q'));
          })[0];
        }
        if (!hit) return null;
        make(hit.m);
        hist[hist.length - 1].san = hit.san;
        return pub(hit.m, hit.san);
      },
      undo: function () {
        if (!hist.length) return null;
        var s = hist[hist.length - 1].san, m = unmake();
        return pub(m, s);
      },
      history: function (o) {
        return hist.map(function (st) { return o && o.verbose ? pub(st.m, st.san) : st.san; });
      },
      in_check: function () { return inCheck(turn); },
      in_checkmate: function () { return inCheck(turn) && !legal().length; },
      perft: function (d) {
        var go = function (n) { var L = legal(); if (n === 1) return L.length; var c = 0; for (var i = 0; i < L.length; i++) { make(L[i]); c += go(n - 1); unmake(); } return c; };
        return go(d);
      }
    };
  }
  return Chess;
})();
