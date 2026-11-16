import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        ctx=await b.new_context(viewport={'width':390,'height':780},device_scale_factor=2,has_touch=True,is_mobile=True)
        await ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith('file:') else r.abort())
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/work/opening-drill.html')
        setp="""(off)=>{const d=new Date();const t=Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000);const lv={},due={},iv={};[0,2,4,6,8,10,12,14].forEach(p=>{lv[p]=2;due[p]=t+off;iv[p]=1});localStorage.setItem('opening-drill-v1',JSON.stringify({lv:{'london-w':lv},miss:{},learned:{'london-w':true},done:{},due:{'london-w':due},iv:{'london-w':iv}}))}"""
        get="()=>{const P=JSON.parse(localStorage.getItem('opening-drill-v1'));const d=new Date();const t=Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000);return [Object.values(P.iv['london-w']).join(','),Object.values(P.due['london-w']).map(x=>x-t).join(',')]}"
        async def answer_all():
            while True:
                await pg.wait_for_timeout(100)
                if await pg.locator('.done').count(): break
                if await pg.locator('#next').count(): await pg.locator('#next').click(); continue
                opt=pg.locator('[data-opt]:not([disabled])')
                if await opt.count():
                    # pick the right option
                    await pg.evaluate("""()=>{const q=document.querySelector('.annot.quiz .ask').textContent;for(const L of LINES)for(const m of L.moves)if(m.why&&m.why.q===q){[...document.querySelectorAll('[data-opt]')].find(b=>+b.dataset.opt===m.why.a).click()}}"""); continue
                info=await pg.evaluate("""()=>{const t=document.querySelector('.annot .who').textContent;const L=LINES.find(l=>t.startsWith(l.title+' · '));const n=parseInt(t.split(' · ')[1]);const ply=(n-1)*2+(L.side==='w'?0:1);const g=new Chess();let r;for(let i=0;i<=ply;i++)r=g.move(L.moves[i].san);return {from:r.from,to:r.to}}""")
                await pg.locator(f'#board [data-sq="{info["from"]}"]').click(); await pg.locator(f'#board [data-sq="{info["to"]}"]').click()
        await pg.evaluate(setp,2); await pg.reload(); await pg.wait_for_timeout(200)
        print('not due:', (await pg.locator('.homework').first.inner_text()).replace('\n',' | '))
        await pg.screenshot(path='/home/claude/work/s_done.png')
        await pg.locator('#startEarly').click(); await answer_all(); await pg.wait_for_timeout(800)
        print('after early review (should be unchanged):', await pg.evaluate(get))
        await pg.evaluate(setp,0); await pg.reload(); await pg.wait_for_timeout(200)
        await pg.locator('#startReview').click(); await answer_all(); await pg.wait_for_timeout(800)
        print('after due review (iv 1->3):', await pg.evaluate(get))
        await pg.locator('#toHome').click(); await pg.wait_for_timeout(100)
        print('home:', (await pg.locator('.homework').first.inner_text()).replace('\n',' | '))
        print('errs',errs); await b.close()
asyncio.run(main())
