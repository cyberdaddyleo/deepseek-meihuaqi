import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../scripts/paths.mjs';
import { Store } from '../desktop/settings.mjs';
import { startPet } from '../scripts/pet-process.mjs';
import { builtinMediaResponse } from '../plugin/builtin-media.mjs';
import { IMAGE_MAX_BYTES, VIDEO_MAX_BYTES } from '../src/media-limits.mjs';
const imageRequestLimit=7*1024*1024;
const videoRequestLimit=Math.ceil((VIDEO_MAX_BYTES+IMAGE_MAX_BYTES)/3)*4+16*1024;
function mediaResponse(request,{data,type}) {
  const headers={'Content-Type':type,'Content-Length':String(data.length),'Accept-Ranges':'bytes','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; sandbox"};
  const range=request.headers.get('range');
  if(range&&request.method!=='HEAD'){
    const match=/^bytes=(\d*)-(\d*)$/.exec(range);
    let start,end;
    if(match&&(match[1]||match[2])){
      if(!match[1]){const suffix=Number(match[2]);if(Number.isSafeInteger(suffix)&&suffix>0){start=Math.max(0,data.length-suffix);end=data.length-1;}}
      else{start=Number(match[1]);end=match[2]?Number(match[2]):data.length-1;}
    }
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=data.length||end<start)return new Response(null,{status:416,headers:{...headers,'Content-Length':'0','Content-Range':`bytes */${data.length}`}});
    end=Math.min(end,data.length-1);
    return new Response(data.subarray(start,end+1),{status:206,headers:{...headers,'Content-Length':String(end-start+1),'Content-Range':`bytes ${start}-${end}/${data.length}`}});
  }
  return new Response(request.method==='HEAD'?null:data,{headers});
}
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
      if(text.length>videoRequestLimit)throw new Error('导入内容过大，视频最多 50 MiB，封面最多 5 MiB');
      const {endpoint,payload}=JSON.parse(text);let value;
      if(text.length>imageRequestLimit&&!(endpoint==='add-preset'&&payload?.kind==='splash'&&payload?.video))throw new Error('导入内容过大，单张图片最多 5 MiB');
      if(endpoint==='get') value=current();
      else if(endpoint==='update') { store.update(payload); maybePet();value=current(); }
      else if(endpoint==='reset') {store.reset();petWarning='';value=current();}
      else if(endpoint==='add-preset') {store.addPreset(payload);value=current();}
      else if(endpoint==='remove-preset') {store.removePreset(payload);value=current();}
      else throw new Error('未知美化操作');
      return Response.json({ok:true,value});
    } catch(error) { return Response.json({ok:false,error:{message:error.message}},{status:400}); }
  }});
  ctx.connection.fetch.register({path:'/api/cyberdaddy/asset',methods:['GET','HEAD'],requestBody:'buffered',fetch(request) {
    try {
      const params=new URL(request.url).searchParams;
      return mediaResponse(request,store.readAsset(params.get('id'),params.get('variant')??'preview'));
    }catch {return new Response('素材不存在或已删除',{status:404});}
  }});
  ctx.connection.fetch.register({path:'/api/cyberdaddy/builtin',methods:['GET','HEAD'],requestBody:'buffered',fetch:request=>builtinMediaResponse(request,root)});
  ctx.on('webserver/index-inject', rows => {
    rows.push({kind:'global',name:'__CYBERDADDY_APPEARANCE__',value:store.get()});
    if(existsSync(join(root,'lib/startup.js')))rows.push({kind:'script',placement:'body',text:readFileSync(join(root,'lib/startup.js'),'utf8')});
  });
  maybePet();
}
