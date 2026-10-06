import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, symlinkSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../desktop/settings.mjs';
import { themes } from '../src/presets.mjs';
const fresh=()=>new Store(mkdtempSync(join(tmpdir(),'dressup-custom-')));
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="#66aaff"/></svg>';
const image=(text=svg,type='image/svg+xml')=>({name:'my-pet.svg',type,dataUrl:`data:${type};base64,${Buffer.from(text).toString('base64')}`});
const addTheme=s=>s.addPreset({kind:'theme',name:'我的冰蓝',scheme:'light',palette:themes.find(p=>p.id==='ice').palette});

test('imports three independent catalogs, returns metadata only and survives process restart',()=>{
 const s=fresh();addTheme(s);s.addPreset({kind:'splash',name:'我的启动页',image:image(),scene:'stars',background:'#e5f0ff'});s.addPreset({kind:'pet',name:'我的伙伴',image:image()});
 const state=s.get();assert.equal(state.custom.theme.length,1);assert.equal(state.custom.splash.length,1);assert.equal(state.custom.pet.length,1);assert.equal(state.theme,'whalegirl');
 for(const kind of ['theme','splash','pet']){const p=state.custom[kind][0];assert.match(p.id,/^custom-[a-f0-9-]{36}$/);assert.match(p.preview,/^custom-assets\//);assert.ok(!JSON.stringify(p).includes('data:'));assert.equal(s.readAsset(p.id).type,'image/svg+xml');}
 s.update({theme:state.custom.theme[0].id,splash:state.custom.splash[0].id,pet:{id:state.custom.pet[0].id,enabled:true}});
 const restarted=new Store(join(s.file,'..')).get();assert.equal(restarted.theme,state.custom.theme[0].id);assert.equal(restarted.pet.id,state.custom.pet[0].id);assert.deepEqual(restarted.custom,state.custom);
});

test('reset preserves imports; removing an applied preset falls back only its own option',()=>{
 const s=fresh();addTheme(s);s.addPreset({kind:'pet',name:'伙伴',image:image()});const {theme,pet}=s.get().custom;
 s.update({theme:theme[0].id,splash:'stars',pet:{id:pet[0].id,enabled:true,size:230}});s.removePreset({kind:'theme',id:theme[0].id});
 assert.equal(s.get().theme,'whalegirl');assert.equal(s.get().splash,'stars');assert.equal(s.get().pet.id,pet[0].id);assert.equal(s.get().pet.enabled,true);assert.equal(s.get().pet.size,230);
 s.reset();assert.equal(s.get().custom.pet.length,1);assert.equal(s.get().pet.id,'whalegirl');assert.throws(()=>s.readAsset(theme[0].id),/不存在/);
 assert.throws(()=>s.removePreset({kind:'pet',id:'robot'}),/自定义/);
});

test('rejects unsafe SVG, false image signatures, oversized files, paths, and unreadable palettes',()=>{
 const s=fresh();
 for(const bad of ['<svg><script>alert(1)</script></svg>','<svg onload="x()"></svg>','<!DOCTYPE svg><svg/>','<svg><foreignObject/></svg>','<svg><image href="https://evil.test/a.png"/></svg>','<svg><rect fill="url(https://evil.test/a)"/></svg>'])assert.throws(()=>s.addPreset({kind:'pet',name:'bad',image:image(bad)}));
 assert.throws(()=>s.addPreset({kind:'pet',name:'fake',image:image('not a PNG','image/png')}),/图片|PNG/);
 assert.throws(()=>s.addPreset({kind:'pet',name:'huge',image:image('x'.repeat(5*1024*1024+1))}),/5 MiB/);
 assert.throws(()=>s.readAsset('../../appearance'),/自定义/);
 assert.throws(()=>s.addPreset({kind:'theme',name:'invisible',scheme:'light',palette:{...themes.find(p=>p.id==='ice').palette,text:'#ffffff'}}),/对比度/);
 assert.throws(()=>s.addPreset({kind:'theme',name:'style',scheme:'light',palette:{...themes.find(p=>p.id==='ice').palette,base:'url(http://evil)'}}),/颜色/);
 assert.equal(s.get().custom.pet.length,0);
});

test('missing or damaged assets are omitted and applied choices safely fall back without deleting source',()=>{
 const s=fresh();s.addPreset({kind:'pet',name:'lost',image:image()});const p=s.get().custom.pet[0];s.update({theme:'forest',pet:{id:p.id,enabled:true}});
 writeFileSync(join(s.file,'..',p.asset),'not svg');const state=s.get();assert.equal(state.custom.pet.length,0);assert.equal(state.pet.id,'whalegirl');assert.equal(state.theme,'forest');assert.match(s.warning,/损坏|缺失/);assert.equal(readFileSync(join(s.file,'..',p.asset),'utf8'),'not svg');
 assert.ok(readdirSync(join(s.file,'..')).some(n=>n.startsWith('custom-presets.broken-')));
});

test('corrupt catalog gets a backup; future catalogs cannot be overwritten',()=>{
 const s=fresh(),file=join(s.file,'..','custom-presets.json');writeFileSync(file,'{invalid');assert.equal(s.get().custom.pet.length,0);assert.ok(readdirSync(join(s.file,'..')).some(n=>n.startsWith('custom-presets.broken-')));
 const future=JSON.stringify({version:3,pet:[]});writeFileSync(file,future);assert.throws(()=>s.addPreset({kind:'pet',name:'new',image:image()}),/版本较新/);assert.equal(readFileSync(file,'utf8'),future);
});

test('each category enforces its own twenty-preset limit',()=>{
 const s=fresh();for(let i=0;i<20;i++)s.addPreset({kind:'pet',name:'伙伴'+i,image:image()});assert.throws(()=>s.addPreset({kind:'pet',name:'21',image:image()}),/20/);addTheme(s);assert.equal(s.get().custom.theme.length,1);
});

const bitmapFixtures = {
  'image/png':'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNI2fIfAAOXAhg37WE8AAAAAElFTkSuQmCC',
  'image/gif':'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
  'image/webp':'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
  'image/jpeg':'/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwUDAwMFBgUFBQUGCAYGBgYGCAoICAgICAgKCgoKCgoKCgwMDAwMDA4ODg4ODw8PDw8PDw8PD//bAEMBAgICBAQEBwQEBxALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/dAAQAAf/aAAwDAQACEQMRAD8A+lKKKK/sw/kc/9k='
};
test('PNG, JPEG, WebP and GIF imports retain their verified type; corrupt PNG pixels are rejected',()=>{
 const s=fresh();
 for(const [type,b64] of Object.entries(bitmapFixtures)){const state=s.addPreset({kind:'pet',name:type,image:{type,dataUrl:`data:${type};base64,${b64}`}});const pet=state.custom.pet.at(-1);assert.equal(s.readAsset(pet.id).type,type);assert.ok(s.readAsset(pet.id).data.equals(Buffer.from(b64,'base64')));}
 const broken=Buffer.from(bitmapFixtures['image/png'],'base64');broken[43]^=1;assert.throws(()=>s.addPreset({kind:'pet',name:'bad crc',image:{type:'image/png',dataUrl:'data:image/png;base64,'+broken.toString('base64')}}),/PNG/);
});

test('tampered catalog paths and symlink assets cannot read arbitrary local files',()=>{
 const s=fresh();s.addPreset({kind:'pet',name:'safe',image:image()});const catalogFile=join(s.file,'..','custom-presets.json'),catalog=JSON.parse(readFileSync(catalogFile,'utf8'));
 catalog.pet[0].asset='../../secret.svg';catalog.pet[0].preview='../../secret.svg';writeFileSync(catalogFile,JSON.stringify(catalog));assert.equal(s.get().custom.pet.length,0);
 s.addPreset({kind:'pet',name:'link',image:image()});const pet=s.get().custom.pet[0];
 const source=join(s.file,'..','source.svg');writeFileSync(source,svg);const target=join(s.file,'..',pet.asset);
 // Replace an owned test asset with a symlink; source content must remain untouched.
 unlinkSync(target);symlinkSync(source,target);assert.equal(s.get().custom.pet.length,0);assert.equal(readFileSync(source,'utf8'),svg);
});

test('parallel process imports keep both libraries and independent appearance updates',async()=>{
 const {spawn}=await import('node:child_process'),s=fresh(),moduleUrl=new URL('../desktop/settings.mjs',import.meta.url).href,dir=join(s.file,'..');
 const run=kind=>new Promise((resolve,reject)=>{const script=`import {Store} from ${JSON.stringify(moduleUrl)};const store=new Store(${JSON.stringify(dir)});for(let i=0;i<5;i++)store.addPreset({kind:${JSON.stringify(kind)},name:'parallel '+i,image:${JSON.stringify(image())}});store.update(${kind==='pet'?'{pet:{size:240}}':"{theme:'forest'}"});`;const child=spawn(process.execPath,['--input-type=module','-e',script],{stdio:['ignore','ignore','pipe']});let error='';child.stderr.on('data',d=>error+=d);child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(error)));});
 await Promise.all([run('pet'),run('splash')]);const state=s.get();assert.equal(state.custom.pet.length,5);assert.equal(state.custom.splash.length,5);assert.equal(state.pet.size,240);assert.equal(state.theme,'forest');
});

