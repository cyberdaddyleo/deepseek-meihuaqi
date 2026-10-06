import lockfile from "proper-lockfile";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
} from "node:fs";
import { join } from "node:path";
import { defaults } from "../src/presets.mjs";
import { CustomPresets, atomicJSON } from "./custom-presets.mjs";
import { normalizeSettings } from "../src/settings-model.mjs";
export { normalizeSettings } from "../src/settings-model.mjs";
const object = (v) =>
  v && typeof v === "object" && !Array.isArray(v) ? v : {};
/** Keep the complete pet inside the nearest display's usable area (coordinates can be negative). */
export function clampBounds(bounds, areas) {
  if (!areas.length) throw new Error("没有可用显示器");
  const cx = bounds.x + bounds.width / 2,
    cy = bounds.y + bounds.height / 2;
  const distance = (a) =>
    Math.hypot(
      cx - Math.max(a.x, Math.min(a.x + a.width, cx)),
      cy - Math.max(a.y, Math.min(a.y + a.height, cy)),
    );
  const a = [...areas].sort((a, b) => distance(a) - distance(b))[0];
  const width = Math.min(bounds.width, a.width),
    height = Math.min(bounds.height, a.height);
  return {
    x: Math.round(Math.max(a.x, Math.min(a.x + a.width - width, bounds.x))),
    y: Math.round(Math.max(a.y, Math.min(a.y + a.height - height, bounds.y))),
    width,
    height,
  };
}
/** Main-process-only store. Writes share one lock and never touch Harness data. */
export class Store {
  constructor(dir) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    this.dir = dir;
    this.file = join(dir, "appearance.json");
    this.warning = "";
    this.custom = new CustomPresets(dir, message => { this.warning = message; });
    this.get();
  }
  read() {
    // Read the catalog first: a newer schema must never be overwritten by old code.
    const custom = this.custom.load();
    let raw = defaults;
    if (existsSync(this.file)) {
      try { raw = JSON.parse(readFileSync(this.file, "utf8")); }
      catch (error) {
        if (error.code) throw error;
        renameSync(this.file, join(this.dir, `appearance.broken-${Date.now()}.json`));
        this.warning = "美化配置损坏，已保留备份并恢复默认。";
      }
      if (Number.isInteger(raw?.version) && raw.version > 1)
        throw new Error("美化配置版本较新，请升级换装器；原文件已保留。");
    }
    this.value = normalizeSettings(raw, custom);
    if (!existsSync(this.file) || JSON.stringify(raw) !== JSON.stringify(this.value)) atomicJSON(this.file, this.value);
    return { ...this.value, custom };
  }
  get() { return this.locked(() => structuredClone(this.read())); }
  save(value, custom) {
    this.value = normalizeSettings(value, custom);
    atomicJSON(this.file, this.value);
    return structuredClone({ ...this.value, custom });
  }
  locked(fn) {
    const deadline = Date.now() + 2000;
    let release;
    while (!release) {
      try { release = lockfile.lockSync(this.file, { realpath:false, stale:5000, update:1000 }); }
      catch (error) {
        if (error.code !== 'ELOCKED') throw error;
        if (Date.now() > deadline) throw new Error('美化配置正在写入，请稍后重试');
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
      }
    }
    try { return fn(); } finally { release(); }
  }
  update(patch) {
    return this.locked(() => {
      const p = object(patch), current = this.read();
      return this.save({ ...current, ...p, pet:{ ...current.pet, ...object(p.pet) } }, current.custom);
    });
  }
  reset() {
    return this.locked(() => this.save(defaults, this.read().custom));
  }
  addPreset(payload) {
    return this.locked(() => {
      const current = this.read(), custom = this.custom.add(payload, current.custom);
      // Importing only updates the library; applying remains an explicit UI action.
      return structuredClone({ ...this.value, custom });
    });
  }
  removePreset(payload) {
    return this.locked(() => {
      const current = this.read(), custom = this.custom.remove(payload, current.custom);
      return this.save(current, custom);
    });
  }
  readAsset(id) {
    return this.locked(() => this.custom.read(id, this.read().custom));
  }
}
