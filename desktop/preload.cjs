const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("cyberDressup", {
  get: () => ipcRenderer.invoke("cyber:get"),
  update: (patch) => ipcRenderer.invoke("cyber:update", patch),
  reset: () => ipcRenderer.invoke("cyber:reset"),
  addPreset: (preset) => ipcRenderer.invoke("cyber:add-preset", preset),
  removePreset: (preset) => ipcRenderer.invoke("cyber:remove-preset", preset),
  asset: (id) => ipcRenderer.invoke("cyber:asset", id),
  action: (name) => ipcRenderer.invoke("cyber:action", name),
  hit: (value) => ipcRenderer.send("cyber:hit", value),
  drag: (phase, point) => ipcRenderer.send("cyber:drag", phase, point),
  menu: () => ipcRenderer.send("cyber:menu"),
  onChange: (callback) => {
    const fn = (_event, value) => callback(value);
    ipcRenderer.on("cyber:change", fn);
    return () => ipcRenderer.removeListener("cyber:change", fn);
  },
  onCursor: (callback) => {
    const fn = (_event, value) => callback(value);
    ipcRenderer.on("cyber:cursor", fn);
    return () => ipcRenderer.removeListener("cyber:cursor", fn);
  },
  onBehavior: (callback) => {
    const fn = (_event, value) => {
      if (["walk", "play", "nap", "wake", "eat", "work", "yawn"].includes(value)) callback(value);
    };
    ipcRenderer.on("cyber:behavior", fn);
    return () => ipcRenderer.removeListener("cyber:behavior", fn);
  },
});
