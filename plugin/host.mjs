import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../scripts/paths.mjs';
import { Store } from '../desktop/settings.mjs';
import { startPet } from '../scripts/pet-process.mjs';
import { builtinMediaResponse } from '../plugin/builtin-media.mjs';
export const name = 'cyberdaddy-dressup';
export const inject = ['connection'];
export function apply(ctx) {
  const store = new Store(join(root, '.local'));
  let petWarning='';
  const warn=error=>{petWarning='桌宠未启动：'+error.message+'。请运行 ./run.sh setup 修复依赖。';};
  const maybePet = () => { const s=store.get(); if(s.enabled && s.pet.enabled){try{petWarning='';startPet({onError:warn});}catch(error){warn(error);}} };
  const current=()=>({...store.get(),warning:petWarning||store.warning});
  ctx.connection.fetch.register({path:'/api/cyberdaddy',methods:['POST'],requestBody:'buffered',async fetch(request) {
    try {
      const text=await request.text();
      if(text.length>7*1024*1024)throw new Error('导入内容过大，单张图片最多 5 MB');
      const {endpoint,payload}=JSON.parse(text);let value;
      if(endpoint==='get') value=current();
      else if(endpoint==='update') { store.update(payload); maybePet();value=current(); }
      else if(endpoint==='reset') {store.reset();petWarning='';value=current();}
      else if(endpoint==='add-preset') {store.addPreset(payload);value=current();}
      else if(endpoint==='remove-preset') {store.removePreset(payload);value=current();}
      else throw new Error('未知美化操作');
      return Response.json({ok:true,value});
    } catch(error) { return Response.json({ok:false,error:{message:error.message}},{status:400}); }
  }});
  ctx.connection.fetch.register({path:'/api/cyberdaddy/asset',methods:['GET'],requestBody:'buffered',fetch(request) {
    try {
      const {data,type}=store.readAsset(new URL(request.url).searchParams.get('id'));
      return new Response(data,{headers:{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; sandbox"}});
    }catch {return new Response('素材不存在或已删除',{status:404});}
  }});
  ctx.connection.fetch.register({path:'/api/cyberdaddy/builtin',methods:['GET','HEAD'],requestBody:'buffered',fetch:request=>builtinMediaResponse(request,root)});
  ctx.on('webserver/index-inject', rows => {
    rows.push({kind:'global',name:'__CYBERDADDY_APPEARANCE__',value:store.get()});
    if(existsSync(join(root,'lib/startup.js')))rows.push({kind:'script',placement:'body',text:readFileSync(join(root,'lib/startup.js'),'utf8')});
  });
  maybePet();
}
