window.__ModuleLoader__.load({id:'@cyberdaddy/harness-dressup',factory:(require)=>{var module={exports:{}};var exports=module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// plugin/client.jsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(client_exports);
var import_react = __toESM(require("react"), 1);

// src/pet-size.mjs
var PET_SIZE = Object.freeze({ min: 80, max: 320, step: 10, default: 120 });

// src/presets.mjs
var themes = [
  {
    id: "geek",
    name: "\u6781\u5BA2 \xB7 \u6DF1\u6D77\u4E2D\u67A2",
    caption: "\u4EE3\u7801\u6D6E\u7A97\u3001\u7EC8\u7AEF\u7EC6\u7EBF\uFF0C\u8FDE\u63A5\u6DF1\u6D77\u7075\u611F\u3002",
    scheme: "dark",
    preview: "assets/geek-wallpaper.png",
    wallpaper: "assets/geek-wallpaper.png",
    palette: { base: "#050c12", surface: "#0b1b26", sidebar: "#07131c", soft: "#102837", selected: "#0c354a", text: "#e0f3ff", muted: "#9dbacd", accent: "#36d5ff", border: "#285369", code: "#07131d" }
  },
  {
    id: "cyberdad",
    name: "\u8D5B\u535A\u8001\u7238 \xB7 \u79D1\u6280\u6DF1\u84DD",
    caption: "\u66F4\u667A\u80FD\uFF0C\u66F4\u53EF\u9760\uFF0C\u4E5F\u66F4\u8D34\u5FC3\u3002",
    scheme: "dark",
    preview: "assets/cyberdad-wallpaper.png",
    wallpaper: "assets/cyberdad-wallpaper.png",
    palette: { base: "#071321", surface: "#102339", sidebar: "#081a2d", soft: "#142c46", selected: "#164263", text: "#e1f2ff", muted: "#a4bbd1", accent: "#61cfff", border: "#345a7c", code: "#09182a" }
  },
  {
    id: "whalegirl",
    name: "\u9CB8\u9C7C\u5A18 \xB7 \u6DF1\u84DD\u9713\u8679",
    caption: "\u5728\u6DF1\u6D77\u5FAE\u5149\u91CC\uFF0C\u548C\u7075\u611F\u5E76\u80A9\u3002",
    scheme: "dark",
    preview: "assets/whalegirl-wallpaper.png",
    wallpaper: "assets/whalegirl-wallpaper.png",
    palette: { base: "#08121f", surface: "#101f32", sidebar: "#0b1725", soft: "#13293d", selected: "#173950", text: "#d8eeff", muted: "#93aec6", accent: "#65d9ff", border: "#31506b", code: "#0a1729" }
  },
  {
    id: "ice",
    name: "\u6E05\u900F\u51B0\u84DD",
    caption: "\u628A\u5DE5\u4F5C\uFF0C\u7559\u7ED9\u4E00\u7247\u6E05\u6F88\u3002",
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
      code: "#edf4fb"
    }
  },
  {
    id: "night",
    name: "\u661F\u6CB3\u591C\u822A",
    caption: "\u591C\u6DF1\u4E86\uFF0C\u7075\u611F\u8FD8\u4EAE\u7740\u3002",
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
      code: "#182239"
    }
  },
  {
    id: "forest",
    name: "\u68EE\u6797\u5976\u6CB9",
    caption: "\u7ED9\u5FD9\u788C\u7684\u65E5\u5E38\uFF0C\u4E00\u70B9\u547C\u5438\u3002",
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
      code: "#edf1e4"
    }
  }
];
var splashes = [
  {
    id: "geek",
    name: "\u6781\u5BA2 \xB7 \u7CFB\u7EDF\u5524\u9192",
    caption: "\u4E00\u675F\u79D1\u6280\u84DD\u5149\uFF0C\u5F00\u542F\u4E13\u6CE8\u65F6\u523B\u3002",
    preview: "assets/geek-wallpaper.png",
    asset: "assets/geek-startup.mp4",
    scene: "geek",
    mediaType: "video",
    videoFit: "contain"
  },
  {
    id: "cyberdad",
    name: "\u8D5B\u535A\u8001\u7238 \xB7 \u84DD\u5149\u542F\u7A0B",
    caption: "\u79D1\u6280\u84DD\u7EBF\u6761\uFF0C\u7ED8\u51FA\u4ECA\u5929\u7684\u966A\u4F34\u3002",
    preview: "assets/cyberdad-wallpaper.png",
    asset: "assets/cyberdad-startup.mp4",
    scene: "cyberdad",
    mediaType: "video",
    videoFit: "contain"
  },
  {
    id: "whalegirl",
    name: "\u9CB8\u9C7C\u5A18 \xB7 \u6DF1\u84DD\u542F\u822A",
    caption: "\u4F60\u63D0\u4F9B\u7684\u52A8\u6001\u58C1\u7EB8\uFF0C\u966A\u4F34\u771F\u5B9E\u542F\u52A8\u3002",
    preview: "assets/whalegirl-wallpaper.png",
    asset: "assets/whalegirl-startup.mp4",
    scene: "whalegirl",
    mediaType: "video"
  },
  {
    id: "whale",
    name: "\u6E05\u900F\u84DD\u9CB8",
    caption: "\u8F7B\u8F7B\u6E38\u8FDB\u4ECA\u5929\u7684\u7075\u611F\u3002",
    preview: "assets/splash-whale.svg",
    asset: "assets/whale.svg",
    scene: "whale"
  },
  {
    id: "stars",
    name: "\u661F\u6CB3\u5FAE\u5149",
    caption: "\u661F\u5149\u6162\u6162\u9760\u8FD1\uFF0C\u597D\u70B9\u5B50\u4E5F\u662F\u3002",
    preview: "assets/splash-stars.svg",
    asset: "assets/stars.svg",
    scene: "stars"
  },
  {
    id: "forest",
    name: "\u68EE\u6797\u6668\u5149",
    caption: "\u5728\u4E00\u7F15\u6668\u5149\u91CC\uFF0C\u91CD\u65B0\u51FA\u53D1\u3002",
    preview: "assets/splash-forest.svg",
    asset: "assets/leaves.svg",
    scene: "forest"
  }
];
var pets = [
  {
    id: "cyberdad",
    name: "\u8D5B\u535A\u8001\u7238",
    caption: "\u6234\u597D\u773C\u955C\uFF0C\u966A\u4F60\u5DE5\u4F5C\uFF0C\u4E5F\u966A\u4F60\u5077\u4E2A\u61D2\u3002",
    preview: "assets/cyberdad-atlas.png",
    asset: "assets/cyberdad-atlas.png",
    sprite: { columns: 4, rows: 2 }
  },
  {
    id: "whalegirl",
    name: "\u9CB8\u9C7C\u5A18",
    caption: "\u6253\u4E2A\u54C8\u6B20\uFF0C\u5403\u70B9\u96F6\u98DF\uFF0C\u518D\u966A\u4F60\u5DE5\u4F5C\u3002",
    preview: "assets/whalegirl-atlas.png",
    asset: "assets/whalegirl-atlas.png",
    sprite: { columns: 4, rows: 2 }
  },
  {
    id: "whale",
    name: "\u5C0F\u84DD\u9CB8",
    caption: "\u4E0D\u50AC\u4F60\uFF0C\u53EA\u966A\u4F60\u6162\u6162\u5411\u524D\u3002",
    preview: "assets/whale.svg",
    asset: "assets/whale.svg"
  },
  {
    id: "cat",
    name: "\u5976\u6CB9\u732B",
    caption: "\u8BA4\u771F\u6478\u9C7C\uFF0C\u5076\u5C14\u4F38\u4E2A\u61D2\u8170\u3002",
    preview: "assets/cat.svg",
    asset: "assets/cat.svg"
  }
];
var defaults = {
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
    position: null
  }
};
function themeTokens(p) {
  const v = {};
  const set = (names, value) => names.split(" ").forEach((name2) => v[`--dsw-${name2}`] = value);
  set("alias-bg-base", p.base);
  set(
    "alias-bg-layer-1 alias-bg-layer-2 alias-bg-layer-3 specific-input-major alias-button-elevated-fill alias-button-floating-fill",
    p.surface
  );
  set("specific-sidebar-fill", p.sidebar);
  set(
    "alias-bg-module-platform alias-bg-multi-select alias-bg-overlay alias-markdown-inline-code alias-markdown-tag alias-markdown-placeholder specific-selector specific-tip specific-login-input alias-button-ghost-active-fill alias-button-primary-dimmed",
    p.soft
  );
  set(
    "specific-sidebar-nav-item-active specific-sidebar-nav-item-active-accent specific-bubble specific-bubble-highlight alias-state-business-tertiary alias-interactive-bg-active",
    p.selected
  );
  set(
    "specific-sidebar-nav-item-hover alias-interactive-bg-hover alias-interactive-bg-hover-solid alias-interactive-bg-hover-accent alias-button-floating-hover alias-button-ghost-active-hover",
    p.soft
  );
  set(
    "alias-label-primary alias-label-primary-dimmed alias-label-primary-bluish alias-brand-primary alias-brand-text",
    p.text
  );
  set(
    "alias-label-secondary alias-label-tertiary alias-menu-icon alias-label-caption",
    p.muted
  );
  set(
    "alias-border-l1 alias-border-l2 alias-border-l2-darkmode-thin alias-border-l3 alias-border-l4 alias-button-ghost-active-border elevation-stroke-color",
    p.border
  );
  set(
    "alias-state-business-primary alias-link focus-ring-color alias-label-deep-diving alias-button-info-fill",
    p.accent
  );
  set("alias-button-primary-fill", p.text);
  set("alias-button-primary-hover alias-button-contrast-fill", p.muted);
  set("alias-label-primary-inverted alias-label-primary-foreground", p.surface);
  set(
    "alias-markdown-code-block alias-markdown-code-block-banner alias-turn-trigger-bg alias-bg-document-preview",
    p.code
  );
  set("alias-label-document-preview", p.text);
  set(
    "specific-menu menu-surface-fill alias-menu-group-header-fill",
    p.surface + "f2"
  );
  set("alias-scrollbar-bg-l1 alias-scrollbar-bg-l2", p.border);
  set("alias-scrollbar-hover-l1 alias-scrollbar-hover-l2", p.muted);
  return v;
}

