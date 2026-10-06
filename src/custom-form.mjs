import { themes, themeTokens } from './presets.mjs';
import { readDataURL, prepareSplashVideo } from './media-import.mjs';

export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
const fields = {base:'主背景',surface:'面板与输入框',sidebar:'侧边栏',soft:'悬停背景',selected:'选中背景',text:'主要文字',muted:'次要文字',accent:'强调色',border:'边框',code:'代码区域'};
const titles = {theme:'界面皮肤',splash:'启动画面',pet:'桌面宠物'};
const imageTypes = new Set(['image/png','image/jpeg','image/webp','image/gif','image/svg+xml']);
const colorValid = value => /^#[\da-f]{6}$/i.test(value || '');

export function themePreviewMarkup(palette, name = '自定义') {
  const vars = Object.entries(themeTokens(palette)).map(([key,value])=>`${key}:${value}`).join(';');
  return `<div class="cb-theme-preview" style="${escapeHTML(vars)}" aria-label="${escapeHTML(name)}主题预览"><aside><i></i><b></b><i></i><i></i></aside><section><div class="cb-mini-line"></div><div class="cb-mini-bubble"></div><code>const idea = 'hello';</code><div class="cb-mini-input"><span>记录一个新想法…</span><b>↑</b></div></section></div>`;
}

export function exportTheme(preset) {
  const data = {version:1,kind:'theme',name:preset.name,scheme:preset.scheme,palette:{...preset.palette}};
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=`harness-theme-${preset.id || 'custom'}.json`;
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

// Lives outside the settings root: background state polling must never erase edits.
export function createModal({title,className='',onClose=()=>{},canClose=()=>true}) {
  const previous=document.activeElement;
  const overlay=document.createElement('div');overlay.className=`cb-modal ${className}`;
  const dialog=document.createElement('section');dialog.className='cb-modal-dialog';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label',title);dialog.tabIndex=-1;
  overlay.append(dialog);document.body.append(overlay);
  let closed=false;
  const close=()=>{if(closed)return;closed=true;overlay.removeEventListener('keydown',keyboard);overlay.remove();if(previous?.isConnected)previous.focus();onClose();};
  const keyboard=e=>{
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(canClose())close();return;}
    if(e.key!=='Tab')return;
    const focusables=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')].filter(el=>el.getClientRects().length);
    const first=focusables[0],last=focusables.at(-1);
    if(!first){e.preventDefault();dialog.focus();return;}
    if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  };
  overlay.addEventListener('keydown',keyboard);dialog.focus();
  return {overlay,dialog,close};
}

