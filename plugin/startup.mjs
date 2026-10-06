import { mountVideoStartup } from './video-startup.mjs';
import { setStartupIcon, startupControlCss } from './startup-controls.mjs';
import { assets, sceneCss } from '../lib/assets.mjs';
import { fallbackData } from '../src/asset-fallback.mjs';
import { splashes, defaults } from '../src/presets.mjs';
import { catalogFor, customAssetId, builtinAssetId } from '../src/catalog.mjs';

const state = globalThis.__CYBERDADDY_APPEARANCE__;
if (state?.enabled && state.splash !== 'off') {
  const preset = catalogFor(state, 'splash').find(x => x.id === state.splash) || splashes.find(x => x.id === defaults.splash);
  const assetURL = path => {
    const custom = customAssetId(path), builtin = builtinAssetId(path);
    return custom ? '/api/cyberdaddy/asset?id=' + encodeURIComponent(custom)
      : builtin ? '/api/cyberdaddy/builtin?id=' + encodeURIComponent(builtin)
      : assets[path] || assets['assets/whale.svg'] || fallbackData;
  };
  if (preset.mediaType === 'video' && builtinAssetId(preset.asset) && preset.asset.endsWith('.mp4')) mountVideoStartup(preset, assetURL, fallbackData);
  else mountSvgStartup(preset, assetURL);
}

// SVG decorations retain their immediate native-ready handoff. Built-in movies
// have an independent overlay so native readiness cannot cut playback short.
function mountSvgStartup(preset, assetURL) {
  let root, decor, style, skip, seen = false, closed = false;
  function clean() {
    if (closed) return;
    closed = true; observer.disconnect();
    for (const image of decor?.querySelectorAll('img') || []) { image.onerror = null; image.removeAttribute('src'); }
    decor?.remove(); style?.remove();
    if (skip) { skip.onclick = null; skip.remove(); }
    root?.removeAttribute('data-cyber-boot');
    globalThis.removeEventListener('pagehide', clean);
    root = decor = style = skip = null;
  }
  function update() {
    if (closed) return;
    if (seen && (!root.isConnected || !root.querySelector('[data-dsh-boot-spinner]'))) { clean(); return; }
    if (seen) return;
    root = document.querySelector('[data-dsh-boot]');
    if (!root) return;
    if (!root.querySelector('[data-dsh-boot-spinner]')) { clean(); return; }
    seen = true; root.dataset.cyberBoot = preset.scene;
    style = document.createElement('style');
    style.textContent = sceneCss + startupControlCss + `[data-cyber-boot]{background:linear-gradient(135deg,#fff,#e0f0ff)!important;isolation:isolate}[data-cyber-boot="stars"]{background:linear-gradient(135deg,#eeefff,#d8e7fb)!important}[data-cyber-boot="forest"]{background:linear-gradient(135deg,#fbf8ed,#dfefdb)!important}[data-cyber-boot]>:first-child{z-index:2;position:relative;background:#ffffffb8!important;color:#305273!important;backdrop-filter:blur(12px)}.cyber-boot-art{position:absolute;inset:0;pointer-events:none;z-index:0;display:grid;place-items:center}.cyber-boot-art .scene-art{position:absolute;width:190px;height:190px;top:12%;opacity:.9}[data-cyber-boot] .cyber-boot-skip{position:absolute;right:18px;bottom:18px;z-index:4}`;
    if (preset.custom && /^#[0-9a-f]{6}$/i.test(preset.background)) style.textContent += `[data-cyber-boot]{background:${preset.background}!important}.cyber-boot-art .scene-art{top:5%;width:85vw;max-width:900px;height:38vh;object-fit:contain}`;
    document.head.append(style);
    decor = document.createElement('div'); decor.className = 'cyber-boot-art scene-' + preset.scene;
    const image = document.createElement('img'); image.className = 'scene-art'; image.alt = '';
    image.onerror = () => { image.onerror = null; image.src = fallbackData; };
    image.src = assetURL(preset.asset); decor.append(image);
    decor.insertAdjacentHTML('beforeend', '<div class="scene-orbs"><i></i><i></i><i></i></div>');
    skip = document.createElement('button'); skip.className = 'cyber-boot-skip'; setStartupIcon(skip, 'skip', '跳过动画'); skip.onclick = clean;
    root.append(decor, skip);
  }
  const observer = new MutationObserver(update);
  observer.observe(document.documentElement, {childList:true,subtree:true});
  globalThis.addEventListener('pagehide', clean, {once:true}); update();
}
