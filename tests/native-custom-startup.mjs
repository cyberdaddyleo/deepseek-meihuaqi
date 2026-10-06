// Run after test:native-custom AND a full app restart, before cleanup. The pinned
// native app caches its boot injection table for each main-process lifetime.
// This observes a real native-window load using that freshly collected table,
// real boot without adding a delay or changing the upstream loading DOM.
import {chromium} from 'playwright';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {root} from '../scripts/paths.mjs';
const qa=JSON.parse(readFileSync(join(root,'.local/custom-native-qa.json'),'utf8'));
const browser=await chromium.connectOverCDP('http://127.0.0.1:9224');
try{
 const page=browser.contexts()[0].pages().find(p=>p.url()==='dsh-app://app/');assert.ok(page);
 await page.addInitScript(()=>{
  const trace=globalThis.__customBootTrace={seen:false,loaded:false,cleaned:false};
  const watch=new MutationObserver(()=>{
   const image=document.querySelector('.cyber-boot-art .scene-art');
   if(image&&!trace.seen){trace.seen=true;trace.src=image.getAttribute('src');trace.spinner=!!document.querySelector('[data-dsh-boot-spinner]');trace.background=getComputedStyle(document.querySelector('[data-dsh-boot]')).backgroundColor;image.addEventListener('load',()=>{trace.loaded=true;trace.width=image.naturalWidth;},{once:true});}
   if(trace.seen&&!document.querySelector('.cyber-boot-art')){trace.cleaned=true;watch.disconnect();}
  });watch.observe(document,{subtree:true,childList:true});
 });
 await page.reload();await page.locator('[contenteditable=true]').first().waitFor();
 const trace=await page.evaluate(()=>globalThis.__customBootTrace);
 assert.equal(trace.seen,true);assert.equal(trace.spinner,true);assert.equal(trace.src,'/api/cyberdaddy/asset?id='+qa.ids.splash);assert.equal(trace.background,'rgb(237, 241, 255)');assert.equal(trace.cleaned,true);
 // Very fast boots may finish before decorative image decoding; they must never
 // be held back. Asset decoding is separately asserted by native UI preview.
 assert.equal(await page.locator('.cyber-boot-art').count(),0);
 console.log('Native custom startup → real editor, parallel loading and resource cleanup: PASS',trace);
}finally{await browser.close();}
