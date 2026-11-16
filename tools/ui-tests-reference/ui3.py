import asyncio
from playwright.async_api import async_playwright
W='/home/claude/work/'

async def openline(pg, lid):
    k = await pg.evaluate("(id)=>{const m=LINES.find(l=>l.id===id).moves[0].san;return ['e4','d4','c4','Nf3'].includes(m)?m:'etc'}", lid)
    if not await pg.locator('[data-first]').count():
        await pg.locator('#nav-home').click()
    await pg.locator(f'[data-first="{k}"]').click()
    await pg.locator(f'[data-line="{lid}"]').click()

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,is_mobile=True)
        await ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
        await ctx.add_init_script("setInterval(()=>{const b=document.getElementById('oppOk'); if(b) b.click(); const q=document.querySelector('.annot.quiz .who'); if(q&&q.textContent.includes('오프닝 이후')){const o=document.querySelector('[data-opt]:not([disabled])'); if(o) o.click(); else {const k=document.getElementById('quizOk'); if(k) k.click();}}},120)")
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://'+W+'opening-drill.html')
        async def moves(lid):
            return await pg.evaluate("""(id)=>{const L=LINES.find(l=>l.id===id);const g=new Chess();return L.moves.map((m,i)=>{const r=g.move(m.san);return {from:r.from,to:r.to,mine:(i%2===0?'w':'b')===L.side}})}""", lid)
        async def ready():
            for _ in range(100):
                if await pg.locator('#quizOk').count(): await pg.locator('#quizOk').click()
                opt=pg.locator('[data-opt]:not([disabled])')
                if await opt.count(): await opt.first.click(); continue
                if await pg.locator('#cont').count(): await pg.locator('#cont').click()
                if await pg.evaluate("()=>document.querySelector('.turn').textContent.includes('내 차례') && !document.querySelector('.annot.ok,.annot.bad,.annot.alt,.annot.quiz')"): return
                await pg.wait_for_timeout(100)
        async def center(sq):
            bb=await pg.locator(f'#board [data-sq="{sq}"]').bounding_box(); return bb['x']+bb['width']/2, bb['y']+bb['height']/2
        for lid in ['evans-w','trap-elephant','kid-b','trap-englund']:
            await openline(pg, lid); await pg.locator('#learn').click()
            for i,m in enumerate(await moves(lid)):
                if not m['mine']: continue
                await ready()
                if i % 4 < 2:   # drag with the mouse
                    x0,y0=await center(m['from']); x1,y1=await center(m['to'])
                    await pg.mouse.move(x0,y0); await pg.mouse.down(); await pg.mouse.move((x0+x1)/2,(y0+y1)/2, steps=3)
                    if lid=='evans-w' and i==0: await pg.screenshot(path=W+'n_drag.png')
                    await pg.mouse.move(x1,y1, steps=3); await pg.mouse.up()
                else:
                    await pg.locator(f'#board [data-sq="{m["from"]}"]').click(); await pg.locator(f'#board [data-sq="{m["to"]}"]').click()
                await pg.wait_for_timeout(80)
            await pg.wait_for_selector('.done', timeout=8000)
            print(lid, await pg.locator('.done h2').inner_text(), '| ghosts left:', await pg.locator('.pc.dragging').count())
            if lid=='kid-b': await pg.screenshot(path=W+'n_done.png')
            await pg.locator('#toHome').click()
        print('errs',errs); await b.close()
asyncio.run(main())
