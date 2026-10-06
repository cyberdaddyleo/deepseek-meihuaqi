// Static theme artwork, not executed code or a live system monitor. Shared by
// the native shell overlay and its miniature in the appearance manager.
const sceneCode = [
  '<b>const</b> scene = {',
  '  palette: <em>"deep_ocean"</em>,',
  '  accent: <em>"#36d5ff"</em>,',
  '  horizon: <em>"beyond"</em>',
  '};',
];
const ideaCode = [
  '<b>function</b> imagine(idea) {',
  '  <b>return</b> connect(',
  '    idea, <em>"possibility"</em>',
  '  );',
  '}',
];
const code = lines => `<div class="cb-geek-code">${lines.map((line, i) => `<div><span>${String(i + 1).padStart(2, '0')}</span><code>${line}</code></div>`).join('')}</div>`;
const panel = (type, title, subtitle, body) => `<section class="cb-geek-panel cb-geek-${type}"><header><span>${title}</span><small>${subtitle}</small></header>${body}</section>`;

export function geekHudMarkup() {
  return `<div class="cb-geek-frame"></div>
    <div class="cb-geek-topline"><span><i></i> DEEPSEEK HARNESS <small>// DEEP OCEAN</small></span><span>CODE / CREATE / EXPLORE</span></div>
    <div class="cb-geek-upper">${panel('source', '&lt;/&gt; SCENE.SOURCE', '视觉代码', code(sceneCode))}
    ${panel('sequence', 'CREATIVE SEQUENCE', '灵感序列', '<div class="cb-geek-steps"><span><i>01</i> SEARCH <b>→</b></span><span><i>02</i> REASON <b>→</b></span><span><i>03</i> CREATE <b>↗</b></span></div><div class="cb-geek-segments"></div>')}</div>
    <div class="cb-geek-lower">${panel('console', '&gt;_ IDEA.SCRIPT', '创意片段', code(ideaCode))}
    <div class="cb-geek-signature"><span>从灵感，连接更多可能</span><small>IMAGINE · CONNECT · BUILD</small><i></i></div></div>`;
}

export function geekPreviewMarkup() {
  return `<div class="cb-geek-mini" aria-hidden="true"><span>&lt;/&gt; SCENE.SOURCE</span>${code([sceneCode[0], sceneCode[2], sceneCode[4]])}</div>`;
}

