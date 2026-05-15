import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getPlatformBrowserAdapter } from "./platform-browser-adapter.js";
import { browserProfilePath } from "./tenant-context.js";

export function buildPlaywrightProfilePath(rootDir, context = {}) {
  return path.join(rootDir, "browser-profiles", "playwright", browserProfilePath(context).replace(/[\\/]+/g, path.sep));
}

export function validatePlaywrightStageInput(input = {}) {
  const context = input.context || {};
  const account = input.account || {};
  const adapter = getPlatformBrowserAdapter(account.platform || context.platform);
  const media = Array.isArray(input.media) ? input.media : [];
  const missing = [
    ["company", context.companyId],
    ["brand", context.brandId],
    ["campaign", context.campaignId],
    ["platform", context.platform],
    ["social account", context.socialAccountId],
    ["browser profile", context.browserProfileId || account.browserProfileId],
    ["compose URL", input.composeUrl || account.composeUrl],
    ["draft text", input.text],
  ].filter(([, value]) => !value);

  if (missing.length) return { ok: false, reason: `Missing ${missing.map(([label]) => label).join(", ")}.` };
  const composerSelector = adapter.composerSelector || (input.allowCandidateAdapters ? adapter.candidateComposerSelector : "");
  const mediaInputSelector = adapter.mediaInputSelector || (input.allowCandidateAdapters ? adapter.candidateMediaInputSelector : "");
  if (adapter.stageMode !== "assisted" && !input.allowCandidateAdapters) return { ok: false, reason: `${adapter.label} does not have a proven Playwright staging adapter yet.` };
  if (!composerSelector) return { ok: false, reason: `${adapter.label} is missing a composer selector.` };
  if (media.length && !mediaInputSelector) return { ok: false, reason: `${adapter.label} is missing a media input selector.` };
  const missingMedia = media.filter((file) => !fs.existsSync(file));
  if (missingMedia.length) return { ok: false, reason: `Media file not found: ${missingMedia[0]}` };
  return { ok: true, reason: "Playwright stage input is valid." };
}

export async function stagePostWithPlaywright(input = {}, driver) {
  const validation = validatePlaywrightStageInput(input);
  if (!validation.ok) return workerResult({ ok: false, status: "blocked", reason: validation.reason });

  const adapter = getPlatformBrowserAdapter(input.account?.platform || input.context?.platform);
  const rootDir = input.appDir || process.cwd();
  const profilePath = input.profilePath || buildPlaywrightProfilePath(rootDir, {
    ...input.context,
    browserProfileId: input.context?.browserProfileId || input.account?.browserProfileId,
  });
  const screenshotsDir = input.screenshotsDir || path.join(rootDir, "screenshots");
  fs.mkdirSync(profilePath, { recursive: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const browserDriver = driver || await loadPlaywrightDriver();
  const context = await browserDriver.launchPersistentContext(profilePath, {
    headless: Boolean(input.headless),
    channel: input.channel || undefined,
    viewport: input.viewport || { width: 1440, height: 1100 },
    args: ["--disable-blink-features=AutomationControlled"],
  });

  try {
    const page = await resolveWorkerPage(context);
    const composeUrl = input.composeUrl || input.account.composeUrl;
    await page.goto(composeUrl, { waitUntil: "domcontentloaded", timeout: input.timeoutMs || 45000 });

    const composerSelector = adapter.composerSelector || (input.allowCandidateAdapters ? adapter.candidateComposerSelector : "");
    const mediaInputSelector = adapter.mediaInputSelector || (input.allowCandidateAdapters ? adapter.candidateMediaInputSelector : "");
    const fillResult = await fillComposer(page, composerSelector, input.text, input.timeoutMs);
    const mediaResult = input.media?.length
      ? await attachMedia(page, mediaInputSelector, input.media, input.timeoutMs)
      : { ok: true, reason: "No media selected." };
    const screenshotPath = await captureWorkerScreenshot(page, screenshotsDir, input.screenshotName);

    return workerResult({
      ok: fillResult.ok && mediaResult.ok,
      status: fillResult.ok && mediaResult.ok ? "staged" : "needs_manual_finish",
      reason: [fillResult.reason, mediaResult.reason].filter(Boolean).join(" "),
      fillResult,
      mediaResult,
      screenshotPath,
      currentUrl: typeof page.url === "function" ? page.url() : composeUrl,
      profilePath,
      candidateAdapter: adapter.stageMode !== "assisted",
    });
  } catch (error) {
    return workerResult({ ok: false, status: "needs_manual_finish", reason: error.message || "Playwright staging failed.", profilePath });
  } finally {
    if (!input.keepOpen && typeof context.close === "function") {
      await context.close();
    }
  }
}

async function loadPlaywrightDriver() {
  const { chromium } = await import("playwright");
  return chromium;
}

async function resolveWorkerPage(context) {
  if (typeof context.pages === "function") {
    const pages = context.pages();
    if (pages.length) return pages[0];
  }
  if (typeof context.newPage === "function") return context.newPage();
  throw new Error("Playwright context did not expose a page.");
}

async function fillComposer(page, selector, text, timeoutMs = 45000) {
  const editor = page.locator(selector).first();
  await editor.waitFor({ state: "visible", timeout: timeoutMs });
  await editor.click();
  await editor.fill(String(text || ""));
  const value = await editor.innerText().catch(() => "");
  const needle = String(text || "").slice(0, Math.min(24, String(text || "").length));
  const ok = value.includes(needle);
  return { ok, reason: ok ? "Composer text inserted by Playwright worker." : "Composer text was not confirmed after worker insert." };
}

async function attachMedia(page, selector, media = [], timeoutMs = 45000) {
  const input = page.locator(selector).first();
  await input.waitFor({ state: "attached", timeout: timeoutMs });
  await input.setInputFiles(media);
  return { ok: true, reason: `Attached ${media.length} media file(s) by Playwright worker.` };
}

async function captureWorkerScreenshot(page, screenshotsDir, name) {
  const safeName = String(name || `playwright-stage-${Date.now()}`).replace(/[^a-z0-9_.-]+/gi, "-");
  const target = path.join(screenshotsDir, safeName.endsWith(".png") ? safeName : `${safeName}.png`);
  await page.screenshot({ path: target, fullPage: true });
  return target;
}

function workerResult(input) {
  return {
    ok: Boolean(input.ok),
    status: input.status || (input.ok ? "staged" : "needs_manual_finish"),
    reason: input.reason || "",
    fillResult: input.fillResult || { ok: false, reason: input.reason || "" },
    mediaResult: input.mediaResult || { ok: false, reason: input.reason || "" },
    screenshotPath: input.screenshotPath || "",
    currentUrl: input.currentUrl || "",
    profilePath: input.profilePath || "",
    profileUrl: input.profilePath ? pathToFileURL(input.profilePath).href : "",
    candidateAdapter: Boolean(input.candidateAdapter),
  };
}
