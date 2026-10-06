import { screen, Menu } from "electron";
import { join } from "node:path";
import { root } from "../scripts/paths.mjs";
import { clampBounds } from "./settings.mjs";
import { catalogFor } from "../src/catalog.mjs";
import { PET_SIZE_PRESETS } from "../src/pet-size.mjs";
/** Owns one transparent OS window and its drag/display-change resources. */
export class PetWindow {
  constructor({ create, store, changed, showManager, quit }) {
    Object.assign(this, { create, store, changed, showManager, quit });
    this.win = null;
    this.drag = null;
    this.ignored = true;
    this.reposition = () => {
      if (this.win && !this.win.isDestroyed()) {
        const b = this.visibleBounds(this.win.getBounds());
        this.win.setBounds(b);
        this.store.update({ pet: { position: { x: b.x, y: b.y } } });
      }
    };
    for (const name of [
      "display-added",
      "display-removed",
      "display-metrics-changed",
    ])
      screen.on(name, this.reposition);
  }
  visibleBounds(b) {
    return clampBounds(
      b,
      screen.getAllDisplays().map((d) => d.workArea),
    );
  }
  sync(state) {
    if (!state.enabled || !state.pet.enabled) {
      this.endDrag();
      if (this.win) {
        this.win.destroy();
        this.win = null;
      }
      return;
    }
    const size = state.pet.size,
      area = screen.getPrimaryDisplay().workArea;
    const position = state.pet.position ?? {
      x: area.x + area.width - size - 50,
      y: area.y + area.height - size - 40,
    };
    const bounds = this.visibleBounds({
      ...position,
      width: size,
      height: size,
    });
    if (!this.win) {
      const win = this.create({
        ...bounds,
        transparent: true,
        backgroundColor: "#00000000",
        frame: false,
        resizable: false,
        hasShadow: false,
        alwaysOnTop: true,
        focusable: false,
        skipTaskbar: true,
      });
      this.win = win;
      win.setAlwaysOnTop(true, "floating");
      win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      win.setIgnoreMouseEvents(true, { forward: true });
      this.ignored = true;
      win.once("ready-to-show", () => win.showInactive());
      win.on("closed", () => {
        if (this.win === win) this.win = null;
      });
      void win.loadFile(join(root, "desktop/pet.html"));
    } else {
      if (!this.drag) this.win.setBounds(bounds);
      this.win.webContents.send("cyber:change", state);
    }
  }
  refreshHit() {
    if (this.win && !this.win.isDestroyed()) {
      const p = screen.getCursorScreenPoint(),
        b = this.win.getBounds();
      this.win.webContents.send("cyber:cursor", {
        clientX: p.x - b.x,
        clientY: p.y - b.y,
      });
    }
  }
  hit(active) {
    if (!this.win || this.drag) return;
    const ignored = !active;
    if (this.ignored === ignored) return;
    this.ignored = ignored;
    this.win.setIgnoreMouseEvents(ignored, { forward: true });
  }
  startDrag(point) {
    if (!this.win || this.drag) return;
    const cursor = this.point(point) || screen.getCursorScreenPoint(),
      bounds = this.win.getBounds();
    this.drag = { cursor, bounds, start: Date.now() };
    this.win.setIgnoreMouseEvents(false);
    this.ignored = false;
    this.timer = setTimeout(() => this.endDrag(), 15000);
  }
  point(p) { return Number.isFinite(p?.x) && Number.isFinite(p?.y) ? {x:Math.round(p.x),y:Math.round(p.y)} : null; }
  moveDrag(point) {
    const p=this.point(point);
    if(!p||!this.drag||!this.win)return;
    this.win.setPosition(this.drag.bounds.x+p.x-this.drag.cursor.x,this.drag.bounds.y+p.y-this.drag.cursor.y);
  }

  endDrag() {
    clearTimeout(this.timer);
    this.timer = null;
    if (!this.drag) return;
    this.drag = null;
    if (this.win && !this.win.isDestroyed()) {
      const b = this.visibleBounds(this.win.getBounds());
      this.win.setBounds(b);
      this.store.update({ pet: { position: { x: b.x, y: b.y } } });
      this.win.webContents.send("cyber:change", this.store.get());
      this.refreshHit();
    }
  }
  contextMenu() {
    const win = this.win;
    if (!win || win.isDestroyed()) return;
    this.endDrag();
    const state = this.store.get(), p = state.pet;
    const update = (patch) => {
      this.store.update({ pet: patch });
      this.changed();
    };
    Menu.buildFromTemplate([
      {
        label: "切换桌宠",
        submenu: catalogFor(state, "pet").map((x) => ({
          label: x.name,
          type: "radio",
          checked: p.id === x.id,
          click: () => update({ id: x.id }),
        })),
      },
      {
        label: "桌宠大小",
        submenu: [
          ...(PET_SIZE_PRESETS.some(x => x.size === p.size) ? [] : [{
            label: `自定义 · ${p.size} px`, type: "radio", checked: true, enabled: false,
          }]),
          ...PET_SIZE_PRESETS.map(({name,size}) => ({
            label: `${name} · ${size} px`,
            type: "radio",
            checked: p.size === size,
            click: () => update({size}),
          })),
          {type: "separator"},
          {label: `当前 ${p.size} px`, enabled: false},
          {label: "管理页精细调节", click: () => void this.showManager()},
        ],
      },
      {
        label: p.paused ? "继续动画" : "暂停动画",
        click: () => update({ paused: !p.paused }),
      },
      {label: "点击音效", type: "checkbox", checked: p.sound, click: () => update({sound: !p.sound})},
      ...[["散散步", "walk"], ["逗一逗", "play"], ["打个盹", "nap"], ["叫醒", "wake"]].map(([label, behavior]) => ({
        label,
        enabled: !p.paused,
        click: () => { if (!win.isDestroyed()) win.webContents.send("cyber:behavior", behavior); },
      })),
      ...(p.id === 'whalegirl' ? [{label: "陪陪鲸鱼娘", submenu: [["喂一口", "eat"], ["陪我工作", "work"], ["打个哈欠", "yawn"]].map(([label,behavior])=>({label,enabled:!p.paused,click:()=>{if(!win.isDestroyed())win.webContents.send("cyber:behavior",behavior);}}))}] : []),
      ...(p.id === 'cyberdad' ? [{label: "陪陪赛博老爸", submenu: [["吃块饼干", "eat"], ["陪我工作", "work"], ["打个哈欠", "yawn"]].map(([label,behavior])=>({label,enabled:!p.paused,click:()=>{if(!win.isDestroyed())win.webContents.send("cyber:behavior",behavior);}}))}] : []),
      { label: "桌宠管理", click: () => void this.showManager() },
      { label: "隐藏桌宠", click: () => update({ enabled: false }) },
      { type: "separator" },
      { label: "退出桌宠", click: () => void this.quit() },
    ]).popup({ window: win, callback: () => this.refreshHit() });
  }
  dispose({ destroy = true } = {}) {
    this.endDrag();
    for (const name of [
      "display-added",
      "display-removed",
      "display-metrics-changed",
    ])
      screen.removeListener(name, this.reposition);
    if (destroy) this.win?.destroy();
    this.win = null;
  }
}
