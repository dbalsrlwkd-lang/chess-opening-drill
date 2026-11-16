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
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://'+W+'opening-drill.html'); await pg.wait_for_timeout(200)
        await pg.screenshot(path=W+'p_home.png')
        await openline(pg, 'italian-w'); await pg.locator('#learn').click(); await pg.wait_for_timeout(300)
        await pg.locator('#board [data-sq="e2"]').click(); await pg.locator('#board [data-sq="e4"]').click()
        await pg.wait_for_timeout(4200)
        print('paused:', await pg.locator('#oppOk').count(), '|', (await pg.locator('.annot').inner_text()).replace('\n',' | ')[:160])
        await pg.screenshot(path=W+'p_pause.png')
        await pg.locator('#oppOk').click(); await pg.wait_for_timeout(200)
        print('after 계속:', (await pg.locator('.annot .ask').inner_text()))
        # tap-board-to-continue + auto toggle
        await pg.locator('#board [data-sq="g1"]').click(); await pg.locator('#board [data-sq="f3"]').click(); await pg.wait_for_timeout(4200)
        await pg.locator('#board [data-sq="a8"]').click(); await pg.wait_for_timeout(200)
        print('tap continues:', await pg.locator('#oppOk').count()==0, (await pg.locator('.annot .ask').inner_text()))
        await pg.locator('#tglAuto').click(); await pg.wait_for_timeout(100)
        await pg.locator('#board [data-sq="f1"]').click(); await pg.locator('#board [data-sq="c4"]').click(); await pg.wait_for_timeout(4200)
        print('auto on -> no pause:', await pg.locator('#oppOk').count()==0, (await pg.locator('.annot .ask').inner_text()))
        await pg.locator('#mback').click(); await pg.locator('.back').click(); await pg.locator('#nav-rec').click(); await pg.wait_for_timeout(200)
        await pg.locator('.setbox').scroll_into_view_if_needed(); await pg.screenshot(path=W+'p_set.png')
        for k in ['simple','pixel','classic']:
            await pg.locator(f'[data-pieces="{k}"]').click(); await pg.wait_for_timeout(80)
        await pg.locator('#nav-home').click(); await openline(pg, 'sicilian-b'); await pg.locator('#practice').click(); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=W+'p_3d.png')
        await pg.locator('#mback').click(); await pg.locator('.back').click(); await pg.locator('#nav-rec').click()
        await pg.locator('#set3d').click(); await pg.wait_for_timeout(80)
        print('p3d class:', await pg.evaluate("document.documentElement.classList.contains('p3d')"), 'pref', await pg.evaluate("localStorage.getItem('opening-drill-pref')"))
        await pg.locator('#nav-home').click(); await openline(pg, 'sicilian-b'); await pg.locator('#practice').click(); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=W+'p_flat.png')
        print('errs',errs); await b.close()
asyncio.run(main())
