import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,copyFileSync,writeFileSync,symlinkSync,existsSync,readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {root} from '../scripts/paths.mjs';
import {defaults} from '../src/presets.mjs';
async function fixture(petEnabled=false){
 const dir=mkdtempSync(join(tmpdir(),'native-addon-'));
 const files=['plugin/host.mjs','plugin/builtin-media.mjs','desktop/settings.mjs','desktop/custom-presets.mjs','scripts/paths.mjs','scripts/pet-process.mjs','src/presets.mjs','src/pet-size.mjs','src/catalog.mjs','src/settings-model.mjs'];
 for(const file of files){if(!existsSync(join(root,file)))continue;const target=join(dir,file);mkdirSync(dirname(target),{recursive:true});copyFileSync(join(root,file),target);}
 mkdirSync(join(dir,'node_modules'));symlinkSync(join(root,'node_modules/proper-lockfile'),join(dir,'node_modules/proper-lockfile'));
 writeFileSync(join(dir,'package.json'),'{}');mkdirSync(join(dir,'.local'));writeFileSync(join(dir,'.local/appearance.json'),JSON.stringify({version:1,enabled:true,pet:{enabled:petEnabled}}));
 const routes=new Map(),events=new Map();
 const {apply}=await import(pathToFileURL(join(dir,'plugin/host.mjs')).href);
 apply({connection:{fetch:{register:r=>routes.set(r.path,r)}},on:(name,fn)=>events.set(name,fn)});
 const call=async(endpoint,payload)=>(await routes.get('/api/cyberdaddy').fetch(new Request('http://local/api/cyberdaddy',{method:'POST',body:JSON.stringify({endpoint,payload})}))).json();
 return {routes,events,call,dir};
}
test('missing optional Electron or startup assets never prevent the native host plugin from registering',async()=>{
 const {call,events}=await fixture(true);const data=await call('get');assert.equal(data.ok,true);assert.match(data.value.warning,/桌宠未启动/);
 const rows=[];events.get('webserver/index-inject')(rows);assert.equal(rows.length,1);assert.equal(rows[0].name,'__CYBERDADDY_APPEARANCE__');
});
test('native API imports an image, serves only registered bytes and falls back after removal',async()=>{
 const {call,routes,events}=await fixture();
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="20" fill="#417bd6"/></svg>';
 const added=await call('add-preset',{kind:'splash',name:'本地云朵',scene:'stars',background:'#e8f2ff',image:{name:'cloud.svg',type:'image/svg+xml',dataUrl:'data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64')}});
 assert.equal(added.ok,true,added.error?.message);const preset=added.value.custom.splash[0];assert.equal(preset.name,'本地云朵');assert.ok(!JSON.stringify(added).includes('base64'));
 assert.equal((await call('update',{splash:preset.id})).value.splash,preset.id);
 const rows=[];events.get('webserver/index-inject')(rows);assert.equal(rows[0].value.splash,preset.id);
 const asset=routes.get('/api/cyberdaddy/asset');assert.ok(asset,'registered image endpoint');
 const response=await asset.fetch(new Request('http://local/api/cyberdaddy/asset?id='+preset.id));assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/^image\/svg\+xml/);assert.equal(await response.text(),svg);
 assert.equal((await asset.fetch(new Request('http://local/api/cyberdaddy/asset?id=../../package.json'))).status,404);
 const removed=await call('remove-preset',{kind:'splash',id:preset.id});assert.equal(removed.value.splash,defaults.splash);assert.equal(removed.value.custom.splash.length,0);
 assert.equal((await asset.fetch(new Request('http://local/api/cyberdaddy/asset?id='+preset.id))).status,404);
});


test('bundled media endpoint whitelists exact local assets and serves correct byte ranges',async()=>{
 const {routes,dir}=await fixture();const route=routes.get('/api/cyberdaddy/builtin');assert.ok(route,'registered fixed built-in media endpoint');
 mkdirSync(join(dir,'assets'));const original=readFileSync(join(root,'assets/whalegirl-startup.mp4'));writeFileSync(join(dir,'assets/whalegirl-startup.mp4'),original);
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNI2fIfAAOXAhg37WE8AAAAAElFTkSuQmCC','base64');
 for(const name of ['whalegirl-wallpaper','whalegirl-atlas','cyberdad-logo','cyberdad-atlas','cyberdad-wallpaper','geek-wallpaper'])writeFileSync(join(dir,`assets/${name}.png`),png);
 writeFileSync(join(dir,'assets/geek-startup.mp4'),original);
 const request=(id,headers={},method='GET')=>route.fetch(new Request('http://local/api/cyberdaddy/builtin?id='+encodeURIComponent(id),{method,headers}));
 const full=await request('whalegirl-startup');assert.equal(full.status,200);assert.equal(full.headers.get('content-type'),'video/mp4');assert.equal(full.headers.get('accept-ranges'),'bytes');assert.equal(full.headers.get('x-content-type-options'),'nosniff');assert.equal(Number(full.headers.get('content-length')),original.length);assert.deepEqual(Buffer.from(await full.arrayBuffer()),original);
 const partial=await request('whalegirl-startup',{Range:'bytes=0-31'});assert.equal(partial.status,206);assert.equal(partial.headers.get('content-range'),`bytes 0-31/${original.length}`);assert.deepEqual(Buffer.from(await partial.arrayBuffer()),original.subarray(0,32));
 const suffix=await request('whalegirl-startup',{Range:'bytes=-16'});assert.equal(suffix.status,206);assert.deepEqual(Buffer.from(await suffix.arrayBuffer()),original.subarray(-16));
 const open=await request('whalegirl-startup',{Range:`bytes=${original.length-16}-`});assert.equal(open.status,206);assert.deepEqual(Buffer.from(await open.arrayBuffer()),original.subarray(-16));
 for(const range of ['bytes=999999999-','bytes=20-10','bytes=-0','bytes=0-1,4-5','garbage']){const invalid=await request('whalegirl-startup',{Range:range});assert.equal(invalid.status,416);assert.equal(invalid.headers.get('content-range'),`bytes */${original.length}`);}
 const head=await request('whalegirl-startup',{},'HEAD');assert.equal(head.status,200);assert.equal(await head.text(),'');assert.equal(Number(head.headers.get('content-length')),original.length);
 for(const id of ['whalegirl-wallpaper','whalegirl-atlas','cyberdad-logo','cyberdad-atlas','cyberdad-wallpaper','geek-wallpaper']){const image=await request(id);assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');assert.deepEqual(Buffer.from(await image.arrayBuffer()),png);}
 const geek=await request('geek-startup',{Range:'bytes=0-31'});assert.equal(geek.status,206);assert.equal(geek.headers.get('content-type'),'video/mp4');assert.deepEqual(Buffer.from(await geek.arrayBuffer()),original.subarray(0,32));
 for(const id of ['../../package.json','whalegirl-startup.mp4','constructor','assets/whalegirl-startup.mp4','geek-reference','geek-atlas','assets/geek-startup.mp4',''])assert.equal((await request(id)).status,404);
 writeFileSync(join(dir,'assets/whalegirl-wallpaper.png'),'<html>not an image</html>');assert.equal((await request('whalegirl-wallpaper')).status,404);
 writeFileSync(join(dir,'assets/whalegirl-startup.mp4'),'<html>not a video</html>');assert.equal((await request('whalegirl-startup')).status,404);
});
