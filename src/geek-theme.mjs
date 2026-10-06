// Stable native slots and design tokens verified against Harness 0.2.0-rc.2.
// The HUD-inspired wallpaper is decoration, never a substitute for real UI.
export const geekTokenOverrides = {
  '--dsw-specific-input-major': '#0b1b26f5',
  '--dsw-specific-bubble': '#0c354af5',
  '--dsw-specific-bubble-highlight': '#14475ef5',
  '--dsw-specific-sidebar-nav-item-active': '#0c354af2',
  '--dsw-specific-sidebar-nav-item-active-accent': '#0c354af2',
  '--dsw-alias-button-info-fill': '#176887',
  '--dsw-alias-button-info-hover': '#207f9f',
  '--dsw-specific-menu': '#0b1b26fc',
  '--dsw-menu-surface-fill': '#0b1b26fc',
  '--dsw-menu-backdrop-filter': 'blur(12px)',
  '--dsw-elevation-stroke-color': '#36d5ff66',
  '--dsw-radius-sm': '4px',
  '--dsw-radius-md': '6px',
  '--dsw-radius-lg': '8px',
  '--dsw-radius-xl': '10px',
  '--dsw-radius-panel': '12px',
  // Success, warning, error and code syntax retain the upstream dark palette.
};

export const geekCss = `
html[data-cyber-theme="geek"] [data-slot="root"] > div:has(> [data-shell-overlay]) {
  background: #050c12 url("/api/cyberdaddy/builtin?id=geek-wallpaper") right center / cover no-repeat;
}
html[data-cyber-theme="geek"] [data-slot="root"] > div > div:has(> [data-slot="main"]),
html[data-cyber-theme="geek"] [data-slot="main"] [data-phase]:has(> [data-conversation-content]) {
  background: transparent;
}
html[data-cyber-theme="geek"] [data-slot="root"] > div > div:has(> [data-slot="sidebar"]) {
  background: linear-gradient(165deg, #0a1a25f5, #050c12f5);
  border-right: 1px solid #36d5ff57;
  box-shadow: 4px 0 20px #00000038;
}
html[data-cyber-theme="geek"] [data-slot="sidebar"] > div {
  background: transparent;
}
html[data-cyber-theme="geek"] [data-slot="sidebar"] button {
  border-radius: 6px;
}
html[data-cyber-theme="geek"] [data-slot="sidebar"] button[aria-current="page"] {
  background: #0c354af2;
  box-shadow: inset 2px 0 #36d5ff, inset 0 0 0 1px #36d5ff4d;
}
html[data-cyber-theme="geek"] [data-slot="conversation.header"] > * {
  background: #07131ce8;
  border-bottom-color: #36d5ff38;
}
html[data-cyber-theme="geek"] [data-conversation-content][data-content-phase="active"] {
  background: linear-gradient(90deg, #050c12f7, #050c12f0 62%, #050c12e3);
}
html[data-cyber-theme="geek"] [data-composer-card] {
  border-radius: 12px;
  background: linear-gradient(145deg, #0d2130f5, #06121bf5);
  box-shadow: 0 0 0 1px #36d5ff99, inset 0 1px 0 #9deaff1f, 0 8px 28px #00000050;
  backdrop-filter: blur(12px);
}
html[data-cyber-theme="geek"] [data-composer-card]:focus-within {
  box-shadow: 0 0 0 1px #74e5ffd9, 0 0 20px #00bdff24, 0 8px 28px #00000050;
}
html[data-cyber-theme="geek"] [data-content-phase="active"] [data-composer-seat] {
  background: linear-gradient(180deg, #050c1200 0px, #050c12f5 36px);
}
html[data-cyber-theme="geek"] [data-slot="conversation.hero.brand.mark"] {
  color: #e0f3ff;
  filter: drop-shadow(0 0 12px #36d5ff33);
}
html[data-cyber-theme="geek"] div:has(> span > [data-slot="conversation.hero.brand.mark"]) {
  align-self: center;
  padding: 8px 16px;
  border: 1px solid #36d5ff38;
  border-radius: 8px;
  background: #050c12d9;
  backdrop-filter: blur(10px);
  text-shadow: 0 1px 4px #00000080;
}
html[data-cyber-theme="geek"] [role="menu"],
html[data-cyber-theme="geek"] [role="dialog"]:not(.cb-modal-dialog) {
  --dsw-elevation-stroke-color: #36d5ff66;
}
@media (prefers-reduced-transparency: reduce) {
  html[data-cyber-theme="geek"] [data-composer-card] {
    background: #0b1b26;
    backdrop-filter: none;
  }
  html[data-cyber-theme="geek"] [data-conversation-content][data-content-phase="active"] {
    background: #050c12;
  }
}
`;
