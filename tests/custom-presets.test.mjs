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
 const future=JSON.stringify({version:2,pet:[]});writeFileSync(file,future);assert.throws(()=>s.addPreset({kind:'pet',name:'new',image:image()}),/版本较新/);assert.equal(readFileSync(file,'utf8'),future);
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
