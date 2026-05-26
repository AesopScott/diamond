const { app, BrowserWindow, ipcMain, shell, dialog, clipboard, session } = require("electron");
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { pathToFileURL } = require("url");
const { fetchFirebaseLicense } = require("../firebase-license.cjs");
const { generatePostDrafts, evaluateDraftWithLlm, rewriteDraftWithSuggestions } = require("../content-generation-llm.cjs");

// Allowed protocols for shell.openExternal — keep attack surface minimal.
const ALLOWED_EXTERNAL_PROTOCOLS = new Set(["https:", "http:", "mailto:"]);

// Allowed writable platforms — must match SUPPORTED_SOCIAL_PLATFORMS in renderer.
const GENERATION_ALLOWED_PLATFORMS = new Set([
  "x", "instagram", "tiktok", "linkedin",
  "youtube-shorts", "youtube-longform", "facebook", "pinterest",
]);
const GENERATION_MAX_PLATFORMS = 8;
const GENERATION_MAX_STRING_LENGTH = 5000;

function validateExternalUrl(url) {
  if (typeof url !== "string" || !url.trim()) return "URL must be a non-empty string.";
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return "URL is not a valid URL.";
  }
  if (!ALLOWED_EXTERNAL_PROTOCOLS.has(parsed.protocol)) {
    return `Protocol "${parsed.protocol}" is not allowed. Only https, http, and mailto links may be opened externally.`;
  }
  return null;
}

function validateGenerationPayload(payload) {
  if (!payload || typeof payload !== "object") return "Payload must be an object.";
  const platforms = payload.platforms;
  if (!Array.isArray(platforms)) return "platforms must be an array.";
  if (platforms.length > GENERATION_MAX_PLATFORMS) {
    return `platforms count ${platforms.length} exceeds maximum ${GENERATION_MAX_PLATFORMS}.`;
  }
  for (const entry of platforms) {
    if (!entry || typeof entry.platform !== "string") return "Each platforms entry must have a platform string.";
    if (!GENERATION_ALLOWED_PLATFORMS.has(entry.platform)) return `Unknown platform: ${entry.platform}.`;
  }
  return null;
}

function truncateGenerationStrings(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((item) => truncateGenerationStrings(item));
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = value.length > GENERATION_MAX_STRING_LENGTH ? value.slice(0, GENERATION_MAX_STRING_LENGTH) : value;
    } else {
      result[key] = truncateGenerationStrings(value);
    }
  }
  return result;
}

const APP_DIR = path.join(process.env.APPDATA || os.homedir(), "Diamond");
const STATE_PATH = path.join(APP_DIR, "state.json");
const STATE_BACKUP_LIMIT = 25;
const SYNC_DIR = path.join(APP_DIR, "sync");
const TOUR_AUDIO_DIR = path.join(APP_DIR, "tour-audio");
const CHROMIUM_CACHE_DIR = path.join(APP_DIR, "chromium-cache");
const PROJECT_ROOT = path.join(__dirname, "..", "..");
const OPERATOR_MANUAL_PATH = path.join(PROJECT_ROOT, "docs", "DIAMOND_OPERATOR_MANUAL.md");

loadLocalEnv();
app.setPath("userData", APP_DIR);
app.commandLine.appendSwitch("disk-cache-dir", CHROMIUM_CACHE_DIR);
app.commandLine.appendSwitch("disable-gpu-shader-disk-cache");

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
    return attachBrowserPartitions(JSON.parse(fs.readFileSync(STATE_PATH, "utf8")));
  } catch {
    return null;
  }
}

function writeState(state) {
  ensureAppDir();
  const next = attachBrowserPartitions(state);
  backupStateBeforeRiskyWrite(next);
  fs.writeFileSync(STATE_PATH, JSON.stringify(next, null, 2), "utf8");
  return next;
}

function backupStateBeforeRiskyWrite(nextState) {
  const current = readRawState();
  if (!current) return;
  const currentCounts = stateEntityCounts(current);
  const nextCounts = stateEntityCounts(nextState);
  const dropped = Object.keys(currentCounts).filter((key) => nextCounts[key] < currentCounts[key]);
  if (!dropped.length) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const label = dropped.map((key) => `${key}-${currentCounts[key]}to${nextCounts[key]}`).join("_");
  const backupPath = path.join(APP_DIR, `state.backup-before-entity-count-drop-${stamp}-${label}.json`);
  fs.copyFileSync(STATE_PATH, backupPath);
  pruneStateBackups();
}

function readRawState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
  } catch {
    return null;
  }
}

