// 내부 검수: 얕은 기물 계산(알파베타 + 잡는 수 연장)으로 해설의 주장과 수순을 점검
const fs=require('fs');const html=fs.readFileSync(process.argv[2],'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
let eng=scripts[0].replace("perft: function (d) {","_legal: legal, _make: make, _unmake: unmake, _board: function(){return board}, _turn: function(){return turn}, _inCheck: inCheck,\n      perft: function (d) {");
eval(eng+';global.Chess=Chess');
const src=scripts[1];const LINES=eval('('+src.slice(src.indexOf('const LINES'),src.indexOf('const SOON')).replace('const LINES =','').trim().replace(/;\s*$/,'')+')');
const VAL={p:1,n:3,b:3.1,r:5,q:9,k:0};
function mat(g){let s=0;const b=g._board();for(let i=0;i<64;i++){const t=b[i];if(t)s+=(t.color==='w'?1:-1)*VAL[t.type];}return s;}
function qs(g,a,b,side,d){ // side: +1 white to move
  let stand=side*mat(g); if(d<=0) return stand; if(stand>=b) return b; if(stand>a)a=stand;
  const ms=g._legal().filter(m=>m.captured||m.promotion).sort((x,y)=>VAL[y.captured||'p']-VAL[x.captured||'p']);
  for(const m of ms){g._make(m);const v=-qs(g,-b,-a,-side,d-1);g._unmake();if(v>=b)return b;if(v>a)a=v;}
  return a;
}
function ab(g,d,a,b,side){
  const ms=g._legal();
  if(!ms.length) return g._inCheck(g._turn())?-1000-d:0;
  if(d===0) return qs(g,a,b,side,6);
  ms.sort((x,y)=>(y.captured?VAL[y.captured]:0)-(x.captured?VAL[x.captured]:0));
  for(const m of ms){g._make(m);const v=-ab(g,d-1,-b,-a,-side);g._unmake();if(v>=b)return b;if(v>a)a=v;}
  return a;
}
const D=+process.argv[3]||3;
function evalAfter(g,san){ // value for the side that just moved
  const side=g.turn()==='w'?1:-1; const r=g.move(san); if(!r) return null;
  const v=-ab(g,D,-9999,9999,-side); g.undo(); return v;
}
const strip=s=>s.replace(/[+#!?]/g,'');
const out=[];
for(const L of LINES){const g=new Chess();
  L.moves.forEach((m,i)=>{
    const mine=(i%2===0?'w':'b')===L.side;
    if(mine){
      const side=g.turn()==='w'?1:-1;
      const main=evalAfter(g,m.san);
      const best=ab(g,D+1,-9999,9999,side), bestSan='(search)';
      if(best-main>=1.9) out.push(['MAIN-LOSES',L.id,i,m.san,'main='+main.toFixed(1),'best='+best.toFixed(1)]);
      for(const k in (m.wrong||{})){const v=evalAfter(g,k);const txt=m.wrong[k];const claims=/잃|체크메이트|당해요/.test(txt);
        if(claims && main-v<0.9) out.push(['WRONG-NO-LOSS',L.id,i,k,'main='+main.toFixed(1)+' this='+v.toFixed(1),txt.slice(0,60)]);
        if(v-main>=0.9) out.push(['WRONG-BETTER?',L.id,i,k,'main='+main.toFixed(1)+' this='+v.toFixed(1),txt.slice(0,60)]);}
      for(const k in (m.alt||{})){const v=evalAfter(g,k);const txt=m.alt[k];
        if(main-v>=1.9 && /좋은 수/.test(txt)) out.push(['ALT-LOSES',L.id,i,k,'main='+main.toFixed(1)+' this='+v.toFixed(1),txt.slice(0,60)]);}
    }
    g.move(m.san);
  });
}
for(const o of out) console.log(o.join(' | '));
console.log('checked',LINES.length,'lines; flags',out.length);
