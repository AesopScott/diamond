import { isMonitoringOnlyPlatform, platformLabel } from "./social-account.js";

export const X_COMPOSER_SELECTOR = '[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]';
export const X_MEDIA_INPUT_SELECTOR = 'input[data-testid="fileInput"][type="file"], input[type="file"]';
export const LINKEDIN_COMPOSER_SELECTOR = '.ql-editor[contenteditable="true"], div[role="textbox"][contenteditable="true"]';
export const FACEBOOK_COMPOSER_SELECTOR = 'div[role="textbox"][contenteditable="true"], [contenteditable="true"][aria-label]';
export const INSTAGRAM_CAPTION_SELECTOR = 'textarea[aria-label*="caption" i], textarea[placeholder*="caption" i], div[contenteditable="true"][role="textbox"]';
export const TIKTOK_CAPTION_SELECTOR = 'div[contenteditable="true"][role="textbox"], textarea[placeholder*="caption" i], textarea';
export const YOUTUBE_SHORTS_DETAILS_SELECTOR = '#textbox[contenteditable="true"], div[contenteditable="true"][aria-label*="title" i], textarea';
export const GENERIC_MEDIA_INPUT_SELECTOR = 'input[type="file"]';

export const PLATFORM_BROWSER_ADAPTERS = Object.freeze({
  x: {
    platform: "x",
    label: "X",
    stageMode: "assisted",
    composeUrl: "https://x.com/compose/post",
    composerSelector: X_COMPOSER_SELECTOR,
    mediaInputSelector: X_MEDIA_INPUT_SELECTOR,
    supportsTextInsert: true,
    supportsMediaPicker: true,
    mediaRequired: false,
    proofTarget: "Composer or posted tweet URL",
    manualFinish: "Review the composer, confirm media, then post manually.",
    note: "X has the proven assisted composer adapter.",
  },
  instagram: manualAdapter("instagram", "Instagram", {
    composeUrl: "https://www.instagram.com/",
    candidateComposerSelector: INSTAGRAM_CAPTION_SELECTOR,
    candidateMediaInputSelector: GENERIC_MEDIA_INPUT_SELECTOR,
    mediaRequired: true,
    proofTarget: "Composer screenshot or published post URL",
    manualFinish: "Open Create, attach the image or video, review crop/caption, then publish manually.",
  }),
  tiktok: manualAdapter("tiktok", "TikTok", {
    composeUrl: "https://www.tiktok.com/upload",
    candidateComposerSelector: TIKTOK_CAPTION_SELECTOR,
    candidateMediaInputSelector: GENERIC_MEDIA_INPUT_SELECTOR,
    mediaRequired: true,
    proofTarget: "Upload screen or published video URL",
    manualFinish: "Upload video media, verify caption and cover, then publish manually.",
  }),
  linkedin: manualAdapter("linkedin", "LinkedIn", {
    composeUrl: "https://www.linkedin.com/feed/",
    candidateComposerSelector: LINKEDIN_COMPOSER_SELECTOR,
    candidateMediaInputSelector: GENERIC_MEDIA_INPUT_SELECTOR,
    mediaRequired: false,
    proofTarget: "Composer screenshot or published post URL",
    manualFinish: "Start a post, paste the copied draft, review formatting/link preview, then publish manually.",
  }),
  "youtube-shorts": manualAdapter("youtube-shorts", "YouTube Shorts", {
    composeUrl: "https://studio.youtube.com/",
    candidateComposerSelector: YOUTUBE_SHORTS_DETAILS_SELECTOR,
    candidateMediaInputSelector: GENERIC_MEDIA_INPUT_SELECTOR,
    mediaRequired: true,
    proofTarget: "Upload details screen or published Short URL",
    manualFinish: "Upload short-form video, complete title/details, confirm checks, then publish manually.",
  }),
  facebook: manualAdapter("facebook", "Facebook", {
    composeUrl: "https://www.facebook.com/",
    candidateComposerSelector: FACEBOOK_COMPOSER_SELECTOR,
    candidateMediaInputSelector: GENERIC_MEDIA_INPUT_SELECTOR,
    mediaRequired: false,
    proofTarget: "Page composer screenshot or published post URL",
    manualFinish: "Confirm the correct page/profile, paste the draft, attach media if needed, then publish manually.",
  }),
  reddit: {
    platform: "reddit",
    label: "Reddit",
    stageMode: "monitoring_only",
    composeUrl: "https://www.reddit.com/",
    supportsTextInsert: false,
    supportsMediaPicker: false,
    mediaRequired: false,
    proofTarget: "Manual subreddit workflow note",
    manualFinish: "Reddit is monitoring-only until a subreddit posting workflow is configured.",
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
    mediaRequired: false,
    proofTarget: "Manual proof",
    manualFinish: "No staging workflow exists yet; handle this platform manually.",
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

export function platformHasCandidateComposerAdapter(platform) {
  const adapter = getPlatformBrowserAdapter(platform);
  return Boolean(adapter.candidateComposerSelector);
}

export function platformHasCandidateMediaAdapter(platform) {
  const adapter = getPlatformBrowserAdapter(platform);
  return Boolean(adapter.candidateMediaInputSelector);
}

export function buildCandidateComposerScript(text, platform = "x") {
  const adapter = getPlatformBrowserAdapter(platform);
  const selector = adapter.composerSelector || adapter.candidateComposerSelector;
  if (!selector) return buildUnsupportedScript(`${adapter.label} does not have a candidate composer selector yet`);
  return buildInsertContentEditableScript(selector, text);
}

export function buildCandidateMediaPickerScript(platform = "x") {
  const adapter = getPlatformBrowserAdapter(platform);
  const selector = adapter.mediaInputSelector || adapter.candidateMediaInputSelector;
  if (!selector) return buildUnsupportedScript(`${adapter.label} does not have a candidate media selector yet`);
  return buildClickFileInputScript(selector);
}

export function buildOpenMediaPickerScript(platform = "x") {
  const adapter = getPlatformBrowserAdapter(platform);
  if (!adapter.mediaInputSelector) return buildUnsupportedScript(`${adapter.label} does not have an assisted media picker selector yet`);
  return buildClickFileInputScript(adapter.mediaInputSelector);
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

export function platformStagingPlan(platform, input = {}) {
  const adapter = getPlatformBrowserAdapter(platform);
  const hasMedia = Array.isArray(input.media) && input.media.length > 0;
  const blockers = [];
  if (adapter.stageMode === "unsupported") blockers.push("No platform adapter exists.");
  if (adapter.stageMode === "monitoring_only") blockers.push(`${adapter.label} is monitoring-only.`);
  if (adapter.mediaRequired && !hasMedia) blockers.push(`${adapter.label} requires media or a manual upload before publishing.`);
  return {
    platform: adapter.platform,
    label: adapter.label,
    stageMode: adapter.stageMode,
    composeUrl: adapter.composeUrl || "",
    supportsTextInsert: Boolean(adapter.supportsTextInsert),
    supportsMediaPicker: Boolean(adapter.supportsMediaPicker),
    candidateTextInsert: Boolean(adapter.candidateComposerSelector),
    candidateMediaPicker: Boolean(adapter.candidateMediaInputSelector),
    mediaRequired: Boolean(adapter.mediaRequired),
    mediaState: hasMedia ? "attached" : adapter.mediaRequired ? "required" : "optional",
    proofTarget: adapter.proofTarget || "Manual proof",
    manualFinish: adapter.manualFinish || adapter.note || "Review the visible composer before publishing.",
    note: adapter.note || "",
    blockers,
  };
}

function manualAdapter(platform, label, options = {}) {
  return {
    platform,
    label,
    stageMode: "manual",
    composeUrl: options.composeUrl || "",
    supportsTextInsert: false,
    supportsMediaPicker: false,
    candidateComposerSelector: options.candidateComposerSelector || "",
    candidateMediaInputSelector: options.candidateMediaInputSelector || "",
    mediaRequired: Boolean(options.mediaRequired),
    proofTarget: options.proofTarget || "Manual proof",
    manualFinish: options.manualFinish || `Paste the copied draft into ${label}, complete any platform checks, then publish manually.`,
    note: `${label} opens in the visible browser and uses clipboard/manual staging until selectors are proven.`,
  };
}

function buildClickFileInputScript(selector) {
  return `
    (() => {
      const input = document.querySelector(${JSON.stringify(selector)});
      if (!input) return { ok: false, reason: "media input selector missing" };
      input.click();
      return { ok: true, reason: "platform file picker opened" };
    })();
  `;
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