function stateEntityCounts(state = {}) {
  return {
    companies: Array.isArray(state.companies) ? state.companies.length : 0,
    brands: Array.isArray(state.brands) ? state.brands.length : 0,
    campaigns: Array.isArray(state.campaigns) ? state.campaigns.length : 0,
    socialAccounts: Array.isArray(state.socialAccounts) ? state.socialAccounts.length : 0,
  };
}

function pruneStateBackups() {
  try {
    const backups = fs.readdirSync(APP_DIR)
      .filter((name) => /^state\.backup-.*\.json$/i.test(name))
      .map((name) => {
        const fullPath = path.join(APP_DIR, name);
        return { name, fullPath, mtimeMs: fs.statSync(fullPath).mtimeMs };
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs);
    backups.slice(STATE_BACKUP_LIMIT).forEach((backup) => fs.rmSync(backup.fullPath, { force: true }));
  } catch {
    // Backups are protective only; a prune failure must not block saving state.
  }
}

function attachBrowserPartitions(state) {
  if (!state || typeof state !== "object") return state;
  const next = structuredClone(state);
  next.socialAccounts = (next.socialAccounts || []).map((account) => ({
    ...account,
    browserPartitionId: resolveBrowserPartitionId(account),
  }));
  return next;
}

function resolveBrowserPartitionId(account = {}) {
  const browserProfileId = sanitizePartitionPart(account.browserProfileId || [
    account.companyId,
    account.brandId,
    account.platform,
    account.id,
  ].filter(Boolean).join("-"));
  const canonical = sanitizePartitionPart([
    "browser-profiles",
    account.companyId,
    account.platform,
    account.id,
    browserProfileId,
  ].filter(Boolean).join("-"));
  const candidates = [
    account.browserPartitionId,
    browserProfileId,
    canonical,
  ].filter(Boolean).map(sanitizePartitionPart);
  return candidates.find((candidate) => partitionExists(candidate)) || canonical || browserProfileId;
}

function sanitizePartitionPart(value) {
  return String(value || "").replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "") || "diamond-account";
}

function partitionExists(partitionId) {
  return fs.existsSync(path.join(APP_DIR, "Partitions", partitionId));
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

  win.maximize();
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

ipcMain.handle("diamond:get-version", () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, "package.json"), "utf8"));
    return packageJson.version || "unknown";
  } catch {
    return "unknown";
  }
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
ipcMain.handle("diamond:inspect-account-session", async (_event, input = {}) => inspectAccountSession(input));
ipcMain.handle("diamond:clear-account-session", async (_event, input = {}) => clearAccountSession(input));
ipcMain.handle("diamond:generate-post-drafts", async (_event, payload = {}) => {
  const validationError = validateGenerationPayload(payload);
  if (validationError) return { ok: false, drafts: null, error: validationError };
  const safePayload = truncateGenerationStrings(payload);
  try {
    const result = await generatePostDrafts(safePayload);
    // Sanitize provider error details before surfacing to renderer; log full detail in main.
    if (result && !result.ok && result.error) {
      console.error("[diamond:generate-post-drafts] writer error:", result.error);
      return { ok: false, drafts: null, error: "Generation failed. Try again or check your API keys." };
    }
    return result;
  } catch (error) {
    console.error("[diamond:generate-post-drafts] unexpected error:", error);
    return { ok: false, drafts: null, error: "Generation failed. Check application logs." };
  }
});
ipcMain.handle("diamond:evaluate-draft", async (_event, payload = {}) => {
  try {
    const result = await evaluateDraftWithLlm(payload);
    if (result && !result.ok && result.error) {
      console.error("[diamond:evaluate-draft] error:", result.error);
      return { ok: false, evaluation: null, error: "Evaluation failed. Check your API keys." };
    }
    return result;
  } catch (error) {
    console.error("[diamond:evaluate-draft] unexpected error:", error);
    return { ok: false, evaluation: null, error: "Evaluation failed. Check application logs." };
  }
});
ipcMain.handle("diamond:rewrite-draft", async (_event, payload = {}) => {
  try {
    const result = await rewriteDraftWithSuggestions(payload);
    if (result && !result.ok && result.error) {
      console.error("[diamond:rewrite-draft] error:", result.error);
      return { ok: false, revisedText: null, error: "Rewrite failed. Check your API keys." };
    }
    return result;
  } catch (error) {
    console.error("[diamond:rewrite-draft] unexpected error:", error);
    return { ok: false, revisedText: null, error: "Rewrite failed. Check application logs." };
  }
});
// Return the Replicate API key to the renderer via IPC so it never needs direct process.env access.
// The key stays in the main process; the renderer receives it once per generation call over the
// secure contextBridge channel (contextIsolation: true, nodeIntegration: false).
ipcMain.handle("diamond:get-replicate-api-key", () => {
  return process.env.REPLICATE_API_KEY || null;
});
// Return HeyGen credentials to the renderer via IPC — same pattern as Replicate.
// process.env is not available in the renderer (contextIsolation: true, nodeIntegration: false).
ipcMain.handle("diamond:get-heygen-api-key", () => {
  return process.env.HEYGEN_API_KEY || null;
});
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

