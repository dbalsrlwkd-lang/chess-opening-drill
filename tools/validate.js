const fs=require('fs');const html=fs.readFileSync(process.argv[2],'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
eval(scripts[0]+';global.Chess=Chess');
const src=scripts[1]; const linesSrc=src.slice(src.indexOf('const LINES'), src.indexOf('const SOON'));
const LINES=eval('('+linesSrc.replace('const LINES =','').trim().replace(/;\s*$/,'')+')');
const strip=s=>s.replace(/[+#!?]/g,'');let bad=0;
for(const L of LINES){const g=new Chess();
  L.moves.forEach((m,i)=>{
    const legal=g.moves().map(strip);
    for(const k of ['alt','wrong']) for(const key in (m[k]||{})){ if(!legal.includes(strip(key))){bad++;console.log('BAD KEY',L.id,i,k,key);} if(strip(key)===strip(m.san)){bad++;console.log('KEY==MAIN',L.id,i,key);} }
    if(m.alt&&m.wrong) for(const key in m.alt) if(key in m.wrong){bad++;console.log('DUP',L.id,key);}
    if(m.why&&(m.why.a<0||m.why.a>=m.why.opts.length)){bad++;console.log('WHY',L.id,i);}
    const mine=(i%2===0?'w':'b')===L.side; if(!mine&&(m.alt||m.wrong||m.why||m.tags)){console.log('note: opp move has extras',L.id,i);}
    if(mine&&!m.note){bad++;console.log('NO NOTE',L.id,i);}
    const r=g.move(m.san); if(!r){bad++;console.log('ILLEGAL',L.id,i,m.san);throw 0;} if(r.san!==m.san&&strip(r.san)!==strip(m.san))console.log('san diff',r.san,m.san);
  });
  for(const k of ['id','group','side','title','sub','summary','ideas','pros','cons','after','outro']) if(!L[k]){bad++;console.log('MISSING',L.id,k);}
  console.log(L.id.padEnd(16),L.group.padEnd(6),L.side,L.moves.length+'ply',g.history().join(' '));
}
console.log(LINES.length,'lines, problems:',bad);
