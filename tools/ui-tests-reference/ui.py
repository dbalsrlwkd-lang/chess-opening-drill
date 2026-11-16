import asyncio, json, sys
from playwright.async_api import async_playwright
URL='file:///home/claude/work/opening-drill.html'

async def openline(pg, lid):
    k = await pg.evaluate("(id)=>{const m=LINES.find(l=>l.id===id).moves[0].san;return ['e4','d4','c4','Nf3'].includes(m)?m:'etc'}", lid)
    if not await pg.locator('[data-first]').count():
        await pg.locator('#nav-home').click()
    await pg.locator(f'[data-first="{k}"]').click()
    await pg.locator(f'[data-line="{lid}"]').click()

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        ctx=await b.new_context(viewport={'width':390,'height':780},device_scale_factor=2,has_touch=True,is_mobile=True)
        await ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
        await ctx.add_init_script("setInterval(()=>{const b=document.getElementById('oppOk'); if(b) b.click(); const q=document.querySelector('.annot.quiz .who'); if(q&&q.textContent.includes('오프닝 이후')){const o=document.querySelector('[data-opt]:not([disabled])'); if(o) o.click(); else {const k=document.getElementById('quizOk'); if(k) k.click();}}},120)")
        pg=await ctx.new_page(); errs=[]
        pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_FAILED' not in m.text and 'net::' not in m.text else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(300)
        print('cards', await pg.locator('.ftile').count())
        print('homework:', (await pg.locator('.homework').first.inner_text()).replace('\n',' | '))
        await pg.screenshot(path='/home/claude/work/s_home.png', full_page=True)
        async def moves(lid):
            return await pg.evaluate("""(id)=>{const L=LINES.find(l=>l.id===id);const g=new Chess();return L.moves.map((m,i)=>{const r=g.move(m.san);return {from:r.from,to:r.to,mine:(i%2===0?'w':'b')===L.side}})}""", lid)
        async def tap(sq):
            await pg.locator(f'#board [data-sq="{sq}"]').click()
        async def play_line(lid, mode):
            await openline(pg, lid)
            await pg.locator('#learn' if mode=='learn' else '#practice').click()
            for m in await moves(lid):
                if not m['mine']: continue
                # wait until it's my turn
                for _ in range(80):
                    if await pg.locator('#quizOk').count(): await pg.locator('#quizOk').click()
                    opt=pg.locator('[data-opt]:not([disabled])')
                    if await opt.count(): await opt.first.click(); continue
                    if await pg.locator('#cont').count(): await pg.locator('#cont').click()
                    ok=await pg.evaluate("()=>document.querySelector('.turn').textContent.includes('내 차례') && !document.querySelector('.annot.ok,.annot.bad,.annot.alt,.annot.quiz')")
                    if ok: break
                    await pg.wait_for_timeout(120)
                await tap(m['from']); sel=await pg.evaluate("()=>{const e=document.querySelector('#board .sel');return e&&e.dataset.sq}"); await tap(m['to']); await pg.wait_for_timeout(60)
                if sel!=m['from']: print('  SEL MISMATCH want',m['from'],'got',sel)
            try:
                await pg.wait_for_selector('.done', timeout=8000)
            except Exception:
                await pg.screenshot(path='/home/claude/work/s_dbg.png', full_page=True); print('STUCK', (await pg.locator('.sheetcol').inner_text())[:400]); raise
            txt=(await pg.locator('.done h2').inner_text())
            await pg.locator('#toHome').click(); return txt
        for lid in ['ruy-w','french-b','london-w']:
            print(lid, await play_line(lid,'learn'))
        print('homework:', (await pg.locator('.homework').first.inner_text()).replace('\n',' | '))
        await pg.screenshot(path='/home/claude/work/s_home2.png')
        # review: answer everything; first item deliberately wrong when it's a move question
        await pg.locator('#startReview').click(); wrong_done=False; n=0
        while True:
            await pg.wait_for_timeout(120)
            if await pg.locator('.done').count(): break
            if await pg.locator('#next').count(): await pg.locator('#next').click(); n+=1; continue
            opt=pg.locator('[data-opt]:not([disabled])')
            if await opt.count(): await opt.first.click(); continue
            if await pg.locator('#retry').count(): await pg.locator('#retry').click(); continue
            st=await pg.evaluate("""()=>{const P=JSON.parse(localStorage.getItem('opening-drill-v1')||'{}');return 1}""")
            # find expected move from scoresheet state via page helper
            info=await pg.evaluate("""()=>{const t=document.querySelector('.annot .who').textContent;const L=LINES.find(l=>t.startsWith(l.title+' · '));const n=parseInt(t.split(' · ')[1]);const ply=(n-1)*2+(L.side==='w'?0:1);const g=new Chess();let r;for(let i=0;i<=ply;i++)r=g.move(L.moves[i].san);const g2=new Chess();for(let i=0;i<ply;i++)g2.move(L.moves[i].san);const other=g2.moves({verbose:true}).find(x=>x.san!==r.san);return {from:r.from,to:r.to,of:other.from,ot:other.to,id:L.id,ply}}""")
            if not wrong_done:
                await tap(info['of']); await tap(info['ot']); wrong_done=True; wrongitem=(info['id'],info['ply'])
                await pg.wait_for_timeout(100); await pg.screenshot(path='/home/claude/work/s_wrong.png'); continue
            await tap(info['from']); await tap(info['to'])
            await pg.wait_for_timeout(80)
            if n==2: await pg.screenshot(path='/home/claude/work/s_ok.png')
        print('review done:', (await pg.locator('.done').inner_text()).replace('\n',' | '), '| bar:', (await pg.locator('.controls.bar').inner_text()).replace('\n',' | '))
        await pg.wait_for_timeout(800)
        P=json.loads(await pg.evaluate("localStorage.getItem('opening-drill-v1')"))
        t=await pg.evaluate("(()=>{const d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000)})()")
        print('wrong item', wrongitem, 'iv', P['iv'][wrongitem[0]][str(wrongitem[1])], 'due-today', P['due'][wrongitem[0]][str(wrongitem[1])]-t)
        print('ivs', {k:sorted(set(v.values())) for k,v in P['iv'].items()})
        await pg.locator('#toHome, #more').first.click() if False else None
        await pg.locator('#toHome').click(); await pg.locator('#nav-rec').click(); await pg.wait_for_timeout(100)
        await pg.screenshot(path='/home/claude/work/s_rec.png', full_page=True)
        # time travel: pretend 3 days later -> shift all dues back
        await pg.evaluate("""()=>{const P=JSON.parse(localStorage.getItem('opening-drill-v1'));for(const id in P.due)for(const p in P.due[id])P.due[id][p]-=3;localStorage.setItem('opening-drill-v1',JSON.stringify(P))}""")
        await pg.reload(); await pg.wait_for_timeout(200)
        print('after +3 days:', (await pg.locator('.homework').first.inner_text()).replace('\n',' | '))
        # old-format data migration
        await pg.evaluate("""()=>{localStorage.setItem('opening-drill-v1',JSON.stringify({lv:{'italian-w':{0:3,2:2,4:1}},miss:{},learned:{'italian-w':true},done:{'italian-w':2}}))}""")
        await pg.reload(); await pg.wait_for_timeout(200)
        print('old data:', (await pg.locator('.homework').first.inner_text()).replace('\n',' | '))
        # practice mode on a new line + desktop layout
        print('practice', await play_line('sicilian-b','learn'), await play_line('sicilian-b','practice'))
        await pg.set_viewport_size({'width':1100,'height':800})
        await openline(pg, 'qg-w'); await pg.screenshot(path='/home/claude/work/s_intro.png')
        print('ERRORS', errs)
        await b.close()
asyncio.run(main())
