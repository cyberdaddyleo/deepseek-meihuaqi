// Requires an idle native Harness launched with localhost CDP 9224.
// import -> fully quit/reopen Harness -> boot -> fully quit/reopen.
// Personal settings are preserved; only this test's own preset is removed.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../scripts/paths.mjs';
const phase=process.argv[2]||'import';
const qaFile=join(root,'.local/native-video-v11-qa.json');mkdirSync(join(root,'.local'),{recursive:true});
const browser=await chromium.connectOverCDP('http://127.0.0.1:9224');
const page=browser.contexts()[0].pages().find(p=>p.url()==='dsh-app://app/');assert.ok(page);
const call=(endpoint,payload)=>page.evaluate(async({endpoint,payload})=>{const result=await(await fetch('/api/cyberdaddy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint,payload})})).json();if(!result.ok)throw Error(result.error.message);return result.value;},{endpoint,payload});
try{
 assert.equal(await page.title(),'DeepSeek Harness');await page.locator('[contenteditable=true]').first().waitFor();
 if(phase==='import'){
  const before=await call('get');writeFileSync(qaFile,JSON.stringify({before}),{mode:0o600});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.getByRole('button',{name:'账号菜单',exact:true}).click();await page.getByText('设置',{exact:true}).click();
  await page.getByRole('button',{name:'美化工具箱',exact:true}).click();await page.getByRole('tab',{name:'启动画面',exact:true}).click();
  await page.getByRole('button',{name:'添加启动画面',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'添加启动画面'});
  // A real 31 MiB clip exercises the authenticated native route above its old 7 MiB limit.
  await dialog.getByLabel('选择视频或图片').setInputFiles(join(root,'assets/cyberdad-startup.mp4'));
  await dialog.locator('.cb-upload-preview video').waitFor({timeout:45000});
  await dialog.getByLabel('名称',{exact:true}).fill('v1.1 自定义视频实测');
  const video=dialog.locator('video');await video.evaluate(v=>new Promise(r=>{v.addEventListener('seeked',r,{once:true});v.currentTime=3;}));
  await page.screenshot({path:process.env.CYBER_QA_SHOT||'/tmp/harness-v11-native-import.png',mask:[page.getByRole('button',{name:'账号菜单',exact:true})],maskColor:'#0b1725'});
  await dialog.getByRole('button',{name:'保存到我的预设'}).click();await dialog.waitFor({state:'detached',timeout:95000});
  const state=await call('get'),entry=state.custom.splash.find(p=>p.name==='v1.1 自定义视频实测');assert.ok(entry);assert.equal(entry.mediaType,'video');
  writeFileSync(qaFile,JSON.stringify({before,id:entry.id}),{mode:0o600});
  await page.locator(`[data-preview="${entry.id}"]`).click();
  await page.waitForFunction(()=>{const v=document.querySelector('.cb-video-preview video');return v?.currentTime>.2&&v.webkitAudioDecodedByteCount>0;},{},{timeout:35000});
  const preview=await page.locator('.cb-video-preview video').evaluate(v=>({src:v.src,duration:v.duration,audioBytes:v.webkitAudioDecodedByteCount,muted:v.muted}));
  assert.match(preview.src,/^blob:/);assert.equal(preview.muted,false);
  await page.getByRole('button',{name:'关闭预览',exact:true}).click();await page.locator(`[data-apply="${entry.id}"]`).click();
  assert.equal((await call('get')).splash,entry.id);await call('update',{enabled:true});
  await page.getByRole('button',{name:'关闭',exact:true}).click();assert.deepEqual(errors,[]);
  console.log('Native video import + decoded poster + >7 MiB authenticated upload + audio Blob preview + apply PASS',JSON.stringify(preview));
 }else if(phase==='boot'){
  const qa=JSON.parse(readFileSync(qaFile));
  await page.addInitScript(()=>{
   const trace=globalThis.__customVideoTrace={created:[],revoked:[]};const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
   URL.createObjectURL=b=>{const u=create(b);if(b.type.startsWith('video/'))trace.created.push(u);return u;};URL.revokeObjectURL=u=>{trace.revoked.push(u);revoke(u);};
   const observer=new MutationObserver(()=>{const v=document.querySelector('.cyber-boot-video');if(v&&!trace.seen){trace.seen=true;trace.preset=globalThis.__CYBERDADDY_APPEARANCE__?.splash;v.addEventListener('loadedmetadata',()=>trace.duration=v.duration);v.addEventListener('playing',()=>{trace.playedAt=performance.now();},{once:true});v.addEventListener('ended',()=>{trace.endedAt=performance.now();trace.end=v.currentTime;trace.audio=v.webkitAudioDecodedByteCount;trace.muted=v.muted;});}
   if(trace.seen&&!document.querySelector('[data-cyber-video-startup]')){trace.removedAt=performance.now();observer.disconnect();}});observer.observe(document,{childList:true,subtree:true});
  });
  await page.reload();await page.waitForFunction(()=>document.querySelector('.cyber-boot-video')?.currentTime>=2);
  await page.screenshot({path:'/tmp/harness-v11-native-boot.png'});
  await page.waitForFunction(()=>globalThis.__customVideoTrace?.removedAt,{},{timeout:30000});
  const trace=await page.evaluate(()=>globalThis.__customVideoTrace);
  assert.equal(trace.preset,qa.id);assert.ok(trace.endedAt&&trace.end>=trace.duration-.1&&trace.audio>0&&!trace.muted);assert.ok(trace.removedAt>=trace.endedAt);
  assert.deepEqual(trace.revoked,trace.created);await page.locator('[contenteditable=true]').first().waitFor();
  await call('update',qa.before);await call('remove-preset',{kind:'splash',id:qa.id});unlinkSync(qaFile);
  console.log('Native stored custom MP4 boot → full ended + audio → real editor + release + original preferences restored PASS',JSON.stringify(trace));
 }else throw Error('Use import or boot');
}finally{await browser.close();}
