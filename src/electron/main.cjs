const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

const APP_DIR = path.join(process.env.APPDATA || os.homedir(), "Diamond");
const STATE_PATH = path.join(APP_DIR, "state.json");

function ensureAppDir() {
  fs.mkdirSync(APP_DIR, { recursive: true });
  fs.mkdirSync(path.join(APP_DIR, "browser-profiles"), { recursive: true });
  fs.mkdirSync(path.join(APP_DIR, "screenshots"), { recursive: true });
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
  } catch {
    return null;
  }
}

function writeState(state) {
  ensureAppDir();
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), "utf8");
  return state;
}

function createWindow() {
  ensureAppDir();
  const win = new BrowserWindow({
    width: 1500,
    height: 950,
    minWidth: 1100,
    minHeight: 720,
    title: "Diamond",
    backgroundColor: "#090b10",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
  });

  win.loadFile(path.join(__dirname, "..", "renderer", "index.html"));
}

app.whenReady().then(() => {
  app.setName("Diamond");
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle("diamond:get-state", () => readState());
ipcMain.handle("diamond:save-state", (_event, state) => writeState(state));
ipcMain.handle("diamond:get-paths", () => ({
  appDir: APP_DIR,
  statePath: STATE_PATH,
  browserProfilesDir: path.join(APP_DIR, "browser-profiles"),
  screenshotsDir: path.join(APP_DIR, "screenshots"),
}));
ipcMain.handle("diamond:open-external", (_event, url) => shell.openExternal(url));
ipcMain.handle("diamond:pick-media", async () => {
  const result = await dialog.showOpenDialog({
    title: "Select social media asset",
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "Media", extensions: ["png", "jpg", "jpeg", "webp", "gif", "mp4", "mov"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
  return result.canceled ? [] : result.filePaths;
});
