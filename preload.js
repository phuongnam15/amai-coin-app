const { contextBridge, ipcRenderer } = require("electron");
const Toastify = require("toastify-js");

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (chanel, data) => ipcRenderer.send(chanel, data),
  on: (chanel, func) =>
    ipcRenderer.on(chanel, func),
  once: (chanel, func) =>
    ipcRenderer.once(chanel, func),
  removeListener: (chanel, func) =>
    ipcRenderer.removeListener(chanel, func),
});
contextBridge.exposeInMainWorld("Toastify", {
  toast: (options) => Toastify(options).showToast(),
});
