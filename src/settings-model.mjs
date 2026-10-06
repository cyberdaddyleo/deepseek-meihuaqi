import { catalogFor } from "./catalog.mjs";
import { PET_SIZE } from "./pet-size.mjs";
const object = (v) =>
  v && typeof v === "object" && !Array.isArray(v) ? v : {};
const flag = (v, d) => (typeof v === "boolean" ? v : d);
const choice = (v, list, d) => (list.some((x) => x.id === v) ? v : d);
export function normalizeSettings(raw, custom = {}) {
  const s = object(raw),
    p = object(s.pet),
    pos = object(p.position);
  return {
    version: 1,
    enabled: flag(s.enabled, true),
    theme: choice(s.theme, [...catalogFor({ custom }, "theme"), { id: "default" }], "whalegirl"),
    splash: choice(s.splash, [...catalogFor({ custom }, "splash"), { id: "off" }], "whalegirl"),
    pet: {
      id: choice(p.id, catalogFor({ custom }, "pet"), "whalegirl"),
      enabled: flag(p.enabled, false),
      paused: flag(p.paused, false),
      sound: flag(p.sound, true),
      size: Number.isFinite(p.size)
        ? Math.round(Math.max(PET_SIZE.min, Math.min(PET_SIZE.max, p.size)))
        : PET_SIZE.default,
      position:
        Number.isFinite(pos.x) && Number.isFinite(pos.y)
          ? { x: Math.round(pos.x), y: Math.round(pos.y) }
          : null,
    },
  };
}
