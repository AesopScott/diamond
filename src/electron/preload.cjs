const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("diamond", {
  getState: () => ipcRenderer.invoke("diamond:get-state"),
  saveState: (state) => ipcRenderer.invoke("diamond:save-state", state),
  getPaths: () => ipcRenderer.invoke("diamond:get-paths"),
  getFirebaseAdminStatus: () => ipcRenderer.invoke("diamond:get-firebase-admin-status"),
  getFirebaseLicense: (input) => ipcRenderer.invoke("diamond:get-firebase-license", input),
  getVoiceoverStatus: () => ipcRenderer.invoke("diamond:get-voiceover-status"),
  getOperatorManual: () => ipcRenderer.invoke("diamond:get-operator-manual"),
  openOperatorManual: () => ipcRenderer.invoke("diamond:open-operator-manual"),
  generateTourVoiceovers: (input) => ipcRenderer.invoke("diamond:generate-tour-voiceovers", input),
  exportSyncBundle: (input) => ipcRenderer.invoke("diamond:export-sync-bundle", input),
  openExternal: (url) => ipcRenderer.invoke("diamond:open-external", url),
  writeClipboard: (text) => ipcRenderer.invoke("diamond:write-clipboard", text),
  saveScreenshot: (input) => ipcRenderer.invoke("diamond:save-screenshot", input),
  saveGeneratedAsset: (input) => ipcRenderer.invoke("diamond:save-generated-asset", input),
  pickMedia: () => ipcRenderer.invoke("diamond:pick-media"),
  inspectMedia: (paths) => ipcRenderer.invoke("diamond:inspect-media", paths),
  stageWithPlaywright: (input) => ipcRenderer.invoke("diamond:stage-with-playwright", input),
});
