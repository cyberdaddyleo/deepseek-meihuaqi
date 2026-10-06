import { whalegirlCss, whalegirlTokenOverrides } from './whalegirl-theme.mjs';
import { geekCss, geekTokenOverrides } from './geek-theme.mjs';
import { geekContentCss } from './geek-content-theme.mjs';
import { geekHudCss } from './geek-hud.mjs';

// Native slots verified against Harness 0.2.0-rc.2. The wallpaper is decorative;
// every conversation, input, tool card and menu remains the upstream component.
export const cyberdadTokenOverrides = {
  '--dsw-specific-input-major': '#102339ed',
  '--dsw-specific-bubble': '#164263f2',
  '--dsw-specific-bubble-highlight': '#205477f2',
  '--dsw-specific-sidebar-nav-item-active': '#164263eb',
  '--dsw-specific-sidebar-nav-item-active-accent': '#164263eb',
  '--dsw-alias-button-info-fill': '#246c9e',
  '--dsw-alias-button-info-hover': '#3183ba',
  '--dsw-specific-menu': '#102339fa',
  '--dsw-menu-surface-fill': '#102339fa',
  '--dsw-menu-backdrop-filter': 'blur(18px)',
  '--dsw-elevation-stroke-color': '#64b9e16b',
};

export const cyberdadCss = `
html[data-cyber-theme="cyberdad"] [data-slot="root"] > div:has(> [data-shell-overlay]) {
  background: #071321 url("/api/cyberdaddy/builtin?id=cyberdad-wallpaper") right center / cover no-repeat;
}
html[data-cyber-theme="cyberdad"] [data-slot="root"] > div > div:has(> [data-slot="main"]),
html[data-cyber-theme="cyberdad"] [data-slot="main"] [data-phase]:has(> [data-conversation-content]) {
  background: transparent;
}
html[data-cyber-theme="cyberdad"] [data-slot="root"] > div > div:has(> [data-slot="sidebar"]) {
  background: linear-gradient(165deg, #10283ef0, #071321ed);
  border-right: 1px solid #61cfff57;
  box-shadow: 4px 0 24px #149ade14;
}
html[data-cyber-theme="cyberdad"] [data-slot="sidebar"] > div {
  background: transparent;
}
html[data-cyber-theme="cyberdad"] [data-slot="sidebar"] button[aria-current="page"] {
  background: #164263e6;
  box-shadow: inset 0 0 0 1px #82dcff66, 0 0 14px #259ddb18;
}
html[data-cyber-theme="cyberdad"] [data-slot="conversation.header"] > * {
  background: #081a2dc9;
  border-bottom-color: #61cfff38;
}
html[data-cyber-theme="cyberdad"] [data-conversation-content][data-content-phase="active"] {
  background: linear-gradient(90deg, #071321f0, #071321e6 62%, #071321cc);
}
html[data-cyber-theme="cyberdad"] [data-composer-card] {
  background: linear-gradient(145deg, #193650ed, #0b1c30f2);
  box-shadow: 0 0 0 1px #8ad7ff99, inset 0 1px 12px #63b8ef14, 0 10px 28px #00000040;
  backdrop-filter: blur(16px);
}
html[data-cyber-theme="cyberdad"] [data-composer-card]:focus-within {
  box-shadow: 0 0 0 1px #a2e6ffdb, 0 0 26px #36a9ef30, 0 10px 28px #00000040;
}
html[data-cyber-theme="cyberdad"] [data-content-phase="active"] [data-composer-seat] {
  background: linear-gradient(180deg, #07132100 0px, #071321f2 36px);
}
html[data-cyber-theme="cyberdad"] [data-slot="conversation.hero.brand.mark"] {
  color: #e1f2ff;
  filter: drop-shadow(0 0 16px #61cfff45);
}
/* The reference has a bright white face behind the real upstream headline. */
html[data-cyber-theme="cyberdad"] div:has(> span > [data-slot="conversation.hero.brand.mark"]) {
  align-self: center;
  padding: 8px 16px;
  border: 1px solid #61cfff38;
  border-radius: 16px;
  background: #071321db;
  backdrop-filter: blur(12px);
  text-shadow: 0 1px 4px #00000080;
}
html[data-cyber-theme="cyberdad"] [role="menu"],
html[data-cyber-theme="cyberdad"] [role="dialog"]:not(.cb-modal-dialog) {
  --dsw-elevation-stroke-color: #64b9e16b;
}
@media (prefers-reduced-transparency: reduce) {
  html[data-cyber-theme="cyberdad"] [data-composer-card] {
    background: #102339;
    backdrop-filter: none;
  }
  html[data-cyber-theme="cyberdad"] [data-conversation-content][data-content-phase="active"] {
    background: #071321;
  }
}
`;

const wallpaperThemes = new Map([
  ['whalegirl', whalegirlTokenOverrides],
  ['cyberdad', cyberdadTokenOverrides],
  ['geek', geekTokenOverrides],
]);

export const wallpaperCss = whalegirlCss + '\n' + cyberdadCss + '\n' + geekCss + '\n' + geekContentCss + '\n' + geekHudCss;
export const wallpaperTokenOverrides = (id) => wallpaperThemes.get(id) ?? {};

// One owned marker prevents a previous wallpaper leaking into a plain theme.
// Passing null disables special styling without touching the upstream DOM/data.
export function setWallpaperAppearance(id, doc = document) {
  const root = doc.documentElement;
  if (wallpaperThemes.has(id)) root.setAttribute('data-cyber-theme', id);
  else if (wallpaperThemes.has(root.getAttribute('data-cyber-theme'))) {
    root.removeAttribute('data-cyber-theme');
  }
}
