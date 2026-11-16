// 규칙 엔진 검증: 알려진 국면의 '가능한 수 개수'와 비교합니다.  사용: node tools/perft.js
const fs=require('fs'),path=require('path');eval(fs.readFileSync(path.join(__dirname,'..','src','engine.js'),'utf8')+';global.Chess=Chess');
const T=[[undefined,4,197281],['r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',3,97862],['8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',4,43238],['r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',3,9467],['rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',3,62379],['r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10',3,89890]];
for(const [f,d,n] of T){const g=new Chess(f);const r=g.perft(d);console.log(r===n?'OK':'FAIL',r,n);}
// SAN checks
let g=new Chess();for(const m of ['e4','e5','Qh5','Nc6','Bc4','Nf6','Qxf7#'])console.log(m,g.move(m)&&g.history().slice(-1)[0]);
console.log(g.in_checkmate(), g.undo().san, g.turn());
g=new Chess('4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1');console.log(g.moves().join(' '));
g=new Chess('4k3/8/8/8/2N3N1/8/8/4K3 w - - 0 1');console.log(g.moves().filter(s=>/e[35]/.test(s)).join(' '));
g=new Chess('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');console.log(g.moves().join(' '), g.move({from:'a7',to:'a8',promotion:'q'}).san);
