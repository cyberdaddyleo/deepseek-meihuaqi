import { randomUUID } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, copyFileSync, lstatSync, unlinkSync } from 'node:fs';
import { join, extname } from 'node:path';
import { customAssetId } from '../src/catalog.mjs';
const kinds = ['theme', 'splash', 'pet'];
const maxBytes = 5 * 1024 * 1024;
const mimeExt = { 'image/png':'png', 'image/jpeg':'jpg', 'image/webp':'webp', 'image/gif':'gif', 'image/svg+xml':'svg' };
const paletteKeys = ['base','surface','sidebar','soft','selected','text','muted','accent','border','code'];
const idPattern = /^custom-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const empty = () => ({ theme:[], splash:[], pet:[] });
const plain = value => value && typeof value === 'object' && !Array.isArray(value);
export function atomicJSON(file, value) {
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n', { mode:0o600 });
  renameSync(temporary, file);
}
function nameOf(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 40 || /[\u0000-\u001f\u007f]/.test(value)) throw new Error('预设名称应为 1–40 个字符');
  return value.trim();
}
function color(value) {
  if (typeof value !== 'string' || !/^#[a-f0-9]{6}$/i.test(value)) throw new Error('颜色必须使用 #rrggbb 格式');
  return value.toLowerCase();
}
function luminance(value) {
  const c=[1,3,5].map(n=>parseInt(value.slice(n,n+2),16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);
  return .2126*c[0]+.7152*c[1]+.0722*c[2];
}
function contrast(a,b) { const x=luminance(a),y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
function paletteOf(input) {
  if (!plain(input)) throw new Error('请提供完整的主题颜色');
  const palette=Object.fromEntries(paletteKeys.map(key=>[key,color(input[key])]));
  for (const key of ['base','surface','sidebar','soft','selected','code']) {
    if (contrast(palette.text,palette[key])<4.5) throw new Error(`正文与 ${key} 背景对比度不足（至少 4.5:1）`);
  }
  for (const key of ['base','surface','sidebar','code']) {
    if (contrast(palette.muted,palette[key])<3) throw new Error(`次要文字与 ${key} 背景对比度不足（至少 3:1）`);
  }
  if (contrast(palette.accent,palette.surface)<3 || contrast(palette.accent,palette.base)<3) throw new Error('强调色与背景对比度不足（至少 3:1）');
  return palette;
}
function dimensions(width,height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width<1 || height<1 || width>8192 || height>8192 || width*height>32_000_000) throw new Error('图片尺寸应在 8192×8192 以内，且不超过 3200 万像素');
}
function validateSVG(data) {
  let xml;
  try { xml=new TextDecoder('utf-8',{fatal:true}).decode(data).replace(/^\uFEFF/,''); } catch { throw new Error('SVG 必须是 UTF-8 文本'); }
  // The renderer uses an <img>, never inserts imported markup. Restrict it further
  // to passive local vector geometry: no code, stylesheets, links or embedded HTML.
  if (/<!|<\?(?!xml\s)|\b(?:script|foreignObject|javascript|vbscript)\b|\son[a-z]+\s*=|\b(?:href|src)\s*=|@import/i.test(xml)) throw new Error('SVG 不允许脚本、外链、事件、DOCTYPE 或嵌入 HTML');
  xml=xml.replace(/^\s*<\?xml\s+[^?]*\?>/,'').trim();
  const allowedTags=new Set(['svg','g','path','circle','rect','ellipse','line','polyline','polygon','defs','linearGradient','radialGradient','stop','clipPath','mask','title','desc']);
  const allowedAttrs=new Set(('xmlns id class viewBox width height x y x1 y1 x2 y2 cx cy r rx ry d points fill fill-rule fill-opacity stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray stroke-dashoffset opacity transform preserveAspectRatio gradientUnits gradientTransform spreadMethod offset stop-color stop-opacity fx fy fr clip-path clip-rule mask maskUnits maskContentUnits').split(' '));
  const stack=[]; let root=false,closed=false,at=0;
  for (const match of xml.matchAll(/<[^>]*>/g)) {
    const between=xml.slice(at,match.index);
    if (between.includes('<') || (!stack.length && between.trim())) throw new Error('SVG 结构无效');
    at=match.index+match[0].length;
    const tag=/^<(\/)?([A-Za-z][\w-]*)([\s\S]*?)(\/)?\s*>$/.exec(match[0]);
    if (!tag || !allowedTags.has(tag[2])) throw new Error('SVG 仅支持静态矢量图形，不支持脚本、样式或外部图片');
    const [,end,name,source,self]=tag;
    if (end) {
      if (source.trim() || self || stack.pop()!==name) throw new Error('SVG 标签不匹配');
      if (!stack.length) closed=true;
      continue;
    }
    if (closed || (!root && name!=='svg')) throw new Error('SVG 需要单一 svg 根元素');
    root=true;const attrs={};let left=source;
    while(left.trim()) {
      const attr=/^\s+([A-Za-z][\w:-]*)\s*=\s*(["'])(.*?)\2/s.exec(left);
      if (!attr || !allowedAttrs.has(attr[1]) || Object.hasOwn(attrs,attr[1])) throw new Error('SVG 含有不支持的属性');
      const value=attr[3];
      if (/[<>&\\]/.test(value) || (attr[1]!=='xmlns' && /(?:https?:|file:|data:|javascript:)/i.test(value)) || (/url\s*\(/i.test(value) && !/^url\(#[A-Za-z_][\w.-]*\)$/.test(value))) throw new Error('SVG 属性只能引用本地图形');
      if (attr[1]==='xmlns' && value!=='http://www.w3.org/2000/svg') throw new Error('SVG 命名空间无效');
      attrs[attr[1]]=value;left=left.slice(attr[0].length);
    }
    if (!stack.length) {
      const box=(attrs.viewBox||'').trim().split(/[\s,]+/).map(Number);
      const w=attrs.width&&/^\d+(?:\.\d+)?(?:px)?$/.test(attrs.width)?parseFloat(attrs.width):box[2];
      const h=attrs.height&&/^\d+(?:\.\d+)?(?:px)?$/.test(attrs.height)?parseFloat(attrs.height):box[3];
      dimensions(w,h);
    }
    if (!self) stack.push(name);else if (!stack.length) closed=true;
  }
  if (!root || stack.length || xml.slice(at).trim()) throw new Error('SVG 结构无效');
}
const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(data){let crc=0xffffffff;for(const byte of data)crc=crcTable[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
export function validateImage(data,type) {
  if (!Buffer.isBuffer(data) || !data.length || data.length>maxBytes) throw new Error('每张图片最大 5 MiB');
  if (!Object.hasOwn(mimeExt,type)) throw new Error('仅支持 PNG、JPEG、WebP、GIF、SVG 图片');
  if (type==='image/svg+xml') {validateSVG(data);return;}
  if (type==='image/png') {
    if (data.length<45 || !data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || data.toString('ascii',12,16)!=='IHDR' || data.readUInt32BE(8)!==13) throw new Error('PNG 图片内容无效');
    const w=data.readUInt32BE(16),h=data.readUInt32BE(20),depth=data[24],colorType=data[25];dimensions(w,h);
    const channels={0:1,2:3,3:1,4:2,6:4}[colorType],depths={0:[1,2,4,8,16],2:[8,16],3:[1,2,4,8],4:[8,16],6:[8,16]};
    if(!channels||!depths[colorType].includes(depth)||data[26]!==0||data[27]!==0||data[28]>1)throw new Error('PNG 图片编码无效');
    let at=8,ended=false;const chunks=[];
    while(at+12<=data.length) {
      const size=data.readUInt32BE(at),name=data.toString('ascii',at+4,at+8);
      if(size>data.length-at-12)throw new Error('PNG 图片内容不完整');
      if(crc32(data.subarray(at+4,at+8+size))!==data.readUInt32BE(at+8+size))throw new Error('PNG 图片校验失败');
      if(name==='IDAT')chunks.push(data.subarray(at+8,at+8+size));at+=size+12;
      if(name==='IEND'){if(size!==0||at!==data.length)throw new Error('PNG 图片结束标记无效');ended=true;break;}
    }
    if (!chunks.length||!ended) throw new Error('PNG 图片内容不完整');
    // Verify compressed bytes without decoding pixels; bound decompression explicitly.
    const passes=data[28]===0?[[0,0,1,1]]:[[0,0,8,8],[4,0,8,8],[0,4,4,8],[2,0,4,4],[0,2,2,4],[1,0,2,2],[0,1,1,2]];
    const expected=passes.reduce((total,[x,y,dx,dy])=>{const pw=Math.max(0,Math.ceil((w-x)/dx)),ph=Math.max(0,Math.ceil((h-y)/dy));return total+(pw&&ph?(Math.ceil(pw*channels*depth/8)+1)*ph:0);},0);
    let pixels;try{pixels=inflateSync(Buffer.concat(chunks),{maxOutputLength:expected+1});}catch{throw new Error('PNG 图片像素数据损坏');}
    if(pixels.length!==expected)throw new Error('PNG 图片像素数据不完整');
  } else if (type==='image/jpeg') {
    if (data.length<12 || data[0]!==255 || data[1]!==216 || data.at(-2)!==255 || data.at(-1)!==217) throw new Error('JPEG 图片内容无效');
    let at=2,found=false,scan=false;
    while(at+4<data.length) {
      if(data[at++]!==255)throw new Error('JPEG 图片内容无效');while(data[at]===255)at++;
      const marker=data[at++];if(marker===0x01||(marker>=0xd0&&marker<=0xd9))continue;
      const size=data.readUInt16BE(at);if(size<2||at+size>data.length)throw new Error('JPEG 图片内容不完整');
      if(marker===0xda){if(size<6||at+size>=data.length-2)throw new Error('JPEG 图片缺少像素数据');scan=true;break;}
      if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){if(size<8)throw new Error('JPEG 图片尺寸无效');dimensions(data.readUInt16BE(at+5),data.readUInt16BE(at+3));found=true;}at+=size;
    }
    if(!found||!scan)throw new Error('JPEG 图片缺少图像信息');
  } else if(type==='image/gif') {
    if(data.length<14||!/^GIF8[79]a$/.test(data.toString('ascii',0,6))||data.at(-1)!==0x3b)throw new Error('GIF 图片内容无效');
    dimensions(data.readUInt16LE(6),data.readUInt16LE(8));let at=13,frames=0,ended=false;
    if(data[10]&0x80)at+=3*(2**((data[10]&7)+1));
    const blocks=()=>{let hasData=false;while(at<data.length){const size=data[at++];if(!size)return hasData;if(at+size>data.length)throw new Error('GIF 图片内容不完整');at+=size;hasData=true;}throw new Error('GIF 图片内容不完整');};
    while(at<data.length){const tag=data[at++];if(tag===0x3b){ended=at===data.length;break;}
      if(tag===0x21){if(at>=data.length)throw new Error('GIF 扩展信息无效');at++;blocks();}
      else if(tag===0x2c){if(at+9>data.length)throw new Error('GIF 图片帧无效');dimensions(data.readUInt16LE(at+4),data.readUInt16LE(at+6));const flags=data[at+8];at+=9;if(flags&0x80)at+=3*(2**((flags&7)+1));const codeSize=data[at++];if(codeSize<2||codeSize>8||!blocks())throw new Error('GIF 图片像素数据无效');frames++;}
      else throw new Error('GIF 图片块无效');
    }
    if(!frames||!ended)throw new Error('GIF 图片缺少完整图像帧');
  } else {
    if(data.length<26||data.toString('ascii',0,4)!=='RIFF'||data.toString('ascii',8,12)!=='WEBP'||data.readUInt32LE(4)+8!==data.length)throw new Error('WebP 图片内容无效');
    let at=12,found=false,canvas=false;
    while(at+8<=data.length){const tag=data.toString('ascii',at,at+4),len=data.readUInt32LE(at+4),pos=at+8;
      if(len>data.length-pos)throw new Error('WebP 图片内容不完整');
      if(tag==='VP8X'){if(len!==10)throw new Error('WebP 图片尺寸无效');dimensions(1+data.readUIntLE(pos+4,3),1+data.readUIntLE(pos+7,3));canvas=true;}
      else if(tag==='VP8 '){if(len<10||!data.subarray(pos+3,pos+6).equals(Buffer.from([157,1,42])))throw new Error('WebP 图片编码无效');dimensions(data.readUInt16LE(pos+6)&0x3fff,data.readUInt16LE(pos+8)&0x3fff);found=true;}
      else if(tag==='VP8L'){if(len<5||data[pos]!==0x2f)throw new Error('WebP 图片编码无效');const bits=data.readUInt32LE(pos+1);dimensions((bits&0x3fff)+1,((bits>>>14)&0x3fff)+1);found=true;}
      else if(tag==='ANMF'){if(!canvas||len<24)throw new Error('WebP 动画帧无效');dimensions(1+data.readUIntLE(pos+6,3),1+data.readUIntLE(pos+9,3));const frameTag=data.toString('ascii',pos+16,pos+20);if(!['ALPH','VP8 ','VP8L'].includes(frameTag))throw new Error('WebP 动画帧无效');found=true;}
      at=pos+len+(len%2);
    }
    if(!found||at!==data.length)throw new Error('WebP 图片缺少完整图像内容');
  }
}

function decodeImage(image) {
  if(!plain(image)||!Object.hasOwn(mimeExt,image.type)||typeof image.dataUrl!=='string')throw new Error('请选择支持的本地图片');
  if(image.dataUrl.length>Math.ceil(maxBytes/3)*4+100)throw new Error('每张图片最大 5 MiB');
  const match=/^data:([^;,]+);base64,([A-Za-z0-9+/]*={0,2})$/.exec(image.dataUrl);
  if(!match||match[1]!==image.type||match[2].length%4!==0)throw new Error('图片数据格式无效');
  const data=Buffer.from(match[2],'base64');if(data.toString('base64')!==match[2])throw new Error('图片数据格式无效');validateImage(data,image.type);
  return {data,type:image.type,ext:mimeExt[image.type]};
}
function themePreview(p) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="280" viewBox="0 0 480 280"><rect width="480" height="280" fill="${p.base}"/><rect x="16" y="16" width="116" height="248" rx="12" fill="${p.sidebar}"/><rect x="28" y="58" width="92" height="32" rx="8" fill="${p.selected}"/><rect x="150" y="16" width="314" height="248" rx="12" fill="${p.surface}"/><rect x="170" y="40" width="120" height="12" rx="6" fill="${p.text}"/><rect x="170" y="70" width="234" height="8" rx="4" fill="${p.muted}"/><rect x="170" y="106" width="274" height="80" rx="8" fill="${p.code}"/><rect x="182" y="122" width="100" height="8" rx="4" fill="${p.accent}"/><rect x="170" y="218" width="274" height="28" rx="8" fill="${p.soft}" stroke="${p.border}"/></svg>`);
}
/** Caller holds the shared appearance lock for every catalog operation. */
export class CustomPresets {
  constructor(dir,warn) {this.dir=dir;this.file=join(dir,'custom-presets.json');this.assetDir=join(dir,'custom-assets');this.warn=warn;this.checked=new Map();}
  backup() {copyFileSync(this.file,join(this.dir,`custom-presets.broken-${Date.now()}-${randomUUID()}.json`));}
  write(catalog) {atomicJSON(this.file,{version:1,...catalog});}
  asset(path) {
    const id=customAssetId(path);if(!id)throw new Error('无效的自定义素材路径');
    if(!lstatSync(this.assetDir).isDirectory()||lstatSync(this.assetDir).isSymbolicLink())throw new Error('自定义素材目录无效');
    const file=join(this.dir,path),stat=lstatSync(file);
    if(!stat.isFile()||stat.isSymbolicLink()||stat.size>maxBytes)throw new Error('自定义素材缺失或损坏');
    const ext=extname(file).slice(1),type=Object.keys(mimeExt).find(m=>mimeExt[m]===ext),key=`${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}`;
    if(this.checked.get(file)!==key){validateImage(readFileSync(file),type);this.checked.set(file,key);}
    return {file,type};
  }
  load() {
    if(!existsSync(this.file)){const value=empty();this.write(value);return value;}
    let raw;
    try{raw=JSON.parse(readFileSync(this.file,'utf8'));}catch(error){if(error.code)throw error;this.backup();this.warn('自定义预设配置损坏，已保留备份并恢复空白素材库。');const value=empty();this.write(value);return value;}
    if(Number.isInteger(raw?.version)&&raw.version>1)throw new Error('自定义预设配置版本较新，请升级换装器；原文件已保留。');
    const result=empty(),seen=new Set();let damaged=!plain(raw)||raw.version!==1;
    for(const kind of kinds){if(!Array.isArray(raw?.[kind])){damaged=true;continue;}if(raw[kind].length>20)damaged=true;
      for(const entry of raw[kind].slice(0,20)){try{
        if(!plain(entry)||!idPattern.test(entry.id)||seen.has(entry.id)||customAssetId(entry.preview)!==entry.id)throw new Error('无效的预设记录');
        const item={id:entry.id,name:nameOf(entry.name),caption:kind==='theme'?'本地自定义皮肤':'本地导入素材',custom:true,preview:entry.preview};
        if(kind==='theme'){if(!['light','dark'].includes(entry.scheme))throw new Error('无效的主题模式');item.scheme=entry.scheme;item.palette=paletteOf(entry.palette);if(!entry.preview.endsWith('.svg'))throw new Error('无效的主题预览');}
        else{if(entry.asset!==entry.preview)throw new Error('无效的素材记录');item.asset=entry.asset;if(kind==='splash'){if(!['whale','stars','forest'].includes(entry.scene))throw new Error('无效的动画样式');item.scene=entry.scene;item.background=color(entry.background);}}
        this.asset(item.preview);result[kind].push(item);seen.add(item.id);
      }catch{damaged=true;}}
    }
    if(damaged){this.backup();this.warn('部分自定义预设或素材缺失、损坏，已保留备份并回退默认选项。');this.write(result);}
    return result;
  }
  add(payload,catalog) {
    if(!plain(payload)||!kinds.includes(payload.kind))throw new Error('请选择启动画面、界面皮肤或桌面宠物');
    const kind=payload.kind;if(catalog[kind].length>=20)throw new Error('每个分类最多添加 20 个自定义预设，请先删除不需要的内容');
    const id=`custom-${randomUUID()}`,name=nameOf(payload.name);let blob;
    const entry={id,name,caption:kind==='theme'?'本地自定义皮肤':'本地导入素材',custom:true};
    if(kind==='theme'){if(!['light','dark'].includes(payload.scheme))throw new Error('主题模式必须是 light 或 dark');entry.scheme=payload.scheme;entry.palette=paletteOf(payload.palette);blob={data:themePreview(entry.palette),type:'image/svg+xml',ext:'svg'};}
    else{blob=decodeImage(payload.image);if(kind==='splash'){entry.scene=payload.scene??'whale';if(!['whale','stars','forest'].includes(entry.scene))throw new Error('请选择支持的动画样式');entry.background=color(payload.background??'#eef6ff');}}
    entry.preview=`custom-assets/${id}.${blob.ext}`;if(kind!=='theme')entry.asset=entry.preview;
    mkdirSync(this.assetDir,{recursive:true,mode:0o700});if(lstatSync(this.assetDir).isSymbolicLink())throw new Error('自定义素材目录无效');
    writeFileSync(join(this.dir,entry.preview),blob.data,{mode:0o600,flag:'wx'});
    catalog[kind].push(entry);this.write(catalog);return catalog;
  }
  remove({kind,id}={},catalog) {
    if(!kinds.includes(kind)||!idPattern.test(id))throw new Error('只能删除自定义预设');
    const entry=catalog[kind].find(item=>item.id===id);if(!entry)throw new Error('自定义预设不存在');
    catalog[kind]=catalog[kind].filter(item=>item.id!==id);this.write(catalog);
    try{unlinkSync(join(this.dir,entry.preview));}catch(error){if(error.code!=='ENOENT')this.warn('预设已移除，但旧素材文件未能删除。');}
    return catalog;
  }
  read(id,catalog) {
    if(typeof id!=='string'||!idPattern.test(id))throw new Error('无效的自定义素材 ID');
    const entry=kinds.flatMap(kind=>catalog[kind]).find(item=>item.id===id);if(!entry)throw new Error('自定义素材不存在');
    const {file,type}=this.asset(entry.preview);return {data:readFileSync(file),type};
  }
}