const mp4 = () => readFileSync(new URL('../assets/whalegirl-startup.mp4',import.meta.url));
const videoPayload = (data=mp4()) => ({kind:'splash',name:'我的启动视频',video:{name:'opening.mp4',type:'video/mp4',dataUrl:'data:video/mp4;base64,'+data.toString('base64')},image:{name:'poster.jpg',type:'image/jpeg',dataUrl:'data:image/jpeg;base64,'+bitmapFixtures['image/jpeg']},videoFit:'contain'});
test('custom MP4 retains video and poster separately, restores duration and independent selections, and removes both files',()=>{
 const s=fresh();s.update({theme:'forest',pet:{id:'cat',size:180}});const state=s.addPreset(videoPayload()),p=state.custom.splash[0];
 assert.equal(p.mediaType,'video');assert.match(p.asset,/\.mp4$/);assert.match(p.preview,/\.jpg$/);assert.equal(p.videoFit,'contain');assert.ok(p.duration>6&&p.duration<8);assert.equal(state.splash,'whalegirl');
 assert.equal(s.readAsset(p.id).type,'image/jpeg');assert.equal(s.readAsset(p.id,'video').type,'video/mp4');assert.deepEqual(s.readAsset(p.id,'video').data,mp4());
 s.update({splash:p.id});const restarted=new Store(s.dir).get();assert.equal(restarted.splash,p.id);assert.equal(restarted.theme,'forest');assert.equal(restarted.pet.id,'cat');assert.equal(restarted.pet.size,180);assert.equal(restarted.custom.splash[0].duration,p.duration);
 assert.throws(()=>s.readAsset(p.id,'../../appearance.json'),/类型|variant|素材/);
 s.removePreset({kind:'splash',id:p.id});assert.equal(s.get().splash,'whalegirl');assert.equal(s.get().theme,'forest');assert.equal(readdirSync(join(s.dir,'custom-assets')).length,0);
});
test('video import rejects invalid media and duration, pet video and excessive size without writing assets',()=>{
 const s=fresh(),original=mp4();
 for(const data of [Buffer.from('not mp4'),original.subarray(0,original.length-1),Buffer.from(bitmapFixtures['image/jpeg'],'base64')])assert.throws(()=>s.addPreset(videoPayload(data)),/MP4|视频/);
 const tooLong=Buffer.from(original),mvhd=tooLong.indexOf(Buffer.from('mvhd'));assert.ok(mvhd>0);assert.equal(tooLong[mvhd+4],0);const timescale=tooLong.readUInt32BE(mvhd+16);tooLong.writeUInt32BE(timescale*121,mvhd+20);assert.throws(()=>s.addPreset(videoPayload(tooLong)),/120/);
 assert.throws(()=>s.addPreset({...videoPayload(),kind:'pet'}),/启动画面/);
 assert.throws(()=>s.addPreset({...videoPayload(),videoFit:'stretch'}),/显示|填充|适配/);
 assert.throws(()=>s.addPreset(videoPayload(Buffer.alloc(50*1024*1024+1))),/50 MiB/);
 assert.throws(()=>s.addPreset({...videoPayload(),image:image()}),/JPEG|封面/);
 assert.equal(s.get().custom.splash.length,0);assert.equal(s.get().custom.pet.length,0);
});
test('damaged or linked custom video safely falls back while preserving the unrelated theme',()=>{
 const s=fresh();s.addPreset(videoPayload());const p=s.get().custom.splash[0];s.update({splash:p.id,theme:'forest'});writeFileSync(join(s.dir,p.asset),'broken video');assert.equal(s.get().splash,'whalegirl');assert.equal(s.get().theme,'forest');assert.equal(s.get().custom.splash.length,0);
 s.addPreset(videoPayload());const second=s.get().custom.splash[0];unlinkSync(join(s.dir,second.asset));symlinkSync(new URL('../assets/whalegirl-startup.mp4',import.meta.url),join(s.dir,second.asset));assert.equal(s.get().custom.splash.length,0);assert.throws(()=>s.readAsset(second.id,'video'),/不存在/);
});
test('failed catalog commit rolls back both imported media files and in-memory entries',()=>{
 const s=fresh(),catalog=s.get().custom;const originalWrite=s.custom.write;s.custom.write=()=>{throw new Error('disk write failed');};
 assert.throws(()=>s.custom.add(videoPayload(),catalog),/disk write failed/);assert.equal(catalog.splash.length,0);assert.equal(readdirSync(join(s.dir,'custom-assets')).length,0);s.custom.write=originalWrite;
});


