const { app, BrowserWindow, ipcMain, shell, dialog, clipboard } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { pathToFileURL } = require("url");
const { fetchFirebaseLicense } = require("../firebase-license.cjs");

const APP_DIR = path.join(process.env.APPDATA || os.homedir(), "Diamond");
const STATE_PATH = path.join(APP_DIR, "state.json");
const SYNC_DIR = path.join(APP_DIR, "sync");
const TOUR_AUDIO_DIR = path.join(APP_DIR, "tour-audio");
const CHROMIUM_CACHE_DIR = path.join(APP_DIR, "chromium-cache");
const PROJECT_ROOT = path.join(__dirname, "..", "..");

loadLocalEnv();
app.setPath("userData", APP_DIR);
app.commandLine.appendSwitch("disk-cache-dir", CHROMIUM_CACHE_DIR);
app.commandLine.appendSwitch("disable-gpu-shader-disk-cache");
repairVolatileChromiumStorage();

function ensureAppDir() {
  fs.mkdirSync(APP_DIR, { recursive: true });
  fs.mkdirSync(path.join(APP_DIR, "browser-profiles"), { recursive: true });
  fs.mkdirSync(path.join(APP_DIR, "screenshots"), { recursive: true });
  fs.mkdirSync(path.join(APP_DIR, "generated-assets"), { recursive: true });
  fs.mkdirSync(CHROMIUM_CACHE_DIR, { recursive: true });
  fs.mkdirSync(SYNC_DIR, { recursive: true });
  fs.mkdirSync(TOUR_AUDIO_DIR, { recursive: true });
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

function repairVolatileChromiumStorage() {
  [
    CHROMIUM_CACHE_DIR,
    path.join(APP_DIR, "Cache"),
    path.join(APP_DIR, "Code Cache"),
    path.join(APP_DIR, "DawnCache"),
    path.join(APP_DIR, "GPUCache"),
    path.join(APP_DIR, "Service Worker", "Database"),
    path.join(APP_DIR, "Service Worker", "ScriptCache"),
    path.join(APP_DIR, "QuotaManager"),
    path.join(APP_DIR, "QuotaManager-journal"),
  ].forEach((target) => {
    try {
      fs.rmSync(target, { recursive: true, force: true });
    } catch {
      // Cache repair is best-effort. Never block the app over disposable Chromium storage.
    }
  });
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
  chromiumCacheDir: CHROMIUM_CACHE_DIR,
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
ipcMain.handle("diamond:get-firebase-license", (_event, input = {}) => fetchFirebaseLicense(input));
ipcMain.handle("diamond:export-sync-bundle", (_event, input = {}) => {
  ensureAppDir();
  const name = String(input.name || `firestore-sync-${Date.now()}`).replace(/[^a-z0-9_.-]+/gi, "-");
  const fileName = name.endsWith(".json") ? name : `${name}.json`;
  const target = path.join(SYNC_DIR, fileName);
  fs.writeFileSync(target, JSON.stringify(input.bundle || {}, null, 2), "utf8");
  return target;
});
ipcMain.handle("diamond:get-voiceover-status", () => {
  ensureAppDir();
  return {
    configured: Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID),
    voiceIdConfigured: Boolean(process.env.ELEVENLABS_VOICE_ID),
    modelId: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
    files: listTourAudioFiles(),
  };
});
ipcMain.handle("diamond:generate-tour-voiceovers", async (_event, input = {}) => {
  ensureAppDir();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
  if (!apiKey || !voiceId) {
    return {
      ok: false,
      reason: "Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID in Diamond .env.local.",
      files: listTourAudioFiles(),
    };
  }
  const steps = Array.isArray(input.steps) ? input.steps : [];
  const written = [];
  for (const step of steps) {
    const order = Number(step.order || written.length + 1);
    const id = safeName(step.id || `step-${order}`);
    const text = String(step.voiceoverText || step.text || "").trim();
    if (!text) continue;
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.8,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      },
    );
    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      return {
        ok: false,
        reason: `ElevenLabs failed for ${id}: ${response.status} ${message}`,
        files: listTourAudioFiles(),
      };
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const target = path.join(TOUR_AUDIO_DIR, `${String(order).padStart(2, "0")}-${id}.mp3`);
    fs.writeFileSync(target, buffer);
    written.push(audioFileRecord(target));
  }
  return {
    ok: true,
    written,
    files: listTourAudioFiles(),
  };
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
ipcMain.handle("diamond:stage-with-playwright", async (_event, input = {}) => {
  ensureAppDir();
  const { stagePostWithPlaywright } = await import(pathToFileURL(path.join(PROJECT_ROOT, "src", "playwright-worker.js")).href);
  return stagePostWithPlaywright({
    ...input,
    appDir: APP_DIR,
    screenshotsDir: path.join(APP_DIR, "screenshots"),
    headless: false,
    keepOpen: false,
  });
});

function redactPath(value) {
  const input = String(value || "");
  if (!input) return "";
  const parts = input.split(/[\\/]/).filter(Boolean);
  if (parts.length <= 2) return `.../${parts.at(-1) || ""}`;
  return `.../${parts.at(-2)}/${parts.at(-1)}`;
}

function loadLocalEnv() {
  [".env.local", ".env"].forEach((file) => {
    const target = path.join(PROJECT_ROOT, file);
    try {
      const raw = fs.readFileSync(target, "utf8");
      raw.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
        const [rawKey, ...rest] = trimmed.split("=");
        const key = rawKey.replace(/^\$env:/i, "").trim();
        if (!key || process.env[key]) return;
        process.env[key] = rest.join("=").trim().replace(/^["']|["']$/g, "");
      });
    } catch {
      // Local env files are optional.
    }
  });
}

function listTourAudioFiles() {
  try {
    return fs.readdirSync(TOUR_AUDIO_DIR)
      .filter((file) => file.endsWith(".mp3"))
      .map((file) => audioFileRecord(path.join(TOUR_AUDIO_DIR, file)));
  } catch {
    return [];
  }
}

function audioFileRecord(filePath) {
  return {
    name: path.basename(filePath),
    path: filePath,
    url: pathToFileURL(filePath).href,
  };
}

function safeName(value) {
  return String(value || "step").replace(/[^a-z0-9_.-]+/gi, "-").replace(/^-+|-+$/g, "") || "step";
}