// src/catalog.mjs
var builtin = { theme: themes, splash: splashes, pet: pets };
function catalogFor(state, kind) {
  return [...builtin[kind] || [], ...Array.isArray(state?.custom?.[kind]) ? state.custom[kind] : []];
}
function customAssetId(path) {
  return typeof path === "string" ? /^custom-assets\/(custom-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\.(?:png|jpg|webp|gif|svg)$/.exec(path)?.[1] || null : null;
}
function builtinAssetId(path) {
  return typeof path === "string" ? /^assets\/(whalegirl-(?:wallpaper|atlas)|cyberdad-(?:logo|atlas|wallpaper)|geek-wallpaper)\.png$/.exec(path)?.[1] || /^assets\/((?:whalegirl|cyberdad|geek)-startup)\.mp4$/.exec(path)?.[1] || null : null;
}

// src/custom-form.mjs
var escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
var fields = { base: "\u4E3B\u80CC\u666F", surface: "\u9762\u677F\u4E0E\u8F93\u5165\u6846", sidebar: "\u4FA7\u8FB9\u680F", soft: "\u60AC\u505C\u80CC\u666F", selected: "\u9009\u4E2D\u80CC\u666F", text: "\u4E3B\u8981\u6587\u5B57", muted: "\u6B21\u8981\u6587\u5B57", accent: "\u5F3A\u8C03\u8272", border: "\u8FB9\u6846", code: "\u4EE3\u7801\u533A\u57DF" };
var titles = { theme: "\u754C\u9762\u76AE\u80A4", splash: "\u542F\u52A8\u753B\u9762", pet: "\u684C\u9762\u5BA0\u7269" };
var imageTypes = /* @__PURE__ */ new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);
var colorValid = (value) => /^#[\da-f]{6}$/i.test(value || "");
function themePreviewMarkup(palette, name2 = "\u81EA\u5B9A\u4E49") {
  const vars = Object.entries(themeTokens(palette)).map(([key, value]) => `${key}:${value}`).join(";");
  return `<div class="cb-theme-preview" style="${escapeHTML(vars)}" aria-label="${escapeHTML(name2)}\u4E3B\u9898\u9884\u89C8"><aside><i></i><b></b><i></i><i></i></aside><section><div class="cb-mini-line"></div><div class="cb-mini-bubble"></div><code>const idea = 'hello';</code><div class="cb-mini-input"><span>\u8BB0\u5F55\u4E00\u4E2A\u65B0\u60F3\u6CD5\u2026</span><b>\u2191</b></div></section></div>`;
}
function exportTheme(preset) {
  const data = { version: 1, kind: "theme", name: preset.name, scheme: preset.scheme, palette: { ...preset.palette } };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `harness-theme-${preset.id || "custom"}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function createModal({ title, className = "", onClose = () => {
} }) {
  const previous = document.activeElement;
  const overlay = document.createElement("div");
  overlay.className = `cb-modal ${className}`;
  const dialog = document.createElement("section");
  dialog.className = "cb-modal-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-label", title);
  dialog.tabIndex = -1;
  overlay.append(dialog);
  document.body.append(overlay);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    overlay.removeEventListener("keydown", keyboard);
    overlay.remove();
    if (previous?.isConnected) previous.focus();
    onClose();
  };
  const keyboard = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== "Tab") return;
    const focusables = [...dialog.querySelectorAll("button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]")].filter((el) => el.getClientRects().length);
    const first = focusables[0], last = focusables.at(-1);
    if (!first) {
      e.preventDefault();
      dialog.focus();
      return;
    }
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  overlay.addEventListener("keydown", keyboard);
  dialog.focus();
  return { overlay, dialog, close };
}
function openCustomPresetForm({ kind, api, onSaved, onClose }) {
  const modal = createModal({ title: `\u6DFB\u52A0${titles[kind]}`, className: "cb-custom-modal", onClose });
  const { dialog, close } = modal;
  let image = null, reading = false, saving = false, readVersion = 0;
  const palette = { ...themes[0].palette };
  dialog.innerHTML = `<header class="cb-dialog-header"><div><span>\u6211\u7684\u9884\u8BBE</span><h3>\u6DFB\u52A0${titles[kind]}</h3></div><button type="button" data-close aria-label="\u5173\u95ED\u6DFB\u52A0\u7A97\u53E3">\xD7</button></header>
    <form class="cb-custom-form">
      <label class="cb-field">\u540D\u79F0<input name="name" aria-label="\u540D\u79F0" maxlength="40" required placeholder="\u7ED9\u5B83\u8D77\u4E2A\u540D\u5B57" autocomplete="off"></label>
      ${kind === "theme" ? `<div class="cb-form-row"><label class="cb-field">\u4ECE\u73B0\u6709\u76AE\u80A4\u5F00\u59CB<select name="reference" aria-label="\u53C2\u8003\u76AE\u80A4">${themes.map((t) => `<option value="${t.id}">${t.name}</option>`).join("")}</select></label><label class="cb-field">\u754C\u9762\u6A21\u5F0F<select name="scheme" aria-label="\u754C\u9762\u6A21\u5F0F"><option value="light">\u6D45\u8272</option><option value="dark">\u6DF1\u8272</option></select></label></div>
        <div class="cb-form-preview">${themePreviewMarkup(palette)}</div>
        <div class="cb-color-grid">${Object.entries(fields).map(([key, label2]) => `<label class="cb-color-field"><input type="color" name="${key}" aria-label="${label2}" value="${palette[key]}"><span>${label2}</span><output data-color-value="${key}">${palette[key]}</output></label>`).join("")}</div>
        <div class="cb-json-tools"><label class="cb-file-button">\u5BFC\u5165\u4E3B\u9898 JSON<input type="file" name="json" aria-label="\u5BFC\u5165\u4E3B\u9898 JSON" accept=".json,application/json"></label><button type="button" data-export>\u5BFC\u51FA\u5F53\u524D\u914D\u8272</button></div><p class="cb-form-hint">\u5BFC\u5165\u914D\u8272\u540E\u4ECD\u53EF\u8C03\u6574\u3002\u53EA\u4FDD\u5B58\u989C\u8272\u4E0E\u660E\u6697\u6A21\u5F0F\uFF0C\u4E0D\u6267\u884C\u4EE3\u7801\u3002</p>` : `<div class="cb-upload-preview ${kind === "pet" ? "cb-transparent-grid" : ""}" aria-label="\u56FE\u7247\u9884\u89C8"><span>\u9009\u4E00\u5F20\u4F60\u559C\u6B22\u7684\u56FE\u7247</span></div><label class="cb-file-button">\u9009\u62E9\u56FE\u7247<input type="file" name="image" aria-label="\u9009\u62E9\u56FE\u7247" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg"></label><p class="cb-form-hint">PNG / JPG / WebP / GIF / SVG \xB7 \u6700\u5927 5 MB${kind === "pet" ? " \xB7 \u900F\u660E\u80CC\u666F\u6548\u679C\u66F4\u81EA\u7136" : ""}</p>
        ${kind === "splash" ? `<div class="cb-form-row"><label class="cb-field">\u52A8\u6001\u98CE\u683C<select name="scene" aria-label="\u52A8\u6001\u98CE\u683C"><option value="whale">\u8F7B\u67D4\u6F02\u6D6E</option><option value="stars">\u661F\u70B9\u5FAE\u5149</option><option value="forest">\u6668\u5149\u98D8\u52A8</option></select></label><label class="cb-color-field cb-background-field"><input type="color" name="background" aria-label="\u80CC\u666F\u989C\u8272" value="#eef7ff"><span>\u80CC\u666F\u989C\u8272</span></label></div>` : ""}`}
      <p class="cb-form-error" role="alert" hidden></p>
      <footer class="cb-dialog-footer"><span>\u4FDD\u5B58\u540E\u53EF\u5728\u5361\u7247\u4E0A\u5E94\u7528</span><button type="button" data-cancel>\u53D6\u6D88</button><button type="submit" class="cb-primary">\u4FDD\u5B58\u5230\u6211\u7684\u9884\u8BBE</button></footer>
    </form>`;
  const form = dialog.querySelector("form");
  const nameInput = form.elements.namedItem("name");
  const errorEl = form.querySelector(".cb-form-error");
  const error = (message) => {
    errorEl.textContent = message;
    errorEl.hidden = !message;
  };
  const submit = form.querySelector("[type=submit]");
  const updateBusy = () => {
    submit.disabled = saving || reading;
    submit.textContent = saving ? "\u6B63\u5728\u4FDD\u5B58\u2026" : reading ? "\u6B63\u5728\u8BFB\u53D6\u56FE\u7247\u2026" : "\u4FDD\u5B58\u5230\u6211\u7684\u9884\u8BBE";
  };
  const preview = () => {
    form.querySelector(".cb-form-preview").innerHTML = themePreviewMarkup(palette, nameInput.value);
  };
  const themePayload = () => ({ version: 1, kind: "theme", name: nameInput.value.trim(), scheme: form.elements.namedItem("scheme").value, palette: { ...palette } });
  const imageFile = form.elements.namedItem("image");
  dialog.querySelector("[data-close]").onclick = close;
  dialog.querySelector("[data-cancel]").onclick = close;
  nameInput.focus();
  if (kind === "theme") {
    const setPalette = (next, scheme) => {
      Object.assign(palette, next);
      for (const key of Object.keys(fields)) {
        form.elements.namedItem(key).value = palette[key];
        form.querySelector(`[data-color-value="${key}"]`).textContent = palette[key];
      }
      form.elements.namedItem("scheme").value = scheme;
      preview();
    };
    form.elements.namedItem("scheme").value = themes[0].scheme;
    form.elements.namedItem("reference").onchange = (e) => {
      const base = themes.find((t) => t.id === e.target.value);
      setPalette(base.palette, base.scheme);
    };
    for (const key of Object.keys(fields)) form.elements.namedItem(key).oninput = (e) => {
      palette[key] = e.target.value;
      form.querySelector(`[data-color-value="${key}"]`).textContent = e.target.value;
      preview();
    };
    form.querySelector("[data-export]").onclick = () => {
      if (!nameInput.value.trim()) {
        error("\u8BF7\u5148\u586B\u5199\u540D\u79F0\uFF0C\u518D\u5BFC\u51FA\u914D\u8272\u3002");
        nameInput.focus();
        return;
      }
      exportTheme(themePayload());
    };
    form.elements.namedItem("json").onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        if (file.size > 32768) throw Error("\u4E3B\u9898 JSON \u4E0D\u80FD\u8D85\u8FC7 32 KB\u3002");
        const data = JSON.parse(await file.text());
        if (!data || data.version !== 1 || data.kind !== "theme" || !["light", "dark"].includes(data.scheme) || typeof data.name !== "string" || !data.name.trim() || data.name.length > 40 || !data.palette || Object.keys(data.palette).length !== 10 || !Object.keys(fields).every((key) => colorValid(data.palette[key]))) throw Error("\u4E3B\u9898 JSON \u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u8BF7\u5BFC\u5165\u5DE5\u5177\u7BB1\u5BFC\u51FA\u7684\u914D\u8272\u6587\u4EF6\u3002");
        nameInput.value = data.name.trim();
        setPalette(data.palette, data.scheme);
        error("");
      } catch (err) {
        error(err instanceof SyntaxError ? "\u4E3B\u9898 JSON \u65E0\u6CD5\u8BFB\u53D6\uFF0C\u8BF7\u68C0\u67E5\u6587\u4EF6\u5185\u5BB9\u3002" : err.message);
      }
      e.target.value = "";
    };
  } else {
    imageFile.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const version = ++readVersion;
      try {
        const type = file.type || (/\.svg$/i.test(file.name) ? "image/svg+xml" : "");
        if (!imageTypes.has(type)) throw Error("\u8BF7\u9009\u62E9 PNG\u3001JPG\u3001WebP\u3001GIF \u6216 SVG \u56FE\u7247\u3002");
        if (file.size > 5 * 1024 * 1024) throw Error("\u56FE\u7247\u4E0D\u80FD\u8D85\u8FC7 5 MB\uFF0C\u8BF7\u5148\u7F29\u5C0F\u56FE\u7247\u3002");
        if (file.size === 0) throw Error("\u56FE\u7247\u662F\u7A7A\u6587\u4EF6\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u3002");
        reading = true;
        updateBusy();
        error("");
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(Error("\u56FE\u7247\u8BFB\u53D6\u5931\u8D25\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u3002"));
          reader.readAsDataURL(file);
        });
        if (version !== readVersion) return;
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = () => reject(Error("\u65E0\u6CD5\u9884\u89C8\u8FD9\u5F20\u56FE\u7247\uFF0C\u8BF7\u9009\u62E9\u6709\u6548\u7684\u56FE\u7247\u6587\u4EF6\u3002"));
          img.src = dataUrl;
        });
        if (version !== readVersion) return;
        image = { name: file.name, type, dataUrl };
        form.querySelector(".cb-upload-preview").innerHTML = `<img src="${escapeHTML(dataUrl)}" alt="${escapeHTML(file.name)}" draggable="false">`;
        if (!nameInput.value.trim()) nameInput.value = file.name.replace(/\.[^.]+$/, "").slice(0, 40);
      } catch (err) {
        if (version === readVersion) error(err.message);
      } finally {
        if (version === readVersion) {
          reading = false;
          updateBusy();
        }
      }
    };
    if (kind === "splash") {
      const background = form.elements.namedItem("background");
      background.oninput = () => {
        form.querySelector(".cb-upload-preview").style.background = background.value;
      };
      background.oninput();
    }
  }
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (saving || reading) return;
    const name2 = nameInput.value.trim();
    if (!name2) {
      error("\u8BF7\u586B\u5199\u540D\u79F0\u3002");
      nameInput.focus();
      return;
    }
    if (kind !== "theme" && !image) {
      error("\u8BF7\u5148\u9009\u62E9\u4E00\u5F20\u56FE\u7247\u3002");
      return;
    }
    const payload = kind === "theme" ? themePayload() : { kind, name: name2, image, ...kind === "splash" ? { scene: form.elements.namedItem("scene").value, background: form.elements.namedItem("background").value } : {} };
    saving = true;
    updateBusy();
    error("");
    try {
      const state = await api.addPreset(payload);
      close();
      onSaved(state);
    } catch (err) {
      error(err.message || "\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    } finally {
      saving = false;
      updateBusy();
    }
  };
  return close;
}

// src/copy.mjs
var copy = {
  title: "\u8D5B\u535A\u8001\u7238\u7684 Harness \u6362\u88C5\u5668",
  headline: "\u7ED9\u7075\u611F\uFF0C\u6362\u4E2A\u597D\u5FC3\u60C5\u3002",
  subtitle: "\u4E00\u4E2A\u5DE5\u4F5C\u754C\u9762\uFF0C\u4E09\u79CD\u5C0F\u5C0F\u7684\u6539\u53D8\u3002",
  saved: "\u5DF2\u5728\u672C\u673A\u4FDD\u5B58",
  saving: "\u6B63\u5728\u4FDD\u5B58\u2026",
  tabs: { splash: "\u542F\u52A8\u753B\u9762", theme: "\u754C\u9762\u76AE\u80A4", pet: "\u684C\u9762\u5BA0\u7269" },
  apply: "\u5E94\u7528",
  selected: "\u4F7F\u7528\u4E2D",
  preview: "\u9884\u89C8",
  reset: "\u6062\u590D\u9ED8\u8BA4",
  disable: "\u5173\u95ED\u7F8E\u5316",
  enable: "\u5F00\u542F\u7F8E\u5316",
  off: "\u7F8E\u5316\u5DF2\u5173\u95ED",
  default: "Harness \u539F\u59CB\u5916\u89C2",
  splashOff: "\u5173\u95ED\u542F\u52A8\u52A8\u753B",
  petOn: "\u663E\u793A\u684C\u5BA0",
  petOff: "\u9690\u85CF\u684C\u5BA0",
  size: "\u684C\u5BA0\u5927\u5C0F",
  pause: "\u6682\u505C\u52A8\u753B",
  resume: "\u7EE7\u7EED\u52A8\u753B",
  foot: "\u4E09\u9879\u72EC\u7ACB\u7EC4\u5408 \xB7 \u672C\u5730\u4FDD\u5B58 \xB7 \u79BB\u7EBF\u7D20\u6750",
  titles: {
    splash: "\u8BA9\u6BCF\u6B21\u51FA\u53D1\uFF0C\u90FD\u503C\u5F97\u671F\u5F85\u3002",
    theme: "\u8BA9\u719F\u6089\u7684\u5DE5\u4F5C\uFF0C\u6709\u4E00\u70B9\u65B0\u9C9C\u3002",
    pet: "\u8BA4\u771F\u5DE5\u4F5C\uFF0C\u4E5F\u6709\u4EBA\u966A\u3002"
  },
  notes: {
    splash: "\u89C6\u9891\u9884\u8BBE\u5B8C\u6574\u64AD\u653E\u7EA6 7 \u79D2\u540E\u8FDB\u5165 Harness\uFF0C\u53EF\u70B9\u51FB\u8DF3\u8FC7\u6216\u6309 Esc\u3002",
    theme: "\u5373\u65F6\u5E94\u7528\u5230\u771F\u5B9E Harness\uFF0C\u4E0D\u6253\u65AD\u4F1A\u8BDD\u4E0E\u4EFB\u52A1\u3002",
    pet: "\u62D6\u52A8\u8C03\u6574\u4F4D\u7F6E\uFF0C\u5355\u51FB\u6253\u62DB\u547C\uFF0C\u53F3\u952E\u6253\u5F00\u83DC\u5355\u3002"
  },
  browserPet: "\u684C\u5BA0\u9700\u8981\u672C\u673A\u4F34\u968F\u8FDB\u7A0B\uFF1A\u8FD0\u884C ./run.sh pet\u3002",
  close: "\u5173\u95ED\u9884\u89C8"
};

// src/asset-fallback.mjs
var fallbackSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" data-fallback="emergency"><g data-creature="whale"><path class="whale-tail" d="M171 125q26-3 25-34 31 27-14 56" fill="#79b9ec" stroke="#316b9f" stroke-width="4" stroke-linejoin="round"/><ellipse class="whale-body" cx="109" cy="130" rx="72" ry="57" fill="#98d8fa" stroke="#316b9f" stroke-width="4"/><path d="M43 149q62 31 132 0-15 33-65 34-49 0-67-34" fill="#e2f6ff"/><path class="whale-fin" d="M117 151q9 22 30 12" fill="#79b9ec" stroke="#316b9f" stroke-width="3" stroke-linecap="round"/><circle class="eyes" cx="76" cy="124" r="6" fill="#244966"/><path class="sleep-eyes" style="display:none" d="M70 124q6 5 12 0" fill="none" stroke="#244966" stroke-width="3" stroke-linecap="round"/><path d="M88 143q9 8 19-1" fill="none" stroke="#316b9f" stroke-width="3" stroke-linecap="round"/><path class="whale-spout" d="M112 67q-16-5-15-20m15 20q1-22 13-24" fill="none" stroke="#79b9ec" stroke-width="6" stroke-linecap="round"/></g></svg>';
var fallbackData = "data:image/svg+xml," + encodeURIComponent(fallbackSvg);

// src/geek-hud.mjs
var sceneCode = [
  "<b>const</b> scene = {",
  '  palette: <em>"deep_ocean"</em>,',
  '  accent: <em>"#36d5ff"</em>,',
  '  horizon: <em>"beyond"</em>',
  "};"
];
var ideaCode = [
  "<b>function</b> imagine(idea) {",
  "  <b>return</b> connect(",
  '    idea, <em>"possibility"</em>',
  "  );",
  "}"
];
var code = (lines) => `<div class="cb-geek-code">${lines.map((line, i) => `<div><span>${String(i + 1).padStart(2, "0")}</span><code>${line}</code></div>`).join("")}</div>`;
var panel = (type, title, subtitle, body) => `<section class="cb-geek-panel cb-geek-${type}"><header><span>${title}</span><small>${subtitle}</small></header>${body}</section>`;
function geekHudMarkup() {
  return `<div class="cb-geek-frame"></div>
    <div class="cb-geek-topline"><span><i></i> DEEPSEEK HARNESS <small>// DEEP OCEAN</small></span><span>CODE / CREATE / EXPLORE</span></div>
    <div class="cb-geek-upper">${panel("source", "&lt;/&gt; SCENE.SOURCE", "\u89C6\u89C9\u4EE3\u7801", code(sceneCode))}
    ${panel("sequence", "CREATIVE SEQUENCE", "\u7075\u611F\u5E8F\u5217", '<div class="cb-geek-steps"><span><i>01</i> SEARCH <b>\u2192</b></span><span><i>02</i> REASON <b>\u2192</b></span><span><i>03</i> CREATE <b>\u2197</b></span></div><div class="cb-geek-segments"></div>')}</div>
    <div class="cb-geek-lower">${panel("console", "&gt;_ IDEA.SCRIPT", "\u521B\u610F\u7247\u6BB5", code(ideaCode))}
    <div class="cb-geek-signature"><span>\u4ECE\u7075\u611F\uFF0C\u8FDE\u63A5\u66F4\u591A\u53EF\u80FD</span><small>IMAGINE \xB7 CONNECT \xB7 BUILD</small><i></i></div></div>`;
}
function geekPreviewMarkup() {
  return `<div class="cb-geek-mini" aria-hidden="true"><span>&lt;/&gt; SCENE.SOURCE</span>${code([sceneCode[0], sceneCode[2], sceneCode[4]])}</div>`;
}
var geekHudCss = `
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

// src/manager.mjs
var escape = (s) => String(s).replace(
  /[&<>"']/g,
  (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]
);
var label = (list, id, fallback) => list.find((p) => p.id === id)?.name || fallback;
function mountManager(root, api, { assetBase = "/cyber-assets/", petOnly = false, assetResolver } = {}) {
  let state, tab = petOnly ? "pet" : "theme", message = "", busy = false, alive = true, pendingDelete = null;
  const headerRegion = document.createElement("div");
  const contentRegion = document.createElement("div");
  const petSizing = document.createElement("div");
  petSizing.className = "cb-pet-size";
  petSizing.setAttribute("role", "group");
  petSizing.setAttribute("aria-label", copy.size);
  petSizing.innerHTML = `<div class="cb-size-heading"><span>${copy.size}</span><output aria-live="off"></output></div><div class="cb-size-adjust"><button type="button" data-size-step="-1" aria-label="\u7F29\u5C0F\u684C\u5BA0">\u2212</button><input type="range" aria-label="${copy.size}" min="${PET_SIZE.min}" max="${PET_SIZE.max}" step="1"><button type="button" data-size-step="1" aria-label="\u653E\u5927\u684C\u5BA0">\uFF0B</button></div><div class="cb-size-scale"><span>\u5C0F\u5DE7</span><span>\u9192\u76EE</span></div>`;
  const sizeRange = petSizing.querySelector("input");
  let sizeDraft = null, sizeQueued = null, sizeSaving = false, sizeTimer;
  function syncSizeControls() {
    if (!state || !alive) return;
    const size = sizeDraft ?? state.pet.size;
    if (Number(sizeRange.value) !== size) sizeRange.value = String(size);
    sizeRange.setAttribute("aria-valuetext", `${size} \u50CF\u7D20`);
    petSizing.querySelector("output").textContent = `${size}px`;
    petSizing.querySelector('[data-size-step="-1"]').disabled = size <= PET_SIZE.min;
    petSizing.querySelector('[data-size-step="1"]').disabled = size >= PET_SIZE.max;
  }
  async function flushSize() {
    clearTimeout(sizeTimer);
    sizeTimer = void 0;
    if (sizeSaving || sizeQueued === null || !alive) return;
    const value = sizeQueued;
    sizeQueued = null;
    if (value === state.pet.size) {
      sizeDraft = null;
      syncSizeControls();
      return;
    }
    sizeSaving = true;
    await update({ pet: { size: value } });
    sizeSaving = false;
    if (!alive) return;
    if (sizeQueued !== null) void flushSize();
    else {
      sizeDraft = null;
      syncSizeControls();
    }
  }
  function changeSize(value, immediate = false) {
    sizeDraft = Math.max(PET_SIZE.min, Math.min(PET_SIZE.max, Math.round(value)));
    sizeQueued = sizeDraft;
    syncSizeControls();
    if (immediate) void flushSize();
    else if (!sizeTimer && !sizeSaving) sizeTimer = setTimeout(() => {
      void flushSize();
    }, 70);
  }
  sizeRange.oninput = () => changeSize(Number(sizeRange.value));
  sizeRange.onchange = () => changeSize(Number(sizeRange.value), true);
  petSizing.querySelectorAll("[data-size-step]").forEach((button) => {
    button.onclick = () => changeSize((sizeDraft ?? state.pet.size) + Number(button.dataset.sizeStep) * PET_SIZE.step, true);
  });
  const overlays = /* @__PURE__ */ new Set();
  const asset = (path) => assetResolver ? assetResolver(path) : assetBase + path.replace(/^assets\//, "");
  const image = (path, alt, cls = "") => `<img class="${cls}" data-asset-path="${escape(path)}" alt="${escape(alt)}" draggable="false">`;
  const hydrateImages = (container) => {
    container.querySelectorAll("img[data-asset-path]").forEach((img) => {
      const unclipFallback = () => img.closest(".cb-sprite-preview")?.classList.add("cb-sprite-fallback");
      const load = (path) => Promise.resolve().then(() => asset(path)).then((url) => {
        if (alive && img.isConnected) {
          if (typeof url !== "string" || !url) unclipFallback();
          img.src = typeof url === "string" && url ? url : fallbackData;
        }
      }).catch(() => {
        if (alive && img.isConnected) {
          unclipFallback();
          img.src = fallbackData;
        }
      });
      img.onerror = () => {
        if (!alive || !img.isConnected) return;
        unclipFallback();
        if (!img.dataset.fallback) {
          img.dataset.fallback = "true";
          void load("assets/whale.svg");
        } else {
          img.onerror = null;
          img.src = fallbackData;
        }
      };
      void load(img.dataset.assetPath);
    });
  };
  const update = async (patch) => {
    busy = true;
    message = copy.saving;
    render();
    try {
      state = await api.update(patch);
      message = copy.saved;
    } catch (error) {
      message = error.message;
    }
    busy = false;
    if (alive) render();
  };
  const preview = (t) => {
    if (api.preview && !t.custom) {
      void api.preview(t.id).catch((error) => {
        message = error.message;
        render();
      });
      return;
    }
    let video;
    const modal = createModal({ title: `${t.name}\u9884\u89C8`, className: "cb-splash-modal", onClose: () => {
      if (video) {
        video.onerror = null;
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
      overlays.delete(modal.close);
    } });
    overlays.add(modal.close);
    if (t.mediaType === "video") {
      modal.dialog.classList.add("cb-video-preview");
      modal.dialog.innerHTML = `<video playsinline controls aria-label="${escape(t.name)}"></video><p role="alert" hidden>\u89C6\u9891\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u672C\u5730\u7D20\u6750\u3002</p><button>${copy.close}</button>`;
      video = modal.dialog.querySelector("video");
      video.muted = false;
      video.volume = 1;
      const fail = () => {
        if (!video.isConnected) return;
        video.onerror = null;
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.hidden = true;
        modal.dialog.querySelector('[role="alert"]').hidden = false;
      };
      video.onerror = fail;
      modal.dialog.querySelector("button").onclick = modal.close;
      modal.dialog.querySelector("button").focus();
      Promise.all([asset(t.asset), asset(t.preview)]).then(([src, poster]) => {
        if (!alive || !video.isConnected) return;
        video.poster = poster;
        video.src = src;
        if (!matchMedia("(prefers-reduced-motion: reduce)").matches) void video.play().catch(() => {
        });
      }).catch(fail);
      return;
    }
    modal.dialog.classList.add("cb-preview", "scene-" + t.scene);
    if (t.custom) modal.dialog.classList.add("cb-custom-splash");
    if (t.background) modal.dialog.style.background = t.background;
    modal.dialog.innerHTML = `<div class="scene-orbs"><i></i><i></i><i></i></div>${image(t.asset, t.name, "scene-art")}<h3>${escape(t.name)}</h3><button>${copy.close}</button>`;
    modal.dialog.querySelector("button").onclick = modal.close;
    modal.dialog.querySelector("button").focus();
    hydrateImages(modal.dialog);
  };
  function render() {
    if (!state || !alive) return;
    const catalogs = { theme: catalogFor(state, "theme"), splash: catalogFor(state, "splash"), pet: catalogFor(state, "pet") };
    const list = catalogs[tab], id = tab === "pet" ? state.pet.id : state[tab];
    const current = tab === "theme" ? label(catalogs.theme, id, copy.default) : tab === "splash" ? label(catalogs.splash, id, copy.splashOff) : label(catalogs.pet, id, pets.find((p) => p.id === defaults.pet.id).name);
    root.className = "cb-toolbox";
    if (headerRegion.parentNode !== root) root.replaceChildren(headerRegion, petSizing, contentRegion);
    petSizing.hidden = tab !== "pet";
    syncSizeControls();
    headerRegion.innerHTML = `<header class="cb-header"><div class="cb-brand">${image("assets/cyberdad-logo.png", "\u8D5B\u535A\u8001\u7238\u54C1\u724C\u6807\u8BC6")}<div><span>CYBER DAD / LOCAL STUDIO</span><p>${copy.title}</p></div></div><span class="cb-save" role="status">${escape(message || copy.saved)}</span><h2>${copy.headline}</h2><p class="cb-subtitle">${copy.subtitle}</p></header>
  <nav class="cb-tabs" role="tablist" aria-label="\u7F8E\u5316\u5206\u7C7B">${Object.entries(
      copy.tabs
    ).filter(([key]) => !petOnly || key === "pet").map(
      ([key, title]) => `<button role="tab" aria-selected="${key === tab}" data-tab="${key}">${title}</button>`
    ).join("")}</nav>
  <div class="cb-section-heading"><div><h3>${copy.titles[tab]}</h3><p>${copy.notes[tab]}</p></div><span class="cb-current">\u5F53\u524D \xB7 ${escape(current)}</span></div>
  ${api.addPreset ? `<div class="cb-library-toolbar"><span>\u5185\u7F6E\u7075\u611F\uFF0C\u4E5F\u88C5\u5F97\u4E0B\u4F60\u7684\u521B\u4F5C</span><button data-add="${tab}"><span aria-hidden="true">\uFF0B</span> \u6DFB\u52A0${copy.tabs[tab]}</button></div>` : ""}
  ${state.warning ? `<div class="cb-notice" role="alert">${escape(state.warning)}</div>` : ""}
  ${!state.enabled ? `<div class="cb-notice">${copy.off}<button data-action="enable">${copy.enable}</button></div>` : ""}`;
    contentRegion.innerHTML = `<div class="cb-cards">${list.map((p) => {
      const selected = p.id === id;
      let visual;
      if (tab === "theme") {
        visual = themePreviewMarkup(p.palette, p.name);
        if (p.wallpaper) visual = `<div class="cb-wallpaper-preview ${p.id === "geek" ? "cb-geek-preview" : ""}">${image(p.wallpaper, p.name)}${visual}${p.id === "geek" ? geekPreviewMarkup() : ""}</div>`;
      } else if (tab === "splash") {
        visual = `<div class="cb-art scene-${escape(p.scene)}" ${p.background ? `style="background:${escape(p.background)}"` : ""}><div class="scene-orbs"><i></i><i></i><i></i></div>${image(p.mediaType === "video" ? p.preview : p.asset, p.name, "scene-art")}</div>`;
      } else
        visual = `<div class="cb-art cb-pet-art">${p.sprite ? `<div class="cb-sprite-preview">${image(p.asset, p.name)}</div>` : image(p.asset, p.name)}</div>`;
      return `<article class="cb-card ${selected ? "is-selected" : ""}" data-preset="${escape(p.id)}">${visual}<div class="cb-card-content"><div class="cb-card-title"><h4>${escape(p.name)}</h4>${selected ? '<span class="cb-check">\u2713</span>' : ""}</div><p>${escape(p.caption || (p.custom ? "\u6211\u7684\u9884\u8BBE \xB7 \u672C\u673A\u4FDD\u5B58" : ""))}</p><div class="cb-card-actions">${tab === "splash" ? `<button data-preview="${escape(p.id)}" class="cb-secondary">${copy.preview}</button>` : ""}<button data-apply="${escape(p.id)}" aria-label="\u5E94\u7528${escape(p.name)}" ${busy ? "disabled" : ""} class="${selected ? "cb-selected" : "cb-primary"}">${selected ? copy.selected : copy.apply}</button></div>
      ${p.custom && api.removePreset || tab === "theme" ? `<div class="cb-card-tools">${tab === "theme" ? `<button data-export="${escape(p.id)}" aria-label="\u5BFC\u51FA${escape(p.name)}\u914D\u8272">\u5BFC\u51FA\u914D\u8272</button>` : "<span>\u6211\u7684\u9884\u8BBE</span>"}${p.custom && api.removePreset ? `<button data-delete="${escape(p.id)}" aria-label="\u5220\u9664${escape(p.name)}">\u5220\u9664</button>` : ""}</div>` : ""}
      ${pendingDelete === p.id ? `<div class="cb-delete-confirm" role="group" aria-label="\u786E\u8BA4\u5220\u9664${escape(p.name)}"><span>${selected ? "\u5220\u9664\u540E\uFF0C\u6B64\u9879\u5C06\u6062\u590D\u9ED8\u8BA4\u3002" : "\u5220\u9664\u8FD9\u4EFD\u672C\u5730\u9884\u8BBE\uFF1F"}</span><div><button data-delete-cancel>\u53D6\u6D88</button><button data-delete-confirm="${escape(p.id)}" ${busy ? "disabled" : ""}>\u786E\u8BA4\u5220\u9664</button></div></div>` : ""}</div></article>`;
    }).join("")}</div>
  <div class="cb-controls">${tab === "theme" ? `<button data-action="default">${copy.default}</button>` : tab === "splash" ? `<button data-action="splash-off" aria-pressed="${state.splash === "off"}">${copy.splashOff}</button>` : `<button data-action="pet-toggle" class="cb-primary">${state.pet.enabled ? copy.petOff : copy.petOn}</button><button data-action="pause">${state.pet.paused ? copy.resume : copy.pause}</button><button data-action="sound" aria-pressed="${state.pet.sound}">\u70B9\u51FB\u97F3\u6548\uFF1A${state.pet.sound ? "\u5F00" : "\u5173"}</button><p>\u8F7B\u70B9\u4E92\u52A8\uFF0C\u8FDE\u70B9\u6492\u6B22\u3002\u653E\u7740\u4F1A\u72AF\u56F0\uFF1B\u53F3\u952E\u53EF\u4EE5\u6563\u6B65\u3001\u6253\u76F9\uFF0C\u6216\u9009\u62E9\u4F19\u4F34\u7684\u4E13\u5C5E\u5C0F\u52A8\u4F5C\u3002</p>${!api.desktop ? `<p>${copy.browserPet}</p>` : ""}`}</div>
  <footer class="cb-footer"><div><span>${copy.foot}</span><p>${escape(label(catalogs.splash, state.splash, "\u65E0\u542F\u52A8\u52A8\u753B"))} <em>\xB7</em> ${escape(label(catalogs.theme, state.theme, copy.default))} <em>\xB7</em> ${escape(state.pet.enabled ? label(catalogs.pet, state.pet.id, "") : "\u684C\u5BA0\u5DF2\u9690\u85CF")}</p></div><div><button data-action="reset">${copy.reset}</button><button data-action="disable">${state.enabled ? copy.disable : copy.enable}</button></div></footer>`;
    root.querySelectorAll("[data-tab]").forEach(
      (el) => el.onclick = () => {
        tab = el.dataset.tab;
        pendingDelete = null;
        message = "";
        render();
      }
    );
    root.querySelectorAll("[data-apply]").forEach(
      (el) => el.onclick = () => update(
        tab === "pet" ? { pet: { id: el.dataset.apply } } : { [tab]: el.dataset.apply }
      )
    );
    root.querySelectorAll("[data-preview]").forEach(
      (el) => el.onclick = () => preview(catalogs.splash.find((p) => p.id === el.dataset.preview))
    );
    root.querySelectorAll("[data-add]").forEach((el) => {
      el.onclick = () => {
        const close = openCustomPresetForm({ kind: tab, api, onSaved(value) {
          if (!alive) return;
          state = value;
          message = "\u5DF2\u6DFB\u52A0\uFF0C\u70B9\u51FB\u5361\u7247\u5E94\u7528";
          render();
        }, onClose() {
          overlays.delete(close);
        } });
        overlays.add(close);
      };
    });
    root.querySelectorAll("[data-export]").forEach((el) => el.onclick = () => exportTheme(catalogs.theme.find((p) => p.id === el.dataset.export)));
    root.querySelectorAll("[data-delete]").forEach((el) => el.onclick = () => {
      pendingDelete = el.dataset.delete;
      render();
    });
    root.querySelectorAll("[data-delete-cancel]").forEach((el) => el.onclick = () => {
      pendingDelete = null;
      render();
    });
    root.querySelectorAll("[data-delete-confirm]").forEach((el) => el.onclick = async () => {
      if (busy) return;
      const id2 = el.dataset.deleteConfirm, kind = tab;
      busy = true;
      render();
      try {
        state = await api.removePreset({ kind, id: id2 });
        pendingDelete = null;
        message = "\u5DF2\u5220\u9664\u672C\u5730\u9884\u8BBE";
      } catch (error) {
        message = error.message;
      } finally {
        busy = false;
        if (alive) render();
      }
    });
    root.querySelectorAll("[data-action]").forEach(
      (el) => el.onclick = async () => {
        const action = el.dataset.action;
        if (action === "reset") {
          try {
            state = await api.reset();
            message = copy.saved;
            render();
          } catch (error) {
            message = error.message;
            render();
          }
          return;
        }
        const patches = {
          enable: { enabled: true },
          disable: { enabled: !state.enabled },
          default: { theme: "default" },
          "splash-off": { splash: "off" },
          "pet-toggle": { pet: { enabled: !state.pet.enabled } },
          pause: { pet: { paused: !state.pet.paused } },
          sound: { pet: { sound: !state.pet.sound } }
        };
        await update(patches[action]);
      }
    );
    hydrateImages(root);
  }
  const off = api.onChange((value) => {
    state = value;
    render();
  });
  api.get().then((value) => {
    state = value;
    render();
  }).catch((error) => {
    root.textContent = error.message;
  });
  return () => {
    alive = false;
    clearTimeout(sizeTimer);
    off();
    [...overlays].forEach((close) => close());
    root.replaceChildren();
  };
}

// src/state-sync.mjs
function createStateSync({ request, read, accept }) {
  let generation = 0;
  let readSerial = 0;
  let pending = 0;
  let queue = Promise.resolve();
  return {
    async get() {
      if (pending) return read();
      const version = generation, serial = ++readSerial;
      const current = () => version === generation && serial === readSerial && pending === 0;
      try {
        const value = await request("get", null);
        return current() ? accept(value) : read();
      } catch (error) {
        if (!current()) return read();
        throw error;
      }
    },
    mutate(endpoint, payload) {
      generation++;
      pending++;
      const task = queue.then(() => request(endpoint, payload)).then(accept);
      queue = task.then(() => void 0, () => void 0);
      return task.finally(() => {
        pending--;
      });
    }
  };
}

// src/whalegirl-theme.mjs
var whalegirlTokenOverrides = {
  "--dsw-specific-input-major": "#102236ed",
  "--dsw-specific-bubble": "#173950ed",
  "--dsw-specific-bubble-highlight": "#21485fed",
  "--dsw-specific-sidebar-nav-item-active": "#17415deb",
  "--dsw-specific-sidebar-nav-item-active-accent": "#17415deb",
  "--dsw-alias-button-info-fill": "#24799e",
  "--dsw-alias-button-info-hover": "#3093ba",
  "--dsw-specific-menu": "#101f32fa",
  "--dsw-menu-surface-fill": "#101f32fa",
  "--dsw-menu-backdrop-filter": "blur(18px)",
  "--dsw-elevation-stroke-color": "#47758e80"
};
var whalegirlCss = `
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

// src/geek-theme.mjs
var geekTokenOverrides = {
  "--dsw-specific-input-major": "#0b1b26f5",
  "--dsw-specific-bubble": "#0c354af5",
  "--dsw-specific-bubble-highlight": "#14475ef5",
  "--dsw-specific-sidebar-nav-item-active": "#0c354af2",
  "--dsw-specific-sidebar-nav-item-active-accent": "#0c354af2",
  "--dsw-alias-button-info-fill": "#176887",
  "--dsw-alias-button-info-hover": "#207f9f",
  "--dsw-specific-menu": "#0b1b26fc",
  "--dsw-menu-surface-fill": "#0b1b26fc",
  "--dsw-menu-backdrop-filter": "blur(12px)",
  "--dsw-elevation-stroke-color": "#36d5ff66",
  "--dsw-radius-sm": "4px",
  "--dsw-radius-md": "6px",
  "--dsw-radius-lg": "8px",
  "--dsw-radius-xl": "10px",
  "--dsw-radius-panel": "12px"
  // Success, warning, error and code syntax retain the upstream dark palette.
};
var geekCss = `
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

// src/geek-content-theme.mjs
var geekContentCss = `
html[data-cyber-theme="geek"] [data-slot="main"] .md-code-block {
  --dsl-code-block-background: #06131c;
  --dsl-code-block-banner-background-color: #0d2533;
  --dsl-code-block-border-radius: 6px;
  box-shadow: 0 0 0 1px #36d5ff45, 0 5px 16px #00000026;
}
html[data-cyber-theme="geek"] [data-slot="main"] [data-code-block-banner] {
  font-family: var(--ds-font-family-code);
  box-shadow: inset 0 -1px #36d5ff38, inset 2px 0 #36d5ff85;
}
/* Keep the upstream sticky banner, scrollport, line numbers, wrapping and
   syntax colors intact. In particular, never clip the code block wrapper. */
html[data-cyber-theme="geek"] [data-slot="main"] [data-code-block-content] pre {
  scrollbar-color: #285369 #06131c;
}
html[data-cyber-theme="geek"] [data-slot="main"] [data-terminal] {
  --dsl-terminal-radius: 6px;
  background: #06131c;
  box-shadow: 0 0 0 1px #36d5ff45, 0 5px 16px #00000026;
}
/* Both native containers are already positioned. These 9px marks are purely
   decorative, cannot receive input, and convey no running/error state. */
html[data-cyber-theme="geek"] [data-slot="main"] .md-code-block::after,
html[data-cyber-theme="geek"] [data-slot="main"] [data-terminal]::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 9px;
  height: 1px;
  background: #f75b7266;
  pointer-events: none;
}
html[data-cyber-theme="geek"] [data-slot="main"] [data-tool][data-state] {
  border-radius: 6px;
  background: linear-gradient(100deg, #0b233178, #06131c38);
  box-shadow: inset 2px 0 #36d5ff40;
}
html[data-cyber-theme="geek"] [data-slot="main"] [data-tool] [data-disclosure-row] {
  padding-inline: 8px;
  border-radius: 4px;
}
html[data-cyber-theme="geek"] [data-slot="main"] [data-tool] [data-disclosure-row][data-expandable]:hover {
  background: #36d5ff0d;
}
html[data-cyber-theme="geek"] [data-slot="main"] [data-tool] [data-disclosure-row][data-expandable]:focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color);
  outline-offset: 2px;
}
`;

// src/wallpaper-theme.mjs
var cyberdadTokenOverrides = {
  "--dsw-specific-input-major": "#102339ed",
  "--dsw-specific-bubble": "#164263f2",
  "--dsw-specific-bubble-highlight": "#205477f2",
  "--dsw-specific-sidebar-nav-item-active": "#164263eb",
  "--dsw-specific-sidebar-nav-item-active-accent": "#164263eb",
  "--dsw-alias-button-info-fill": "#246c9e",
  "--dsw-alias-button-info-hover": "#3183ba",
  "--dsw-specific-menu": "#102339fa",
  "--dsw-menu-surface-fill": "#102339fa",
  "--dsw-menu-backdrop-filter": "blur(18px)",
  "--dsw-elevation-stroke-color": "#64b9e16b"
};
var cyberdadCss = `
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
var wallpaperThemes = /* @__PURE__ */ new Map([
  ["whalegirl", whalegirlTokenOverrides],
  ["cyberdad", cyberdadTokenOverrides],
  ["geek", geekTokenOverrides]
]);
var wallpaperCss = whalegirlCss + "\n" + cyberdadCss + "\n" + geekCss + "\n" + geekContentCss + "\n" + geekHudCss;
var wallpaperTokenOverrides = (id) => wallpaperThemes.get(id) ?? {};
function setWallpaperAppearance(id, doc = document) {
  const root = doc.documentElement;
  if (wallpaperThemes.has(id)) root.setAttribute("data-cyber-theme", id);
  else if (wallpaperThemes.has(root.getAttribute("data-cyber-theme"))) {
    root.removeAttribute("data-cyber-theme");
  }
}

// lib/assets.mjs
var assets = { "assets/cat.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjQwIiBmaWxsPSJub25lIj4KICA8ZyBkYXRhLWNyZWF0dXJlPSJjYXQiPgogICAgPGcgY2xhc3M9InRhaWwgY2F0LXRhaWwiPjxwYXRoIGQ9Ik0xNjcgMTcyYzQ1IDkgNTMtMzggMjctMzgiIHN0cm9rZT0iI2I4OTg3NSIgc3Ryb2tlLXdpZHRoPSIyMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTE2NyAxNzJjNDUgOSA1My0zOCAyNy0zOCIgc3Ryb2tlPSIjZWJkN2I0IiBzdHJva2Utd2lkdGg9IjEzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L2c+CiAgICA8ZyBjbGFzcz0iY2F0LWJvZHkiPjxwYXRoIGQ9Ik03MyAxMzFjLTggMTUtMTQgMzgtMTIgNDkgMiAyMyAyNiAyNyA1NyAyNyAyOSAwIDUzLTcgNTMtMjggMC0xNS05LTM4LTE1LTQ4IiBmaWxsPSIjZjNlN2NjIiBzdHJva2U9IiM5YTgwNjciIHN0cm9rZS13aWR0aD0iMy41Ii8+PGVsbGlwc2UgY3g9IjEyMCIgY3k9IjE4MyIgcng9IjI5IiByeT0iMjAiIGZpbGw9IiNmZmY2ZTMiLz48L2c+CiAgICA8ZyBjbGFzcz0iY2F0LWZvb3QtbGVmdCI+PHBhdGggZD0iTTgxIDE5MmMtOCA3LTggMTcgNiAxOGgxMmM5LTEgMTAtOSAzLTE2IiBmaWxsPSIjZmZmMWQ2IiBzdHJva2U9IiNiZGEwODAiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTg3IDIwMnY1bTctNXY1IiBzdHJva2U9IiNkMGI0OTIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9nPgogICAgPGcgY2xhc3M9ImNhdC1mb290LXJpZ2h0Ij48cGF0aCBkPSJNMTM3IDE5MmMtOCA3LTggMTcgNiAxOGgxMmM5LTEgMTAtOSAzLTE2IiBmaWxsPSIjZmZmMWQ2IiBzdHJva2U9IiNiZGEwODAiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTE0MyAyMDJ2NW03LTV2NSIgc3Ryb2tlPSIjZDBiNDkyIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvZz4KICAgIDxnIGNsYXNzPSJwZXQtaGVhZCBjYXQtaGVhZCI+CiAgICAgIDxwYXRoIGQ9Im02MSA5NC0yLTQ3YzE2IDAgMzAgMTQgMzggMjQgMTQtNCAyNi00IDQwIDAgMTAtMTYgMjMtMjMgMzktMjVsLTIgNDhjOCA5IDEzIDE5IDEzIDMxIDAgMjctMjYgNDItNjcgNDItMzkgMC02Ni0xNC02Ni00MiAwLTEzIDEtMjMgNy0zMVoiIGZpbGw9IiNmZmYxZDYiIHN0cm9rZT0iIzlhODA2NyIgc3Ryb2tlLXdpZHRoPSIzLjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICAgICAgPHBhdGggY2xhc3M9ImNhdC1lYXJzIiBkPSJtNjggNjIgMSAyNSAxNi04bTc2LTE3LTEgMjUtMTUtNyIgZmlsbD0iI2U2YjdhYSIvPjxwYXRoIGQ9Im0xMDggNzUgMyAxNG0xNC0xNSAxIDE0IiBzdHJva2U9IiNkNWI3ODgiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgICAgIDxnIGNsYXNzPSJleWVzIiBmaWxsPSIjNjA1MzQ0Ij48ZWxsaXBzZSBjeD0iODkiIGN5PSIxMTkiIHJ4PSI0LjUiIHJ5PSI2LjUiLz48ZWxsaXBzZSBjeD0iMTQ5IiBjeT0iMTE5IiByeD0iNC41IiByeT0iNi41Ii8+PC9nPgogICAgICA8ZyBjbGFzcz0ic2xlZXAtZXllcyIgc3R5bGU9ImRpc3BsYXk6bm9uZSIgc3Ryb2tlPSIjNjA1MzQ0IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PHBhdGggZD0iTTgxIDExOXE4IDYgMTYgMCIvPjxwYXRoIGQ9Ik0xNDEgMTE5cTggNiAxNiAwIi8+PC9nPgogICAgICA8cGF0aCBkPSJtMTE0IDEzMiA2IDUgNi01IiBmaWxsPSIjYzk4ZjhkIi8+PHBhdGggY2xhc3M9Im1vdXRoLW5vcm1hbCIgZD0iTTEyMCAxMzdxLTQgOC0xMSAybTExLTJxNCA4IDExIDIiIHN0cm9rZT0iIzhjNzQ2MCIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxlbGxpcHNlIGNsYXNzPSJtb3V0aC15YXduIiBzdHlsZT0iZGlzcGxheTpub25lIiBjeD0iMTIwIiBjeT0iMTQzIiByeD0iNiIgcnk9IjkiIGZpbGw9IiNhOTc4NzMiLz4KICAgICAgPHBhdGggZD0ibTY2IDEzMSAxMiAybS0xMyA2IDEzLTFtODUtNSAxMy0ybS0xMiA3IDEzIDIiIHN0cm9rZT0iI2JkYTA4MCIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogICAgICA8ZWxsaXBzZSBjeD0iODIiIGN5PSIxMzQiIHJ4PSI4IiByeT0iNCIgZmlsbD0iI2VmYmRhYyIgb3BhY2l0eT0iLjY1Ii8+PGVsbGlwc2UgY3g9IjE1NyIgY3k9IjEzNCIgcng9IjgiIHJ5PSI0IiBmaWxsPSIjZWZiZGFjIiBvcGFjaXR5PSIuNjUiLz4KICAgIDwvZz4KICAgIDwhLS0gU2VwYXJhdGUgZm9yZWxlZ3Mgc3RheSB2aXNpYmxlIGFib3ZlIHRoZSBiZWxseTsgaGluZCBmZWV0IHJlbWFpbiBiZWxvdy4gLS0+CiAgICA8ZyBjbGFzcz0iY2F0LXBhdyBjYXQtcGF3LWxlZnQiPjxwYXRoIGQ9Ik04OCAxNjZjLTktMS0xMiA3LTkgMTZsMyA3YzYgNyAxMiA2IDE3IDAgMy00IDItOCAwLTEzbC0yLTVjLTItNC01LTUtOS01WiIgZmlsbD0iI2ZmZjFkNiIgc3Ryb2tlPSIjYmRhMDgwIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJtODYgMTg0IDEgNW01LTYgMSA1IiBzdHJva2U9IiNkMGI0OTIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9nPgogICAgPGcgY2xhc3M9ImNhdC1wYXcgY2F0LXBhdy1yaWdodCI+PHBhdGggZD0iTTE1MiAxNjZjOS0xIDEyIDcgOSAxNmwtMyA3Yy02IDctMTIgNi0xNyAwLTMtNC0yLTggMC0xM2wyLTVjMi00IDUtNSA5LTVaIiBmaWxsPSIjZmZmMWQ2IiBzdHJva2U9IiNiZGEwODAiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Im0xNTQgMTg0LTEgNW0tNS02LTEgNSIgc3Ryb2tlPSIjZDBiNDkyIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvZz4KICA8L2c+Cjwvc3ZnPgo=", "assets/leaves.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjQwIj48cGF0aCBkPSJNMTE5IDE5NlY5NCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNmU5NzczIiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMTkgMTQwQzcyIDE0MiA1MyAxMDggNTQgNzNjNDMgMCA2OSAyNCA2NSA2N1oiIGZpbGw9IiNhZGNkYTAiLz48cGF0aCBkPSJNMTIwIDEyMGMtMy01MCAzMC02OSA2My02NiAzIDQyLTIzIDY5LTYzIDY2WiIgZmlsbD0iIzc5YWQ4MyIvPjxwYXRoIGQ9Ik0xMjAgMTcxYzI5LTMwIDUyLTI1IDY4LTEzLTIwIDI4LTQzIDMwLTY4IDEzWiIgZmlsbD0iI2I3ZDVhNyIvPjxwYXRoIGQ9Im03OCAxMDAgNDAgNDBtMi0yMSA0MS00MyIgc3Ryb2tlPSIjZWVmNGRkIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPgo=", "assets/robot.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjQwIiBmaWxsPSJub25lIj4KICA8ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InJvYm90LWJvZHkiIHgxPSI2NiIgeTE9IjgwIiB4Mj0iMTgwIiB5Mj0iMTgwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iI2ZmZiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2JlZGVmMiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPgogIDxnIGRhdGEtY3JlYXR1cmU9InJvYm90Ij4KICAgIDxnIGNsYXNzPSJyb2JvdC1sZWdzIiBzdHJva2U9IiM0ZTcwOTIiIHN0cm9rZS13aWR0aD0iMTIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PGcgY2xhc3M9InJvYm90LWxlZy1sZWZ0Ij48cGF0aCBkPSJNOTEgMTk1djEzIi8+PHBhdGggZD0iTTg3IDIwOWg5IiBzdHJva2Utd2lkdGg9IjEwIi8+PC9nPjxnIGNsYXNzPSJyb2JvdC1sZWctcmlnaHQiPjxwYXRoIGQ9Ik0xNDkgMTk1djEzIi8+PHBhdGggZD0iTTE0NSAyMDloOSIgc3Ryb2tlLXdpZHRoPSIxMCIvPjwvZz48L2c+CiAgICA8ZyBjbGFzcz0icm9ib3QtYXJtLWxlZnQiPjxwYXRoIGQ9Im03NCAxNTctMTYgMTUiIHN0cm9rZT0iIzY5OGZiMiIgc3Ryb2tlLXdpZHRoPSIxMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iNTciIGN5PSIxNzQiIHI9IjciIGZpbGw9IiNjY2U3ZjciIHN0cm9rZT0iIzY5OGZiMiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPgogICAgPGcgY2xhc3M9InJvYm90LWFybS1yaWdodCI+PHBhdGggZD0ibTE2OCAxNTcgMjAtMTIiIHN0cm9rZT0iIzY5OGZiMiIgc3Ryb2tlLXdpZHRoPSIxMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0ibTE4NyAxNDUgNS05bS0zIDEwIDgtNCIgc3Ryb2tlPSIjNjk4ZmIyIiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjE4OCIgY3k9IjE0NiIgcj0iNyIgZmlsbD0iI2NjZTdmNyIgc3Ryb2tlPSIjNjk4ZmIyIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+CiAgICA8cmVjdCBjbGFzcz0icm9ib3QtYm9keSIgeD0iNzYiIHk9IjEzOSIgd2lkdGg9Ijg4IiBoZWlnaHQ9IjU3IiByeD0iMjIiIGZpbGw9InVybCgjcm9ib3QtYm9keSkiIHN0cm9rZT0iIzRlNzA5MiIgc3Ryb2tlLXdpZHRoPSIzLjUiLz4KICAgIDxyZWN0IHg9IjEwNCIgeT0iMTY0IiB3aWR0aD0iMzEiIGhlaWdodD0iMTQiIHJ4PSI3IiBmaWxsPSIjNGU5M2NlIi8+PGNpcmNsZSBjbGFzcz0icm9ib3Qtc3RhdHVzIiBjeD0iMTI0IiBjeT0iMTcxIiByPSIzIiBmaWxsPSIjYjZlZGZmIi8+CiAgICA8ZyBjbGFzcz0icGV0LWhlYWQgcm9ib3QtaGVhZCI+CiAgICAgIDxwYXRoIGQ9Ik0xMTcgNTFWMzUiIHN0cm9rZT0iIzRlNzA5MiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PGNpcmNsZSBjbGFzcz0iYW50ZW5uYS1saWdodCIgY3g9IjExNyIgY3k9IjI4IiByPSI5IiBmaWxsPSIjODVkM2Y1IiBzdHJva2U9IiM0ZTcwOTIiIHN0cm9rZS13aWR0aD0iMyIvPjxjaXJjbGUgY3g9IjExNCIgY3k9IjI1IiByPSIyLjUiIGZpbGw9IiNlY2ZiZmYiLz4KICAgICAgPHJlY3QgeD0iNDIiIHk9IjgwIiB3aWR0aD0iMTQiIGhlaWdodD0iMzgiIHJ4PSI3IiBmaWxsPSIjN2NiN2RmIiBzdHJva2U9IiM0ZTcwOTIiIHN0cm9rZS13aWR0aD0iMyIvPjxyZWN0IHg9IjE4NCIgeT0iODAiIHdpZHRoPSIxNCIgaGVpZ2h0PSIzOCIgcng9IjciIGZpbGw9IiM3Y2I3ZGYiIHN0cm9rZT0iIzRlNzA5MiIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgICAgIDxyZWN0IHg9IjUzIiB5PSI1MSIgd2lkdGg9IjEzNCIgaGVpZ2h0PSIxMDEiIHJ4PSIzNCIgZmlsbD0idXJsKCNyb2JvdC1ib2R5KSIgc3Ryb2tlPSIjNGU3MDkyIiBzdHJva2Utd2lkdGg9IjMuNSIvPgogICAgICA8cGF0aCBkPSJNNjkgNzNxOC0xMSAyMi0xMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgICAgPHJlY3QgeD0iNjUiIHk9IjgzIiB3aWR0aD0iNDYiIGhlaWdodD0iMzMiIHJ4PSIxMyIgZmlsbD0iI2VkZjlmZiIgc3Ryb2tlPSIjMzQ1MzcwIiBzdHJva2Utd2lkdGg9IjQiLz48cmVjdCB4PSIxMjgiIHk9IjgzIiB3aWR0aD0iNDYiIGhlaWdodD0iMzMiIHJ4PSIxMyIgZmlsbD0iI2VkZjlmZiIgc3Ryb2tlPSIjMzQ1MzcwIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNMTExIDk4cTgtNiAxNyAwIiBzdHJva2U9IiMzNDUzNzAiIHN0cm9rZS13aWR0aD0iNCIvPgogICAgICA8ZyBjbGFzcz0iZXllcyIgZmlsbD0iIzM0NTM3MCI+PGVsbGlwc2UgY3g9Ijg5IiBjeT0iMTAwIiByeD0iNC41IiByeT0iNiIvPjxlbGxpcHNlIGN4PSIxNTAiIGN5PSIxMDAiIHJ4PSI0LjUiIHJ5PSI2Ii8+PC9nPgogICAgICA8ZyBjbGFzcz0ic2xlZXAtZXllcyIgc3R5bGU9ImRpc3BsYXk6bm9uZSIgc3Ryb2tlPSIjMzQ1MzcwIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PHBhdGggZD0iTTgyIDEwMHE3IDUgMTQgMCIvPjxwYXRoIGQ9Ik0xNDMgMTAwcTcgNSAxNCAwIi8+PC9nPgogICAgICA8cGF0aCBjbGFzcz0ibW91dGgtbm9ybWFsIiBkPSJNMTEwIDEzMHExMCA3IDIwIDAiIHN0cm9rZT0iIzM0NTM3MCIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48ZWxsaXBzZSBjbGFzcz0ibW91dGgteWF3biIgc3R5bGU9ImRpc3BsYXk6bm9uZSIgY3g9IjEyMCIgY3k9IjEzMSIgcng9IjUiIHJ5PSI3IiBmaWxsPSIjNTY3YTk5Ii8+CiAgICAgIDxlbGxpcHNlIGN4PSI3NyIgY3k9IjEyNCIgcng9IjgiIHJ5PSI0IiBmaWxsPSIjZjBiYmM4Ii8+PGVsbGlwc2UgY3g9IjE2MyIgY3k9IjEyNCIgcng9IjgiIHJ5PSI0IiBmaWxsPSIjZjBiYmM4Ii8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K", "assets/splash-forest.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMjIwIj48cmVjdCB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIyMCIgcng9IjE4IiBmaWxsPSIjZWRmM2UyIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODUgMTApIHNjYWxlKC44MykiPjxwYXRoIGQ9Ik0xMTkgMTk2Vjk0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2ZTk3NzMiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTExOSAxNDBDNzIgMTQyIDUzIDEwOCA1NCA3M2M0MyAwIDY5IDI0IDY1IDY3WiIgZmlsbD0iI2FkY2RhMCIvPjxwYXRoIGQ9Ik0xMjAgMTIwYy0zLTUwIDMwLTY5IDYzLTY2IDMgNDItMjMgNjktNjMgNjZaIiBmaWxsPSIjNzlhZDgzIi8+PHBhdGggZD0iTTEyMCAxNzFjMjktMzAgNTItMjUgNjgtMTMtMjAgMjgtNDMgMzAtNjggMTNaIiBmaWxsPSIjYjdkNWE3Ii8+PHBhdGggZD0ibTc4IDEwMCA0MCA0MG0yLTIxIDQxLTQzIiBzdHJva2U9IiNlZWY0ZGQiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9nPjwvc3ZnPgo=", "assets/splash-stars.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMjIwIj48cmVjdCB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIyMCIgcng9IjE4IiBmaWxsPSIjZWNlOWZhIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODUgMTApIHNjYWxlKC44MykiPjxnIGZpbGw9IiM4YThlZGEiPjxwYXRoIGQ9Im0xMjAgNjUgOSA0MiA0MiAxMy00MiA5LTkgNDItMTMtNDItNDItOSA0Mi0xM1oiLz48cGF0aCBkPSJtNjIgMzUgNCAxOCAxOCA1LTE4IDQtNCAxOC01LTE4LTE4LTQgMTgtNVptMTE1IDEzNyA0IDE4IDE4IDUtMTggNC00IDE4LTUtMTgtMTgtNCAxOC01WiIvPjwvZz48ZyBmaWxsPSIjYjhiYWYwIj48Y2lyY2xlIGN4PSIxODUiIGN5PSI2MiIgcj0iNCIvPjxjaXJjbGUgY3g9IjQ5IiBjeT0iMTYxIiByPSI0Ii8+PGNpcmNsZSBjeD0iMTU3IiBjeT0iNDAiIHI9IjMiLz48Y2lyY2xlIGN4PSI5OSIgY3k9IjE5NiIgcj0iMyIvPjwvZz48L2c+PC9zdmc+Cg==", "assets/splash-whale.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMjIwIj48cmVjdCB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIyMCIgcng9IjE4IiBmaWxsPSIjZThmNWZmIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODUgMTApIHNjYWxlKC44MykiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0id2hhbGUtYm9keSIgeDE9IjcyIiB5MT0iNjMiIHgyPSIxNDMiIHkyPSIxODQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjOWRkZmZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNTA5NWRmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PGcgZGF0YS1jcmVhdHVyZT0id2hhbGUiPjxwYXRoIGQ9Ik0xNzcgMTIyYzIzLTQgMjUtMjMgMjItMzkgMTggNyAyOCAyOSAxNSA0OC03IDExLTIwIDE4LTM0IDE4IiBmaWxsPSIjNmFhZmU5IiBzdHJva2U9IiMzMTZiOWYiIHN0cm9rZS13aWR0aD0iMy41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTQwIDEyNGMwLTM0IDI1LTYxIDY3LTYxIDQwIDAgNzYgMjYgNzYgNjUgMCA0My0zNiA2MS03NSA2MS00MCAwLTY4LTIzLTY4LTY1WiIgZmlsbD0idXJsKCN3aGFsZS1ib2R5KSIgc3Ryb2tlPSIjMzE2YjlmIiBzdHJva2Utd2lkdGg9IjMuNSIvPjxwYXRoIGQ9Ik00NSAxNDVjMjYgMjMgODEgMjggMTI2IDAtOCAyNy0zMiAzOS02MiAzOS0zMSAwLTU0LTEzLTY0LTM5WiIgZmlsbD0iI2RiZjVmZiIvPjxwYXRoIGQ9Ik0xMTkgMTQ4YzQgMTggMTggMjUgMzQgMTgiIGZpbGw9IiM3MWI3ZWMiIHN0cm9rZT0iIzMxNmI5ZiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48ZyBjbGFzcz0iZXllcyI+PGVsbGlwc2UgY3g9IjcyIiBjeT0iMTIyIiByeD0iNSIgcnk9IjciIGZpbGw9IiMyNDQ5NjYiLz48Y2lyY2xlIGN4PSI3MyIgY3k9IjEyMCIgcj0iMS42IiBmaWxsPSJ3aGl0ZSIvPjwvZz48ZWxsaXBzZSBjeD0iNjIiIGN5PSIxMzciIHJ4PSIxMCIgcnk9IjUiIGZpbGw9IiNmMWI5YzUiIG9wYWNpdHk9Ii44Ii8+PHBhdGggZD0iTTg0IDEzOXE5IDcgMTctMiIgc3Ryb2tlPSIjMzE2YjlmIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMTEgNTlxLTE2LTgtMTUtMjBtMTUgMjBxMS0yOCAxMy0yNyIgc3Ryb2tlPSIjNzVjN2YxIiBzdHJva2Utd2lkdGg9IjciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjkxIiBjeT0iMjgiIHI9IjUiIGZpbGw9IiNhNWUyZmEiLz48Y2lyY2xlIGN4PSIxMzYiIGN5PSI0MCIgcj0iNCIgZmlsbD0iI2E1ZTJmYSIvPjxwYXRoIGQ9Ik02MiA5OXExMC0xNyAyOC0yMSIgc3Ryb2tlPSIjZGZmN2ZmIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgb3BhY2l0eT0iLjgiLz48L2c+PC9nPjwvc3ZnPgo=", "assets/stars.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjQwIj48ZyBmaWxsPSIjOGE4ZWRhIj48cGF0aCBkPSJtMTIwIDY1IDkgNDIgNDIgMTMtNDIgOS05IDQyLTEzLTQyLTQyLTkgNDItMTNaIi8+PHBhdGggZD0ibTYyIDM1IDQgMTggMTggNS0xOCA0LTQgMTgtNS0xOC0xOC00IDE4LTVabTExNSAxMzcgNCAxOCAxOCA1LTE4IDQtNCAxOC01LTE4LTE4LTQgMTgtNVoiLz48L2c+PGcgZmlsbD0iI2I4YmFmMCI+PGNpcmNsZSBjeD0iMTg1IiBjeT0iNjIiIHI9IjQiLz48Y2lyY2xlIGN4PSI0OSIgY3k9IjE2MSIgcj0iNCIvPjxjaXJjbGUgY3g9IjE1NyIgY3k9IjQwIiByPSIzIi8+PGNpcmNsZSBjeD0iOTkiIGN5PSIxOTYiIHI9IjMiLz48L2c+PC9zdmc+Cg==", "assets/theme-forest.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMjIwIj48cmVjdCB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIyMCIgcng9IjE4IiBmaWxsPSIjZmFmOWYxIi8+PHBhdGggZD0iTTE4IDBoNzV2MjIwSDE4QTE4IDE4IDAgMCAxIDAgMjAyVjE4QTE4IDE4IDAgMCAxIDE4IDBaIiBmaWxsPSIjZWRmMWUzIi8+PHJlY3QgeD0iMTUiIHk9IjUwIiB3aWR0aD0iNjMiIGhlaWdodD0iMjUiIHJ4PSI3IiBmaWxsPSIjZGFlOGNhIi8+PHBhdGggZD0iTTIwIDI5aDQybS00MiA2MmgzNW0tMzUgMjJoNDRtNDctNzdoMTExIiBzdHJva2U9IiMzZTc1NTUiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIuNSIvPjxyZWN0IHg9IjE4OCIgeT0iNjQiIHdpZHRoPSIxNDUiIGhlaWdodD0iMzIiIHJ4PSIxMiIgZmlsbD0iI2RhZThjYSIvPjxyZWN0IHg9IjEyMCIgeT0iMTEzIiB3aWR0aD0iMTYzIiBoZWlnaHQ9IjQ0IiByeD0iOSIgZmlsbD0iI2VkZjFlMyIvPjxyZWN0IHg9IjEyMCIgeT0iMTc3IiB3aWR0aD0iMjEzIiBoZWlnaHQ9IjI3IiByeD0iOSIgc3Ryb2tlPSIjM2U3NTU1IiBmaWxsPSIjZmFmOWYxIiBvcGFjaXR5PSIuNyIvPjwvc3ZnPgo=", "assets/theme-ice.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMjIwIj48cmVjdCB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIyMCIgcng9IjE4IiBmaWxsPSIjZjVmYWZmIi8+PHBhdGggZD0iTTE4IDBoNzV2MjIwSDE4QTE4IDE4IDAgMCAxIDAgMjAyVjE4QTE4IDE4IDAgMCAxIDE4IDBaIiBmaWxsPSIjZWFmM2ZiIi8+PHJlY3QgeD0iMTUiIHk9IjUwIiB3aWR0aD0iNjMiIGhlaWdodD0iMjUiIHJ4PSI3IiBmaWxsPSIjZDhlYWZmIi8+PHBhdGggZD0iTTIwIDI5aDQybS00MiA2MmgzNW0tMzUgMjJoNDRtNDctNzdoMTExIiBzdHJva2U9IiMyODY4YmQiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIuNSIvPjxyZWN0IHg9IjE4OCIgeT0iNjQiIHdpZHRoPSIxNDUiIGhlaWdodD0iMzIiIHJ4PSIxMiIgZmlsbD0iI2Q4ZWFmZiIvPjxyZWN0IHg9IjEyMCIgeT0iMTEzIiB3aWR0aD0iMTYzIiBoZWlnaHQ9IjQ0IiByeD0iOSIgZmlsbD0iI2VhZjNmYiIvPjxyZWN0IHg9IjEyMCIgeT0iMTc3IiB3aWR0aD0iMjEzIiBoZWlnaHQ9IjI3IiByeD0iOSIgc3Ryb2tlPSIjMjg2OGJkIiBmaWxsPSIjZjVmYWZmIiBvcGFjaXR5PSIuNyIvPjwvc3ZnPgo=", "assets/theme-night.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMjIwIj48cmVjdCB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIyMCIgcng9IjE4IiBmaWxsPSIjMTQxZDMyIi8+PHBhdGggZD0iTTE4IDBoNzV2MjIwSDE4QTE4IDE4IDAgMCAxIDAgMjAyVjE4QTE4IDE4IDAgMCAxIDE4IDBaIiBmaWxsPSIjMTcyMjM4Ii8+PHJlY3QgeD0iMTUiIHk9IjUwIiB3aWR0aD0iNjMiIGhlaWdodD0iMjUiIHJ4PSI3IiBmaWxsPSIjMzQ0NjY4Ii8+PHBhdGggZD0iTTIwIDI5aDQybS00MiA2MmgzNW0tMzUgMjJoNDRtNDctNzdoMTExIiBzdHJva2U9IiNhOWJjZmYiIHN0cm9rZS13aWR0aD0iNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIuNSIvPjxyZWN0IHg9IjE4OCIgeT0iNjQiIHdpZHRoPSIxNDUiIGhlaWdodD0iMzIiIHJ4PSIxMiIgZmlsbD0iIzM0NDY2OCIvPjxyZWN0IHg9IjEyMCIgeT0iMTEzIiB3aWR0aD0iMTYzIiBoZWlnaHQ9IjQ0IiByeD0iOSIgZmlsbD0iIzE3MjIzOCIvPjxyZWN0IHg9IjEyMCIgeT0iMTc3IiB3aWR0aD0iMjEzIiBoZWlnaHQ9IjI3IiByeD0iOSIgc3Ryb2tlPSIjYTliY2ZmIiBmaWxsPSIjMTQxZDMyIiBvcGFjaXR5PSIuNyIvPjwvc3ZnPgo=", "assets/whale.svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjQwIiBmaWxsPSJub25lIj4KICA8ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9IndoYWxlLWJvZHkiIHgxPSI3MiIgeTE9IjYzIiB4Mj0iMTQzIiB5Mj0iMTg0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzlkZGZmZiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzUwOTVkZiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPgogIDxnIGRhdGEtY3JlYXR1cmU9IndoYWxlIj4KICAgIDxnIGNsYXNzPSJ0YWlsIHdoYWxlLXRhaWwiPjxwYXRoIGQ9Ik0xNzcgMTIyYzIzLTQgMjUtMjMgMjItMzkgMTggNyAyOCAyOSAxNSA0OC03IDExLTIwIDE4LTM0IDE4IiBmaWxsPSIjNmFhZmU5IiBzdHJva2U9IiMzMTZiOWYiIHN0cm9rZS13aWR0aD0iMy41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9nPgogICAgPGcgY2xhc3M9IndoYWxlLWJvZHkiPjxwYXRoIGQ9Ik00MCAxMjRjMC0zNCAyNS02MSA2Ny02MSA0MCAwIDc2IDI2IDc2IDY1IDAgNDMtMzYgNjEtNzUgNjEtNDAgMC02OC0yMy02OC02NVoiIGZpbGw9InVybCgjd2hhbGUtYm9keSkiIHN0cm9rZT0iIzMxNmI5ZiIgc3Ryb2tlLXdpZHRoPSIzLjUiLz48cGF0aCBkPSJNNDUgMTQ1YzI2IDIzIDgxIDI4IDEyNiAwLTggMjctMzIgMzktNjIgMzktMzEgMC01NC0xMy02NC0zOVoiIGZpbGw9IiNkYmY1ZmYiLz48cGF0aCBkPSJNNjIgOTlxMTAtMTcgMjgtMjEiIHN0cm9rZT0iI2RmZjdmZiIgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2UtbGluZWNhcD0icm91bmQiIG9wYWNpdHk9Ii44Ii8+PC9nPgogICAgPHBhdGggY2xhc3M9IndoYWxlLWZpbiIgZD0iTTExOSAxNDhjNCAxOCAxOCAyNSAzNCAxOCIgZmlsbD0iIzcxYjdlYyIgc3Ryb2tlPSIjMzE2YjlmIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogICAgPGcgY2xhc3M9ImV5ZXMiPjxlbGxpcHNlIGN4PSI3MiIgY3k9IjEyMiIgcng9IjUiIHJ5PSI3IiBmaWxsPSIjMjQ0OTY2Ii8+PGNpcmNsZSBjeD0iNzMiIGN5PSIxMjAiIHI9IjEuNiIgZmlsbD0id2hpdGUiLz48L2c+CiAgICA8cGF0aCBjbGFzcz0ic2xlZXAtZXllcyIgc3R5bGU9ImRpc3BsYXk6bm9uZSIgZD0iTTY1IDEyM3E3IDUgMTQgMCIgc3Ryb2tlPSIjMjQ0OTY2IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogICAgPGVsbGlwc2UgY3g9IjYyIiBjeT0iMTM3IiByeD0iMTAiIHJ5PSI1IiBmaWxsPSIjZjFiOWM1IiBvcGFjaXR5PSIuOCIvPjxwYXRoIGNsYXNzPSJtb3V0aC1ub3JtYWwiIGQ9Ik04NCAxMzlxOSA3IDE3LTIiIHN0cm9rZT0iIzMxNmI5ZiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48ZWxsaXBzZSBjbGFzcz0ibW91dGgteWF3biIgc3R5bGU9ImRpc3BsYXk6bm9uZSIgY3g9Ijk0IiBjeT0iMTM5IiByeD0iNSIgcnk9IjYiIGZpbGw9IiMzMTZiOWYiLz4KICAgIDxnIGNsYXNzPSJ3aGFsZS1zcG91dCI+PHBhdGggZD0iTTExMSA1OXEtMTYtOC0xNS0yMG0xNSAyMHExLTI4IDEzLTI3IiBzdHJva2U9IiM3NWM3ZjEiIHN0cm9rZS13aWR0aD0iNyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iOTEiIGN5PSIyOCIgcj0iNSIgZmlsbD0iI2E1ZTJmYSIvPjxjaXJjbGUgY3g9IjEzNiIgY3k9IjQwIiByPSI0IiBmaWxsPSIjYTVlMmZhIi8+PC9nPgogIDwvZz4KPC9zdmc+Cg==" };
var css = '.cb-toolbox {\n  --cb-blue: #346da8;\n  --cb-text: #263e55;\n  --cb-muted: #7a8fa3;\n  font:\n    13px/1.5 -apple-system,\n    BlinkMacSystemFont,\n    "PingFang SC",\n    sans-serif;\n  color: var(--cb-text);\n  background: linear-gradient(155deg, #fff 12%, #f4f9ff 82%, #edf4fc);\n  padding: 26px;\n  border: 1px solid #e2ebf5;\n  border-radius: 22px;\n  position: relative;\n  container-type: inline-size;\n  box-sizing: border-box;\n}\n.cb-toolbox * {\n  box-sizing: border-box;\n}\n.cb-toolbox button {\n  font: inherit;\n  cursor: pointer;\n  transition:\n    background 0.18s,\n    border-color 0.18s,\n    transform 0.18s;\n}\n.cb-toolbox button:disabled {\n  opacity: 0.5;\n  cursor: wait;\n}\n.cb-toolbox button:focus-visible {\n  outline: 2px solid #599ad8;\n  outline-offset: 3px;\n}\n.cb-header {\n  position: relative;\n  padding-bottom: 24px;\n}\n.cb-brand {\n  display: flex;\n  gap: 9px;\n  align-items: center;\n}\n.cb-brand img {\n  width: 48px;\n  height: 48px;\n  flex-shrink: 0;\n  object-fit: contain;\n}\n.cb-brand span {\n  font-size: 8px;\n  letter-spacing: 1.7px;\n  color: #7c97b0;\n}\n.cb-brand p {\n  font-size: 12px;\n  margin: 0;\n  color: #698198;\n}\n.cb-header h2 {\n  font-size: 26px;\n  font-weight: 600;\n  letter-spacing: 1px;\n  margin: 22px 0 7px;\n  color: #243e59;\n}\n.cb-subtitle {\n  color: #7a8fa3;\n  margin: 0;\n}\n.cb-save {\n  position: absolute;\n  right: 0;\n  top: 12px;\n  font-size: 10px;\n  color: #6c8a7b;\n  background: #eff7f3;\n  padding: 5px 9px;\n  border-radius: 20px;\n}\n.cb-tabs {\n  display: flex;\n  gap: 5px;\n  border: 1px solid #e1ebf5;\n  background: #eaf2fa99;\n  border-radius: 13px;\n  padding: 4px;\n  margin-bottom: 26px;\n  width: fit-content;\n}\n.cb-tabs button {\n  border: 0;\n  background: transparent;\n  color: #7790a5;\n  padding: 9px 20px;\n  border-radius: 9px;\n  font-weight: 500;\n}\n.cb-tabs button[aria-selected="true"] {\n  background: #fff;\n  color: #346da8;\n  box-shadow: 0 2px 7px #779bb71a;\n}\n.cb-section-heading {\n  display: flex;\n  gap: 10px;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 16px;\n}\n.cb-section-heading h3 {\n  margin: 0 0 5px;\n  font-weight: 550;\n  font-size: 15px;\n}\n.cb-section-heading p {\n  font-size: 11px;\n  color: #7a8fa3;\n  margin: 0;\n}\n.cb-current {\n  font-size: 10px;\n  color: #6285a4;\n  white-space: nowrap;\n}\n.cb-cards {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 13px;\n}\n.cb-card {\n  border: 1px solid #dee8f2;\n  background: #ffffffad;\n  border-radius: 17px;\n  overflow: hidden;\n  box-shadow: 0 4px 18px #6a8aac06;\n  transition:\n    box-shadow 0.2s,\n    transform 0.2s;\n}\n.cb-card:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 7px 22px #7b9cbb1c;\n}\n.cb-card.is-selected {\n  border-color: #77a8d6;\n  box-shadow: 0 0 0 2px #a8cfed25;\n}\n.cb-card-content {\n  padding: 14px;\n}\n.cb-card-title {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.cb-card h4 {\n  font-size: 13px;\n  margin: 0;\n  font-weight: 600;\n}\n.cb-check {\n  border-radius: 50%;\n  background: #eaf3ff;\n  color: #3c80b9;\n  width: 19px;\n  height: 19px;\n  text-align: center;\n}\n.cb-card p {\n  font-size: 10px;\n  color: #8a9aac;\n  margin: 7px 0 16px;\n  min-height: 30px;\n}\n.cb-card-actions {\n  display: flex;\n  gap: 6px;\n}\n.cb-card-actions button {\n  flex: 1;\n  border-radius: 9px;\n  padding: 6px 10px;\n  border: 1px solid #e1e9f1;\n  font-size: 11px;\n}\n.cb-primary {\n  background: #3f78b2 !important;\n  color: white !important;\n  border: 1px solid #3f78b2 !important;\n}\n.cb-primary:hover {\n  background: #2f649a !important;\n}\n.cb-selected {\n  background: #eef5ff;\n  color: #487bac;\n}\n.cb-secondary {\n  background: #fff;\n  color: #6b8aa4;\n}\n.cb-art {\n  height: 155px;\n  position: relative;\n  display: grid;\n  place-items: center;\n  overflow: hidden;\n}\n.cb-art img {\n  width: 128px;\n  height: 128px;\n  z-index: 1;\n  filter: drop-shadow(0 7px 6px #6a8eac10);\n  object-fit: contain;\n}\n.cb-pet-art {\n  background: radial-gradient(ellipse at 50% 55%, #edf6fe 0%, #f8fbfe 74%);\n}\n.cb-pet-art img {\n  width: 146px;\n  height: 146px;\n  transition: transform 0.3s;\n}\n.cb-card:hover .cb-pet-art img {\n  transform: translateY(-5px) rotate(3deg);\n}\n.cb-theme-preview {\n  height: 155px;\n  display: flex;\n  background: var(--dsw-alias-bg-base);\n  padding: 16px 13px 14px 0;\n  gap: 13px;\n  color: var(--dsw-alias-label-primary);\n}\n.cb-theme-preview aside {\n  width: 28%;\n  background: var(--dsw-specific-sidebar-fill);\n  padding: 15px 7px;\n  margin: -16px 0 -14px;\n}\n.cb-theme-preview aside i,\n.cb-theme-preview aside b {\n  display: block;\n  height: 6px;\n  border-radius: 3px;\n  background: var(--dsw-alias-border-l2);\n  margin-bottom: 11px;\n}\n.cb-theme-preview aside b {\n  background: var(--dsw-specific-sidebar-nav-item-active);\n  height: 15px;\n  margin-left: -3px;\n  margin-right: -3px;\n}\n.cb-theme-preview section {\n  flex: 1;\n  min-width: 0;\n  padding-top: 5px;\n}\n.cb-mini-line {\n  height: 4px;\n  background: var(--dsw-alias-label-secondary);\n  opacity: 0.5;\n  width: 64%;\n  margin-bottom: 14px;\n  border-radius: 3px;\n}\n.cb-mini-bubble {\n  height: 16px;\n  margin: 0 0 11px 20%;\n  border-radius: 6px;\n  background: var(--dsw-specific-bubble);\n}\n.cb-theme-preview code {\n  font:\n    8px ui-monospace,\n    monospace;\n  display: block;\n  background: var(--dsw-alias-markdown-code-block);\n  padding: 9px 6px;\n  border-radius: 6px;\n  color: var(--dsw-alias-link);\n  white-space: nowrap;\n  overflow: hidden;\n}\n.cb-mini-input {\n  border: 1px solid var(--dsw-alias-border-l2);\n  margin-top: 15px;\n  border-radius: 7px;\n  background: var(--dsw-specific-input-major);\n  padding: 7px 5px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 4px;\n  font-size: 6px;\n  color: var(--dsw-alias-label-secondary);\n}\n.cb-mini-input b {\n  border-radius: 50%;\n  background: var(--dsw-alias-button-primary-fill);\n  color: var(--dsw-alias-label-primary-inverted);\n  width: 12px;\n  height: 12px;\n  text-align: center;\n  font-size: 9px;\n}\n.cb-controls {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 19px;\n  flex-wrap: wrap;\n}\n.cb-pet-size {\n  padding: 13px 15px 11px;\n  margin: 0 0 18px;\n  border: 1px solid #d5e4f0;\n  border-radius: 14px;\n  background: linear-gradient(120deg, #fff, #edf6ff);\n}\n.cb-pet-size[hidden] { display: none; }\n.cb-size-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; color: #496b89; font-size: 12px; font-weight: 550; }\n.cb-size-heading output { color: #3473a9; font-variant-numeric: tabular-nums; font-size: 13px; }\n.cb-size-adjust { display: flex; align-items: center; gap: 11px; }\n.cb-size-adjust button { flex: 0 0 28px; width: 28px; height: 28px; padding: 0; border: 1px solid #caddec; border-radius: 8px; background: #fff; color: #427da8; font-size: 19px; line-height: 1; }\n.cb-size-adjust button:hover { background: #e7f2fc; }\n.cb-size-adjust button:disabled { cursor: default; opacity: .35; }\n.cb-size-adjust input { flex: 1; min-width: 0; width: 100%; margin: 0; accent-color: #4f8bc2; cursor: pointer; }\n.cb-size-scale { display: flex; justify-content: space-between; margin: 3px 39px 0; color: #8ba0b0; font-size: 9px; }\n.cb-controls button,\n.cb-footer button,\n.cb-notice button,\n.cb-preview button {\n  border: 1px solid #dae6f1;\n  background: #fff9;\n  color: #6b859d;\n  padding: 7px 12px;\n  border-radius: 9px;\n  font-size: 11px;\n}\n.cb-controls button[aria-pressed="true"] {\n  background: #e6eff9;\n}\n.cb-controls label {\n  display: flex;\n  gap: 8px;\n  align-items: center;\n  font-size: 11px;\n  margin-left: auto;\n  color: #718ba3;\n}\n.cb-controls input {\n  width: 90px;\n  accent-color: #4f8bc2;\n}\n.cb-controls output {\n  width: 36px;\n}\n.cb-controls p {\n  font-size: 11px;\n  color: #8d7a61;\n}\n.cb-footer {\n  border-top: 1px solid #e2ebf5;\n  margin-top: 25px;\n  padding-top: 17px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n.cb-footer span {\n  font-size: 9px;\n  color: #98a9b7;\n}\n.cb-footer p {\n  font-size: 10px;\n  margin: 5px 0 0;\n  color: #738b9e;\n}\n.cb-footer em {\n  font-style: normal;\n  margin: 0 5px;\n  color: #bccbd7;\n}\n.cb-footer button {\n  font-size: 10px;\n  border: none;\n  background: transparent;\n  padding: 5px;\n}\n.cb-footer button:hover {\n  color: #3172b0;\n  background: #e8f2fd;\n}\n.cb-notice {\n  border: 1px solid #dce9f4;\n  background: #f0f6fc;\n  color: #7791a6;\n  padding: 10px 14px;\n  border-radius: 12px;\n  margin-bottom: 15px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.cb-preview {\n  position: absolute;\n  inset: 0;\n  border-radius: 22px;\n  z-index: 2;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n}\n.cb-preview .scene-art {\n  width: 210px;\n  height: 210px;\n}\n.cb-preview h3 {\n  font-size: 22px;\n  font-weight: 500;\n}\n.cb-preview button {\n  z-index: 1;\n}\n.cb-preview .scene-orbs {\n  z-index: 0;\n}\n@container (max-width:550px) {\n  .cb-cards {\n    gap: 8px;\n  }\n  .cb-card-content {\n    padding: 10px;\n  }\n  .cb-card p {\n    min-height: 42px;\n  }\n  .cb-save {\n    font-size: 9px;\n  }\n  .cb-section-heading {\n    display: block;\n  }\n  .cb-current {\n    display: block;\n    margin-top: 8px;\n  }\n  .cb-tabs button {\n    padding: 8px 14px;\n  }\n  .cb-controls label {\n    margin-left: 0;\n  }\n  .cb-footer {\n    align-items: flex-start;\n    flex-direction: column;\n  }\n}\n@container (max-width:390px) {\n  .cb-cards {\n    grid-template-columns: 1fr;\n  }\n  .cb-art,\n  .cb-theme-preview {\n    height: 170px;\n  }\n  .cb-card p {\n    min-height: 0;\n  }\n  .cb-header h2 {\n    font-size: 22px;\n  }\n  .cb-save {\n    position: static;\n    display: inline-block;\n    margin-top: 10px;\n  }\n}\n\n.cb-library-toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  margin: -3px 0 18px;\n}\n.cb-library-toolbar > span { color: #7a8fa3; font-size: 11px; }\n.cb-library-toolbar button {\n  background: #fff;\n  border: 1px solid #cbddec;\n  border-radius: 10px;\n  padding: 7px 12px;\n  color: #356b9d;\n  white-space: nowrap;\n}\n.cb-library-toolbar button:hover { background: #edf6ff; }\n.cb-card h4 { overflow-wrap: anywhere; }\n.cb-card-tools { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; min-height: 19px; color: #8498a8; font-size: 10px; }\n.cb-card-tools button { background: transparent; border: 0; padding: 1px 0; color: #6f899d; font-size: 10px; }\n.cb-card-tools button:hover { color: #2868bd; }\n.cb-delete-confirm { margin-top: 9px; padding: 9px; border-radius: 9px; background: #fff5ef; color: #986b51; font-size: 10px; }\n.cb-delete-confirm > div { display: flex; gap: 6px; margin-top: 6px; justify-content: flex-end; }\n.cb-delete-confirm button { background: #fff; border: 1px solid #eedbd0; border-radius: 5px; color: #865c46; font-size: 10px; padding: 3px 6px; }\n\n/* Modals are siblings of the settings root so its live updates cannot erase drafts. */\n.cb-modal {\n  position: fixed;\n  inset: 0;\n  z-index: 1000000;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 24px;\n  background: #243e594d;\n  backdrop-filter: blur(7px);\n  color: #263e55;\n  font: 13px/1.5 -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;\n}\n.cb-modal * { box-sizing: border-box; }\n.cb-modal button,.cb-modal input,.cb-modal select { font: inherit; }\n.cb-modal button { cursor: pointer; }\n.cb-modal button:disabled { opacity: .55; cursor: wait; }\n.cb-modal :is(button,input,select):focus-visible { outline: 2px solid #599ad8; outline-offset: 3px; }\n.cb-modal-dialog {\n  width: min(620px, 100%);\n  max-height: calc(100dvh - 48px);\n  overflow-y: auto;\n  background: linear-gradient(145deg,#fff,#f4f9ff);\n  border: 1px solid #e4edf5;\n  border-radius: 22px;\n  box-shadow: 0 20px 90px #12314930;\n  outline: none;\n}\n.cb-dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 25px 0; }\n.cb-dialog-header span { font-size: 10px; color: #7895ac; letter-spacing: 1px; }\n.cb-dialog-header h3 { font-size: 22px; color: #243e59; font-weight: 600; margin: 4px 0 0; }\n.cb-dialog-header > button { border: 0; width: 30px; height: 30px; border-radius: 50%; color: #738a9e; background: #eaf2f9; font-size: 22px; }\n.cb-custom-form { padding: 20px 25px 24px; }\n.cb-field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 15px; font-size: 12px; color: #577389; }\n.cb-field > input,.cb-field > select {\n  width: 100%;\n  height: 37px;\n  border: 1px solid #d4e2ed;\n  background: #fff;\n  color: #29455c;\n  padding: 7px 10px;\n  border-radius: 9px;\n}\n.cb-field input::placeholder { color: #9baeba; }\n.cb-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }\n.cb-form-preview { overflow: hidden; border-radius: 13px; border: 1px solid #d7e4ef; margin-bottom: 16px; }\n.cb-form-preview .cb-theme-preview { height: 154px; }\n.cb-color-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; margin-bottom: 17px; }\n.cb-color-field { display: flex; align-items: center; gap: 9px; color: #577389; font-size: 11px; padding: 5px 7px; border: 1px solid #dfebf5; border-radius: 8px; background: #ffffffb8; }\n.cb-color-field input[type=color] { width: 26px; height: 26px; padding: 0; border: 0; border-radius: 6px; cursor: pointer; overflow: hidden; background: none; flex: 0 0 auto; }\n.cb-color-field input::-webkit-color-swatch-wrapper { padding: 0; }\n.cb-color-field input::-webkit-color-swatch { border-radius: 6px; border: 1px solid #8daac13d; }\n.cb-color-field output { margin-left: auto; color: #8b9daa; font: 9px ui-monospace, monospace; }\n.cb-background-field { align-self: center; min-height: 38px; margin-top: 10px; }\n.cb-json-tools { display: flex; align-items: center; gap: 10px; }\n.cb-json-tools > button,.cb-file-button { display: inline-flex; align-items: center; justify-content: center; padding: 7px 11px; border: 1px solid #d5e3ee; border-radius: 8px; color: #4c7392; background: #fff; font-size: 11px; cursor: pointer; }\n.cb-file-button { position: relative; overflow: hidden; }\n.cb-file-button input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }\n.cb-file-button:focus-within { outline: 2px solid #599ad8; outline-offset: 2px; }\n.cb-form-hint { font-size: 10px; line-height: 1.6; color: #8498a9; margin: 8px 0 15px; }\n.cb-upload-preview { height: 200px; border: 1px dashed #cbdce9; border-radius: 13px; display: grid; place-items: center; margin-bottom: 12px; overflow: hidden; color: #8aa0b1; font-size: 12px; background: #f1f8fd; }\n.cb-upload-preview img { width: 100%; height: 100%; max-height: 200px; object-fit: contain; }\n.cb-transparent-grid { background: repeating-conic-gradient(#f0f5f9 0% 25%,#fff 0% 50%) 50% / 20px 20px; }\n.cb-form-error { background: #fff1ea; color: #9c583b; border: 1px solid #f0d7c9; border-radius: 9px; padding: 10px 12px; font-size: 12px; margin: 12px 0; }\n.cb-dialog-footer { display: flex; align-items: center; justify-content: flex-end; gap: 9px; padding-top: 14px; border-top: 1px solid #e0eaf2; margin-top: 18px; }\n.cb-dialog-footer > span { margin-right: auto; font-size: 10px; color: #8b9faf; }\n.cb-dialog-footer button { background: #fff; border: 1px solid #d6e3ef; color: #64819a; border-radius: 9px; padding: 8px 12px; font-size: 11px; }\n.cb-splash-modal .cb-preview { position: relative; inset: auto; width: min(640px,100%); height: min(500px,80dvh); overflow: hidden; }\n.cb-splash-modal .cb-preview .scene-art { object-fit: contain; position: relative; z-index: 1; }\n.cb-splash-modal .cb-custom-splash .scene-art { width: 85%; max-width: 85vw; height: 45vh; max-height: 300px; }\n.cb-splash-modal .cb-preview h3 { position: relative; z-index: 1; }\n@media(max-width:520px) {\n  .cb-modal { padding: 12px; }\n  .cb-modal-dialog { max-height: calc(100dvh - 24px); }\n  .cb-dialog-header { padding: 18px 18px 0; }\n  .cb-custom-form { padding: 18px; }\n  .cb-color-grid { grid-template-columns: 1fr; }\n  .cb-dialog-footer { flex-wrap: wrap; }\n  .cb-dialog-footer > span { width: 100%; }\n  .cb-library-toolbar { flex-wrap: wrap; }\n}\n\n.cb-sprite-preview { position:relative; width:150px; height:150px; overflow:hidden; transition:transform .3s; }\n.cb-art .cb-sprite-preview img { position:absolute; left:0; top:0; width:400%; height:200%; max-width:none; max-height:none; animation:none; object-fit:fill; }\n/* Move the clipped cell, never the atlas: rotating it reveals adjacent poses. */\n.cb-card:hover .cb-sprite-preview { transform:translateY(-5px) rotate(3deg); }\n.cb-card:hover .cb-sprite-preview img { transform:none; }\n.cb-art .cb-sprite-preview.cb-sprite-fallback img { width:100%; height:100%; object-fit:contain; }\n.cb-wallpaper-preview { position:relative; overflow:hidden; }\n.cb-wallpaper-preview > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }\n.cb-wallpaper-preview .cb-theme-preview { position:relative; background:transparent; }\n.cb-wallpaper-preview .cb-theme-preview aside { opacity:.85; }\n.cb-wallpaper-preview .cb-theme-preview section { background:#08121f55; }\n.cb-art:is(.scene-whalegirl,.scene-cyberdad,.scene-geek) { background:#08121f; }\n.cb-art:is(.scene-whalegirl,.scene-cyberdad,.scene-geek) .scene-art { width:100%; height:100%; max-width:none; max-height:none; object-fit:cover; animation:none; }\n.cb-art:is(.scene-whalegirl,.scene-cyberdad,.scene-geek) .scene-orbs { display:none; }\n.cb-video-preview { max-width:820px; width:min(820px,92vw); padding:12px; background:#08121f; }\n.cb-video-preview video { display:block; width:100%; aspect-ratio:16/9; border-radius:16px; background:#08121f; }\n.cb-video-preview button { margin-top:12px; }\n\n.cb-video-preview video[hidden] { display:none; }\n.cb-video-preview [role="alert"] { color:#d8eeff; padding:32px 12px; }\n\n/* Same scene-code fragment as the native geek HUD, scaled for its card. */\n.cb-geek-preview .cb-theme-preview { padding-top: 48px; }\n.cb-geek-preview .cb-theme-preview aside { margin-top: -48px; border-right: 1px solid #36d5ff66; }\n.cb-geek-preview .cb-theme-preview code { border-radius: 2px; border: 1px solid #36d5ff55; }\n.cb-geek-mini { position:absolute; top:10px; left:32%; right:12px; padding:5px; border:1px solid #36d5ff66; background:#06131ceb; color:#36d5ff; pointer-events:none; font:7px/1.5 ui-monospace,monospace; }\n.cb-geek-mini::after { content:""; position:absolute; top:-1px; right:-1px; width:6px; height:6px; border-top:1px solid #ef566b; border-right:1px solid #ef566b; }\n.cb-geek-mini > span { font-size:6px; letter-spacing:.5px; white-space:nowrap; }\n.cb-geek-mini .cb-geek-code { padding:3px 0 0; font:6px/1.4 ui-monospace,monospace; }\n.cb-geek-mini .cb-geek-code > div { display:flex; gap:4px; white-space:pre; }\n.cb-geek-mini .cb-geek-code > div > span { color:#749bad; font:inherit; }\n.cb-geek-mini .cb-geek-code code { color:#c4dce9; background:none; padding:0; border:0; font:inherit; }\n.cb-geek-mini .cb-geek-code b { color:#51d9ff; font-weight:400; }\n.cb-geek-mini .cb-geek-code em { color:#9bddbf; font-style:normal; }\n\n.cb-geek-preview .cb-mini-line { display:none; }\n.cb-geek-preview .cb-mini-bubble { height:10px; margin-bottom:8px; }\n.cb-geek-preview .cb-mini-input { margin-top:8px; }\n.cb-geek-mini { overflow:hidden; }\n\n.scene-whale {\n  background: linear-gradient(145deg, #fff 10%, #e8f5ff 65%, #d9ebfc);\n}\n.scene-stars {\n  background: radial-gradient(\n    ellipse at 55% 45%,\n    #f4f1ff,\n    #e6ebff 65%,\n    #dde6fc\n  );\n}\n.scene-forest {\n  background: linear-gradient(150deg, #fffcf0, #eef5e5 60%, #e1efd9);\n}\n.scene-orbs {\n  position: absolute;\n  inset: 0;\n  overflow: hidden;\n  pointer-events: none;\n}\n.scene-orbs i {\n  position: absolute;\n  width: 200px;\n  height: 200px;\n  border-radius: 50%;\n  background: #ffffff6b;\n  filter: blur(2px);\n  animation: scene-drift 9s ease-in-out infinite;\n}\n.scene-orbs i:nth-child(1) {\n  left: 13%;\n  top: 18%;\n  width: 50px;\n  height: 50px;\n  border: 1px solid #ffffffa3;\n}\n.scene-orbs i:nth-child(2) {\n  right: 12%;\n  bottom: 5%;\n  animation-delay: -4s;\n}\n.scene-orbs i:nth-child(3) {\n  right: 20%;\n  top: 19%;\n  width: 12px;\n  height: 12px;\n  animation-delay: -7s;\n}\n.scene-art {\n  width: 100%;\n  height: 100%;\n  object-fit: contain;\n  animation: scene-drift 5s ease-in-out infinite;\n}\n.scene-stars .scene-art {\n  animation: stars-gather 5s ease-in-out infinite;\n}\n.scene-forest .scene-art {\n  animation: leaf-sway 6s ease-in-out infinite;\n  transform-origin: 50% 80%;\n}\n@keyframes scene-drift {\n  50% {\n    transform: translateY(-12px) rotate(2deg);\n  }\n}\n@keyframes stars-gather {\n  50% {\n    transform: scale(0.91) rotate(5deg);\n    opacity: 0.6;\n  }\n}\n@keyframes leaf-sway {\n  50% {\n    transform: rotate(5deg) translateY(-5px);\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .scene-art,\n  .scene-orbs i {\n    animation: none !important;\n  }\n}\n';

// plugin/client.jsx
var name = "cyberdaddy-dressup";
var inject = ["theme", "slots", "connection"];
function apply(ctx) {
  let state = globalThis.__CYBERDADDY_APPEARANCE__ || structuredClone(defaults);
  const listeners = /* @__PURE__ */ new Set();
  let disposed = false;
  const original = ctx.theme.getTheme().preference;
  let builtin2 = ["system", "dark", "light"].includes(original) ? original : "system";
  const style = document.createElement("style");
  style.textContent = css + "\n" + wallpaperCss;
  document.head.append(style);
  const registered = /* @__PURE__ */ new Map();
  function syncThemes() {
    const all = catalogFor(state, "theme"), ids = new Set(all.map((t) => t.id));
    for (const [id, dispose] of registered) if (!ids.has(id)) {
      dispose();
      registered.delete(id);
    }
    for (const t of all) if (!registered.has(t.id)) registered.set(t.id, ctx.theme.register({ id: `cyber-${t.id}`, colorScheme: t.scheme, tokens: { ...themeTokens(t.palette), ...wallpaperTokenOverrides(t.id) } }));
  }
  function applyTheme() {
    if (disposed) return;
    const id = state.enabled && state.theme !== "default" ? `cyber-${state.theme}` : builtin2;
    setWallpaperAppearance(state.enabled ? state.theme : null);
    if (ctx.theme.getTheme().preference !== id) ctx.theme.setTheme(id);
  }
  function accept(next) {
    const changed = JSON.stringify(state) !== JSON.stringify(next);
    if (disposed) return next;
    state = next;
    syncThemes();
    applyTheme();
    if (changed) for (const fn of listeners) fn(state);
    return state;
  }
  async function call(endpoint, payload) {
    const response = await fetch("/api/cyberdaddy", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint, payload }), signal: AbortSignal.timeout(1e4) });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error.message);
    return result.value;
  }
  const sync = createStateSync({ request: call, read: () => state, accept });
  const api = {
    desktop: true,
    get: () => sync.get(),
    update: (patch) => sync.mutate("update", patch),
    reset: () => sync.mutate("reset", null),
    addPreset: (payload) => sync.mutate("add-preset", payload),
    removePreset: (payload) => sync.mutate("remove-preset", payload),
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };
  function Section() {
    const ref = (0, import_react.useRef)(null);
    (0, import_react.useEffect)(() => {
      const unmount = mountManager(ref.current, api, { assetResolver: (path) => {
        const id = customAssetId(path), builtinId = builtinAssetId(path);
        return id ? "/api/cyberdaddy/asset?id=" + encodeURIComponent(id) : builtinId ? "/api/cyberdaddy/builtin?id=" + encodeURIComponent(builtinId) : assets[path];
      } });
      return unmount;
    }, []);
    return import_react.default.createElement("div", { ref });
  }
  ctx.on("theme/change", () => {
    if (state.enabled && state.theme !== "default") queueMicrotask(applyTheme);
    else {
      const id = ctx.theme.getTheme().preference;
      if (["system", "dark", "light"].includes(id)) builtin2 = id;
    }
  });
  ctx.slots.inject("settings.section", () => ctx.slots.register({ name: "settings.section", id: "cyber-toolbox", order: 5, label: "\u7F8E\u5316\u5DE5\u5177\u7BB1" }, Section));
  ctx.slots.inject("shell.overlay", () => ctx.slots.register({ name: "shell.overlay", id: "cyber-geek-hud", order: -100 }, () => import_react.default.createElement("div", { className: "cb-geek-hud", "aria-hidden": true, inert: "", dangerouslySetInnerHTML: { __html: geekHudMarkup() } })));
  syncThemes();
  applyTheme();
  const refresh = () => {
    if (!disposed && document.visibilityState === "visible") void api.get().catch(() => {
    });
  };
  const poll = setInterval(refresh, 1500);
  document.addEventListener("visibilitychange", refresh);
  refresh();
  ctx.effect(() => () => {
    disposed = true;
    clearInterval(poll);
    document.removeEventListener("visibilitychange", refresh);
    listeners.clear();
    style.remove();
    setWallpaperAppearance(null);
    if (ctx.theme.getTheme().preference.startsWith("cyber-")) ctx.theme.setTheme(builtin2);
    for (const dispose of registered.values()) dispose();
    registered.clear();
  });
}

return module.exports;}});