async function clearAccountSession(input = {}) {
  const account = input.account || {};
  const partition = String(input.partition || "").startsWith("persist:")
    ? String(input.partition)
    : `persist:${sanitizePartitionPart(input.partition || account.browserPartitionId || account.browserProfileId)}`;
  try {
    const store = session.fromPartition(partition);
    await store.clearStorageData({
      storages: [
        "cookies",
        "filesystem",
        "indexdb",
        "localstorage",
        "shadercache",
        "websql",
        "serviceworkers",
        "cachestorage",
      ],
    });
    await store.clearCache();
    return {
      ok: true,
      status: "cleared",
      note: `${platformLabel(account.platform)} browser session was cleared for this Diamond account.`,
      partition,
    };
  } catch (error) {
    return {
      ok: false,
      status: "error",
      note: error?.message || "Could not clear the Diamond browser session.",
      partition,
    };
  }
}

async function inspectAccountSession(input = {}) {
  const account = input.account || {};
  const partition = String(input.partition || "").startsWith("persist:")
    ? String(input.partition)
    : `persist:${sanitizePartitionPart(input.partition || account.browserPartitionId || account.browserProfileId)}`;
  const urls = accountSessionProbeUrls(account);
  const authCookieNames = authCookieNamesForPlatform(account.platform);
  if (!urls.length || !authCookieNames.length) {
    return { ok: true, status: "unknown", note: "No session cookie probe is configured for this platform.", partition };
  }
  try {
    const store = session.fromPartition(partition);
    const cookieGroups = await Promise.all(urls.map(async (url) => {
      try {
        return await store.cookies.get({ url });
      } catch {
        return [];
      }
    }));
    const cookies = cookieGroups.flat();
    const names = new Set(cookies.map((cookie) => cookie.name));
    const hasAuthCookie = authCookieNames.some((name) => names.has(name));
    if (hasAuthCookie) {
      return {
        ok: true,
        status: "ready",
        note: `${platformLabel(account.platform)} session cookies are present in Diamond's browser profile.`,
        partition,
        cookieCount: cookies.length,
      };
    }
    return {
      ok: true,
      status: "unknown",
      note: `${platformLabel(account.platform)} session cookies were not found in Diamond's browser profile.`,
      partition,
      cookieCount: cookies.length,
    };
  } catch (error) {
    return {
      ok: false,
      status: "unknown",
      note: error?.message || "Could not inspect the Diamond browser session.",
      partition,
    };
  }
}

function accountSessionProbeUrls(account = {}) {
  const defaults = {
    linkedin: ["https://www.linkedin.com/", "https://linkedin.com/"],
    facebook: ["https://www.facebook.com/", "https://facebook.com/"],
    x: ["https://x.com/", "https://twitter.com/"],
    instagram: ["https://www.instagram.com/", "https://instagram.com/"],
    tiktok: ["https://www.tiktok.com/", "https://tiktok.com/"],
    "youtube-shorts": ["https://www.youtube.com/", "https://studio.youtube.com/"],
    "youtube-longform": ["https://www.youtube.com/", "https://studio.youtube.com/"],
    pinterest: ["https://www.pinterest.com/", "https://pinterest.com/"],
    reddit: ["https://www.reddit.com/", "https://reddit.com/"],
  };
  return [
    account.accountUrl,
    account.currentUrl,
    account.loginPanelUrl,
    ...(defaults[account.platform] || []),
  ].filter(Boolean).filter((url, index, urls) => urls.indexOf(url) === index);
}

function authCookieNamesForPlatform(platform = "") {
  return {
    linkedin: ["li_at"],
    facebook: ["c_user", "xs"],
    x: ["auth_token"],
    instagram: ["sessionid", "ds_user_id"],
    tiktok: ["sessionid", "sid_tt", "sid_guard"],
    "youtube-shorts": ["SAPISID", "APISID", "SSID", "HSID"],
    "youtube-longform": ["SAPISID", "APISID", "SSID", "HSID"],
    pinterest: ["_pinterest_sess"],
    reddit: ["reddit_session"],
  }[platform] || [];
}

