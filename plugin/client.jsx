import React, { useEffect, useRef } from 'react';
import { defaults, themeTokens } from '../src/presets.mjs';
import { catalogFor, customAssetId, builtinAssetId } from '../src/catalog.mjs';
import { mountManager } from '../src/manager.mjs';
import { createStateSync } from '../src/state-sync.mjs';
import { wallpaperCss, wallpaperTokenOverrides, setWallpaperAppearance } from '../src/wallpaper-theme.mjs';
import { assets, css } from '../lib/assets.mjs';
import { geekHudMarkup } from '../src/geek-hud.mjs';
export const name = 'cyberdaddy-dressup';
export const inject = ['theme', 'slots', 'connection'];
export function apply(ctx) {
  let state = globalThis.__CYBERDADDY_APPEARANCE__ || structuredClone(defaults);
  const listeners = new Set();
  let disposed = false;
  const original = ctx.theme.getTheme().preference;
  let builtin = ['system', 'dark', 'light'].includes(original) ? original : 'system';
  const style = document.createElement('style'); style.textContent = css + '\n' + wallpaperCss; document.head.append(style);
  const registered = new Map();
  function syncThemes() {
    const all=catalogFor(state,'theme'), ids=new Set(all.map(t=>t.id));
    for(const [id,dispose] of registered)if(!ids.has(id)){dispose();registered.delete(id);}
    for(const t of all)if(!registered.has(t.id))registered.set(t.id,ctx.theme.register({id:`cyber-${t.id}`,colorScheme:t.scheme,tokens:{...themeTokens(t.palette),...wallpaperTokenOverrides(t.id)}}));
  }
  function applyTheme() {
    if (disposed) return;
    const id = state.enabled && state.theme !== 'default' ? `cyber-${state.theme}` : builtin;
    setWallpaperAppearance(state.enabled ? state.theme : null);
    if (ctx.theme.getTheme().preference !== id) ctx.theme.setTheme(id);
  }
  function accept(next) {
    const changed = JSON.stringify(state) !== JSON.stringify(next);
    if(disposed)return next;
    state = next; syncThemes(); applyTheme();
    if (changed) for (const fn of listeners) fn(state);
    return state;
  }
  async function call(endpoint, payload) {
    const response = await fetch('/api/cyberdaddy', {method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint,payload}),signal:AbortSignal.timeout(endpoint === 'add-preset' ? 90000 : 10000)});
    const result = await response.json();
    if (!result.ok) throw new Error(result.error.message);
    return result.value;
  }
  const sync = createStateSync({request: call, read: () => state, accept});
  const api = {
    desktop: true,
    get: () => sync.get(),
    update: (patch) => sync.mutate('update', patch),
    reset: () => sync.mutate('reset', null),
    addPreset: (payload) => sync.mutate('add-preset', payload),
    removePreset: (payload) => sync.mutate('remove-preset', payload),
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
  function Section() {
    const ref = useRef(null);
    useEffect(() => {
      const unmount = mountManager(ref.current, api, {assetResolver:path=>{
        const id=customAssetId(path),builtinId=builtinAssetId(path);return id?'/api/cyberdaddy/asset?id='+encodeURIComponent(id)+(path.endsWith('.mp4')?'&variant=video':''):builtinId?'/api/cyberdaddy/builtin?id='+encodeURIComponent(builtinId):assets[path];
      }});
      return unmount;
    }, []);
    return React.createElement('div', {ref});
  }
  ctx.on('theme/change', () => {
    if (state.enabled && state.theme !== 'default') queueMicrotask(applyTheme);
    else { const id=ctx.theme.getTheme().preference; if (['system','dark','light'].includes(id)) builtin=id; }
  });
  ctx.slots.inject('settings.section', () => ctx.slots.register({name:'settings.section', id:'cyber-toolbox', order:5, label:'美化工具箱'}, Section));
  // Additive official list slot: no native component is replaced. Static
  // decorative code has no controls, live metrics, observers or render loop.
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({name:'shell.overlay', id:'cyber-geek-hud', order:-100}, () =>
    React.createElement('div', {className:'cb-geek-hud', 'aria-hidden':true, inert:'', dangerouslySetInnerHTML:{__html:geekHudMarkup()}})));
  syncThemes(); applyTheme();
  const refresh=()=>{if(!disposed && document.visibilityState==='visible')void api.get().catch(()=>{});};
  const poll=setInterval(refresh,1500);document.addEventListener('visibilitychange',refresh);refresh();
  ctx.effect(() => () => { disposed=true; clearInterval(poll); document.removeEventListener('visibilitychange',refresh); listeners.clear(); style.remove(); setWallpaperAppearance(null); if(ctx.theme.getTheme().preference.startsWith('cyber-')) ctx.theme.setTheme(builtin); for(const dispose of registered.values())dispose(); registered.clear(); });
}
