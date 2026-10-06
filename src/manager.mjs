import { pets, defaults } from "./presets.mjs";
import { catalogFor } from "./catalog.mjs";
import { createModal, openCustomPresetForm, exportTheme, themePreviewMarkup } from "./custom-form.mjs";
import { copy as c } from "./copy.mjs";
import { fallbackData } from "./asset-fallback.mjs";
import { PET_SIZE } from "./pet-size.mjs";
import { geekPreviewMarkup } from "./geek-hud.mjs";
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
const label = (list, id, fallback) =>
  list.find((p) => p.id === id)?.name || fallback;
/** Shared settings view, mounted inside the official settings slot or independent pet window. */
export function mountManager(
  root,
  api,
  { assetBase = "/cyber-assets/", petOnly = false, assetResolver } = {},
) {
  let state,
    tab = petOnly ? "pet" : "theme",
    message = "",
    busy = false,
    alive = true,
    pendingDelete = null;
  const headerRegion = document.createElement("div");
  const contentRegion = document.createElement("div");
  const petSizing = document.createElement("div");
  petSizing.className = "cb-pet-size";
  petSizing.setAttribute("role", "group");
  petSizing.setAttribute("aria-label", c.size);
  petSizing.innerHTML = `<div class="cb-size-heading"><span>${c.size}</span><output aria-live="off"></output></div><div class="cb-size-adjust"><button type="button" data-size-step="-1" aria-label="缩小桌宠">−</button><input type="range" aria-label="${c.size}" min="${PET_SIZE.min}" max="${PET_SIZE.max}" step="1"><button type="button" data-size-step="1" aria-label="放大桌宠">＋</button></div><div class="cb-size-scale"><span>小巧</span><span>醒目</span></div>`;
  const sizeRange = petSizing.querySelector("input");
  let sizeDraft = null, sizeQueued = null, sizeSaving = false, sizeTimer;
  function syncSizeControls() {
    if (!state || !alive) return;
    const size = sizeDraft ?? state.pet.size;
    if (Number(sizeRange.value) !== size) sizeRange.value = String(size);
    sizeRange.setAttribute("aria-valuetext", `${size} 像素`);
    petSizing.querySelector("output").textContent = `${size}px`;
    petSizing.querySelector('[data-size-step="-1"]').disabled = size <= PET_SIZE.min;
    petSizing.querySelector('[data-size-step="1"]').disabled = size >= PET_SIZE.max;
  }
  async function flushSize() {
    clearTimeout(sizeTimer); sizeTimer = undefined;
    if (sizeSaving || sizeQueued === null || !alive) return;
    const value = sizeQueued; sizeQueued = null;
    if (value === state.pet.size) { sizeDraft = null; syncSizeControls(); return; }
    sizeSaving = true;
    await update({pet: {size: value}});
    sizeSaving = false;
    if (!alive) return;
    if (sizeQueued !== null) void flushSize();
    else { sizeDraft = null; syncSizeControls(); }
  }
  function changeSize(value, immediate = false) {
    sizeDraft = Math.max(PET_SIZE.min, Math.min(PET_SIZE.max, Math.round(value)));
    sizeQueued = sizeDraft;
    syncSizeControls();
    if (immediate) void flushSize();
    else if (!sizeTimer && !sizeSaving) sizeTimer = setTimeout(() => { void flushSize(); }, 70);
  }
  sizeRange.oninput = () => changeSize(Number(sizeRange.value));
  sizeRange.onchange = () => changeSize(Number(sizeRange.value), true);
  petSizing.querySelectorAll("[data-size-step]").forEach(button => {
    button.onclick = () => changeSize((sizeDraft ?? state.pet.size) + Number(button.dataset.sizeStep) * PET_SIZE.step, true);
  });
  const overlays = new Set();
  const asset = (path) => assetResolver ? assetResolver(path) : assetBase + path.replace(/^assets\//, "");
  const image = (path, alt, cls = "") =>
    `<img class="${cls}" data-asset-path="${escape(path)}" alt="${escape(alt)}" draggable="false">`;
  const hydrateImages = (container) => {
    container.querySelectorAll("img[data-asset-path]").forEach(img => {
      const unclipFallback = () => img.closest('.cb-sprite-preview')?.classList.add('cb-sprite-fallback');
      const load = (path) => Promise.resolve().then(() => asset(path)).then(url => {
        if (alive && img.isConnected) {
          if (typeof url !== "string" || !url) unclipFallback();
          img.src = typeof url === "string" && url ? url : fallbackData;
        }
      }).catch(() => {if (alive && img.isConnected) { unclipFallback(); img.src = fallbackData; }});
      img.onerror = () => {
        if (!alive || !img.isConnected) return;
        unclipFallback();
        if (!img.dataset.fallback) {img.dataset.fallback = "true"; void load("assets/whale.svg");}
        else {img.onerror = null; img.src = fallbackData;}
      };
      void load(img.dataset.assetPath);
    });
  };
  const update = async (patch) => {
    busy = true;
    message = c.saving;
    render();
    try {
      state = await api.update(patch);
      message = c.saved;
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
    let video, movieURL, mediaTimer, previewClosed = false;
    const mediaRequest = new AbortController();
    const releaseVideo = () => {
      clearTimeout(mediaTimer);
      mediaRequest.abort();
      if (video) { video.onerror = null; video.pause(); video.removeAttribute('src'); video.removeAttribute('poster'); video.load(); }
      if (movieURL) { URL.revokeObjectURL(movieURL); movieURL = null; }
    };
    const modal = createModal({title: `${t.name}预览`, className: "cb-splash-modal", onClose: () => {
      previewClosed = true; releaseVideo();
      overlays.delete(modal.close);
    }});
    overlays.add(modal.close);
    if(t.mediaType==='video') {
      modal.dialog.classList.add('cb-video-preview');
      modal.dialog.innerHTML=`<video playsinline controls aria-label="${escape(t.name)}"></video><p role="alert" hidden>视频加载失败，请检查本地素材。</p><button>${c.close}</button>`;
      video=modal.dialog.querySelector('video');video.muted=false;video.volume=1;
      video.style.objectFit = t.videoFit === 'contain' ? 'contain' : 'cover';
      const fail=()=>{
        if(previewClosed||!video.isConnected)return;
        releaseVideo();video.hidden=true;
        modal.dialog.querySelector('[role="alert"]').hidden=false;
      };
      video.onerror=fail;
      modal.dialog.querySelector('button').onclick=modal.close;
      modal.dialog.querySelector('button').focus();
      mediaTimer = setTimeout(fail, 30000);
      // The native dsh stream proxy may have no seekable range. Fetching one
      // Blob makes custom and built-in previews seekable with the same decoder.
      Promise.all([asset(t.asset),asset(t.preview)]).then(async ([src,poster])=>{
        if(!alive||previewClosed||!video.isConnected)return;
        video.poster=poster;
        const response=await fetch(src,{signal:mediaRequest.signal});
        if(!response.ok)throw new Error('Preview media unavailable');
        const movie=await response.blob();
        if(!alive||previewClosed||mediaRequest.signal.aborted||!video.isConnected)return;
        clearTimeout(mediaTimer);
        movieURL=URL.createObjectURL(movie);video.src=movieURL;
        if(!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          try { await video.play(); }
          catch(error) {
            if(previewClosed||mediaRequest.signal.aborted)return;
            if(error.name==='NotAllowedError') { video.muted=true; await video.play().catch(()=>{}); }
          }
        }
      }).catch(fail);
      return;
    }
    modal.dialog.classList.add("cb-preview", "scene-" + t.scene);
    if (t.custom) modal.dialog.classList.add("cb-custom-splash");
    if (t.background) modal.dialog.style.background = t.background;
    modal.dialog.innerHTML = `<div class="scene-orbs"><i></i><i></i><i></i></div>${image(t.asset, t.name, "scene-art")}<h3>${escape(t.name)}</h3><button>${c.close}</button>`;
    modal.dialog.querySelector("button").onclick = modal.close;
    modal.dialog.querySelector("button").focus();
    hydrateImages(modal.dialog);
  };
  function render() {
    if (!state || !alive) return;
    const catalogs = { theme: catalogFor(state, "theme"), splash: catalogFor(state, "splash"), pet: catalogFor(state, "pet") };
    const list = catalogs[tab],
      id = tab === "pet" ? state.pet.id : state[tab];
    const current =
      tab === "theme"
        ? label(catalogs.theme, id, c.default)
        : tab === "splash"
          ? label(catalogs.splash, id, c.splashOff)
          : label(catalogs.pet, id, pets.find(p => p.id === defaults.pet.id).name);
    root.className = "cb-toolbox";
    // Keep the size controls mounted: replacing a range during its own save or
    // a background poll cancels native dragging and keyboard focus.
    if (headerRegion.parentNode !== root) root.replaceChildren(headerRegion, petSizing, contentRegion);
    petSizing.hidden = tab !== "pet";
    syncSizeControls();
    headerRegion.innerHTML = `<header class="cb-header"><div class="cb-brand">${image("assets/cyberdad-logo.png", "赛博老爸品牌标识")}<div><span>CYBER DAD / LOCAL STUDIO</span><p>${c.title}</p></div></div><span class="cb-save" role="status">${escape(message || c.saved)}</span><h2>${c.headline}</h2><p class="cb-subtitle">${c.subtitle}</p></header>
  <nav class="cb-tabs" role="tablist" aria-label="美化分类">${Object.entries(
    c.tabs,
  )
    .filter(([key]) => !petOnly || key === "pet")
    .map(
      ([key, title]) =>
        `<button role="tab" aria-selected="${key === tab}" data-tab="${key}">${title}</button>`,
    )
    .join("")}</nav>
  <div class="cb-section-heading"><div><h3>${c.titles[tab]}</h3><p>${c.notes[tab]}</p></div><span class="cb-current">当前 · ${escape(current)}</span></div>
  ${api.addPreset ? `<div class="cb-library-toolbar"><span>内置灵感，也装得下你的创作</span><button data-add="${tab}"><span aria-hidden="true">＋</span> 添加${c.tabs[tab]}</button></div>` : ""}
  ${state.warning ? `<div class="cb-notice" role="alert">${escape(state.warning)}</div>` : ""}
  ${!state.enabled ? `<div class="cb-notice">${c.off}<button data-action="enable">${c.enable}</button></div>` : ""}`;
    contentRegion.innerHTML = `<div class="cb-cards">${list
    .map((p) => {
      const selected = p.id === id;
      let visual;
      if (tab === "theme") {
        visual = themePreviewMarkup(p.palette, p.name);
        if(p.wallpaper) visual=`<div class="cb-wallpaper-preview ${p.id==='geek'?'cb-geek-preview':''}">${image(p.wallpaper,p.name)}${visual}${p.id==='geek'?geekPreviewMarkup():''}</div>`;
      } else if (tab === "splash") {
        visual = `<div class="cb-art scene-${escape(p.scene)}" ${p.background ? `style="background:${escape(p.background)}"` : ""}><div class="scene-orbs"><i></i><i></i><i></i></div>${image(p.mediaType==='video'?p.preview:p.asset, p.name, "scene-art")}</div>`;
      } else
        visual = `<div class="cb-art cb-pet-art">${p.sprite?`<div class="cb-sprite-preview">${image(p.asset,p.name)}</div>`:image(p.asset, p.name)}</div>`;
      return `<article class="cb-card ${selected ? "is-selected" : ""}" data-preset="${escape(p.id)}">${visual}<div class="cb-card-content"><div class="cb-card-title"><h4>${escape(p.name)}</h4>${selected ? '<span class="cb-check">✓</span>' : ""}</div><p>${escape(p.caption || (p.custom ? "我的预设 · 本机保存" : ""))}</p><div class="cb-card-actions">${tab === "splash" ? `<button data-preview="${escape(p.id)}" class="cb-secondary">${c.preview}</button>` : ""}<button data-apply="${escape(p.id)}" aria-label="应用${escape(p.name)}" ${busy ? "disabled" : ""} class="${selected ? "cb-selected" : "cb-primary"}">${selected ? c.selected : c.apply}</button></div>
      ${(p.custom && api.removePreset) || tab === "theme" ? `<div class="cb-card-tools">${tab === "theme" ? `<button data-export="${escape(p.id)}" aria-label="导出${escape(p.name)}配色">导出配色</button>` : "<span>我的预设</span>"}${p.custom && api.removePreset ? `<button data-delete="${escape(p.id)}" aria-label="删除${escape(p.name)}">删除</button>` : ""}</div>` : ""}
      ${pendingDelete === p.id ? `<div class="cb-delete-confirm" role="group" aria-label="确认删除${escape(p.name)}"><span>${selected ? "删除后，此项将恢复默认。" : "删除这份本地预设？"}</span><div><button data-delete-cancel>取消</button><button data-delete-confirm="${escape(p.id)}" ${busy ? "disabled" : ""}>确认删除</button></div></div>` : ""}</div></article>`;
    })
    .join("")}</div>
  <div class="cb-controls">${tab === "theme" ? `<button data-action="default">${c.default}</button>` : tab === "splash" ? `<button data-action="splash-off" aria-pressed="${state.splash === "off"}">${c.splashOff}</button>` : `<button data-action="pet-toggle" class="cb-primary">${state.pet.enabled ? c.petOff : c.petOn}</button><button data-action="pause">${state.pet.paused ? c.resume : c.pause}</button><button data-action="sound" aria-pressed="${state.pet.sound}">点击音效：${state.pet.sound?'开':'关'}</button><p>轻点互动，连点撒欢。放着会犯困；右键可以散步、打盹，或选择伙伴的专属小动作。</p>${!api.desktop ? `<p>${c.browserPet}</p>` : ""}`}</div>
  <footer class="cb-footer"><div><span>${c.foot}</span><p>${escape(label(catalogs.splash, state.splash, "无启动动画"))} <em>·</em> ${escape(label(catalogs.theme, state.theme, c.default))} <em>·</em> ${escape(state.pet.enabled ? label(catalogs.pet, state.pet.id, "") : "桌宠已隐藏")}</p></div><div><button data-action="reset">${c.reset}</button><button data-action="disable">${state.enabled ? c.disable : c.enable}</button></div></footer>`;
    root.querySelectorAll("[data-tab]").forEach(
      (el) =>
        (el.onclick = () => {
          tab = el.dataset.tab;
          pendingDelete = null;
          message = "";
          render();
        }),
    );
    root
      .querySelectorAll("[data-apply]")
      .forEach(
        (el) =>
          (el.onclick = () =>
            update(
              tab === "pet"
                ? { pet: { id: el.dataset.apply } }
                : { [tab]: el.dataset.apply },
            )),
      );
    root
      .querySelectorAll("[data-preview]")
      .forEach(
        (el) =>
          (el.onclick = () =>
            preview(catalogs.splash.find((p) => p.id === el.dataset.preview))),
      );
    root.querySelectorAll("[data-add]").forEach(el => {
      el.onclick = () => {
        const close = openCustomPresetForm({kind: tab, api, onSaved(value) {
          if (!alive) return;
          state = value;
          message = "已添加，点击卡片应用";
          render();
        }, onClose() { overlays.delete(close); }});
        overlays.add(close);
      };
    });
    root.querySelectorAll("[data-export]").forEach(el => el.onclick = () => exportTheme(catalogs.theme.find(p => p.id === el.dataset.export)));
    root.querySelectorAll("[data-delete]").forEach(el => el.onclick = () => {pendingDelete = el.dataset.delete; render();});
    root.querySelectorAll("[data-delete-cancel]").forEach(el => el.onclick = () => {pendingDelete = null; render();});
    root.querySelectorAll("[data-delete-confirm]").forEach(el => el.onclick = async () => {
      if (busy) return;
      const id = el.dataset.deleteConfirm, kind = tab;
      busy = true; render();
      try {state = await api.removePreset({kind, id}); pendingDelete = null; message = "已删除本地预设";}
      catch (error) {message = error.message;}
      finally {busy = false; if (alive) render();}
    });
    root.querySelectorAll("[data-action]").forEach(
      (el) =>
        (el.onclick = async () => {
          const action = el.dataset.action;
          if (action === "reset") {
            try {
              state = await api.reset();
              message = c.saved;
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
            sound: { pet: { sound: !state.pet.sound } },
          };
          await update(patches[action]);
        }),
    );
    hydrateImages(root);
  }
  const off = api.onChange((value) => {
    state = value;
    render();
  });
  api
    .get()
    .then((value) => {
      state = value;
      render();
    })
    .catch((error) => {
      root.textContent = error.message;
    });
  return () => {
    alive = false;
    clearTimeout(sizeTimer);
    off();
    [...overlays].forEach(close => close());
    root.replaceChildren();
  };
}
