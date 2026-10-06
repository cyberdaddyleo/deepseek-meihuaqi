import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {root} from '../scripts/paths.mjs';
const browser=await chromium.launch({headless:true});
async function assertSkipIcon(page) {
 const button=page.getByRole('button',{name:'跳过动画',exact:true});
 const actual=await button.evaluate(el=>{const icon=el.querySelector('svg'),bounds=el.getBoundingClientRect(),iconBounds=icon?.getBoundingClientRect();return{text:el.textContent.trim(),label:el.getAttribute('aria-label'),icons:el.querySelectorAll('svg').length,size:[bounds.width,bounds.height],iconSize:iconBounds&&[iconBounds.width,iconBounds.height]};});
 assert.deepEqual(actual,{text:'',label:'跳过动画',icons:1,size:[30,30],iconSize:[16,16]},'SVG/image startup uses the same compact accessible skip icon');
}
try {
 for(const action of ['ready','skip','failure','off']) {
  const page=await browser.newPage();
  // Structure inspected from the pinned native BootPage. This is a test
  // fixture, never a replacement Harness interface or a delivered screenshot.
  await page.setContent('<div data-dsh-boot><div>HARNESS<div data-dsh-boot-spinner></div><p>Loading plugins…</p></div></div>');
  await page.evaluate(off=>globalThis.__CYBERDADDY_APPEARANCE__={enabled:!off,splash:'stars'},action==='off');
  await page.addScriptTag({path:join(root,'lib/startup.js')});
  if(action==='off')assert.equal(await page.locator('.cyber-boot-art').count(),0);
  else {
   await page.locator('.cyber-boot-art').waitFor();
   await assertSkipIcon(page);
   if(action==='ready')await page.locator('[data-dsh-boot]').evaluate(el=>el.remove());
   if(action==='skip'){await page.getByRole('button',{name:'跳过动画',exact:true}).click();assert.equal(await page.locator('[data-dsh-boot-spinner]').count(),1);}
   if(action==='failure')await page.locator('[data-dsh-boot-spinner]').evaluate(el=>el.replaceWith(Object.assign(document.createElement('p'),{textContent:'Failed to load plugins: TEST_ERROR'})));
   await page.waitForFunction(()=>!document.querySelector('.cyber-boot-art'));
   if(action==='failure')assert.ok(await page.getByText('Failed to load plugins: TEST_ERROR').isVisible());
   assert.equal(await page.locator('[data-cyber-boot]').count(),0);
  }
  await page.close();console.log('startup state:',action,'PASS');
 }
 const custom=await browser.newPage();
 const id='custom-11111111-1111-1111-1111-111111111111';
 await custom.route('http://startup.test/**',route=>route.fulfill({contentType:route.request().url().includes('/api/')?'image/svg+xml':'text/html',body:route.request().url().includes('/api/')?'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="20" fill="#417bd6"/></svg>':'<div data-dsh-boot><div>HARNESS<div data-dsh-boot-spinner></div></div></div>'}));
 await custom.goto('http://startup.test/');
 await custom.evaluate(id=>globalThis.__CYBERDADDY_APPEARANCE__={enabled:true,splash:id,custom:{splash:[{id,name:'自定义星云',scene:'stars',background:'#f3e7ff',custom:true,asset:'custom-assets/'+id+'.svg'}]}},id);
 await custom.addScriptTag({path:join(root,'lib/startup.js')});
 assert.equal(await custom.locator('.scene-art').getAttribute('src'),'/api/cyberdaddy/asset?id='+id);
 await custom.waitForFunction(()=>document.querySelector('.scene-art').naturalWidth===64);
 await assertSkipIcon(custom);
 assert.equal(await custom.locator('[data-dsh-boot]').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(243, 231, 255)');
 await custom.locator('[data-dsh-boot]').evaluate(el=>el.remove());
 await custom.waitForFunction(()=>!document.querySelector('.cyber-boot-art'));
 await custom.close();console.log('startup custom image and cleanup: PASS');
}finally{await browser.close();}
await import('./video-startup.mjs');
