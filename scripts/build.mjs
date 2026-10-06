import {build} from 'esbuild';
import {mkdirSync,readFileSync,writeFileSync,readdirSync,copyFileSync} from 'node:fs';
import {join} from 'node:path';
import {root} from './paths.mjs';
mkdirSync(join(root,'lib'),{recursive:true});
// Only small built-in SVGs are embedded. MP4 and wallpaper/sprite PNG files
// stay as files, served through the authenticated fixed built-in media route.
const assets={};
for(const name of readdirSync(join(root,'assets'),{recursive:true})) {
 if(name.endsWith('.svg')) assets['assets/'+name]='data:image/svg+xml;base64,'+readFileSync(join(root,'assets',name)).toString('base64');
}
const sceneCss=readFileSync(join(root,'src/scenes.css'),'utf8');
const css=readFileSync(join(root,'src/manager.css'),'utf8')+'\n'+sceneCss;
writeFileSync(join(root,'lib/assets.mjs'),`export const assets=${JSON.stringify(assets)};\nexport const css=${JSON.stringify(css)};\nexport const sceneCss=${JSON.stringify(sceneCss)};\n`);
const result=await build({entryPoints:[join(root,'plugin/client.jsx')],bundle:true,format:'cjs',platform:'browser',external:['react'],write:false});
writeFileSync(join(root,'lib/client.js'),`window.__ModuleLoader__.load({id:'@cyberdaddy/harness-dressup',factory:(require)=>{var module={exports:{}};var exports=module.exports;\n${result.outputFiles[0].text}\nreturn module.exports;}});\n`);
await build({entryPoints:[join(root,'plugin/startup.mjs')],bundle:true,format:'iife',platform:'browser',outfile:join(root,'lib/startup.js')});
copyFileSync(join(root,'plugin/host.mjs'),join(root,'lib/index.js'));
console.log('原生 Harness 插件已构建：lib/client.js + lib/index.js');
