import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {_electron} from 'playwright';
import {Store} from '../desktop/settings.mjs';
import {root} from '../scripts/paths.mjs';

const data=mkdtempSync(join(tmpdir(),'cyberdad-pet-'));
const store=new Store(data);
store.update({enabled:true,pet:{id:'cyberdad',enabled:true,size:180,paused:false,sound:true,position:{x:300,y:300}}});
const require=createRequire(join(root,'package.json'));
const env={...process.env,CYBER_PET_DATA_DIR:data};delete env.ELECTRON_RUN_AS_NODE;
const app=await _electron.launch({executablePath:require('electron'),args:[join(root,'desktop/pet-main.mjs')],env});
const child=app.process(),shots=join(root,'docs/screenshots');mkdirSync(shots,{recursive:true});
let page;
try {
 page=await app.firstWindow();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Keep trusted Playwright pointer input and production PetSound. The context
 // supplies real offline Web Audio nodes, so the test cannot make audible sound.
 await page.addInitScript(()=>{
  window.__audioNodes=0;window.__trustedReleases=[];
  window.addEventListener('pointerup',e=>window.__trustedReleases.push(e.isTrusted),true);
  window.AudioContext=class {
   constructor(){this.offline=new OfflineAudioContext(1,24000,48000);this.state='running';}
   get currentTime(){return 0;}
   get destination(){return this.offline.destination;}
   createOscillator(){window.__audioNodes++;return this.offline.createOscillator();}
   createGain(){return this.offline.createGain();}
   resume(){return Promise.resolve();}
   close(){this.state='closed';return Promise.resolve();}
  };
 });
 await page.clock.install({time:new Date('2026-10-06T00:00:00Z')});await page.reload();
 await page.locator('canvas.pet-sprite[data-creature="cyberdad"]').waitFor();
 await page.clock.pauseAt(new Date('2026-10-06T00:00:01Z'));
 const canvas=page.locator('canvas.pet-sprite');
 const action=()=>page.locator('body').getAttribute('data-action');
 const frame=()=>canvas.getAttribute('data-frame');
 const nodes=()=>page.evaluate(()=>window.__audioNodes);
 const bounds=()=>app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].getBounds());
 const send=kind=>app.evaluate(({BrowserWindow},kind)=>BrowserWindow.getAllWindows()[0].webContents.send('cyber:behavior',kind),kind);
 await app.evaluate(({Menu,ipcMain})=>{
  const original=Menu.buildFromTemplate;
  Menu.buildFromTemplate=function(template){const menu=original.call(this,template);globalThis.__cyberdadMenu=template;menu.popup=({callback})=>callback?.();return menu;};
  globalThis.__cyberdadHits=[];ipcMain.on('cyber:hit',(_e,hit)=>globalThis.__cyberdadHits.push(hit));
 });
 async function menu() {
  await app.evaluate(()=>{globalThis.__cyberdadMenu=undefined;});await page.evaluate(()=>window.cyberDressup.menu());
  for(let i=0;i<60;i++){if(await app.evaluate(()=>!!globalThis.__cyberdadMenu))return;await page.waitForTimeout(20);}
  throw Error('Native menu did not arrive');
 }
 async function command(label,submenu) {
  await menu();await app.evaluate((_e,{label,submenu})=>{
   const items=submenu?globalThis.__cyberdadMenu.find(x=>x.label===submenu)?.submenu:globalThis.__cyberdadMenu;
   const item=items?.find(x=>x.label===label);if(!item||item.enabled===false)throw Error('Missing or disabled menu item: '+label);item.click();
  },{label,submenu});
 }
 // Select a pixel from the actual current atlas frame and map it through the
 // rendered 2D root transform. No assumed opaque rectangle or synthetic asset.
 async function points() {
  return canvas.evaluate(c=>{
   const e=c.parentElement,ctx=c.getContext('2d',{willReadFrequently:true});
   const pixels=ctx.getImageData(0,0,c.width,c.height).data;
   const style=getComputedStyle(e),m=new DOMMatrix(style.transform),[ox,oy]=style.transformOrigin.split(' ').map(Number.parseFloat);
   const result={opaque:null,clear:null,hash:0};let bestOpaque=Infinity,bestClear=Infinity;
   for(let y=0;y<c.height;y+=4)for(let x=0;x<c.width;x+=4){
    const i=(y*c.width+x)*4,a=pixels[i+3];result.hash=(result.hash*31+pixels[i]+pixels[i+1]+pixels[i+2]+a)>>>0;
    const p=new DOMPoint((x+.5)/c.width*e.clientWidth-ox,(y+.5)/c.height*e.clientHeight-oy).matrixTransform(m);
    const point={x:p.x+ox+e.offsetLeft,y:p.y+oy+e.offsetTop};
    if(point.x<3||point.y<3||point.x>innerWidth-3||point.y>innerHeight-3)continue;
    const d=(point.x-innerWidth/2)**2+(point.y-innerHeight/2)**2;
    if(a>=250&&d<bestOpaque){bestOpaque=d;result.opaque=point;}
    const corner=(point.x-12)**2+(point.y-12)**2;
    if(a===0&&corner<bestClear){bestClear=corner;result.clear=point;}
   }
   return result;
  });
 }
 async function hit(point,expected) {
  await app.evaluate(()=>{globalThis.__cyberdadHits=[];});
  await app.evaluate(({BrowserWindow},p)=>BrowserWindow.getAllWindows()[0].webContents.send('cyber:cursor',{clientX:p.x,clientY:p.y}),point);
  for(let i=0;i<50&&!await app.evaluate(()=>globalThis.__cyberdadHits.length);i++)await page.waitForTimeout(10);
  assert.equal(await app.evaluate(()=>globalThis.__cyberdadHits.at(-1)),expected,'current atlas alpha mask controls the native hit IPC');
 }
 async function clickPet(){const {opaque}=await points();assert.ok(opaque);await page.mouse.click(opaque.x,opaque.y);}
 const home=await bounds(),saved=readFileSync(join(data,'appearance.json'),'utf8');
 assert.equal(home.width,180);assert.equal(home.height,180);assert.equal(await frame(),'0');
 assert.deepEqual(await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];return {top:w.isAlwaysOnTop(),focusable:w.isFocusable(),shadow:w.hasShadow()};}),{top:true,focusable:false,shadow:false});
 const hashes=new Set();hashes.add((await points()).hash);
 await page.screenshot({path:join(shots,'cyberdad-idle.png'),omitBackground:true});
 for(const [label,kind,index] of [['打个哈欠','yawn','1'],['吃块饼干','eat','2'],['陪我工作','work','3']]){
  await command(label,'陪陪赛博老爸');await page.locator(`body[data-action="${kind}"]`).waitFor();assert.equal(await frame(),index);
  const p=await points();assert.ok(p.opaque&&p.clear);hashes.add(p.hash);await hit(p.opaque,true);await hit(p.clear,false);
  await page.screenshot({path:join(shots,`cyberdad-${kind}.png`),omitBackground:true});
 }
 await command('散散步');await page.locator('body[data-action="walk"]').waitFor();assert.equal(await frame(),'4');
 hashes.add((await points()).hash);
 const walk=await page.locator('#creature').evaluate(e=>{
  const a=e.getAnimations().find(a=>a.animationName==='cyberdad-walk');if(!a)return null;const before=a.currentTime,samples=[];
  for(const t of [750,2250,3750,5250,6000]){
   a.currentTime=t;const m=new DOMMatrix(getComputedStyle(e).transform);
   a.currentTime=t-5;const previous=new DOMMatrix(getComputedStyle(e).transform).e;
   a.currentTime=Math.min(t+5,6000);const next=new DOMMatrix(getComputedStyle(e).transform).e;
   samples.push({t,x:m.e,face:m.a,velocity:next-previous});
  }a.currentTime=before;return samples;
 });
 assert.ok(walk?.some(s=>s.x<-5)&&walk.some(s=>s.x>5));assert.ok(walk.some(s=>s.face<0)&&walk.some(s=>s.face>0));assert.equal(walk.at(-1).x,0);
 assert.ok(walk.slice(0,-1).every(s=>Math.sign(s.velocity)===Math.sign(s.face)),'the right-facing pose must face its direction of travel');
 await page.screenshot({path:join(shots,'cyberdad-walk.png'),omitBackground:true});
 assert.equal(hashes.size,5,'all five atlas poses contain different real pixels');
 assert.deepEqual(await bounds(),home);assert.equal(readFileSync(join(data,'appearance.json'),'utf8'),saved,'menu animations never move or persist the window');
 assert.equal(await nodes(),0,'menu and idle actions never synthesize click audio');
 console.log('native cyberdad menu → actual atlas frames, walk turn and alpha IPC: PASS');

 await command('暂停动画');await page.locator('body.paused').waitFor();await page.waitForTimeout(100);
 const frozen=await page.locator('#creature').evaluate(e=>getComputedStyle(e).transform);
 await page.clock.runFor(120000);await page.waitForTimeout(120);
 assert.equal(await action(),'walk');assert.equal(await frame(),'4');assert.equal(await page.locator('#creature').evaluate(e=>getComputedStyle(e).transform),frozen);
 await menu();const paused=await app.evaluate(()=>globalThis.__cyberdadMenu.find(x=>x.label==='陪陪赛博老爸').submenu.map(x=>x.enabled));assert.deepEqual(paused,[false,false,false]);
 await send('eat');assert.equal(await action(),'walk');await clickPet();assert.equal(await nodes(),0,'paused trusted click produces no audio');
 await command('继续动画');await page.locator('body:not(.paused)').waitFor();
 await command('打个盹');await page.locator('body[data-mood="sleeping"]').waitFor();assert.equal(await frame(),'5');
 hashes.add((await points()).hash);await page.screenshot({path:join(shots,'cyberdad-sleep.png'),omitBackground:true});
 await clickPet();assert.equal(await frame(),'6');assert.equal(await action(),'wake');assert.equal(await nodes(),2,'the first trusted click wakes and schedules the local sound');
 hashes.add((await points()).hash);await page.screenshot({path:join(shots,'cyberdad-wave.png'),omitBackground:true});
 assert.ok(await page.evaluate(()=>window.__trustedReleases.every(Boolean)),'Playwright clicks are trusted renderer input');
 await page.clock.runFor(2200);await page.locator('body[data-action="idle"]').waitFor();
 await command('点击音效');for(let i=0;i<50&&store.get().pet.sound;i++)await page.waitForTimeout(20);assert.equal(store.get().pet.sound,false);
 await page.clock.runFor(250);await clickPet();assert.equal(await nodes(),2,'muted trusted click schedules no audio nodes');
 await command('点击音效');assert.equal(store.get().pet.sound,true);await page.clock.runFor(250);
 await clickPet();assert.equal(await nodes(),4,'unmuting restores sound on the next explicit click');
 await page.clock.runFor(2500);
 const beforeDrag=await bounds(),p=(await points()).opaque,count=await nodes();
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+15,p.y+8);
 await page.locator('body[data-action="drag"]').waitFor();assert.equal(await frame(),'7');
 hashes.add((await points()).hash);await page.screenshot({path:join(shots,'cyberdad-drag.png'),omitBackground:true});
 await page.mouse.move(p.x+20,p.y+12);await page.mouse.up();await page.locator('body[data-action="land"]').waitFor();
 assert.equal(await nodes(),count,'a real drag does not make click sounds');
 const afterDrag=await bounds();assert.ok(afterDrag.x!==beforeDrag.x||afterDrag.y!==beforeDrag.y);assert.deepEqual(store.get().pet.position,{x:afterDrag.x,y:afterDrag.y});
 await page.clock.runFor(3500);assert.equal(await frame(),'0');
 await page.clock.runFor(45000);assert.equal(await page.locator('body').getAttribute('data-mood'),'drowsy');
 await page.clock.runFor(76000);assert.equal(await frame(),'5');assert.equal(await nodes(),count,'automatic drowsy/sleep transitions stay silent');
 assert.equal(hashes.size,8,'all eight independently drawn poses must contain distinct real pixels');
 await command('叫醒');
 for(const [label,size] of [['迷你',80],['小巧',100],['展示',240],['大号',180]]){
  await command(`${label} · ${size} px`,'桌宠大小');
  for(let i=0;i<50&&(await bounds()).width!==size;i++)await page.waitForTimeout(20);
  assert.equal((await bounds()).width,size);assert.equal((await bounds()).height,size);assert.equal(store.get().pet.size,size);
  const p=await points();assert.ok(p.opaque&&p.clear);await hit(p.opaque,true);await hit(p.clear,false);
 }
 assert.deepEqual(errors,[]);
 console.log('pause/resume, trusted click wake/audio, mute, drag pose/save, eight unique frames, silent sleep and native resize: PASS');
} finally {
 const exit=new Promise((resolve,reject)=>{if(child.exitCode!==null){resolve(child.exitCode);return;}const timer=setTimeout(()=>reject(Error('cyberdad test did not exit')),6000);child.once('exit',code=>{clearTimeout(timer);resolve(code);});});
 try {
  await app.evaluate(()=>{const inspector=process.getBuiltinModule('node:inspector');setTimeout(()=>inspector.close(),0);}).catch(()=>{});
  if(page&&!page.isClosed())await page.evaluate(()=>{void window.cyberDressup.action('quit').catch(()=>{});}).catch(()=>{});
  assert.equal(await exit,0);
 } catch(error){child.kill('SIGKILL');throw error;}
 finally{if(child.exitCode!==null)rmSync(data,{recursive:true,force:true});}
}
