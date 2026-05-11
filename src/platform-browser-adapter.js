import { isMonitoringOnlyPlatform, platformLabel } from "./social-account.js";

export const X_COMPOSER_SELECTOR = '[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]';
export const X_MEDIA_INPUT_SELECTOR = 'input[data-testid="fileInput"][type="file"], input[type="file"]';

export const PLATFORM_BROWSER_ADAPTERS = Object.freeze({
  x: {
    platform: "x",
    label: "X",
    stageMode: "assisted",
    composerSelector: X_COMPOSER_SELECTOR,
    mediaInputSelector: X_MEDIA_INPUT_SELECTOR,
    supportsTextInsert: true,
    supportsMediaPicker: true,
    note: "X has the proven assisted composer adapter.",
  },
  instagram: manualAdapter("instagram", "Instagram"),
  tiktok: manualAdapter("tiktok", "TikTok"),
  linkedin: manualAdapter("linkedin", "LinkedIn"),
  "youtube-shorts": manualAdapter("youtube-shorts", "YouTube Shorts"),
  facebook: manualAdapter("facebook", "Facebook"),
  reddit: {
    platform: "reddit",
    label: "Reddit",
    stageMode: "monitoring_only",
    supportsTextInsert: false,
    supportsMediaPicker: false,
    note: "Reddit is configured for monitoring and reply capture only.",
  },
});

export function getPlatformBrowserAdapter(platform) {
  const key = String(platform || "").toLowerCase();
  return PLATFORM_BROWSER_ADAPTERS[key] || {
    platform: key,
    label: platformLabel(key),
    stageMode: "unsupported",
    supportsTextInsert: false,
    supportsMediaPicker: false,
    note: "No browser adapter exists for this platform yet.",
  };
}

export function platformCanStageInBrowser(platform) {
  const adapter = getPlatformBrowserAdapter(platform);
  return adapter.stageMode === "assisted" || adapter.stageMode === "manual";
}

export function buildInsertComposerScript(text, platform = "x") {
  const adapter = getPlatformBrowserAdapter(platform);
  if (!adapter.composerSelector) return buildUnsupportedScript(`${adapter.label} does not have an assisted composer selector yet`);
  return buildInsertContentEditableScript(adapter.composerSelector, text);
}

export function buildOpenMediaPickerScript(platform = "x") {
  const adapter = getPlatformBrowserAdapter(platform);
  if (!adapter.mediaInputSelector) return buildUnsupportedScript(`${adapter.label} does not have an assisted media picker selector yet`);
  return `
    (() => {
      const input = document.querySelector(${JSON.stringify(adapter.mediaInputSelector)});
      if (!input) return { ok: false, reason: "media input selector missing" };
      input.click();
      return { ok: true, reason: "platform file picker opened" };
    })();
  `;
}

export async function insertPlatformComposerText(webview, text, platform = "x") {
  const adapter = getPlatformBrowserAdapter(platform);
  if (isMonitoringOnlyPlatform(platform) || adapter.stageMode === "monitoring_only") {
    return { ok: false, manual: false, reason: `${adapter.label} is monitoring-only.` };
  }
  if (adapter.stageMode === "manual") {
    return { ok: false, manual: true, reason: `${adapter.label} compose opened. Paste the copied draft manually until its adapter is proven.` };
  }
  if (!webview || typeof webview.executeJavaScript !== "function") {
    return { ok: false, reason: "embedded browser does not support script execution" };
  }
  try {
    return await webview.executeJavaScript(buildInsertComposerScript(text, platform));
  } catch (error) {
    return { ok: false, reason: error.message || "script execution failed" };
  }
}

export async function openPlatformMediaPicker(webview, platform = "x") {
  const adapter = getPlatformBrowserAdapter(platform);
  if (adapter.stageMode === "monitoring_only") {
    return { ok: false, manual: false, reason: `${adapter.label} is monitoring-only.` };
  }
  if (adapter.stageMode === "manual") {
    return { ok: false, manual: true, reason: `${adapter.label} media upload is manual until its adapter is proven.` };
  }
  if (!webview || typeof webview.executeJavaScript !== "function") {
    return { ok: false, reason: "embedded browser does not support script execution" };
  }
  try {
    return await webview.executeJavaScript(buildOpenMediaPickerScript(platform));
  } catch (error) {
    return { ok: false, reason: error.message || "script execution failed" };
  }
}

function manualAdapter(platform, label) {
  return {
    platform,
    label,
    stageMode: "manual",
    supportsTextInsert: false,
    supportsMediaPicker: false,
    note: `${label} opens in the visible browser and uses clipboard/manual staging until selectors are proven.`,
  };
}

function buildInsertContentEditableScript(selector, text) {
  return `
    (() => {
      const text = ${JSON.stringify(String(text || ""))};
      const editor = document.querySelector(${JSON.stringify(selector)});
      if (!editor) return { ok: false, reason: "composer selector missing" };
      if (editor.getAttribute("contenteditable") === "false" || editor.getAttribute("aria-disabled") === "true") {
        return { ok: false, reason: "composer is not editable" };
      }
      editor.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      const selected = document.execCommand("selectAll", false, null);
      const inserted = document.execCommand("insertText", false, text);
      if (!selected || !inserted) return { ok: false, reason: "composer insert command failed" };
      editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
      const value = editor.innerText || editor.textContent || "";
      return {
        ok: value.includes(text.slice(0, Math.min(24, text.length))),
        reason: value ? "composer text inserted" : "composer stayed empty after insert",
      };
    })();
  `;
}

function buildUnsupportedScript(reason) {
  return `(() => ({ ok: false, manual: true, reason: ${JSON.stringify(reason)} }))();`;
}

