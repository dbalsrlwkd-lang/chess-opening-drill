import asyncio, json
from playwright.async_api import async_playwright
W='/home/claude/work/'
PGN='''[Event "t1"]
[White "minki"]
[Black "opp1"]
[Result "1-0"]
[Date "2026.11.01"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 {comment} a6 8. h3 1-0

[Event "t2"]
[White "minki"]
[Black "opp2"]
[Result "0-1"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. Ng5 (4. c3 Nf6) Qxg5 0-1

[Event "t3"]
[White "opp3"]
[Black "minki"]
[Result "1/2-1/2"]

1. e4 c5 2. Nc3 Nc6 3. g3 g6 1/2-1/2

[Event "t4"]
[White "opp4"]
[Black "minki"]
[Result "1-0"]

1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 c5 7. O-O 1-0
'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,is_mobile=True,accept_downloads=True)
        await ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://'+W+'opening-drill.html')
        print('lines without plan:', await pg.evaluate("LINES.filter(l=>!l.plan).map(l=>l.id)"))
        learned=['italian-w','italian-w-2n','italian-w-main','evans-w','ruy-w','scotch-w','trap-shilling','sicilian-b','french-b','kid-b']
        await pg.evaluate("""(ids)=>{const d=new Date();const t=Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000);const P={lv:{},miss:{},learned:{},done:{},due:{},iv:{},days:{}};for(const id of ids){const L=LINES.find(x=>x.id===id);P.learned[id]=true;P.lv[id]={};P.due[id]={};P.iv[id]={};L.moves.forEach((m,i)=>{if((i%2===0?'w':'b')===L.side){P.lv[id][i]=2;P.iv[id][i]=3;P.due[id][i]=t+3}})}P.days[t-1]=5;P.days[t-2]=9;P.days[t-4]=3;localStorage.setItem('opening-drill-v1',JSON.stringify(P));localStorage.setItem('opening-drill-pref',JSON.stringify({infl:false,snd:false,board:'green',pieces:'classic',p3d:true,auto:true}))}""", learned)
        await pg.reload(); await pg.wait_for_timeout(300)
        print('stats:', (await pg.locator('.stats').first.inner_text()).replace('\n',' '))
        print('fork card:', (await pg.locator('.homework.fork').inner_text()).replace('\n',' | '))
        await pg.screenshot(path=W+'f_home.png')
        ends={}
        for run in range(6):
            if run==0: await pg.locator('[data-fork="w"]').first.click()
            for step in range(60):
                await pg.wait_for_timeout(110)
                if await pg.locator('.done').count(): break
                opt=pg.locator('[data-opt]:not([disabled])')
                if await opt.count(): await opt.first.click(); continue
                if await pg.locator('#quizOk').count(): await pg.locator('#quizOk').click(); continue
                if await pg.locator('#cont').count(): await pg.locator('#cont').click(); continue
                ready=await pg.evaluate("()=>document.querySelector('.turn').textContent.includes('내 차례') && !document.querySelector('.annot.ok,.annot.bad,.annot.alt,.annot.quiz')")
                if not ready: continue
                info=await pg.evaluate("""(a)=>{const ids=a[0],run=a[1];const strip=s=>s.replace(/[+#!?]/g,'');const h=[...document.querySelectorAll('#strip .mv:not(.cur)')].map(e=>strip(e.childNodes[0].textContent));
                  const c=LINES.filter(l=>ids.includes(l.id)&&l.side==='w'&&h.every((x,i)=>l.moves[i]&&strip(l.moves[i].san)===x));const pick=c[run%c.length];const g=new Chess();h.forEach(x=>g.move(x));const r=g.move(pick.moves[h.length].san);
                  return {from:r.from,to:r.to,n:c.length,opts:[...new Set(c.map(l=>l.moves[h.length].san))].length,ask:document.querySelector('.annot .ask').textContent,who:document.querySelector('.annot .who').textContent}}""",[learned,run])
                if run==0 and step<12: print('   ', info['who'],'|',info['ask'],'| cands',info['n'])
                if run==1 and info['opts']>1 and not ends.get('shot'): await pg.screenshot(path=W+'f_fork.png'); ends['shot']=1
                await pg.locator(f'#board [data-sq="{info["from"]}"]').click(); await pg.locator(f'#board [data-sq="{info["to"]}"]').click()
                if run==1 and not ends.get('shot2'):
                    await pg.wait_for_timeout(150); await pg.screenshot(path=W+'f_fork2.png'); ends['shot2']=1
            t=await pg.locator('.done h2').inner_text(); ends[t]=ends.get(t,0)+1
            await pg.locator('#again').click()
        print('fork endings:', {k:v for k,v in ends.items() if k not in('shot','shot2')})
        await pg.locator('#mback').click(); await pg.wait_for_timeout(200)
        print('after fork, stats:', (await pg.locator('.stats').first.inner_text()).replace('\n',' '))
        # first-move page fork button
        await pg.locator('[data-first="e4"]').click(); print('first page fork buttons:', await pg.locator('.forkbtn').all_inner_texts())
        # PGN
        await pg.locator('#nav-pgn').click(); await pg.locator('#pgMe').fill('minki'); await pg.locator('#pgText').fill(PGN); await pg.locator('#pgGo').click(); await pg.wait_for_timeout(200)
        print('pgn summary:', (await pg.locator('.gsum').inner_text()).replace('\n',' '))
        for t in await pg.locator('.gcard').all_inner_texts(): print('   ', t.replace('\n',' | '))
        await pg.screenshot(path=W+'f_pgn.png', full_page=True)
        # export / import
        await pg.locator('#nav-rec').click(); await pg.wait_for_timeout(200)
        async with pg.expect_download() as dl: await pg.locator('#exp').click()
        d=await dl.value; path=await d.path(); data=json.load(open(path)); print('export:', d.suggested_filename, data['app'], len(data['P']['learned']), 'learned')
        await pg.evaluate("localStorage.removeItem('opening-drill-v1')"); await pg.reload(); await pg.locator('#nav-rec').click()
        await pg.locator('#imp').click(); await pg.locator('#impText').fill(json.dumps(data)); await pg.locator('#impGo').click(); await pg.wait_for_timeout(900)
        print('import msg:', await pg.locator('#ioMsg').inner_text(), '| stored learned:', await pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('opening-drill-v1')).learned).length"))
        await pg.screenshot(path=W+'f_rec.png', full_page=True)
        print('errs', errs); await b.close()
asyncio.run(main())
