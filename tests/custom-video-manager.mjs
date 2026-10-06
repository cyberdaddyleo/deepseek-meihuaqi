// Real shared form + disk Store. Does not substitute a fake Harness chat page.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Store } from '../desktop/settings.mjs';
import { customAssetId } from '../src/catalog.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const dir=await mkdtemp(join(tmpdir(),'harness-video-import-'));
const store=new Store(dir);
const html=`<!doctype html><meta charset="utf-8"><title>启动视频导入测试</title><link rel="stylesheet" href="/src/manager.css"><link rel="stylesheet" href="/src/scenes.css"><main id="toolbox"></main><script type="module">
import {mountManager} from '/src/manager.mjs';import {customAssetId} from '/src/catalog.mjs';
window.blobs={created:[],revoked:[]};const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
URL.createObjectURL=b=>{const u=create(b);window.blobs.created.push(u);return u;};URL.revokeObjectURL=u=>{window.blobs.revoked.push(u);return revoke(u);};
const call=async(endpoint,payload)=>{const r=await(await fetch('/api',{method:'POST',body:JSON.stringify({endpoint,payload})})).json();if(!r.ok)throw Error(r.error);return r.value;};
window.readState=()=>call('get');
mountManager(document.querySelector('#toolbox'),{get:()=>call('get'),onChange:()=>()=>{},update:p=>call('update',p),addPreset:async p=>{if(window.holdSave)await new Promise(r=>window.releaseSave=r);return call('add',p);},removePreset:p=>call('remove',p),desktop:true},{assetResolver:p=>{const id=customAssetId(p);return id?'/asset?id='+id+(p.endsWith('.mp4')?'&variant=video':''):'/'+p;}});
</script>`;
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/'){res.setHeader('Content-Type','text/html');res.end(html);return;}
  if(url.pathname==='/api'){
   const buffers=[];for await(const b of req)buffers.push(b);const {endpoint,payload}=JSON.parse(Buffer.concat(buffers));
   try{const value=endpoint==='get'?store.get():endpoint==='add'?store.addPreset(payload):endpoint==='remove'?store.removePreset(payload):store.update(payload);res.end(JSON.stringify({ok:true,value}));}
   catch(error){res.statusCode=400;res.end(JSON.stringify({ok:false,error:error.message}));}return;
  }
  if(url.pathname==='/asset'){const {data,type}=store.readAsset(url.searchParams.get('id'),url.searchParams.get('variant')||'preview');res.setHeader('Content-Type',type);res.end(data);return;}
  const path=resolve(root,'.'+decodeURIComponent(url.pathname));if(!path.startsWith(root))throw Error('path');
  res.setHeader('Content-Type',({'.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.mp4':'video/mp4','.png':'image/png'})[extname(path)]||'application/octet-stream');res.end(await readFile(path));
 }catch{res.statusCode=404;res.end('not found');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
try{
 const page=await browser.newPage({viewport:{width:1100,height:980}}),errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.error('Page error:',e.message);});
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 assert.equal(await page.title(),'启动视频导入测试');
 await page.getByRole('tab',{name:'启动画面'}).click();
 await page.getByRole('button',{name:'添加启动画面',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'添加启动画面'}),input=dialog.getByLabel('选择视频或图片');
 await input.setInputFiles(join(root,'assets/whalegirl-startup.mp4'));
 await dialog.locator('.cb-upload-preview video').waitFor();
 assert.equal(await dialog.getByLabel('动态风格').isVisible(),false);
 assert.equal(await dialog.getByLabel('视频画面').inputValue(),'contain');
 await dialog.getByLabel('名称',{exact:true}).fill('我的有声启动视频');
 await dialog.getByLabel('视频画面').selectOption('cover');
 assert.equal(await dialog.locator('video').evaluate(v=>getComputedStyle(v).objectFit),'cover');
 await dialog.getByLabel('视频画面').selectOption('contain');
 await dialog.locator('video').evaluate(v=>v.play());
 await page.waitForFunction(()=>document.querySelector('.cb-upload-preview video')?.webkitAudioDecodedByteCount>0);
 if(process.env.CYBER_QA_SHOT)await page.screenshot({path:process.env.CYBER_QA_SHOT});
 await page.evaluate(()=>window.holdSave=true);
 await dialog.getByRole('button',{name:'保存到我的预设'}).click();
 assert.equal(await dialog.getByRole('button',{name:'取消',exact:true}).isDisabled(),true);
 await dialog.getByLabel('名称',{exact:true}).press('Escape');assert.equal(await dialog.count(),1,'saving cannot be ambiguously cancelled');
 await page.evaluate(()=>{window.holdSave=false;window.releaseSave();});
 await dialog.waitFor({state:'detached'});
 const imported=store.get().custom.splash[0];assert.equal(imported.mediaType,'video');assert.equal(imported.videoFit,'contain');
 assert.equal(store.get().splash,'whalegirl','saving must not apply');
 assert.equal(customAssetId(imported.asset),imported.id);assert.equal(customAssetId(imported.preview),imported.id);
 const before=await page.evaluate(()=>window.blobs);assert.deepEqual([...before.revoked].sort(),[...before.created].sort(),'import and preview decoder URLs released after saving');
 const card=page.locator(`[data-preset="${imported.id}"]`);await card.locator('[data-preview]').click();
 await page.waitForFunction(()=>{const v=document.querySelector('.cb-video-preview video');return v?.readyState>=2&&v.currentTime>.1;});
 const movie=page.locator('.cb-video-preview video');assert.match(await movie.getAttribute('src'),/^blob:/);
 await movie.evaluate(v=>new Promise(r=>{v.pause();v.addEventListener('seeked',r,{once:true});v.currentTime=3;}));
 assert.ok(await movie.evaluate(v=>v.currentTime>=2.99));assert.equal(await movie.evaluate(v=>v.muted),false);
 const src=await movie.getAttribute('src');await page.getByRole('button',{name:'关闭预览',exact:true}).click();
 assert.ok((await page.evaluate(()=>window.blobs.revoked)).includes(src),'closing preview revokes video URL');
 await card.locator('[data-apply]').click();await page.waitForFunction(id=>document.querySelector(`[data-preset="${id}"]`)?.classList.contains('is-selected'),imported.id);
 await page.reload();await page.getByRole('tab',{name:'启动画面'}).click();assert.equal(new Store(dir).get().splash,imported.id,'new Store retains selected video');
 await page.getByRole('button',{name:'添加启动画面',exact:true}).click();
 await input.setInputFiles({name:'broken.mp4',mimeType:'video/mp4',buffer:Buffer.from('not a movie')});
 await dialog.getByRole('alert').filter({hasText:'无法播放'}).waitFor();
 assert.equal(await input.inputValue(),'','retrying the same file must trigger change');
 assert.equal(await dialog.locator('video').count(),0,'invalid new input cannot save stale media');
 const oversized=join(dir,'large.mp4');await writeFile(oversized,Buffer.alloc(50*1024*1024+1));await input.setInputFiles(oversized);
 await dialog.getByRole('alert').filter({hasText:'50 MiB'}).waitFor();
 await page.setViewportSize({width:390,height:844});assert.ok(await dialog.evaluate(e=>e.getBoundingClientRect().width<=innerWidth));
 await dialog.getByRole('button',{name:'取消',exact:true}).click();
 await card.locator('[data-delete]').click();await card.getByRole('button',{name:'确认删除'}).click();
 await card.waitFor({state:'detached'});assert.equal(store.get().splash,'whalegirl');
 assert.deepEqual(errors,[]);
 console.log('Custom video form → decoded audio/poster → disk save → Blob seek/cleanup → apply/reload → invalid/oversize → responsive → delete fallback PASS');
}finally{await browser.close();await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true});}
