const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("diamond", {
  getState: () => ipcRenderer.invoke("diamond:get-state"),
  saveState: (state) => ipcRenderer.invoke("diamond:save-state", state),
  getPaths: () => ipcRenderer.invoke("diamond:get-paths"),
  getFirebaseAdminStatus: () => ipcRenderer.invoke("diamond:get-firebase-admin-status"),
  getVoiceoverStatus: () => ipcRenderer.invoke("diamond:get-voiceover-status"),
  generateTourVoiceovers: (input) => ipcRenderer.invoke("diamond:generate-tour-voiceovers", input),
  exportSyncBundle: (input) => ipcRenderer.invoke("diamond:export-sync-bundle", input),
  openExternal: (url) => ipcRenderer.invoke("diamond:open-external", url),
  writeClipboard: (text) => ipcRenderer.invoke("diamond:write-clipboard", text),
  saveScreenshot: (input) => ipcRenderer.invoke("diamond:save-screenshot", input),
  saveGeneratedAsset: (input) => ipcRenderer.invoke("diamond:save-generated-asset", input),
  pickMedia: () => ipcRenderer.invoke("diamond:pick-media"),
  stageWithPlaywright: (input) => ipcRenderer.invoke("diamond:stage-with-playwright", input),
});