test('version 1 image catalogs migrate to version 2 without changing presets or appearance selections',()=>{
 const s=fresh();s.addPreset({kind:'splash',name:'原有图片启动页',image:image(),scene:'stars',background:'#e5f0ff'});s.addPreset({kind:'pet',name:'原有伙伴',image:image()});
 const before=s.get();s.update({splash:before.custom.splash[0].id,theme:'forest',pet:{id:before.custom.pet[0].id,enabled:true}});
 const file=join(s.dir,'custom-presets.json'),legacy=JSON.parse(readFileSync(file,'utf8'));legacy.version=1;writeFileSync(file,JSON.stringify(legacy));
 const migrated=new Store(s.dir).get();assert.deepEqual(migrated.custom,before.custom);assert.equal(migrated.splash,before.custom.splash[0].id);assert.equal(migrated.pet.id,before.custom.pet[0].id);assert.equal(migrated.theme,'forest');assert.equal(migrated.pet.enabled,true);
 assert.equal(JSON.parse(readFileSync(file,'utf8')).version,2);assert.ok(!readdirSync(s.dir).some(name=>name.startsWith('custom-presets.broken-')));
});
test('video catalog declares schema 2 so version 1 readers reject before cleanup; deleting video never downgrades it',()=>{
 const s=fresh();s.addPreset(videoPayload());const p=s.get().custom.splash[0],file=join(s.dir,'custom-presets.json');
 const disk=JSON.parse(readFileSync(file,'utf8'));assert.equal(disk.version,2);assert.equal(disk.splash[0].mediaType,'video');
 // v0.8.2 rejects numeric schema versions > 1 before inspecting records or repairing files.
 assert.ok(Number.isInteger(disk.version)&&disk.version>1,'must activate the old reader forward-version guard');
 assert.equal(new Store(s.dir).get().custom.splash[0].id,p.id);
 s.removePreset({kind:'splash',id:p.id});assert.equal(JSON.parse(readFileSync(file,'utf8')).version,2);
});
