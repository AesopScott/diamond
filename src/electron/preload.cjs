const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("diamond", {
  getState: () => ipcRenderer.invoke("diamond:get-state"),
  saveState: (state) => ipcRenderer.invoke("diamond:save-state", state),
  getPaths: () => ipcRenderer.invoke("diamond:get-paths"),
  openExternal: (url) => ipcRenderer.invoke("diamond:open-external", url),
  pickMedia: () => ipcRenderer.invoke("diamond:pick-media"),
});
