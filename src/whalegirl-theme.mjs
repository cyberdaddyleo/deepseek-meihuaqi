// Verified against Harness 0.2.0-rc.2. These are the upstream slot anchors,
// not generated CSS-module class names, so no chat component is replaced.
export const whalegirlTokenOverrides = {
  '--dsw-specific-input-major': '#102236ed',
  '--dsw-specific-bubble': '#173950ed',
  '--dsw-specific-bubble-highlight': '#21485fed',
  '--dsw-specific-sidebar-nav-item-active': '#17415deb',
  '--dsw-specific-sidebar-nav-item-active-accent': '#17415deb',
  '--dsw-alias-button-info-fill': '#24799e',
  '--dsw-alias-button-info-hover': '#3093ba',
  '--dsw-specific-menu': '#101f32fa',
  '--dsw-menu-surface-fill': '#101f32fa',
  '--dsw-menu-backdrop-filter': 'blur(18px)',
  '--dsw-elevation-stroke-color': '#47758e80',
};

export const whalegirlCss = `
html[data-cyber-theme="whalegirl"] [data-slot="root"] > div:has(> [data-shell-overlay]) {
  background: #08121f url("/api/cyberdaddy/builtin?id=whalegirl-wallpaper") right center / cover no-repeat;
}
html[data-cyber-theme="whalegirl"] [data-slot="root"] > div > div:has(> [data-slot="main"]),
html[data-cyber-theme="whalegirl"] [data-slot="main"] [data-phase]:has(> [data-conversation-content]) {
  background: transparent;
}
html[data-cyber-theme="whalegirl"] [data-slot="root"] > div > div:has(> [data-slot="sidebar"]) {
  background: linear-gradient(165deg, #112235ed, #071420ed);
  border-right: 1px solid #5babc44a;
  box-shadow: 5px 0 22px #00000020;
}
html[data-cyber-theme="whalegirl"] [data-slot="sidebar"] > div {
  background: transparent;
}
html[data-cyber-theme="whalegirl"] [data-slot="sidebar"] button[aria-current="page"] {
  background: #173e55df;
  box-shadow: inset 0 0 0 1px #69d4f149;
}
html[data-cyber-theme="whalegirl"] [data-slot="conversation.header"] > * {
  background: #081423ad;
  border-bottom-color: #5babc43b;
}
html[data-cyber-theme="whalegirl"] [data-conversation-content][data-content-phase="active"] {
  background: linear-gradient(90deg, #07111de8, #07111ddc 62%, #07111dbd);
}
html[data-cyber-theme="whalegirl"] [data-composer-card] {
  background: linear-gradient(145deg, #19354be8, #0c192bed);
  box-shadow: 0 0 0 1px #72ccf185, 0 0 24px #1a90cb21, 0 10px 30px #00000035;
  backdrop-filter: blur(16px);
}
html[data-cyber-theme="whalegirl"] [data-composer-card]:focus-within {
  box-shadow: 0 0 0 1px #86e1ffc2, 0 0 28px #2d9fd438, 0 10px 30px #00000035;
}
html[data-cyber-theme="whalegirl"] [data-content-phase="active"] [data-composer-seat] {
  background: linear-gradient(180deg, #08121f00 0px, #08121fed 36px);
}
html[data-cyber-theme="whalegirl"] [data-slot="conversation.hero.brand.mark"] {
  color: #d8eeff;
  filter: drop-shadow(0 0 16px #55beee35);
}
html[data-cyber-theme="whalegirl"] [role="menu"],
html[data-cyber-theme="whalegirl"] [role="dialog"]:not(.cb-modal-dialog) {
  --dsw-elevation-stroke-color: #47758e80;
}
@media (prefers-reduced-transparency: reduce) {
  html[data-cyber-theme="whalegirl"] [data-composer-card] {
    background: #102236;
    backdrop-filter: none;
  }
  html[data-cyber-theme="whalegirl"] [data-conversation-content][data-content-phase="active"] {
    background: #08121f;
  }
}
`;

export function setWhalegirlAppearance(active, doc = document) {
  if (active) doc.documentElement.setAttribute('data-cyber-theme', 'whalegirl');
  else if (doc.documentElement.getAttribute('data-cyber-theme') === 'whalegirl') {
    doc.documentElement.removeAttribute('data-cyber-theme');
  }
}
