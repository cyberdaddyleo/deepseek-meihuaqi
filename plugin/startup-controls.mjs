// Local, decorative SVG glyphs. Accessible names live on the real buttons.
const svg = paths => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
const speaker = '<path d="M11 5 6 9H3v6h3l5 4V5Z"/>';
export const startupIcons = {
  skip: svg('<path d="m6 5 10 7-10 7V5Z"/><path d="M19 5v14"/>'),
  soundOn: svg(speaker + '<path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>'),
  soundOff: svg(speaker + '<path d="m16 9 5 6m0-6-5 6"/>'),
};

export function setStartupIcon(button, icon, label) {
  button.type = 'button';
  button.classList.add('cyber-startup-control');
  button.setAttribute('aria-label', label);
  if (button.dataset.icon !== icon) {
    button.dataset.icon = icon;
    button.innerHTML = startupIcons[icon];
  }
}

export const startupControlCss = `
.cyber-startup-control{box-sizing:border-box;display:inline-grid;place-items:center;flex:0 0 auto;width:30px;height:30px;padding:0;border:1px solid #d8eeff38;border-radius:50%;background:#08121f70;color:#e4f5ff;opacity:.76;cursor:pointer;backdrop-filter:blur(10px);transition:opacity .15s,background-color .15s;font:inherit;line-height:1}
.cyber-startup-control[hidden]{display:none}
.cyber-startup-control svg{display:block;width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}
.cyber-startup-control:hover,.cyber-startup-control:focus-visible{opacity:1;background:#122b43d9}
.cyber-startup-control:focus-visible{outline:2px solid #8edfff;outline-offset:3px}
[data-cyber-boot] .cyber-startup-control{background:#ffffffb8;color:#315679;border-color:#789dbb55}
[data-cyber-boot] .cyber-startup-control:hover{background:#fff}
@media(pointer:coarse){.cyber-startup-control{width:40px;height:40px}}
@media(prefers-reduced-motion:reduce){.cyber-startup-control{transition:none}}
`;