function platformLabel(platform = "") {
  return {
    linkedin: "LinkedIn",
    facebook: "Facebook",
    x: "X",
    instagram: "Instagram",
    tiktok: "TikTok",
    "youtube-shorts": "YouTube Shorts",
    "youtube-longform": "YouTube Long Form",
    pinterest: "Pinterest",
    reddit: "Reddit",
  }[platform] || platform || "Platform";
}
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
ipcMain.handle("diamond:get-operator-manual", () => {
  try {
    const text = fs.readFileSync(OPERATOR_MANUAL_PATH, "utf8");
    return {
      ok: true,
      path: OPERATOR_MANUAL_PATH,
      text,
      updatedAt: fs.statSync(OPERATOR_MANUAL_PATH).mtime.toISOString(),
    };
  } catch (error) {
    return {
      ok: false,
      path: OPERATOR_MANUAL_PATH,
      text: "",
      reason: error.message || "Operator manual could not be read.",
    };
  }
});
ipcMain.handle("diamond:open-operator-manual", () => shell.openPath(OPERATOR_MANUAL_PATH));
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
ipcMain.handle("diamond:open-external", (_event, url) => {
  const validationError = validateExternalUrl(url);
  if (validationError) {
    console.warn("[diamond:open-external] blocked:", validationError, url);
    return { ok: false, error: validationError };
  }
  return shell.openExternal(url).then(() => ({ ok: true }));
});
ipcMain.handle("diamond:write-clipboard", (_event, text) => {
  clipboard.writeText(String(text || ""));
  return true;
});
ipcMain.handle("diamond:dashlane-search", async (_event, input = {}) => searchDashlane(input));
ipcMain.handle("diamond:dashlane-copy-field", async (_event, input = {}) => copyDashlaneField(input));
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
ipcMain.handle("diamond:inspect-media", (_event, paths = []) => {
  return (Array.isArray(paths) ? paths : [])
    .map((filePath) => inspectMediaPath(filePath));
});
ipcMain.handle("diamond:stage-with-playwright", async (_event, input = {}) => {
  ensureAppDir();
  const { stagePostWithPlaywright } = await import(pathToFileURL(path.join(PROJECT_ROOT, "src", "playwright-worker.js")).href);
  // Point Playwright at the same Electron partition directory so it reuses
  // the existing login session — no second login prompt for the user.
  const partitionId = sanitizePartitionPart(
    input.account?.browserPartitionId ||
    input.context?.browserProfileId ||
    input.account?.browserProfileId
  );
  const electronPartitionDir = partitionId
    ? path.join(APP_DIR, "Partitions", partitionId)
    : null;
  return stagePostWithPlaywright({
    ...input,
    appDir: APP_DIR,
    screenshotsDir: path.join(APP_DIR, "screenshots"),
    headless: false,
    keepOpen: true,
    ...(electronPartitionDir ? { profilePath: electronPartitionDir } : {}),
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

function inspectMediaPath(filePath) {
  const value = String(filePath || "");
  const extension = path.extname(value).replace(/^\./, "").toLowerCase();
  const kind = ["mp4", "mov", "webm"].includes(extension)
    ? "video"
    : ["png", "jpg", "jpeg", "webp", "gif"].includes(extension) ? "image" : "file";
  let size = 0;
  let exists = false;
  try {
    const stat = fs.statSync(value);
    exists = stat.isFile();
    size = stat.size;
  } catch {
    exists = false;
  }
  return {
    path: value,
    name: path.basename(value),
    extension,
    kind,
    exists,
    size,
  };
}

async function searchDashlane(input = {}) {
  const query = dashlaneQuery(input);
  if (!query) return { ok: false, reason: "No account URL, handle, or platform query is available.", entries: [] };
  const result = await runDashlane(["p", query, "-o", "json"]);
  if (!result.ok) return { ...result, entries: [] };
  const entries = parseDashlaneEntries(result.stdout);
  return {
    ok: true,
    query,
    entries: entries.map(redactDashlaneEntry),
  };
}

async function copyDashlaneField(input = {}) {
  const field = normalizeDashlaneField(input.field);
  if (!field) return { ok: false, reason: "Unsupported Dashlane field." };
  const query = dashlaneQuery(input);
  if (!query) return { ok: false, reason: "No account URL, handle, or platform query is available." };
  const result = await runDashlane(["p", query, "-f", field, "-o", "console"]);
  if (!result.ok) return result;
  const value = String(result.stdout || "").trim();
  if (!value) return { ok: false, reason: `Dashlane did not return a ${field} value for this account.` };
  clipboard.writeText(value);
  return {
    ok: true,
    query,
    field,
    copied: true,
  };
}

function dashlaneQuery(input = {}) {
  if (input.dashlaneId) return `id=${input.dashlaneId}`;
  const candidates = [
    input.accountUrl,
    input.loginUrl,
    input.expectedHost,
    input.handle,
    input.platform,
  ];
  return String(candidates.find((value) => String(value || "").trim()) || "").trim();
}

function normalizeDashlaneField(field) {
  const value = String(field || "").trim().toLowerCase();
  if (["login", "email", "password", "otp"].includes(value)) return value;
  return "";
}

function parseDashlaneEntries(stdout = "") {
  const text = String(stdout || "").trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.items)) return parsed.items;
    if (Array.isArray(parsed.data)) return parsed.data;
    return [parsed];
  } catch {
    return [];
  }
}

function redactDashlaneEntry(entry = {}) {
  const title = entry.title || entry.name || entry.itemName || "";
  const url = entry.url || entry.website || entry.domain || "";
  const login = entry.login || entry.email || entry.username || "";
  const id = entry.id || entry.itemId || "";
  return {
    id: String(id || ""),
    title: String(title || ""),
    url: String(url || ""),
    login: String(login || ""),
    hasPassword: Boolean(entry.password || entry.hasPassword || entry.otp),
    hasOtp: Boolean(entry.otp || entry.hasOtp),
  };
}

function runDashlane(args = []) {
  return new Promise((resolve) => {
    const candidates = dashlaneCommandCandidates();
    runDashlaneCandidate(candidates, args, [], resolve);
  });
}

function dashlaneCommandCandidates() {
  const configured = process.env.DIAMOND_DASHLANE_CLI || process.env.DASHLANE_CLI || "";
  return [
    configured,
    "dcli",
    "dcli.exe",
    "dcli.cmd",
    "C:\\Tools\\Dashlane\\dcli.exe",
  ].filter(Boolean).filter((value, index, list) => list.indexOf(value) === index);
}

function runDashlaneCandidate(candidates, args, failures, done) {
  const [command, ...rest] = candidates;
  if (!command) {
    done({
      ok: false,
      reason: dashlaneUnavailableReason(failures),
      stdout: "",
      stderr: failures.map((failure) => `${failure.command}: ${failure.reason}`).join("\n"),
    });
    return;
  }
  runDashlaneCommand(command, args, (result) => {
    if (result.ok) return done({ ...result, command });
    const nextFailures = [...failures, { command, reason: result.reason }];
    if (isDashlaneLaunchFailure(result)) return runDashlaneCandidate(rest, args, nextFailures, done);
    return done({ ...result, command });
  });
}

function runDashlaneCommand(command, args, done) {
  let child = null;
  let settled = false;
  const finish = (result) => {
    if (settled) return;
    settled = true;
    done(result);
  };
  try {
    child = execFile(command, args, {
      windowsHide: true,
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    }, (error, stdout, stderr) => {
      if (error) {
        finish({
          ok: false,
          reason: dashlaneErrorReason(error, stderr),
          stdout: "",
          stderr: String(stderr || ""),
        });
        return;
      }
      finish({
        ok: true,
        stdout: String(stdout || ""),
        stderr: String(stderr || ""),
      });
    });
  } catch (error) {
    finish({
      ok: false,
      reason: dashlaneErrorReason(error, ""),
      stdout: "",
      stderr: String(error?.message || ""),
    });
    return;
  }
  child?.on?.("error", (error) => {
    if (error?.code === "EINVAL") {
      finish({
        ok: false,
        reason: dashlaneErrorReason(error, ""),
        stdout: "",
        stderr: String(error?.message || ""),
      });
    }
  });
}

function dashlaneErrorReason(error, stderr = "") {
  const message = String(stderr || error?.message || "").trim();
  if (error?.code === "ENOENT") return "Dashlane CLI was not found. Install and sign in to dcli, then try again.";
  if (error?.code === "EINVAL") return "Dashlane CLI could not be started from this path.";
  return message || "Dashlane CLI command failed.";
}

function isDashlaneLaunchFailure(result = {}) {
  return /not found|could not be started from this path/i.test(result.reason || "");
}

function dashlaneUnavailableReason(failures = []) {
  const tried = failures.map((failure) => failure.command).filter(Boolean).join(", ");
  return `Dashlane CLI could not be started from Diamond${tried ? ` after trying: ${tried}` : ""}.`;
}

function safeName(value) {
  return String(value || "step").replace(/[^a-z0-9_.-]+/gi, "-").replace(/^-+|-+$/g, "") || "step";
}
