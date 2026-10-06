import { themes, splashes, pets } from './presets.mjs';
const builtin = { theme: themes, splash: splashes, pet: pets };
export function catalogFor(state, kind) {
  return [...(builtin[kind] || []), ...(Array.isArray(state?.custom?.[kind]) ? state.custom[kind] : [])];
}
export function customAssetId(path) {
  return typeof path === 'string' ? /^custom-assets\/(custom-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\.(?:png|jpg|webp|gif|svg|mp4)$/.exec(path)?.[1] || null : null;
}
export function builtinAssetId(path) {
  return typeof path === 'string' ? /^assets\/(whalegirl-(?:wallpaper|atlas)|cyberdad-(?:logo|atlas|wallpaper)|geek-wallpaper)\.png$/.exec(path)?.[1] || /^assets\/((?:whalegirl|cyberdad|geek)-startup)\.mp4$/.exec(path)?.[1] || null : null;
}
