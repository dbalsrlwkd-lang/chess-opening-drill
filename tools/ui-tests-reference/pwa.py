import asyncio, json
from playwright.async_api import async_playwright

async def openline(pg, lid):
    k = await pg.evaluate("(id)=>{const m=LINES.find(l=>l.id===id).moves[0].san;return ['e4','d4','c4','Nf3'].includes(m)?m:'etc'}", lid)
    if not await pg.locator('[data-first]').count():
        await pg.locator('#nav-home').click()
    await pg.locator(f'[data-first="{k}"]').click()
    await pg.locator(f'[data-line="{lid}"]').click()

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--no-proxy-server'])
        ctx=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://localhost:8765/chess/'); await pg.wait_for_timeout(1500)
        print('sw:', await pg.evaluate("navigator.serviceWorker.ready.then(r=>r.active&&r.active.state)"))
        print('cached:', await pg.evaluate("caches.keys().then(async ks=>{const c=await caches.open(ks[0]);return (await c.keys()).map(r=>new URL(r.url).pathname)})"))
        man=await pg.evaluate("fetch(document.querySelector('link[rel=manifest]').href).then(r=>r.json())"); print('manifest ok:', man['name'], [i['sizes'] for i in man['icons']])
        await pg.evaluate("localStorage.setItem('probe','1')")
        await ctx.set_offline(True)
        await pg.reload(); await pg.wait_for_timeout(600)
        print('offline entries:', await pg.locator('.ftile').count(), 'probe', await pg.evaluate("localStorage.getItem('probe')"))
        await openline(pg, 'london-w'); await pg.locator('#learn').click(); await pg.wait_for_timeout(300)
        print('offline board squares:', await pg.locator('#board .sq').count(), 'errs', errs)
        await b.close()
asyncio.run(main())
