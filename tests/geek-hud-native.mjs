// An idle native Harness on localhost CDP 9224; no model calls or test chats.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {root} from '../scripts/paths.mjs';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
const page = browser.contexts()[0].pages().find(p => p.url() === 'dsh-app://app/');
assert.ok(page, 'Real native Harness required');
page.setDefaultTimeout(15000);
const errors = []; page.on('pageerror', e => errors.push(e.message));
const call = (endpoint, payload) => page.evaluate(async ({endpoint, payload}) => {
  const r = await (await fetch('/api/cyberdaddy', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({endpoint,payload})})).json();
  if (!r.ok) throw Error(r.error.message); return r.value;
}, {endpoint,payload});
const frame = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const visiblePanels = () => page.locator('.cb-geek-panel:visible').count();
const shot = async name => { const size=await page.evaluate(()=>({w:innerWidth,h:innerHeight})); await page.mouse.move(size.w-2,size.h-2); await frame(); return page.screenshot({path:join(root,'docs/screenshots',name+'.png'),mask:[page.getByRole('button',{name:'账号菜单',exact:true})],maskColor:'#0b1725'}); };
const cdp = await page.context().newCDPSession(page);
let original, draft, input, inputNode, settingsOpen=false, phaseFixture=false;
try {
  await page.locator('[contenteditable=true]').first().waitFor({timeout:60000});
  await page.locator('.cyber-boot-art').waitFor({state:'detached',timeout:60000});
  original = await call('get');
  assert.ok(await page.locator('[data-slot="main"] [data-content-phase="hero"]').count(), 'Start in an idle new conversation');
  input = page.locator('[contenteditable=true]').first(); draft = await input.innerText(); inputNode = await input.elementHandle();
  await input.fill(''); await call('update',{enabled:true,theme:'geek'});
  await page.waitForFunction(() => document.documentElement.dataset.cyberTheme === 'geek');
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:1280,height:820,deviceScaleFactor:2,mobile:false});
  await frame(); assert.equal(await visiblePanels(),3,'three real native HUD panels visible');
  const geometry = await page.evaluate(() => {
    const rect = s => document.querySelector(s).getBoundingClientRect();
    const input = rect('[data-composer-card]'), title = rect('div:has(> span > [data-slot="conversation.hero.brand.mark"])');
    const overlaps = (a,b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    const hud = document.querySelector('.cb-geek-hud'), main = rect('[data-slot="main"] [data-content-phase="hero"]');
    return {ariaHidden:hud.getAttribute('aria-hidden'),inert:hud.inert,pointer:getComputedStyle(hud).pointerEvents,anchorDelta:Math.abs(hud.getBoundingClientRect().left-main.left),panels:[...document.querySelectorAll('.cb-geek-panel')].map(p => {
      const r=p.getBoundingClientRect(), hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      return {overlap:overlaps(r,input)||overlaps(r,title),inside:r.left>=main.left&&r.right<=main.right&&r.top>=main.top&&r.bottom<=main.bottom,clickThrough:!hit?.closest('.cb-geek-hud')};
    })};
  });
  assert.equal(geometry.ariaHidden,'true'); assert.equal(geometry.inert,true); assert.equal(geometry.pointer,'none'); assert.ok(geometry.anchorDelta<1);
  assert.ok(geometry.panels.every(p=>!p.overlap&&p.inside&&p.clickThrough));
  await shot('geek-hud-native-home-v081');
  await input.fill('极客样式检查：保留同一个草稿和输入框。'); const checkDraft=await input.innerText();
  for (const patch of [{theme:'forest'},{theme:'geek'},{enabled:false},{enabled:true}]) {
    await call('update',patch);
    await page.waitForFunction(wanted => (document.documentElement.dataset.cyberTheme==='geek')===wanted, patch.theme==='geek'||patch.enabled===true);
    await frame(); assert.equal(await input.innerText(),checkDraft); assert.ok(await inputNode.evaluate(n=>n.isConnected));
    assert.equal(await page.locator('.cb-geek-hud').isVisible(),patch.theme==='geek'||patch.enabled===true);
  }
  await input.click(); assert.ok(await input.evaluate(n=>n===document.activeElement||n.contains(document.activeElement)),'real input remains clickable');
  await input.fill(Array(20).fill('长草稿布局验证，不发送任务。').join('\n')); await frame();
  assert.equal(await visiblePanels(),0,'growing draft hides panels with insufficient clearance');
  await shot('geek-hud-long-draft-v081'); await input.fill(''); await frame(); assert.equal(await visiblePanels(),3);
  // Lifecycle style fixture on the actual native container; does not create
  // or pretend to execute a real task. Restore the original attribute at once.
  phaseFixture=true;
  await page.evaluate(() => document.querySelector('[data-slot="main"] [data-content-phase="hero"]').dataset.contentPhase='active');
  assert.equal(await page.locator('.cb-geek-hud').isVisible(),false,'active-phase styling hides decoration');
  await page.evaluate(() => document.querySelector('[data-slot="main"] [data-content-phase="active"]').dataset.contentPhase='hero'); phaseFixture=false;
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:900,height:720,deviceScaleFactor:2,mobile:false}); await frame();
  assert.equal(await visiblePanels(),0); assert.ok(await input.isVisible()); await shot('geek-hud-narrow-v081');
  await cdp.send('Emulation.clearDeviceMetricsOverride'); await frame();
  await page.getByRole('button',{name:'收起侧边栏',exact:true}).click(); await page.waitForFunction(()=>!!document.querySelector('[data-sidebar-collapsed="true"]')); await frame();
  const delta = await page.evaluate(()=>Math.abs(document.querySelector('.cb-geek-hud').getBoundingClientRect().left-document.querySelector('[data-slot="main"] [data-content-phase="hero"]').getBoundingClientRect().left));
  assert.ok(delta<2,'HUD follows actual main width when sidebar collapses');
  await page.getByRole('button',{name:'打开侧边栏',exact:true}).last().click(); await page.waitForFunction(()=>!document.querySelector('[data-sidebar-collapsed="true"]'));
  await page.getByRole('button',{name:'账号菜单',exact:true}).click(); await shot('geek-hud-native-menu-v081');
  await page.getByText('设置',{exact:true}).click(); settingsOpen=true;
  await page.getByRole('button',{name:'美化工具箱',exact:true}).click();
  assert.equal(await page.locator('.cb-geek-hud').isVisible(),false,'decorations stay out of settings');
  await page.getByRole('tab',{name:'界面皮肤',exact:true}).click();
  await page.locator('[data-preset="geek"] .cb-geek-mini').waitFor();
  await page.waitForFunction(()=>[...document.querySelectorAll('.cb-toolbox img')].every(i=>i.complete&&i.naturalWidth));
  await shot('geek-hud-toolbox-v081');
  await page.getByRole('button',{name:'关闭',exact:true}).click(); settingsOpen=false;
  assert.deepEqual(errors,[]);
  console.log('Native geek HUD PASS',JSON.stringify({geometry,longDraft:'hidden',narrowViewport:'900x720 hidden',sidebarAnchor:'follows',draft:'preserved',settings:'hidden, preview present',activePhase:'CSS fixture hidden',pageErrors:errors}));
} finally {
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  if (settingsOpen) await page.getByRole('button',{name:'关闭',exact:true}).click();
  if (await page.getByRole('button',{name:'打开侧边栏',exact:true}).last().isVisible()) await page.getByRole('button',{name:'打开侧边栏',exact:true}).last().click();
  if (phaseFixture) await page.evaluate(()=>{document.querySelector('[data-slot="main"] [data-content-phase="active"]').dataset.contentPhase='hero';});
  if (draft!==undefined) await input.fill(draft);
  if (original) await call('update',{enabled:original.enabled,theme:original.theme});
  await cdp.detach(); await browser.close();
}