export const geekHudCss = `
/* The verified native hero is the positioning anchor. No polling, resize
   listeners or DOM reparenting; the real composer retains its own layout. */
html[data-cyber-theme="geek"] [data-slot="main"] [data-conversation-content][data-content-phase="hero"] {
  anchor-name: --cyber-geek-home;
}
html[data-cyber-theme="geek"] [data-slot="main"] div:has(> span > [data-slot="conversation.hero.brand.mark"]) {
  anchor-name: --cyber-geek-heading;
}
html[data-cyber-theme="geek"] [data-slot="main"] [data-content-phase="hero"] [data-composer-card] {
  anchor-name: --cyber-geek-input;
}
.cb-geek-hud {
  display: none;
  pointer-events: none !important;
  user-select: none;
  -webkit-app-region: no-drag;
}
@supports (width: anchor-size(width)) {
  html[data-cyber-theme="geek"]:has([data-slot="main"] [data-content-phase="hero"]):not(:has([role="dialog"], .cb-toolbox, [data-slot="main"] [data-content-phase="active"])) .cb-geek-hud {
    display: block;
    position: fixed;
    position-anchor: --cyber-geek-home;
    top: anchor(top);
    left: anchor(left);
    width: anchor-size(width);
    height: anchor-size(height);
    container-type: size;
    overflow: hidden;
    color: #9bbdd1;
    font: 11px/1.8 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
}
.cb-geek-hud *, .cb-geek-hud *::before, .cb-geek-hud *::after { pointer-events: none !important; box-sizing: border-box; }
.cb-geek-frame, .cb-geek-topline, .cb-geek-upper, .cb-geek-lower, .cb-geek-panel, .cb-geek-signature { display: none; }
/* Available space follows the real headline and growing draft, not a guessed
   editor height. Hide complete panels when less than 160px remains. */
.cb-geek-upper, .cb-geek-lower { position: fixed; left: anchor(--cyber-geek-home left); width: anchor-size(--cyber-geek-home width); }
.cb-geek-upper { top: calc(anchor(--cyber-geek-home top) + 90px); bottom: calc(anchor(--cyber-geek-heading top) + 8px); container: cb-geek-upper / size; }
.cb-geek-lower { top: calc(anchor(--cyber-geek-input bottom) + 24px); bottom: calc(anchor(--cyber-geek-home bottom) + 38px); container: cb-geek-lower / size; }
@container (min-width: 820px) and (min-height: 720px) {
  .cb-geek-frame { display: block; position: absolute; inset: 20px; border: 1px solid #36d5ff24; }
  .cb-geek-frame::before, .cb-geek-frame::after { content: ""; position: absolute; width: 13px; height: 13px; }
  .cb-geek-frame::before { top: -1px; left: -1px; border-top: 2px solid #b9efff; border-left: 2px solid #b9efff; }
  .cb-geek-frame::after { bottom: -1px; right: -1px; border-bottom: 2px solid #f75b72; border-right: 2px solid #f75b72; }
  .cb-geek-topline { display: flex; position: absolute; top: 32px; left: 38px; right: 38px; justify-content: space-between; align-items: center; border-bottom: 1px solid #36d5ff38; padding-bottom: 10px; color: #b9efff; font-size: 10px; letter-spacing: 2px; }
  .cb-geek-topline i { display: inline-block; width: 16px; height: 2px; background: #ef566b; margin: 0 10px 3px 0; box-shadow: 0 0 8px #ef566b55; }
  .cb-geek-topline small { color: #6a93a8; font-size: 9px; letter-spacing: 1px; }
  .cb-geek-upper, .cb-geek-lower { display: block; }
}
@container cb-geek-upper (min-height: 160px) {
  .cb-geek-panel { display: block; }
}
@container cb-geek-lower (min-height: 160px) {
  .cb-geek-panel, .cb-geek-signature { display: block; }
}
.cb-geek-hud {
  .cb-geek-panel { position: absolute; border: 1px solid #36d5ff55; background: linear-gradient(120deg,#07151ee8,#051018d4); border-radius: 2px; box-shadow: inset 0 0 24px #157aa509, 0 8px 24px #00000024; }
  .cb-geek-panel::before, .cb-geek-panel::after { content: ""; position: absolute; width: 9px; height: 9px; }
  .cb-geek-panel::before { left: -1px; bottom: -1px; border-left: 1px solid #ceeefa; border-bottom: 1px solid #ceeefa; }
  .cb-geek-panel::after { top: -1px; right: -1px; border-right: 2px solid #ef566b; border-top: 2px solid #ef566b; }
  .cb-geek-panel header { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 7px 12px; color: #36d5ff; border-bottom: 1px solid #36d5ff36; background: #0c263550; letter-spacing: 1px; font-size: 10px; }
  .cb-geek-panel header small { color: #8eafc2; font: 9px/1.4 system-ui, sans-serif; letter-spacing: 1px; }
  .cb-geek-source { top: 0; left: 38px; width: 274px; }
  .cb-geek-sequence { top: 0; right: 38px; width: 218px; }
  .cb-geek-console { bottom: 0; left: 38px; width: 306px; }
  .cb-geek-signature { position: absolute; right: 38px; bottom: 8px; text-align: right; color: #bad6e6; letter-spacing: 3px; font: 12px/1.5 system-ui,sans-serif; }
  .cb-geek-signature small { display: block; margin-top: 7px; font: 9px/1.5 ui-monospace, monospace; letter-spacing: 2px; color: #789caf; }
  .cb-geek-signature i { display: block; margin-left: auto; width: 72px; height: 2px; margin-top: 5px; background: linear-gradient(90deg,#36d5ff88 80%,transparent 80% 90%,#ef566b 90%); }
}
.cb-geek-code { padding: 10px 13px 12px; font: 11px/1.85 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.cb-geek-code > div { display: flex; gap: 12px; white-space: pre; }
.cb-geek-code > div > span { color: #51788e; font-size: 10px; }
.cb-geek-code code { color: #c4dce9; font: inherit; }
.cb-geek-code b { color: #51d9ff; font-weight: 400; }
.cb-geek-code em { color: #9bddbf; font-style: normal; }
.cb-geek-steps { padding: 8px 12px; }
.cb-geek-sequence > div > span { display: flex; align-items: center; gap: 14px; line-height: 2.6; color: #bad6e6; letter-spacing: 2px; }
.cb-geek-sequence i { color: #547b91; font: 10px ui-monospace,monospace; }
.cb-geek-sequence b { margin-left: auto; color: #36d5ff; font-weight: 400; }
.cb-geek-segments { height: 3px; margin: 0 12px 12px; background: repeating-linear-gradient(90deg,#36d5ff66 0 13px,transparent 13px 17px); }
`;
