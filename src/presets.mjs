// IDs are durable settings values. Asset paths are relative to this repository.
import { PET_SIZE } from "./pet-size.mjs";
export const themes = [
  {
    id: "geek", name: "极客 · 深海中枢", caption: "代码浮窗、终端细线，连接深海灵感。", scheme: "dark",
    preview: "assets/geek-wallpaper.png", wallpaper: "assets/geek-wallpaper.png",
    palette: {base:"#050c12",surface:"#0b1b26",sidebar:"#07131c",soft:"#102837",selected:"#0c354a",text:"#e0f3ff",muted:"#9dbacd",accent:"#36d5ff",border:"#285369",code:"#07131d"},
  },
  {
    id: "cyberdad", name: "赛博老爸 · 科技深蓝", caption: "更智能，更可靠，也更贴心。", scheme: "dark",
    preview: "assets/cyberdad-wallpaper.png", wallpaper: "assets/cyberdad-wallpaper.png",
    palette: {base:"#071321",surface:"#102339",sidebar:"#081a2d",soft:"#142c46",selected:"#164263",text:"#e1f2ff",muted:"#a4bbd1",accent:"#61cfff",border:"#345a7c",code:"#09182a"},
  },
  {
    id: "whalegirl", name: "鲸鱼娘 · 深蓝霓虹", caption: "在深海微光里，和灵感并肩。", scheme: "dark",
    preview: "assets/whalegirl-wallpaper.png", wallpaper: "assets/whalegirl-wallpaper.png",
    palette: {base:"#08121f",surface:"#101f32",sidebar:"#0b1725",soft:"#13293d",selected:"#173950",text:"#d8eeff",muted:"#93aec6",accent:"#65d9ff",border:"#31506b",code:"#0a1729"},
  },
  {
    id: "ice",
    name: "清透冰蓝",
    caption: "把工作，留给一片清澈。",
    scheme: "light",
    preview: "assets/theme-ice.svg",
    palette: {
      base: "#f5faff",
      surface: "#ffffff",
      sidebar: "#eaf3fb",
      soft: "#edf5ff",
      selected: "#d8eaff",
      text: "#203449",
      muted: "#597087",
      accent: "#2868bd",
      border: "#d1dfed",
      code: "#edf4fb",
    },
  },
  {
    id: "night",
    name: "星河夜航",
    caption: "夜深了，灵感还亮着。",
    scheme: "dark",
    preview: "assets/theme-night.svg",
    palette: {
      base: "#141d32",
      surface: "#1d2941",
      sidebar: "#172238",
      soft: "#23324e",
      selected: "#344668",
      text: "#e1e9f6",
      muted: "#acbbd2",
      accent: "#a9bcff",
      border: "#3b4b67",
      code: "#182239",
    },
  },
  {
    id: "forest",
    name: "森林奶油",
    caption: "给忙碌的日常，一点呼吸。",
    scheme: "light",
    preview: "assets/theme-forest.svg",
    palette: {
      base: "#faf9f1",
      surface: "#fffef9",
      sidebar: "#edf1e3",
      soft: "#f0f3e7",
      selected: "#dae8ca",
      text: "#2e4336",
      muted: "#607365",
      accent: "#3e7555",
      border: "#d5dfca",
      code: "#edf1e4",
    },
  },
];
export const splashes = [
  {
    id: "geek", name: "极客 · 系统唤醒", caption: "一束科技蓝光，开启专注时刻。",
    preview: "assets/geek-wallpaper.png", asset: "assets/geek-startup.mp4", scene: "geek", mediaType: "video", videoFit: "contain",
  },
  {
    id: "cyberdad", name: "赛博老爸 · 蓝光启程", caption: "科技蓝线条，绘出今天的陪伴。",
    preview: "assets/cyberdad-wallpaper.png", asset: "assets/cyberdad-startup.mp4", scene: "cyberdad", mediaType: "video", videoFit: "contain",
  },
  {
    id: "whalegirl", name: "鲸鱼娘 · 深蓝启航", caption: "你提供的动态壁纸，陪伴真实启动。",
    preview: "assets/whalegirl-wallpaper.png", asset: "assets/whalegirl-startup.mp4", scene: "whalegirl", mediaType: "video",
  },
  {
    id: "whale",
    name: "清透蓝鲸",
    caption: "轻轻游进今天的灵感。",
    preview: "assets/splash-whale.svg",
    asset: "assets/whale.svg",
    scene: "whale",
  },
  {
    id: "stars",
    name: "星河微光",
    caption: "星光慢慢靠近，好点子也是。",
    preview: "assets/splash-stars.svg",
    asset: "assets/stars.svg",
    scene: "stars",
  },
  {
    id: "forest",
    name: "森林晨光",
    caption: "在一缕晨光里，重新出发。",
    preview: "assets/splash-forest.svg",
    asset: "assets/leaves.svg",
    scene: "forest",
  },
];
export const pets = [
  {
    id: "cyberdad", name: "赛博老爸", caption: "戴好眼镜，陪你工作，也陪你偷个懒。",
    preview: "assets/cyberdad-atlas.png", asset: "assets/cyberdad-atlas.png", sprite: {columns:4,rows:2},
  },
  {
    id: "whalegirl", name: "鲸鱼娘", caption: "打个哈欠，吃点零食，再陪你工作。",
    preview: "assets/whalegirl-atlas.png", asset: "assets/whalegirl-atlas.png", sprite: {columns:4,rows:2},
  },
  {
    id: "whale",
    name: "小蓝鲸",
    caption: "不催你，只陪你慢慢向前。",
    preview: "assets/whale.svg",
    asset: "assets/whale.svg",
  },
  {
    id: "cat",
    name: "奶油猫",
    caption: "认真摸鱼，偶尔伸个懒腰。",
    preview: "assets/cat.svg",
    asset: "assets/cat.svg",
  },
];
export const defaults = {
  version: 1,
  enabled: true,
  theme: "whalegirl",
  splash: "whalegirl",
  pet: {
    id: "whalegirl",
    enabled: false,
    size: PET_SIZE.default,
    paused: false,
    sound: true,
    position: null,
  },
};
export function themeTokens(p) {
  const v = {};
  const set = (names, value) =>
    names.split(" ").forEach((name) => (v[`--dsw-${name}`] = value));
  set("alias-bg-base", p.base);
  set(
    "alias-bg-layer-1 alias-bg-layer-2 alias-bg-layer-3 specific-input-major alias-button-elevated-fill alias-button-floating-fill",
    p.surface,
  );
  set("specific-sidebar-fill", p.sidebar);
  set(
    "alias-bg-module-platform alias-bg-multi-select alias-bg-overlay alias-markdown-inline-code alias-markdown-tag alias-markdown-placeholder specific-selector specific-tip specific-login-input alias-button-ghost-active-fill alias-button-primary-dimmed",
    p.soft,
  );
  set(
    "specific-sidebar-nav-item-active specific-sidebar-nav-item-active-accent specific-bubble specific-bubble-highlight alias-state-business-tertiary alias-interactive-bg-active",
    p.selected,
  );
  set(
    "specific-sidebar-nav-item-hover alias-interactive-bg-hover alias-interactive-bg-hover-solid alias-interactive-bg-hover-accent alias-button-floating-hover alias-button-ghost-active-hover",
    p.soft,
  );
  set(
    "alias-label-primary alias-label-primary-dimmed alias-label-primary-bluish alias-brand-primary alias-brand-text",
    p.text,
  );
  set(
    "alias-label-secondary alias-label-tertiary alias-menu-icon alias-label-caption",
    p.muted,
  );
  set(
    "alias-border-l1 alias-border-l2 alias-border-l2-darkmode-thin alias-border-l3 alias-border-l4 alias-button-ghost-active-border elevation-stroke-color",
    p.border,
  );
  set(
    "alias-state-business-primary alias-link focus-ring-color alias-label-deep-diving alias-button-info-fill",
    p.accent,
  );
  set("alias-button-primary-fill", p.text);
  set("alias-button-primary-hover alias-button-contrast-fill", p.muted);
  set("alias-label-primary-inverted alias-label-primary-foreground", p.surface);
  set(
    "alias-markdown-code-block alias-markdown-code-block-banner alias-turn-trigger-bg alias-bg-document-preview",
    p.code,
  );
  set("alias-label-document-preview", p.text);
  set(
    "specific-menu menu-surface-fill alias-menu-group-header-fill",
    p.surface + "f2",
  );
  set("alias-scrollbar-bg-l1 alias-scrollbar-bg-l2", p.border);
  set("alias-scrollbar-hover-l1 alias-scrollbar-hover-l2", p.muted);
  // Status and syntax colors retain the upstream light/dark semantic palettes.
  return v;
}
