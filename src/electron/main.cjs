const { app, BrowserWindow, ipcMain, shell, dialog, clipboard } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

const APP_DIR = path.join(process.env.APPDATA || os.homedir(), "Diamond");
const STATE_PATH = path.join(APP_DIR, "state.json");
const SYNC_DIR = path.join(APP_DIR, "sync");

function ensureAppDir() {
  fs.mkdirSync(APP_DIR, { recursive: true });
  fs.mkdirSync(path.join(APP_DIR, "browser-profiles"), { recursive: true });
  fs.mkdirSync(path.join(APP_DIR, "screenshots"), { recursive: true });
  fs.mkdirSync(path.join(APP_DIR, "generated-assets"), { recursive: true });
  fs.mkdirSync(SYNC_DIR, { recursive: true });
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
  generatedAssetsDir: path.join(APP_DIR, "generated-assets"),
  syncDir: SYNC_DIR,
}));
ipcMain.handle("diamond:get-firebase-admin-status", () => {
  const configuredPath = process.env.DIAMOND_FIREBASE_ADMIN_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
  const exists = Boolean(configuredPath && fs.existsSync(configuredPath));
  return {
    configured: Boolean(configuredPath),
    exists,
    source: process.env.DIAMOND_FIREBASE_ADMIN_JSON ? "DIAMOND_FIREBASE_ADMIN_JSON" : process.env.GOOGLE_APPLICATION_CREDENTIALS ? "GOOGLE_APPLICATION_CREDENTIALS" : "missing",
    redactedPath: redactPath(configuredPath),
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    reason: configuredPath ? exists ? "Firebase admin JSON path is configured and exists." : "Firebase admin JSON path is configured but the file was not found." : "No Firebase admin JSON path configured.",
  };
});
ipcMain.handle("diamond:export-sync-bundle", (_event, input = {}) => {
  ensureAppDir();
  const name = String(input.name || `firestore-sync-${Date.now()}`).replace(/[^a-z0-9_.-]+/gi, "-");
  const fileName = name.endsWith(".json") ? name : `${name}.json`;
  const target = path.join(SYNC_DIR, fileName);
  fs.writeFileSync(target, JSON.stringify(input.bundle || {}, null, 2), "utf8");
  return target;
});
ipcMain.handle("diamond:open-external", (_event, url) => shell.openExternal(url));
ipcMain.handle("diamond:write-clipboard", (_event, text) => {
  clipboard.writeText(String(text || ""));
  return true;
});
ipcMain.handle("diamond:save-screenshot", (_event, input = {}) => {
  ensureAppDir();
  const name = String(input.name || `screenshot-${Date.now()}`).replace(/[^a-z0-9_.-]+/gi, "-");
  const fileName = name.endsWith(".png") ? name : `${name}.png`;
  const target = path.join(APP_DIR, "screenshots", fileName);
  const dataUrl = String(input.dataUrl || "");
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync(target, Buffer.from(base64, "base64"));
  return target;
});
ipcMain.handle("diamond:save-generated-asset", (_event, input = {}) => {
  ensureAppDir();
  const extension = String(input.extension || "svg").replace(/[^a-z0-9]/gi, "") || "svg";
  const name = String(input.name || `generated-${Date.now()}`).replace(/[^a-z0-9_.-]+/gi, "-");
  const fileName = name.endsWith(`.${extension}`) ? name : `${name}.${extension}`;
  const target = path.join(APP_DIR, "generated-assets", fileName);
  fs.writeFileSync(target, String(input.contents || ""), "utf8");
  return target;
});
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

function redactPath(value) {
  const input = String(value || "");
  if (!input) return "";
  const parts = input.split(/[\\/]/).filter(Boolean);
  if (parts.length <= 2) return `.../${parts.at(-1) || ""}`;
  return `.../${parts.at(-2)}/${parts.at(-1)}`;
}
