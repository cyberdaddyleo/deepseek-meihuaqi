// Requires an idle native Harness launched with localhost CDP port 9224.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import {root} from '../scripts/paths.mjs';
const presetId=process.env.CYBER_TEST_NATIVE_PRESET||'whalegirl';
const expected={whalegirl:{base:'#08121f',size:[1280,720]},cyberdad:{base:'#071321',size:[1918,1080],fit:'contain'},geek:{base:'#050c12',size:[3184,1792],fit:'contain'}}[presetId];
assert.ok(expected,'Known built-in native theme required');
const browser=await chromium.connectOverCDP('http://127.0.0.1:9224');
const page=browser.contexts()[0].pages().find(p=>p.url()==='dsh-app://app/');
assert.ok(page,'Native dsh-app://app/ window required');
assert.equal(await page.title(),'DeepSeek Harness');
const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
const shot=async name=>{await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));return page.screenshot({path:join(root,'docs/screenshots/'+name+'.png'),mask:[page.getByRole('button',{name:'账号菜单',exact:true})],maskColor:'#0b1725'});};
const call=(endpoint,payload)=>page.evaluate(async({endpoint,payload})=>{const r=await(await fetch('/api/cyberdaddy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint,payload})})).json();if(!r.ok)throw Error(r.error.message);return r.value;},{endpoint,payload});
let originalInput;
let builtinVideoRequests=0;
const countVideoRequest=request=>{if(request.url().includes('/api/cyberdaddy/builtin?id='+presetId+'-startup'))builtinVideoRequests++;};
page.on('request',countVideoRequest);
try {
 await page.locator('[contenteditable=true]').first().waitFor();
 await page.addInitScript(()=>{
  const trace=globalThis.__whaleBoot={seen:false,cleaned:false,decoded:false,endedAt:null,endedTime:null,blobsCreated:[],blobsRevoked:[]};
  const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
  URL.createObjectURL=blob=>{const url=create(blob);if(blob.type.startsWith('video/'))trace.blobsCreated.push(url);return url;};
  URL.revokeObjectURL=url=>{if(trace.blobsCreated.includes(url))trace.blobsRevoked.push(url);return revoke(url);};
  new MutationObserver(()=>{
   const v=document.querySelector('.cyber-boot-video');
   if(v&&!trace.seen){
    trace.seen=true;trace.objectFit=getComputedStyle(v).objectFit;trace.muted=v.muted;trace.spinner=!!document.querySelector('[data-dsh-boot-spinner]');
    v.addEventListener('loadedmetadata',()=>{trace.src=v.currentSrc||v.getAttribute('src');trace.duration=v.duration;},{once:true});
    v.addEventListener('loadeddata',()=>trace.decoded=true,{once:true});
    // With audio as the master clock, background-window frame callbacks may
    // arrive later; the actual playing event proves where playback began.
    v.addEventListener('playing',()=>{trace.playingAt=performance.now();trace.playingTime=v.currentTime;},{once:true});
    v.addEventListener('ended',()=>{trace.endedAt=performance.now();trace.endedTime=v.currentTime;trace.audioBytes=v.webkitAudioDecodedByteCount;trace.muted=v.muted;trace.volume=v.volume;},{once:true});
    const frame=(_now,meta)=>{
     if(document.querySelector('[data-cyber-video-startup]')?.hasAttribute('data-frame')&&Number(getComputedStyle(v).opacity)>0){trace.frameAt=performance.now();trace.frameTime=meta.mediaTime;trace.visible=document.visibilityState;}
     else if(v.isConnected)v.requestVideoFrameCallback(frame);
    };
    v.requestVideoFrameCallback(frame);
   }
   if(trace.seen&&!trace.cleaned&&!document.querySelector('.cyber-boot-art')){trace.cleaned=true;trace.removedAt=performance.now();}
  }).observe(document,{childList:true,subtree:true});
 });
 await page.reload();await page.locator('[contenteditable=true]').first().waitFor();
 await page.waitForFunction(()=>globalThis.__whaleBoot.frameAt&&document.querySelector('[data-cyber-video-startup]'));
 await page.waitForFunction(()=>document.querySelector('.cyber-boot-video')?.currentTime>=2.5);
 // The opaque startup layer already covers private UI. Masking an underlying
 // account button here would paint an unrelated rectangle over the video.
 assert.equal(await page.locator('[data-cyber-video-startup]').count(),1);
 await page.screenshot({path:join(root,'docs/screenshots/'+presetId+'-native-boot-visible.png')});
 await page.waitForFunction(()=>globalThis.__whaleBoot.cleaned);
 const boot=await page.evaluate(()=>globalThis.__whaleBoot);
 assert.ok(boot.seen&&boot.cleaned&&boot.spinner&&!boot.muted&&boot.decoded);assert.equal(boot.visible,'visible');assert.equal(boot.volume,1);assert.ok(boot.audioBytes>0,'native startup decodes the real soundtrack without muting');if(expected.fit)assert.equal(boot.objectFit,expected.fit,'the full original video frame remains visible');assert.ok(boot.playingTime>=0&&boot.playingTime<.25,'native intro starts from the original opening');assert.ok(boot.endedAt!==null&&boot.endedTime>=boot.duration-.02,'native video reaches its real ended event');assert.ok(boot.duration>7&&boot.duration<7.2);assert.ok(boot.removedAt>=boot.endedAt&&boot.endedAt-boot.playingAt>=6600,'ready does not truncate the full original movie');assert.match(boot.src,/^blob:/);assert.ok(builtinVideoRequests>=1,'startup loads the real local MP4 through the production route');assert.deepEqual(boot.blobsCreated,[boot.src]);assert.deepEqual(boot.blobsRevoked,boot.blobsCreated,'native startup releases its seekable Blob URL');
 await page.waitForFunction(id=>document.documentElement.dataset.cyberTheme===id,presetId);
 const theme=await page.evaluate(()=>({base:getComputedStyle(document.body).getPropertyValue('--dsw-alias-bg-base').trim(),background:getComputedStyle(document.querySelector('[data-slot="root"] > div:has(> [data-shell-overlay])')).backgroundImage,composer:getComputedStyle(document.querySelector('[data-composer-card]')).backgroundImage}));
 assert.equal(theme.base,expected.base);assert.ok(theme.background.includes(presetId+'-wallpaper'));assert.match(theme.composer,/gradient/);
 if(presetId==='cyberdad'){const headline=await page.locator('div:has(> span > [data-slot="conversation.hero.brand.mark"])').evaluate(el=>getComputedStyle(el).backgroundColor);assert.equal(headline,'rgba(7, 19, 33, 0.86)','real headline remains readable over the white character');}

 await shot(presetId+'-native-home');
 const input=page.locator('[contenteditable=true]').first(), node=await input.elementHandle();originalInput=await input.innerText();await input.fill(originalInput+'美化换肤验证草稿');const draft=await input.innerText();
 for(const theme of ['forest','whalegirl',presetId]){await call('update',{theme});await page.waitForFunction(t=>document.documentElement.dataset.cyberTheme===(['whalegirl','cyberdad','geek'].includes(t)?t:undefined),theme);assert.equal(await input.innerText(),draft);assert.ok(await node.evaluate(e=>e.isConnected));}
 await input.fill(originalInput);originalInput=undefined;
 await page.getByRole('button',{name:'账号菜单',exact:true}).click();await shot(presetId+'-native-menu');await page.getByText('设置',{exact:true}).click();await page.getByRole('button',{name:'美化工具箱',exact:true}).click();
 await page.waitForFunction(()=>[...document.querySelectorAll('.cb-toolbox img')].every(i=>i.complete&&i.naturalWidth));await shot(presetId+'-native-toolbox');
 await page.getByRole('tab',{name:'启动画面',exact:true}).click();await page.locator(`[data-preview="${presetId}"]`).click();const video=page.locator('.cb-video-preview video');await video.waitFor();await page.waitForFunction(()=>document.querySelector('.cb-video-preview video')?.readyState>=2);
 await page.waitForFunction(()=>{const v=document.querySelector('.cb-video-preview video');return v.currentTime>.2&&v.webkitAudioDecodedByteCount>0;});const media=await video.evaluate(v=>({w:v.videoWidth,h:v.videoHeight,duration:v.duration,muted:v.muted,volume:v.volume,audioBytes:v.webkitAudioDecodedByteCount}));assert.deepEqual([media.w,media.h],expected.size);assert.equal(media.muted,false);assert.equal(media.volume,1);assert.ok(media.audioBytes>0);await video.evaluate(v=>new Promise(resolve=>{v.pause();v.addEventListener('seeked',resolve,{once:true});v.currentTime=3;}));await shot(presetId+'-video-preview');
 await page.getByRole('button',{name:'关闭预览',exact:true}).click();assert.equal(await video.count(),0);
 await page.getByRole('tab',{name:'桌面宠物',exact:true}).click();await shot(presetId+'-native-pet-settings');
 await page.getByRole('button',{name:'关闭',exact:true}).click();
 await call('update',{enabled:false});await page.waitForFunction(()=>!document.documentElement.dataset.cyberTheme);await call('update',{enabled:true});await page.waitForFunction(id=>document.documentElement.dataset.cyberTheme===id,presetId);
 assert.deepEqual(pageErrors,[],'no renderer errors during the native interaction flow');
 console.log('Native '+presetId+' boot, cleanup, background/composer/theme tokens, same input/draft, menu, toolbox video decoding, independent settings and disable/enable PASS',JSON.stringify({boot,theme,media}));
} finally {
 page.off('request',countVideoRequest);
 if(originalInput!==undefined)await page.locator('[contenteditable=true]').first().fill(originalInput);
 await browser.close();
}
