import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,readFileSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {_electron} from 'playwright';
import {Store} from '../desktop/settings.mjs';
import {root} from '../scripts/paths.mjs';

// Real Electron window, Store, preload and renderer. Only the renderer clock is
// accelerated, so two minutes of inactivity can be checked without waiting.
const data=mkdtempSync(join(tmpdir(),'pet-behavior-ui-'));
const store=new Store(data);store.update({enabled:true,pet:{id:'cat',enabled:true,paused:false,size:260}});
const require=createRequire(join(root,'package.json'));
const env={...process.env,CYBER_PET_DATA_DIR:data};delete env.ELECTRON_RUN_AS_NODE;
const app=await _electron.launch({executablePath:require('electron'),args:[join(root,'desktop/pet-main.mjs')],env});
const child=app.process();let page;
const shots=join(root,'docs/screenshots');mkdirSync(shots,{recursive:true});
try{
 page=await app.firstWindow();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 assert.match(page.url(),/desktop\/pet.html$/);assert.equal(await page.title(),'赛博老爸桌宠');
 await page.locator('#creature svg [data-creature="cat"]').waitFor();
 await page.clock.install({time:new Date('2026-10-05T00:00:00Z')});await page.reload();
 await page.locator('#creature svg [data-creature="cat"]').waitFor();
 await page.clock.pauseAt(new Date('2026-10-05T00:00:01Z'));
 const mood=()=>page.locator('body').getAttribute('data-mood');
 const action=()=>page.locator('body').getAttribute('data-action');
 const send=kind=>app.evaluate(({BrowserWindow},kind)=>BrowserWindow.getAllWindows()[0].webContents.send('cyber:behavior',kind),kind);
 assert.equal(await mood(),'awake','pet renderer must start with an actual awake behavior state');
 const home=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].getBounds());
 const savedBeforeWalk=readFileSync(join(data,'appearance.json'),'utf8');
 await page.clock.runFor(9000);assert.equal(await action(),'walk','the first idle activity is a visible short walk');
 const walkGeometry=await page.locator('#creature').evaluate(e=>{
  const animation=e.getAnimations().find(a=>a.animationName==='pet-walk');
  if(!animation)return null;
  const time=animation.currentTime;const samples=[];
  for(let t=0;t<=6000;t+=250){animation.currentTime=t;const m=new DOMMatrix(getComputedStyle(e).transform);samples.push({x:m.e,facing:m.a});}
  animation.currentTime=time;return samples;
 });
 assert.ok(walkGeometry,'walking must render an actual motion');
 assert.ok(Math.min(...walkGeometry.map(s=>s.x))<-5&&Math.max(...walkGeometry.map(s=>s.x))>5,'pet walks to both sides of its placed position');
 assert.ok(walkGeometry.some(s=>s.facing<0)&&walkGeometry.some(s=>s.facing>0),'pet visibly turns for the return journey');
 assert.ok(Math.abs(walkGeometry.at(-1).x)<.1&&walkGeometry.at(-1).facing>0,'walk returns to its starting position and facing');
 assert.equal(readFileSync(join(data,'appearance.json'),'utf8'),savedBeforeWalk,'autonomous walking does not persist animation offsets');
 assert.deepEqual(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].getBounds()),home);
 store.update({pet:{paused:true}});await page.locator('body.paused').waitFor();
 await page.waitForTimeout(80); // Let the compositor commit the CSS pause.
 const frozenWalk=await page.locator('#creature').evaluate(e=>getComputedStyle(e).transform);
 await page.waitForTimeout(180);await page.clock.runFor(200000);
 assert.equal(await action(),'walk');assert.equal(await page.locator('#creature').evaluate(e=>getComputedStyle(e).transform),frozenWalk,'paused walking freezes visually and logically');
 store.update({pet:{paused:false}});await page.locator('body:not(.paused)').waitFor();
 await page.mouse.click(130,140);assert.notEqual(await action(),'walk','click interrupts a walk');
 await send('walk');await page.locator('body[data-action="walk"]').waitFor();
 await page.mouse.move(130,140);await page.mouse.down();await page.mouse.move(138,140);
 assert.equal(await action(),'drag','dragging takes over walking');await page.mouse.move(130,140);await page.mouse.up();
 assert.equal(await action(),'land');
 const afterDrag=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].getBounds());
 await send('walk');await page.locator('body[data-action="walk"]').waitFor();
 await page.clock.runFor(6500);assert.equal(await action(),'idle');
 assert.deepEqual(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].getBounds()),afterDrag,'autonomous motion never changes native window bounds');
 assert.equal(JSON.parse(readFileSync(join(data,'appearance.json'),'utf8')).pet.position?.x,afterDrag.x);
 // The drag intentionally persisted its ending coordinates; an entire subsequent
 // walk must not write them again or otherwise change the appearance settings.
 const savedAfterDrag=readFileSync(join(data,'appearance.json'),'utf8');
 await send('walk');await page.locator('body[data-action="walk"]').waitFor();await page.clock.runFor(6500);
 assert.equal(readFileSync(join(data,'appearance.json'),'utf8'),savedAfterDrag);
 console.log('autonomous walking, turn/return, pause, click/drag interruption and stable window: PASS');
 await page.clock.runFor(45000);assert.equal(await mood(),'drowsy');
 await page.clock.runFor(76000);assert.equal(await mood(),'sleeping');
 assert.equal(await page.locator('.sleep-eyes').evaluate(e=>getComputedStyle(e).display==='none'),false);
 assert.equal(await page.locator('.eyes').evaluate(e=>getComputedStyle(e).display),'none');
 await page.waitForTimeout(900); // CSS compositor time for a readable sleep screenshot.
 await page.screenshot({path:join(shots,'pet-cat-sleep.png'),omitBackground:true});
 await page.mouse.click(130,140);
 assert.equal(await mood(),'awake');assert.equal(await action(),'wake','clicking a sleeping pet must wake it rather than lose the click to drag');
 await page.clock.runFor(3500);assert.equal(await action(),'idle');
 await page.mouse.click(130,140);const first=await action();
 await page.clock.runFor(250);await page.mouse.click(130,140);
 await page.clock.runFor(250);await page.mouse.click(130,140);
 assert.ok(['spin','hop'].includes(await action()),'three deliberate taps trigger playful feedback');
 assert.equal(await page.locator('body').getAttribute('data-effect'),'sparkle');
 console.log('idle → drowsy → sleep → click wake; repeated taps: PASS',first);

 await send('nap');await page.locator('body[data-mood="sleeping"]').waitFor();
 store.update({pet:{paused:true}});await page.locator('body.paused').waitFor();
 const sleeping=await mood();await page.clock.runFor(300000);assert.equal(await mood(),sleeping);
 await send('play');await page.clock.runFor(1000);assert.equal(await mood(),'sleeping','pause cannot queue a hidden play action');
 store.update({pet:{paused:false}});await page.locator('body:not(.paused)').waitFor();
 await send('wake');await page.locator('body[data-action="wake"]').waitFor();assert.equal(await mood(),'awake');
 await page.clock.runFor(3500);
 store.update({pet:{paused:true}});await page.locator('body.paused').waitFor();
 await page.mouse.move(130,140);await page.mouse.down();await page.mouse.move(110,125);
 store.update({pet:{paused:false}});await page.locator('body:not(.paused)').waitFor();
 assert.equal(await action(),'drag','unpausing a physically held drag must reconcile the behavior state');
 await page.mouse.up();assert.equal(await action(),'land');await page.clock.runFor(3000);
 await page.mouse.move(130,140);await page.mouse.down();await page.mouse.move(110,125);
 assert.equal(await action(),'drag');await page.clock.runFor(121000);assert.equal(await action(),'drag');
 await page.mouse.up();assert.equal(await action(),'land');
 await page.clock.runFor(3000);assert.equal(await action(),'idle');
 store.update({pet:{paused:true}});await page.locator('body.paused').waitFor();
 const beforeCancel=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].getBounds());
 await page.mouse.move(130,140);await page.mouse.down();await page.mouse.move(133,140);
 await page.evaluate(()=>window.dispatchEvent(new PointerEvent('pointercancel')));await page.mouse.up();
 await page.waitForTimeout(100);
 assert.deepEqual(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].getBounds()),beforeCancel,'cancel before the drag threshold cannot nudge the saved window position');
 store.update({pet:{paused:false}});await page.locator('body:not(.paused)').waitFor();
 console.log('native behavior command, paused time and dragging/landing: PASS');

 for(const id of ['whale','cat']){
  store.update({pet:{id}});await page.locator(`#creature svg [data-creature="${id}"]`).waitFor();
  await send('play');await page.locator('body:not([data-action="idle"])').waitFor();
  assert.ok((await page.locator('#pet-caption').textContent()).trim());
  await page.clock.runFor(300);
  await page.waitForTimeout(400); // Capture the real limb/effect animation mid-motion.
  await page.screenshot({path:join(shots,`pet-${id}-play.png`),omitBackground:true});
  await send('walk');await page.locator('body[data-action="walk"]').waitFor();
  await page.locator('#creature').evaluate(e=>{const a=e.getAnimations().find(a=>a.animationName==='pet-walk');a.pause();a.currentTime=1350;});
  await page.screenshot({path:join(shots,`pet-${id}-walk.png`),omitBackground:true});
 }
 const imported=store.addPreset({kind:'pet',name:'会打盹的小星星',image:{type:'image/svg+xml',dataUrl:'data:image/svg+xml;base64,'+readFileSync(join(root,'examples/小星星.svg')).toString('base64')}}).custom.pet.at(-1);
 store.update({pet:{id:imported.id}});await page.locator('#creature img').waitFor({state:'visible'});
 const asymmetric=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=200;const ctx=c.getContext('2d');ctx.fillStyle='#84bde3';ctx.fillRect(0,0,100,200);return c.toDataURL('image/png');});
 const half=store.addPreset({kind:'pet',name:'非对称透明命中测试',image:{type:'image/png',dataUrl:asymmetric}}).custom.pet.at(-1);
 store.update({pet:{id:half.id}});await page.locator(`img[data-creature="${half.id}"]`).waitFor();
 await send('walk');await page.locator('body[data-action="walk"]').waitFor();
 await app.evaluate(({ipcMain})=>{globalThis.__walkHits=[];ipcMain.on('cyber:hit',(_event,hit)=>globalThis.__walkHits.push(hit));});
 for(const t of [750,2250,3750,5250]){
  await page.locator('#creature').evaluate((e,t)=>{const a=e.getAnimations().find(a=>a.animationName==='pet-walk');a.pause();a.currentTime=t;},t);
  for(const [x,y,expected] of [[65,130,true],[195,130,false]]){
   await app.evaluate(()=>{globalThis.__walkHits=[];});
   await page.locator('#creature').evaluate((e,{x,y})=>{const m=new DOMMatrix(getComputedStyle(e).transform);const [ox,oy]=getComputedStyle(e).transformOrigin.split(' ').map(Number.parseFloat);const p=new DOMPoint(x-ox,y-oy).matrixTransform(m);window.dispatchEvent(new MouseEvent('mousemove',{clientX:p.x+ox,clientY:p.y+oy}));},{x,y});
   await page.waitForTimeout(30);
   assert.equal(await app.evaluate(()=>globalThis.__walkHits.at(-1)),expected,`imported-pet alpha hit remains aligned at walking phase ${t}`);
  }
 }
 store.update({pet:{id:imported.id}});await page.locator(`img[data-creature="${imported.id}"]`).waitFor();
 await send('nap');await page.locator('body[data-mood="sleeping"]').waitFor();
 await page.mouse.click(130,140);assert.equal(await mood(),'awake');assert.equal(await action(),'wake');
 // Decorations do not become hit targets, including text and effect children.
 assert.equal(await page.locator('#reaction, #reaction *, #pet-caption').evaluateAll(es=>es.every(e=>getComputedStyle(e).pointerEvents==='none')),true);
 await page.emulateMedia({reducedMotion:'reduce'});
 await send('walk');await page.locator('body[data-action="walk"]').waitFor();
 assert.equal(await page.locator('#creature').evaluate(e=>getComputedStyle(e).animationName),'none');
 await send('nap');await page.locator('body[data-mood="sleeping"]').waitFor();
 assert.equal(await page.locator('#creature').evaluate(e=>getComputedStyle(e).animationName),'none');
 assert.deepEqual(errors,[]);
 console.log('remaining SVG personalities, imported pet, passive overlays and reduced motion: PASS');
}finally{
 const exit=new Promise((resolve,reject)=>{if(child.exitCode!==null){resolve(child.exitCode);return;}const timer=setTimeout(()=>reject(new Error('pet behavior test did not exit')),6000);child.once('exit',code=>{clearTimeout(timer);resolve(code);});});
 try{
  await app.evaluate(()=>{const inspector=process.getBuiltinModule('node:inspector');setTimeout(()=>inspector.close(),0);}).catch(()=>{});
  if(page&&!page.isClosed())await page.evaluate(()=>{void window.cyberDressup.action('quit').catch(()=>{});}).catch(()=>{});
  assert.equal(await exit,0);
 }catch(error){child.kill('SIGKILL');throw error;}
 finally{if(child.exitCode!==null)rmSync(data,{recursive:true,force:true});}
}