export function openCustomPresetForm({kind,api,onSaved,onClose}) {
  let controller, previewURL, closed=false;
  const releasePreview=()=>{const v=modal.dialog.querySelector('.cb-upload-preview video');if(v){v.pause();v.removeAttribute('src');v.load();}if(previewURL){URL.revokeObjectURL(previewURL);previewURL=null;}};
  const modal=createModal({title:`添加${titles[kind]}`,className:'cb-custom-modal',canClose:()=>!saving,onClose:()=>{closed=true;controller?.abort();releasePreview();onClose?.();}});
  const {dialog,close}=modal;
  let image=null, video=null, reading=false, saving=false, readVersion=0;
  const palette={...themes[0].palette};
  dialog.innerHTML=`<header class="cb-dialog-header"><div><span>我的预设</span><h3>添加${titles[kind]}</h3></div><button type="button" data-close aria-label="关闭添加窗口">×</button></header>
    <form class="cb-custom-form">
      <label class="cb-field">名称<input name="name" aria-label="名称" maxlength="40" required placeholder="给它起个名字" autocomplete="off"></label>
      ${kind==='theme' ? `<div class="cb-form-row"><label class="cb-field">从现有皮肤开始<select name="reference" aria-label="参考皮肤">${themes.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}</select></label><label class="cb-field">界面模式<select name="scheme" aria-label="界面模式"><option value="light">浅色</option><option value="dark">深色</option></select></label></div>
        <div class="cb-form-preview">${themePreviewMarkup(palette)}</div>
        <div class="cb-color-grid">${Object.entries(fields).map(([key,label])=>`<label class="cb-color-field"><input type="color" name="${key}" aria-label="${label}" value="${palette[key]}"><span>${label}</span><output data-color-value="${key}">${palette[key]}</output></label>`).join('')}</div>
        <div class="cb-json-tools"><label class="cb-file-button">导入主题 JSON<input type="file" name="json" aria-label="导入主题 JSON" accept=".json,application/json"></label><button type="button" data-export>导出当前配色</button></div><p class="cb-form-hint">导入配色后仍可调整。只保存颜色与明暗模式，不执行代码。</p>` : `<div class="cb-upload-preview ${kind==='pet'?'cb-transparent-grid':''}" aria-label="素材预览"><span>${kind==='splash'?'选择一段启动视频，也可以使用图片':'选一张你喜欢的图片'}</span></div><label class="cb-file-button">${kind==='splash'?'选择视频或图片':'选择图片'}<input type="file" name="image" aria-label="${kind==='splash'?'选择视频或图片':'选择图片'}" accept="${kind==='splash'?'video/mp4,.mp4,':''}image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg"></label><p class="cb-form-hint">${kind==='splash'?'MP4 · 最大 50 MiB / 120 秒 · H.264 视频 / 推荐 AAC 音轨<br>图片：':''}PNG / JPG / WebP / GIF / SVG · 最大 5 MiB${kind==='pet'?' · 透明背景效果更自然':''}</p>
        ${kind==='splash'?`<div class="cb-form-row" data-image-options><label class="cb-field">动态风格<select name="scene" aria-label="动态风格"><option value="whale">轻柔漂浮</option><option value="stars">星点微光</option><option value="forest">晨光飘动</option></select></label><label class="cb-color-field cb-background-field"><input type="color" name="background" aria-label="背景颜色" value="#eef7ff"><span>背景颜色</span></label></div><div data-video-options hidden><label class="cb-field">视频画面<select name="videoFit" aria-label="视频画面"><option value="contain">完整显示（保留全部画面）</option><option value="cover">铺满窗口（裁切边缘）</option></select></label><p class="cb-form-hint" data-video-info>保留视频原声，完整播放后进入 Harness；随时可跳过。</p></div>`:''}`}
      <p class="cb-form-error" role="alert" hidden></p>
      <footer class="cb-dialog-footer"><span>保存后可在卡片上应用</span><button type="button" data-cancel>取消</button><button type="submit" class="cb-primary">保存到我的预设</button></footer>
    </form>`;
  const form=dialog.querySelector('form');
  const nameInput=form.elements.namedItem('name');
  const errorEl=form.querySelector('.cb-form-error');
  const error=message=>{errorEl.textContent=message;errorEl.hidden=!message;};
  const submit=form.querySelector('[type=submit]');
  const updateBusy=()=>{submit.disabled=saving||reading;imageFile&&(imageFile.disabled=saving);dialog.querySelector('[data-close]').disabled=saving;dialog.querySelector('[data-cancel]').disabled=saving;submit.textContent=saving?'正在保存…':reading?'正在读取素材…':'保存到我的预设';};
  const preview=()=>{form.querySelector('.cb-form-preview').innerHTML=themePreviewMarkup(palette,nameInput.value);};
  const themePayload=()=>({version:1,kind:'theme',name:nameInput.value.trim(),scheme:form.elements.namedItem('scheme').value,palette:{...palette}});
  const imageFile=form.elements.namedItem('image');
  dialog.querySelector('[data-close]').onclick=close;
  dialog.querySelector('[data-cancel]').onclick=close;
  nameInput.focus();

  if(kind==='theme'){
    const setPalette=(next,scheme)=>{Object.assign(palette,next);for(const key of Object.keys(fields)){form.elements.namedItem(key).value=palette[key];form.querySelector(`[data-color-value="${key}"]`).textContent=palette[key];}form.elements.namedItem('scheme').value=scheme;preview();};
    form.elements.namedItem('scheme').value=themes[0].scheme;
    form.elements.namedItem('reference').onchange=e=>{const base=themes.find(t=>t.id===e.target.value);setPalette(base.palette,base.scheme);};
    for(const key of Object.keys(fields))form.elements.namedItem(key).oninput=e=>{palette[key]=e.target.value;form.querySelector(`[data-color-value="${key}"]`).textContent=e.target.value;preview();};
    form.querySelector('[data-export]').onclick=()=>{
      if(!nameInput.value.trim()){error('请先填写名称，再导出配色。');nameInput.focus();return;}
      exportTheme(themePayload());
    };
    form.elements.namedItem('json').onchange=async e=>{
      const file=e.target.files?.[0];if(!file)return;
      e.target.value=''; // Selecting the same file must retry after a decode/read failure.
      try{
        if(file.size>32768)throw Error('主题 JSON 不能超过 32 KB。');
        const data=JSON.parse(await file.text());
        if(!data||data.version!==1||data.kind!=='theme'||!['light','dark'].includes(data.scheme)||typeof data.name!=='string'||!data.name.trim()||data.name.length>40||!data.palette||Object.keys(data.palette).length!==10||!Object.keys(fields).every(key=>colorValid(data.palette[key])))throw Error('主题 JSON 格式不正确，请导入工具箱导出的配色文件。');
        nameInput.value=data.name.trim();setPalette(data.palette,data.scheme);error('');
      }catch(err){error(err instanceof SyntaxError?'主题 JSON 无法读取，请检查文件内容。':err.message);}
      e.target.value='';
    };
  }else{
    imageFile.onchange=async e=>{
      const file=e.target.files?.[0];if(!file)return;
      e.target.value=''; // A failed file may be chosen again without changing its name.
      const version=++readVersion;
      controller?.abort();controller=new AbortController();releasePreview();image=null;video=null;
      form.querySelector('.cb-upload-preview').replaceChildren();
      const imageOptions=form.querySelector('[data-image-options]'),videoOptions=form.querySelector('[data-video-options]');
      if(imageOptions)imageOptions.hidden=false;if(videoOptions)videoOptions.hidden=true;
      try{
        const type=file.type || (/\.svg$/i.test(file.name)?'image/svg+xml':/\.mp4$/i.test(file.name)?'video/mp4':'');
        reading=true;updateBusy();error('');
        if(kind==='splash'&&type==='video/mp4'){
          const prepared=await prepareSplashVideo(file,controller.signal);
          if(closed||version!==readVersion)return;
          image=prepared.image;video=prepared.video;previewURL=URL.createObjectURL(file);
          const player=document.createElement('video');player.src=previewURL;player.poster=image.dataUrl;player.controls=true;player.playsInline=true;player.preload='metadata';player.setAttribute('aria-label','启动视频预览');player.style.objectFit=form.elements.namedItem('videoFit').value;
          form.querySelector('.cb-upload-preview').replaceChildren(player);
          imageOptions.hidden=true;videoOptions.hidden=false;
          form.querySelector('[data-video-info]').textContent=`${prepared.duration.toFixed(1)} 秒 · ${(file.size/1024/1024).toFixed(1)} MiB · 保留原声，完整播放，可随时跳过。`;
          if(!nameInput.value.trim())nameInput.value=file.name.replace(/\.[^.]+$/,'').slice(0,40);
          return;
        }
        if(!imageTypes.has(type))throw Error(kind==='splash'?'请选择 H.264 MP4 视频，或 PNG、JPG、WebP、GIF、SVG 图片。':'请选择 PNG、JPG、WebP、GIF 或 SVG 图片。');
        if(file.size>5*1024*1024)throw Error('图片不能超过 5 MB，请先缩小图片。');
        if(file.size===0)throw Error('图片是空文件，请重新选择。');
        const dataUrl=await readDataURL(file,controller.signal);
        if(closed||version!==readVersion)return;
        // This is an <img> preview. SVG is never inserted as executable markup.
        await new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=()=>reject(Error('无法预览这张图片，请选择有效的图片文件。'));img.src=dataUrl;});
        if(closed||version!==readVersion)return;
        image={name:file.name,type,dataUrl};
        form.querySelector('.cb-upload-preview').innerHTML=`<img src="${escapeHTML(dataUrl)}" alt="${escapeHTML(file.name)}" draggable="false">`;
        if(!nameInput.value.trim())nameInput.value=file.name.replace(/\.[^.]+$/,'').slice(0,40);
      }catch(err){if(!closed&&version===readVersion&&err.name!=='AbortError')error(err.message);}
      finally{if(!closed&&version===readVersion){reading=false;updateBusy();}}
    };
    if(kind==='splash'){
      const background=form.elements.namedItem('background');
      background.oninput=()=>{form.querySelector('.cb-upload-preview').style.background=background.value;};background.oninput();
      form.elements.namedItem('videoFit').onchange=e=>{const v=form.querySelector('.cb-upload-preview video');if(v)v.style.objectFit=e.target.value;};
    }
  }
  form.onsubmit=async e=>{
    e.preventDefault();if(saving||reading)return;
    const name=nameInput.value.trim();
    if(!name){error('请填写名称。');nameInput.focus();return;}
    if(kind!=='theme'&&!image){error(kind==='splash'?'请先选择一段视频或一张图片。':'请先选择一张图片。');return;}
    const payload=kind==='theme'?themePayload():{kind,name,image,...(video?{video,videoFit:form.elements.namedItem('videoFit').value}:kind==='splash'?{scene:form.elements.namedItem('scene').value,background:form.elements.namedItem('background').value}:{})};
    saving=true;updateBusy();error('');
    try{const state=await api.addPreset(payload);close();onSaved(state);}
    catch(err){error(err.message||'保存失败，请重试。');}
    finally{saving=false;updateBusy();}
  };
  return close;
}
