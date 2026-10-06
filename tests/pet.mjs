import {_electron} from 'playwright';
import {createRequire} from 'node:module';
import {mkdtempSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {root} from '../scripts/paths.mjs';
import {Store} from '../desktop/settings.mjs';
import {alphaHit,localImagePoint} from '../src/image-hit.mjs';
const tinyMask={width:2,height:1,data:new Uint8ClampedArray([0,0,0,0,0,0,0,255])};
assert.equal(alphaHit(tinyMask,{width:100,height:100},{x:25,y:50}),false);
assert.equal(alphaHit(tinyMask,{width:100,height:100},{x:75,y:50}),true);
assert.equal(alphaHit(tinyMask,{width:100,height:100},{x:75,y:10}),false);
// Downsampling rounds mask dimensions; image containment must still use the
// original image ratio (here 4:1, even though the tiny alpha mask is 2:1).
assert.equal(alphaHit({...tinyMask,sourceWidth:4000,sourceHeight:1000},{width:100,height:100},{x:75,y:30}),false);
assert.equal(alphaHit({...tinyMask,sourceWidth:4000,sourceHeight:1000},{width:100,height:100},{x:75,y:50}),true);
assert.deepEqual(localImagePoint({x:95,y:50},{left:20,top:30},{width:100,height:100},{a:0,b:1,c:-1,d:0,e:0,f:0},{x:50,y:50}),{x:20,y:25});
const require=createRequire(join(root,'package.json'));
const data=mkdtempSync(join(tmpdir(),'native-pet-'));
new Store(data).update({pet:{id:'cat'}});
const env={...process.env,CYBER_PET_DATA_DIR:data};delete env.ELECTRON_RUN_AS_NODE;
const app=await _electron.launch({executablePath:require('electron'),args:[join(root,'desktop/pet-main.mjs'),'--standalone'],env});
try{
 const page=await app.firstWindow();const rendererErrors=[];page.on('pageerror',e=>rendererErrors.push(e.message));await page.locator('#creature svg').waitFor();
 const native=await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];return {top:w.isAlwaysOnTop(),focusable:w.isFocusable(),url:w.webContents.getURL(),bounds:w.getBounds()};});
 assert.equal(native.top,true);assert.equal(native.focusable,false);assert.match(native.url,/desktop\/pet.html$/);
 await assert.rejects(()=>page.evaluate(()=>window.cyberDressup.update({theme:'night'})),/不受信任/);
 const store=new Store(data);let previous=await page.locator('#creature svg').innerHTML();
 for(const id of ['whale','cat']){store.update({pet:{id}});await page.waitForFunction(previous=>document.querySelector('#creature svg')?.innerHTML!==previous,previous);previous=await page.locator('#creature svg').innerHTML();assert.ok(previous.length>100);await page.screenshot({path:join(data,'native-pet-'+id+'.png'),omitBackground:true});}
 // A transparent, non-square custom image must keep both letterboxing and
 // transparent pixels click-through. Only the asset transport is a fixture;
 // image decoding, rendering and the hit IPC all run in the real renderer.
 const customId='custom-123e4567-e89b-42d3-a456-426614174000';
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=64;c.height=32;const x=c.getContext('2d');x.fillStyle='#308ed4';x.fillRect(16,8,32,16);return c.toDataURL('image/png');});
 // Keep the real menu template and its production callbacks; suppress only
 // native popup display so this test never needs the user's desktop unlocked.
 const menuPet=store.addPreset({kind:'pet',name:'右键菜单测试伙伴',image:{type:'image/png',dataUrl:png}}).custom.pet.at(-1);
 await app.evaluate(({Menu})=>{globalThis.__originalMenuBuilder=Menu.buildFromTemplate;Menu.buildFromTemplate=function(template){const menu=globalThis.__originalMenuBuilder.call(this,template);globalThis.__petMenuTemplate=template;globalThis.__actualPetMenu=menu;menu.popup=({callback})=>callback?.();return menu;};});
 try{
  // Resizing through the actual native menu must resize this same window,
  // persist the new size, and preserve the selected pet and its animations.
  const windowID=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].id);
  await page.evaluate(()=>{window.__samePetWindow='kept';});
  const original=store.get();
  for(const [label,size] of [['迷你 · 80 px',80],['小巧 · 100 px',100],['适中 · 120 px',120]]){
   await app.evaluate(()=>{globalThis.__petMenuTemplate=undefined;});
   await page.evaluate(()=>window.cyberDressup.menu());
   for(let i=0;i<50&&!await app.evaluate(()=>!!globalThis.__petMenuTemplate);i++)await page.waitForTimeout(20);
   const choices=await app.evaluate(()=>globalThis.__petMenuTemplate.find(x=>x.label==='桌宠大小')?.submenu.map(({label,checked})=>({label,checked})));
   assert.ok(choices?.some(x=>x.label===label),'native size menu must offer compact pets');
   await app.evaluate((_e,label)=>globalThis.__petMenuTemplate.find(x=>x.label==='桌宠大小').submenu.find(x=>x.label===label).click(),label);
   await page.waitForFunction(size=>innerWidth===size&&innerHeight===size,size);
   assert.equal(new Store(data).get().pet.size,size);
   const latest=store.get();assert.equal(latest.pet.id,original.pet.id);assert.equal(latest.pet.paused,original.pet.paused);
   assert.equal(latest.theme,original.theme);assert.equal(latest.splash,original.splash);
   assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].id),windowID);
   assert.equal(await page.evaluate(()=>window.__samePetWindow),'kept');
   if(size===100)await page.screenshot({path:join(root,'docs/screenshots/pet-size-100.png'),omitBackground:true});
   await app.evaluate(()=>{globalThis.__petMenuTemplate=undefined;});await page.evaluate(()=>window.cyberDressup.menu());
   for(let i=0;i<50&&!await app.evaluate(()=>!!globalThis.__petMenuTemplate);i++)await page.waitForTimeout(20);
   assert.equal(await app.evaluate((_e,label)=>globalThis.__petMenuTemplate.find(x=>x.label==='桌宠大小').submenu.find(x=>x.label===label).checked,label),true);
  }
  store.update({pet:{size:110}});await page.waitForFunction(()=>innerWidth===110);
  await app.evaluate(()=>{globalThis.__petMenuTemplate=undefined;});await page.evaluate(()=>window.cyberDressup.menu());
  for(let i=0;i<50&&!await app.evaluate(()=>!!globalThis.__petMenuTemplate);i++)await page.waitForTimeout(20);
  assert.deepEqual(await app.evaluate(()=>globalThis.__actualPetMenu.items.find(x=>x.label==='桌宠大小').submenu.items.filter(x=>x.type==='radio'&&x.checked).map(x=>x.label)),['自定义 · 110 px'],'a custom slider size must not falsely select the first native radio preset');
  const opened=app.waitForEvent('window');
  await app.evaluate(()=>globalThis.__petMenuTemplate.find(x=>x.label==='桌宠大小').submenu.find(x=>x.label==='管理页精细调节').click());
  const manager=await opened;await manager.waitForURL(/desktop\/manager.html$/);
  manager.on('pageerror',e=>rendererErrors.push(e.message));
  const slider=manager.getByRole('slider',{name:'桌宠大小'});
  await slider.waitFor();
  assert.equal(await manager.locator('[data-preset="robot"]').count(),0,'standalone manager omits the retired robot pet');
  assert.equal(await manager.getByAltText('赛博老爸品牌标识',{exact:true}).count(),1,'independent CyberDad branding remains');
  await slider.focus();await slider.press('Home');
  await page.waitForFunction(()=>innerWidth===80);
  await manager.getByRole('button',{name:'放大桌宠'}).click();await page.waitForFunction(()=>innerWidth===90);
  await manager.getByRole('button',{name:'放大桌宠'}).click();await page.waitForFunction(()=>innerWidth===100);
  assert.equal(new Store(data).get().pet.size,100,'native manager slider and plus buttons save through real IPC');
  await manager.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
  await manager.screenshot({path:join(root,'docs/screenshots/pet-size-controls.png')});
  await manager.close();
  console.log('actual manager: native menu entry, slider, plus controls, same live pet and persistence PASS');
  console.log('native size menu: real window resize, persistent compact sizes, checked state and no reload PASS');
  store.update({pet:{size:original.pet.size}});
  await page.waitForFunction(size=>innerWidth===size,original.pet.size);
  await page.evaluate(()=>window.cyberDressup.menu());
  for(let i=0;i<50&&!await app.evaluate(()=>!!globalThis.__petMenuTemplate);i++)await page.waitForTimeout(20);
  const choices=await app.evaluate(()=>globalThis.__petMenuTemplate?.find(x=>x.label==='切换桌宠')?.submenu.map(({label,checked})=>({label,checked})));
  assert.deepEqual(choices.map(x=>x.label),['赛博老爸','鲸鱼娘','小蓝鲸','奶油猫','右键菜单测试伙伴'],'native menu derives the current catalog without the retired robot');
  assert.ok(choices?.some(x=>x.label==='右键菜单测试伙伴'),'native pet menu includes the imported pet name');
  assert.equal(choices.find(x=>x.label==='右键菜单测试伙伴').checked,false);
  await app.evaluate(()=>globalThis.__petMenuTemplate.find(x=>x.label==='切换桌宠').submenu.find(x=>x.label==='右键菜单测试伙伴').click());
  assert.equal(store.get().pet.id,menuPet.id,'native menu selection persists the custom pet ID');
  assert.equal(JSON.parse(readFileSync(join(data,'appearance.json'),'utf8')).pet.id,menuPet.id);
  await page.locator('#creature img.pet-custom-image').waitFor({state:'visible'});
  await app.evaluate(()=>{globalThis.__petMenuTemplate=undefined;});
  await page.evaluate(()=>window.cyberDressup.menu());
  for(let i=0;i<50&&!await app.evaluate(()=>!!globalThis.__petMenuTemplate);i++)await page.waitForTimeout(20);
  assert.equal(await app.evaluate(()=>globalThis.__petMenuTemplate.find(x=>x.label==='切换桌宠').submenu.find(x=>x.label==='右键菜单测试伙伴').checked),true);
  const behaviorChoices=await app.evaluate(()=>globalThis.__petMenuTemplate.map(({label,enabled})=>({label,enabled})));
  for(const label of ['散散步','逗一逗','打个盹','叫醒']){
   assert.ok(behaviorChoices.some(item=>item.label===label),`native menu includes ${label}`);
   assert.equal(behaviorChoices.find(item=>item.label===label).enabled,true);
  }
  assert.equal(await page.evaluate(()=>typeof window.cyberDressup.onBehavior),'function');
  await page.evaluate(()=>{window.__petBehaviors=[];window.__offPetBehavior=window.cyberDressup.onBehavior(value=>window.__petBehaviors.push(value));});
  const beforeBehavior=readFileSync(join(data,'appearance.json'),'utf8');
  for(const [index,label] of ['散散步','逗一逗','打个盹','叫醒'].entries()){
   await app.evaluate((_electron,label)=>globalThis.__petMenuTemplate.find(item=>item.label===label).click(),label);
   await page.waitForFunction(count=>window.__petBehaviors.length===count,index+1);
  }
  assert.deepEqual(await page.evaluate(()=>window.__petBehaviors),['walk','play','nap','wake'],'menu sends the fixed behavior through the real preload listener');
  assert.equal(readFileSync(join(data,'appearance.json'),'utf8'),beforeBehavior,'temporary behaviors do not write appearance settings');
  // Invalid payloads must be filtered before any renderer callback is invoked.
  await app.evaluate(({BrowserWindow})=>{const wc=BrowserWindow.getAllWindows()[0].webContents;for(const value of ['dance',null,1,{action:'play'},['wake']])wc.send('cyber:behavior',value);wc.send('cyber:behavior','wake');});
  await page.waitForFunction(()=>window.__petBehaviors.length>=5);
  assert.deepEqual(await page.evaluate(()=>window.__petBehaviors),['walk','play','nap','wake','wake']);
  await page.evaluate(()=>{window.__offPetBehavior();window.__behaviorBarrier=0;window.__offBehaviorBarrier=window.cyberDressup.onBehavior(()=>window.__behaviorBarrier++);});
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.send('cyber:behavior','play'));
  await page.waitForFunction(()=>window.__behaviorBarrier===1);
  assert.equal(await page.evaluate(()=>window.__petBehaviors.length),5,'cancelled behavior subscriptions receive no more events');
  await page.evaluate(()=>window.__offBehaviorBarrier());
  store.update({pet:{paused:true}});
  await page.waitForFunction(()=>document.body.classList.contains('paused'));
  await app.evaluate(()=>{globalThis.__petMenuTemplate=undefined;});
  await page.evaluate(()=>window.cyberDressup.menu());
  for(let i=0;i<50&&!await app.evaluate(()=>!!globalThis.__petMenuTemplate);i++)await page.waitForTimeout(20);
  const pausedChoices=await app.evaluate(()=>globalThis.__petMenuTemplate.map(({label,enabled})=>({label,enabled})));
  for(const label of ['散散步','逗一逗','打个盹','叫醒'])assert.equal(pausedChoices.find(item=>item.label===label)?.enabled,false,`${label} is disabled while paused`);
  for(const label of ['隐藏桌宠','退出桌宠']){
   const item=pausedChoices.find(item=>item.label===label);
   assert.ok(item,`${label} remains in the paused menu`);
   assert.notEqual(item.enabled,false,`${label} remains available while paused`);
  }
  store.update({pet:{paused:false}});
  await page.waitForFunction(()=>!document.body.classList.contains('paused'));
  console.log('native behavior menu: real preload delivery, enum filter, unsubscribe, pause gate and no settings writes PASS');
 }finally{
  await page.evaluate(()=>{window.__offPetBehavior?.();window.__offBehaviorBarrier?.();});
  await app.evaluate(({Menu})=>{Menu.buildFromTemplate=globalThis.__originalMenuBuilder;delete globalThis.__originalMenuBuilder;delete globalThis.__petMenuTemplate;delete globalThis.__actualPetMenu;});
  store.update({pet:{paused:false}});
  store.removePreset({kind:'pet',id:menuPet.id});
 }
 await page.locator('#creature canvas[data-creature="whalegirl"]').waitFor();
 console.log('native menu: custom pet name, selected state and persisted click callback PASS');
 const customState={...store.get(),custom:{pet:[{id:customId,name:'透明测试图',asset:'custom-assets/'+customId+'.png',preview:'custom-assets/'+customId+'.png',custom:true}]},pet:{...store.get().pet,id:customId,paused:true}};
 await app.evaluate(({ipcMain,BrowserWindow},{png,state})=>{ipcMain.removeHandler('cyber:asset');ipcMain.handle('cyber:asset',()=>png);globalThis.__petHitResults=[];ipcMain.on('cyber:hit',(_e,value)=>globalThis.__petHitResults.push(value));BrowserWindow.getAllWindows()[0].webContents.send('cyber:change',state);},{png,state:customState});
 await page.locator('#creature img.pet-custom-image').waitFor({state:'attached',timeout:5000});
 assert.equal(await page.locator('#creature svg').count(),0,'custom assets must never become inline SVG');
 assert.equal(await page.locator('#creature img').evaluate(img=>img.naturalWidth),64);
 for(const [x,y,expected] of [[.02,.02,false],[.05,.5,false],[.5,.5,true]]){
  await app.evaluate(()=>{globalThis.__petHitResults=[];});
  await page.evaluate(({x,y})=>{const r=document.querySelector('#creature').getBoundingClientRect();window.dispatchEvent(new MouseEvent('mousemove',{clientX:r.left+r.width*x,clientY:r.top+r.height*y}));},{x,y});
  await page.waitForTimeout(40);
  assert.equal(await app.evaluate(()=>globalThis.__petHitResults.at(-1)),expected,`alpha hit at ${x},${y}`);
 }
 assert.equal(await page.locator('#creature canvas.pet-custom-frozen').isVisible(),true,'paused images display a frozen canvas');
 await app.evaluate(({BrowserWindow},state)=>BrowserWindow.getAllWindows()[0].webContents.send('cyber:change',state),{...customState,pet:{...customState.pet,paused:false}});
 await page.locator('#creature img.pet-custom-image').waitFor({state:'visible'});
 await app.evaluate(({BrowserWindow},state)=>BrowserWindow.getAllWindows()[0].webContents.send('cyber:change',state),{...customState,custom:{pet:[]}});
 await page.locator('#creature canvas[data-creature="whalegirl"]').waitFor();
 assert.equal(await page.locator('#creature img').count(),0,'deleting a selected image releases the previous image');
 console.log('custom PNG: passive image, contain alpha hits, pause/resume and deletion fallback PASS');
 const warning=page.waitForEvent('console',{predicate:m=>m.type()==='warning'&&m.text().includes('已使用内置小蓝鲸')});
 await app.evaluate(({ipcMain,BrowserWindow},state)=>{ipcMain.removeHandler('cyber:asset');ipcMain.handle('cyber:asset',()=> 'data:image/png;base64,aGVsbG8=');BrowserWindow.getAllWindows()[0].webContents.send('cyber:change',state);},customState);
 await warning;await page.locator('#creature svg [data-creature="whale"]').waitFor();
 assert.equal(await page.locator('body').getAttribute('data-pet'),'whale','corrupt assets use whale behavior as well as whale artwork');
 const svgId='custom-123e4567-e89b-42d3-a456-426614174001';
 const svg='data:image/svg+xml;base64,'+Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><script>window.__petSvgExecuted=true</script><rect x="20" y="10" width="40" height="20" fill="blue"/></svg>').toString('base64');
 const svgState={...customState,custom:{pet:[{...customState.custom.pet[0],id:svgId,asset:'custom-assets/'+svgId+'.svg'}]},pet:{...customState.pet,id:svgId,paused:false}};
 await app.evaluate(({ipcMain,BrowserWindow},{svg,state})=>{ipcMain.removeHandler('cyber:asset');ipcMain.handle('cyber:asset',()=>svg);BrowserWindow.getAllWindows()[0].webContents.send('cyber:change',state);},{svg,state:svgState});
 await page.locator('#creature img.pet-custom-image').waitFor({state:'visible'});
 assert.equal(await page.locator('#creature svg').count(),0,'custom SVG must remain passive img');
 assert.equal(await page.evaluate(()=>window.__petSvgExecuted),undefined,'custom SVG scripts cannot enter renderer DOM');
 const slowState={...customState,pet:{...customState.pet,paused:false}};
 await app.evaluate(({ipcMain,BrowserWindow},{png,state})=>{globalThis.__slowAssetStarted=false;ipcMain.removeHandler('cyber:asset');ipcMain.handle('cyber:asset',()=>{globalThis.__slowAssetStarted=true;return new Promise(r=>setTimeout(()=>r(png),300));});BrowserWindow.getAllWindows()[0].webContents.send('cyber:change',state);},{png,state:slowState});
 for(let i=0;i<50&&!await app.evaluate(()=>globalThis.__slowAssetStarted);i++)await page.waitForTimeout(20);
 assert.equal(await app.evaluate(()=>globalThis.__slowAssetStarted),true);
 await app.evaluate(({BrowserWindow},state)=>BrowserWindow.getAllWindows()[0].webContents.send('cyber:change',state),{...customState,pet:{...customState.pet,id:'cat'}});
 await page.locator('#creature svg [data-creature="cat"]').waitFor();await page.waitForTimeout(400);
 assert.equal(await page.locator('#creature img').count(),0,'an obsolete asset response cannot replace the newer pet');
 assert.equal(await page.locator('#creature svg [data-creature="cat"]').count(),1);
 console.log('custom resources: corrupt image fallback, passive SVG and async cancellation PASS');
 // Pet window deliberately cannot update arbitrary settings. Exercise its
 // narrow drag channel; full physical cross-app hit tests are a manual gate.
 await page.evaluate(()=>{window.cyberDressup.drag('start',{x:500,y:500});window.cyberDressup.drag('move',{x:420,y:440});window.cyberDressup.drag('end',{x:420,y:440});});
 await page.waitForTimeout(100);
 const moved=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].getBounds());assert.notDeepEqual(moved,native.bounds);
 await page.evaluate(()=>document.body.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,screenX:420,screenY:440})));
 const position=JSON.parse(readFileSync(join(data,'appearance.json'),'utf8')).pet.position;assert.equal(position.x,moved.x);
 assert.deepEqual((await app.windows()).map(p=>p.url()),[native.url]);
 assert.deepEqual(rendererErrors,[]);
 console.log(JSON.stringify({standalone:true,backendWindows:0,top:native.top,focusable:native.focusable,dragIpc:true,positionSaved:true,physicalCrossApp:'独立物理验收，详见验证报告'},null,2));
 }finally{
 const child=app.process();
 const exit=new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('桌宠未在 5 秒内退出')),5000);child.once('exit',()=>{clearTimeout(t);resolve();});});
 try{
  // Electron 44 can wait for the main-process debugger during shutdown.
  // Detach that test-only debugger before exercising the real renderer IPC.
  const page=app.windows()[0];
  await app.evaluate(()=>{const inspector=process.getBuiltinModule('node:inspector');setTimeout(()=>inspector.close(),0);});
  await page.evaluate(()=>{void window.cyberDressup.action('quit').catch(()=>{});}).catch(()=>{});
  await exit;console.log('quit: PASS');
 }catch(error){child.kill('SIGKILL');throw error;}
}
const smokeEnv={...env,CYBER_PET_DATA_DIR:mkdtempSync(join(tmpdir(),'native-pet-quit-'))};
const smoke=spawnSync(require('electron'),[join(root,'tests/pet-quit-smoke.mjs'),'--standalone'],{env:smokeEnv,encoding:'utf8',timeout:7000,killSignal:'SIGKILL'});
assert.equal(smoke.status,0,smoke.error?.message||smoke.stderr);
console.log('quit without debugger: PASS');
