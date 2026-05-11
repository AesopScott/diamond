import {
  approvalLevelForText,
  browserProfilePath,
  canStageDraft,
  createPostDraft,
  createSeedWorkspace,
  createTenantContext,
  getSessionForContext,
  inferSessionStatusFromUrl,
  normalizeAccountUrl,
  normalizeBrowserProfileId,
  normalizeComposeUrl,
  normalizeHost,
  normalizeLoginUrl,
  resolveComposeUrl,
  resolveLoginUrl,
  migrateWorkspaceState,
  upsertSessionForContext,
  validateSessionForStaging,
} from "../index.js";

const state = await loadInitialState();
let activeMode = state.context?.postingMode || "stage_for_review";
let activeDraft = null;
let lastStageMessage = null;
let media = [];
let browserZoom = Number(state.browserZoom || 0.85);

const els = {
  company: document.querySelector("#company-select"),
  brand: document.querySelector("#brand-select"),
  campaign: document.querySelector("#campaign-select"),
  account: document.querySelector("#account-select"),
  accountHandle: document.querySelector("#account-handle"),
  accountUrl: document.querySelector("#account-url"),
  accountLoginUrl: document.querySelector("#account-login-url"),
  accountComposeUrl: document.querySelector("#account-compose-url"),
  accountHost: document.querySelector("#account-host"),
  accountProfile: document.querySelector("#account-profile"),
  activeTarget: document.querySelector("#active-target"),
  targetStatus: document.querySelector("#target-status"),
  draftText: document.querySelector("#draft-text"),
  riskCard: document.querySelector("#risk-card"),
  validationList: document.querySelector("#validation-list"),
  webview: document.querySelector("#social-webview"),
  browserShell: document.querySelector(".browser-shell"),
  browserTabs: document.querySelector("#browser-tabs"),
  mediaRow: document.querySelector("#media-row"),
  runLog: document.querySelector("#run-log"),
  runHistory: document.querySelector("#run-history"),
  draftHistory: document.querySelector("#draft-history"),
  scheduleCalendar: document.querySelector("#schedule-calendar"),
  sessionCard: document.querySelector("#session-card"),
  sessionStatus: document.querySelector("#session-status"),
  sessionNote: document.querySelector("#session-note"),
};

hydrate();
render();
window.addEventListener("resize", () => requestAnimationFrame(sizeWebviewToShell));
const browserResizeObserver = new ResizeObserver(() => requestAnimationFrame(sizeWebviewToShell));
browserResizeObserver.observe(els.browserShell);

document.querySelector("#save-state").addEventListener("click", async () => {
  await window.diamond.saveState(state);
  log("State saved.");
});

document.querySelectorAll(".mode").forEach((button) => {
  button.addEventListener("click", () => {
    activeMode = button.dataset.mode;
    document.querySelectorAll(".mode").forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
});

document.querySelector("#evaluate-draft").addEventListener("click", evaluateDraft);
document.querySelector("#approve-draft").addEventListener("click", approveDraft);
document.querySelector("#stage-draft").addEventListener("click", stageDraft);
document.querySelector("#assist-media").addEventListener("click", assistMediaUpload);
document.querySelector("#capture-run").addEventListener("click", captureCurrentRun);
document.querySelector("#schedule-draft").addEventListener("click", scheduleActiveDraft);
document.querySelector("#mark-posted").addEventListener("click", markActiveRunPosted);
document.querySelector("#mark-abandoned").addEventListener("click", markActiveRunAbandoned);
document.querySelector("#save-account").addEventListener("click", saveAccountSettings);
document.querySelector("#open-account").addEventListener("click", openActiveAccount);
document.querySelector("#open-login").addEventListener("click", openLogin);
document.querySelector("#focus-browser").addEventListener("click", () => setBrowserFocus(true));
document.querySelector("#exit-focus").addEventListener("click", () => setBrowserFocus(false));
document.querySelector("#fit-browser").addEventListener("click", refreshGuestBounds);
document.querySelector("#zoom-out").addEventListener("click", () => adjustBrowserZoom(-0.1));
document.querySelector("#zoom-in").addEventListener("click", () => adjustBrowserZoom(0.1));
document.querySelector("#check-session").addEventListener("click", checkSession);
document.querySelector("#mark-ready").addEventListener("click", markSessionReady);
document.querySelector("#reload-webview").addEventListener("click", () => els.webview.reload());
document.querySelector("#clear-log").addEventListener("click", () => { els.runLog.innerHTML = ""; });
els.runHistory.addEventListener("click", handleRunHistoryClick);
els.draftHistory.addEventListener("click", handleDraftHistoryClick);
els.scheduleCalendar.addEventListener("click", handleScheduleClick);
document.querySelector("#pick-media").addEventListener("click", async () => {
  media = await window.diamond.pickMedia();
  if (activeDraft) {
    activeDraft.media = media;
    activeDraft.updatedAt = new Date().toISOString();
  }
  renderMedia();
});

[els.company, els.brand, els.campaign, els.account].forEach((select) => {
  select.addEventListener("change", () => {
    activeDraft = null;
    render();
  });
});

async function loadInitialState() {
  const saved = await window.diamond.getState();
  if (saved) {
    const migrated = migrateWorkspaceState(saved);
    if (migrated !== saved) await window.diamond.saveState(migrated);
    return migrated;
  }
  const seed = createSeedWorkspace();
  return {
    ...seed,
    drafts: [],
    postRuns: [],
    scheduledPosts: [],
    sessions: {},
    runLog: [],
  };
}

function hydrate() {
  fillSelect(els.company, state.companies);
  fillSelect(els.brand, state.brands);
  fillSelect(els.campaign, state.campaigns);
  fillSelect(els.account, state.socialAccounts, (account) => `${account.platform.toUpperCase()} / ${account.id}`);
  els.draftText.value = "Join the free World Cup league, make your picks, and see where your country lands on the board.";
  syncModeButtons();
}

function fillSelect(select, rows, labeler = (row) => row.name || row.id) {
  select.innerHTML = "";
  rows.forEach((row) => {
    const option = document.createElement("option");
    option.value = row.id;
    option.textContent = labeler(row);
    select.append(option);
  });
}

function getActiveRows() {
  const company = state.companies.find((row) => row.id === els.company.value) || state.companies[0];
  const brand = state.brands.find((row) => row.id === els.brand.value) || state.brands[0];
  const campaign = state.campaigns.find((row) => row.id === els.campaign.value) || state.campaigns[0];
  const account = state.socialAccounts.find((row) => row.id === els.account.value) || state.socialAccounts[0];
  const policy = state.approvalPolicies.find((row) => row.id === company.defaultApprovalPolicyId) || state.approvalPolicies[0];
  return { company, brand, campaign, account, policy };
}

function getContext() {
  const { company, brand, campaign, account, policy } = getActiveRows();
  return createTenantContext({
    companyId: company.id,
    brandId: brand.id,
    platform: account.platform,
    socialAccountId: account.id,
    campaignId: campaign.id,
    approvalPolicyId: policy.id,
    browserProfileId: account.browserProfileId,
    postingMode: activeMode,
  });
}

function render() {
  const { company, brand, campaign, account } = getActiveRows();
  const context = getContext();
  els.activeTarget.textContent = `${company.name} / ${brand.name} / ${campaign.name} / ${account.platform.toUpperCase()}`;
  els.targetStatus.textContent = activeMode === "auto_publish" ? "Auto locked" : "Fail closed";
  renderAccountSettings(account);
  renderValidation(context);
  renderSession(context);
  renderBrowserTabs();
  renderMedia();
  renderRiskCard();
  renderRunHistory();
  renderDraftHistory();
  renderScheduleCalendar();
  syncModeButtons();
  requestAnimationFrame(sizeWebviewToShell);
}

function renderAccountSettings(account) {
  if (document.activeElement && ["account-handle", "account-url", "account-login-url", "account-compose-url", "account-host", "account-profile"].includes(document.activeElement.id)) {
    return;
  }
  els.accountHandle.value = account.handle || "";
  els.accountUrl.value = account.accountUrl || "";
  els.accountLoginUrl.value = account.loginUrl || resolveLoginUrl(account);
  els.accountComposeUrl.value = account.composeUrl || resolveComposeUrl(account);
  els.accountHost.value = account.expectedHost || "";
  els.accountProfile.value = account.browserProfileId || "";
}

function renderValidation(context) {
  const session = getActiveSession();
  const sessionCheck = validateSessionForStaging(session, context);
  const { account } = getActiveRows();
  const items = [
    ["Company selected", Boolean(context.companyId)],
    ["Brand selected", Boolean(context.brandId)],
    ["Social account selected", Boolean(context.socialAccountId)],
    ["Account URL configured", Boolean(account.accountUrl)],
    ["Expected host configured", Boolean(account.expectedHost)],
    ["Browser profile isolated", browserProfilePath(context).includes(context.companyId)],
    ["Auto-publish locked until signoff", activeMode !== "auto_publish"],
    ["Browser session ready", sessionCheck.ok],
  ];

  els.validationList.innerHTML = "";
  items.forEach(([label, ok]) => {
    const li = document.createElement("li");
    li.className = ok ? "ok" : "warn";
    li.textContent = `${ok ? "OK" : "Review"} - ${label}`;
    els.validationList.append(li);
  });
}

async function saveAccountSettings() {
  const { account } = getActiveRows();
  const previousProfile = account.browserProfileId;
  account.handle = els.accountHandle.value.trim();
  account.accountUrl = normalizeAccountUrl(els.accountUrl.value.trim(), account.platform);
  account.loginUrl = normalizeLoginUrl(els.accountLoginUrl.value.trim(), account.platform);
  account.composeUrl = normalizeComposeUrl(els.accountComposeUrl.value.trim(), account.platform);
  account.expectedHost = normalizeHost(els.accountHost.value.trim() || account.accountUrl);
  account.browserProfileId = normalizeBrowserProfileId(els.accountProfile.value.trim() || `${account.companyId}-${account.brandId}-${account.platform}-${account.id}`);

  if (previousProfile !== account.browserProfileId) {
    activeDraft = null;
    saveActiveSession({
      status: "unknown",
      currentUrl: null,
      lastReadyAt: null,
      note: "Browser profile changed. Please log in or check the session again.",
    });
  }

  await window.diamond.saveState(state);
  log(`Account settings saved for ${account.platform}/${account.id}.`);
  render();
}

function getActiveSession() {
  state.sessions ||= {};
  return getSessionForContext(state.sessions, getContext());
}

function saveActiveSession(patch) {
  state.sessions ||= {};
  const context = getContext();
  state.sessions = upsertSessionForContext(state.sessions, context, patch);
  return getSessionForContext(state.sessions, context);
}

function renderSession(context) {
  const session = getActiveSession();
  els.sessionCard.className = `session-card ${session.status}`;
  els.sessionStatus.textContent = session.status.replace(/_/g, " ");
  els.sessionNote.textContent = `${session.note} Profile: ${browserProfilePath(context)}`;
}

function renderBrowserTabs() {
  const accounts = state.socialAccounts.filter((account) => account.brandId === els.brand.value);
  els.browserTabs.innerHTML = "";
  accounts.forEach((account) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = account.platform.toUpperCase();
    button.className = account.id === els.account.value ? "active" : "";
    button.addEventListener("click", () => {
      els.account.value = account.id;
      render();
    });
    els.browserTabs.append(button);
  });

  const { account } = getActiveRows();
  const context = getContext();
  const partition = `persist:${browserProfilePath(context).replace(/[^a-z0-9-]+/g, "-")}`;
  if (els.webview.getAttribute("partition") !== partition) {
    replaceWebview(partition, account.accountUrl || "about:blank");
    return;
  }
  if (els.webview.getURL?.() !== account.accountUrl) {
    els.webview.src = account.accountUrl || "about:blank";
  }
}

function replaceWebview(partition, src) {
  const next = document.createElement("webview");
  next.id = "social-webview";
  next.setAttribute("partition", partition);
  next.setAttribute("src", src);
  next.setAttribute("allowpopups", "");
  next.style.width = "100%";
  next.style.height = "100%";
  els.webview.replaceWith(next);
  els.webview = next;
  wireWebviewEvents(next);
  requestAnimationFrame(sizeWebviewToShell);
  setTimeout(sizeWebviewToShell, 250);
}

function openActiveAccount() {
  const { account } = getActiveRows();
  if (!account.accountUrl) {
    log("Open refused: account URL is not configured.");
    return;
  }
  els.webview.src = account.accountUrl || "about:blank";
  log(`Opened ${account.platform.toUpperCase()} account target.`);
}

function openLogin() {
  const { account } = getActiveRows();
  const loginUrl = resolveLoginUrl(account);
  if (!loginUrl) {
    log("Open login refused: login URL is not configured.");
    return;
  }
  els.webview.src = loginUrl;
  log(`Opened ${account.platform.toUpperCase()} login flow.`);
}

function inferAndSaveSession() {
  const { account } = getActiveRows();
  const currentUrl = typeof els.webview.getURL === "function" ? els.webview.getURL() : els.webview.src;
  const inferred = inferSessionStatusFromUrl(currentUrl, account);
  return saveActiveSession({
    status: inferred.status,
    currentUrl,
    note: inferred.note,
  });
}

function checkSession() {
  const session = inferAndSaveSession();
  log(`Session check: ${session.status} - ${session.note}`);
  render();
}

function markSessionReady() {
  const currentUrl = typeof els.webview.getURL === "function" ? els.webview.getURL() : els.webview.src;
  const session = saveActiveSession({
    status: "ready",
    currentUrl,
    note: "Manually marked ready after account/login review.",
  });
  log(`Session marked ready for ${session.context.platform}/${session.context.socialAccountId}.`);
  render();
}

function renderMedia() {
  els.mediaRow.innerHTML = "";
  if (!media.length) {
    els.mediaRow.textContent = "No media selected.";
    return;
  }
  media.forEach((file) => {
    const div = document.createElement("div");
    div.className = "media-item";
    const name = document.createElement("span");
    name.textContent = file.split(/[\\/]/).pop() || file;
    name.title = file;
    const badge = document.createElement("strong");
    badge.textContent = file.split(".").pop()?.toUpperCase() || "FILE";
    div.append(name, badge);
    els.mediaRow.append(div);
  });
}

function evaluateDraft() {
  const { policy } = getActiveRows();
  lastStageMessage = null;
  activeDraft = createPostDraft({
    context: getContext(),
    text: els.draftText.value,
    media,
    approvalPolicy: policy,
  });
  state.drafts.unshift(activeDraft);
  log(`Draft evaluated: ${activeDraft.approvalLevel}${activeDraft.riskFlags.length ? ` (${activeDraft.riskFlags.join(", ")})` : ""}.`);
  renderRiskCard();
  renderDraftHistory();
}

function approveDraft() {
  if (!activeDraft) evaluateDraft();
  if (activeDraft.status === "blocked") {
    log("Cannot approve blocked draft.");
    return;
  }
  lastStageMessage = null;
  activeDraft.status = "approved";
  activeDraft.updatedAt = new Date().toISOString();
  log("Draft approved for staging.");
  renderRiskCard();
  renderDraftHistory();
}

async function stageDraft() {
  if (!activeDraft) evaluateDraft();
  const session = inferAndSaveSession();
  const sessionCheck = validateSessionForStaging(session, getContext());
  const check = canStageDraft(activeDraft, { sessionCheck });
  if (!check.ok) {
    lastStageMessage = check.reason;
    log(`Staging refused: ${check.reason}.`);
    renderRiskCard();
    return;
  }

  const { account } = getActiveRows();
  const composeUrl = resolveComposeUrl(account);
  lastStageMessage = null;
  await window.diamond.writeClipboard(activeDraft.text);
  activeDraft.status = "staged";
  activeDraft.stagedAt = new Date().toISOString();
  activeDraft.updatedAt = activeDraft.stagedAt;
  activeDraft.stageUrl = composeUrl;
  activeDraft.media = media;
  await window.diamond.saveState(state);
  els.webview.src = composeUrl;
  const fillResult = await fillComposerText(activeDraft.text);
  const mediaResult = media.length ? await prepareMediaUpload() : { ok: true, reason: "No media selected." };
  await capturePostRun({
    status: fillResult.ok && mediaResult.ok ? "staged" : "needs_manual_finish",
    note: buildStageNote(fillResult, mediaResult),
  });
  log(fillResult.ok
    ? `Draft copied to clipboard, X compose opened, and text inserted. ${media.length ? `${media.length} media file path(s) copied for upload. ` : ""}Review it, attach media if needed, then publish manually.`
    : `Draft copied to clipboard and X compose opened. Auto-fill did not complete: ${fillResult.reason}. Paste manually if needed.`);
  renderRiskCard();
  renderDraftHistory();
}

async function assistMediaUpload() {
  const result = await prepareMediaUpload();
  log(result.ok ? result.reason : `Media upload helper could not finish: ${result.reason}.`);
}

async function prepareMediaUpload() {
  if (!media.length) return { ok: false, reason: "No media selected." };
  await window.diamond.writeClipboard(media.join("\n"));
  const picker = await openPlatformMediaPicker();
  const reason = picker.ok
    ? `Copied ${media.length} media path(s) and opened the platform file picker.`
    : `Copied ${media.length} media path(s). ${picker.reason}`;
  return { ok: picker.ok, reason };
}

function buildStageNote(fillResult, mediaResult) {
  const textNote = fillResult.ok ? "Composer text inserted." : `Composer text not inserted: ${fillResult.reason}.`;
  const mediaNote = media.length ? mediaResult.reason : "No media selected.";
  return `${textNote} ${mediaNote}`;
}

async function captureCurrentRun() {
  if (!activeDraft) {
    log("Capture refused: evaluate or stage a draft first.");
    return;
  }
  const run = await capturePostRun({ status: "manual_capture", note: "Manual run capture." });
  log(`Run captured: ${run.id}${run.screenshotPath ? ` screenshot=${run.screenshotPath}` : ""}.`);
  renderRiskCard();
}

async function scheduleActiveDraft() {
  if (!activeDraft) {
    log("Schedule refused: evaluate or load a draft first.");
    return;
  }
  if (!["approved", "staged", "posted"].includes(activeDraft.status)) {
    log("Schedule refused: approve the draft before scheduling.");
    return;
  }

  const defaultDate = new Date(Date.now() + 60 * 60 * 1000);
  const dateTime = prompt("Schedule date/time", toDatetimeLocal(defaultDate));
  if (!dateTime) return;
  const scheduledAt = new Date(dateTime);
  if (Number.isNaN(scheduledAt.getTime())) {
    log("Schedule refused: invalid date/time.");
    return;
  }

  const schedule = {
    id: `scheduled-${Date.now()}`,
    draftId: activeDraft.id,
    context: getContext(),
    status: "scheduled",
    scheduledAt: scheduledAt.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "local",
    text: activeDraft.text,
    media: [...(activeDraft.media || media)],
    createdAt: new Date().toISOString(),
  };
  state.scheduledPosts ||= [];
  state.scheduledPosts.unshift(schedule);
  activeDraft.status = "scheduled";
  activeDraft.scheduledPostId = schedule.id;
  activeDraft.scheduledAt = schedule.scheduledAt;
  activeDraft.updatedAt = schedule.createdAt;
  await window.diamond.saveState(state);
  renderRiskCard();
  renderDraftHistory();
  renderScheduleCalendar();
  log(`Scheduled draft ${activeDraft.id} for ${formatScheduleTime(schedule.scheduledAt)}.`);
}

async function markActiveRunPosted() {
  const run = getActiveRun();
  if (!run) {
    log("Mark posted refused: no active run. Stage or capture a run first.");
    return;
  }
  const currentUrl = typeof els.webview.getURL === "function" ? els.webview.getURL() : els.webview.src;
  run.status = "posted";
  run.postUrl = currentUrl;
  run.platformUrl = currentUrl;
  run.postedAt = new Date().toISOString();
  run.note = "Operator marked this run as posted after manual publish.";
  run.screenshotPath = await captureBrowserScreenshot(`${run.id}-posted`) || run.screenshotPath;
  if (activeDraft) {
    activeDraft.status = "posted";
    activeDraft.postUrl = currentUrl;
    activeDraft.updatedAt = run.postedAt;
  }
  await window.diamond.saveState(state);
  renderRunHistory();
  renderRiskCard();
  renderDraftHistory();
  log(`Run marked posted: ${run.id}.`);
}

async function markActiveRunAbandoned() {
  const run = getActiveRun();
  if (!run) {
    log("Mark abandoned refused: no active run. Stage or capture a run first.");
    return;
  }
  run.status = "abandoned";
  run.abandonedAt = new Date().toISOString();
  run.note = "Operator marked this run as not posted.";
  if (activeDraft && activeDraft.lastRunId === run.id) {
    activeDraft.status = "approved";
    activeDraft.updatedAt = run.abandonedAt;
  }
  await window.diamond.saveState(state);
  renderRunHistory();
  renderRiskCard();
  renderDraftHistory();
  log(`Run marked abandoned: ${run.id}.`);
}

function getActiveRun() {
  if (activeDraft?.lastRunId) {
    return (state.postRuns || []).find((run) => run.id === activeDraft.lastRunId) || null;
  }
  return (state.postRuns || [])[0] || null;
}

async function capturePostRun({ status, note }) {
  state.postRuns ||= [];
  const context = getContext();
  const currentUrl = typeof els.webview.getURL === "function" ? els.webview.getURL() : els.webview.src;
  const runId = `run-${Date.now()}`;
  const screenshotPath = await captureBrowserScreenshot(runId);
  const run = {
    id: runId,
    draftId: activeDraft.id,
    context,
    status,
    note,
    text: activeDraft.text,
    media: [...(activeDraft.media || media)],
    platformUrl: currentUrl,
    screenshotPath,
    createdAt: new Date().toISOString(),
  };
  state.postRuns.unshift(run);
  activeDraft.lastRunId = run.id;
  activeDraft.screenshotPath = screenshotPath;
  await window.diamond.saveState(state);
  renderRunHistory();
  return run;
}

async function captureBrowserScreenshot(runId) {
  if (typeof els.webview.capturePage !== "function") return null;
  try {
    const image = await els.webview.capturePage();
    return window.diamond.saveScreenshot({
      name: `${runId}-${getContext().platform}-${getContext().socialAccountId}.png`,
      dataUrl: image.toDataURL(),
    });
  } catch (error) {
    log(`Screenshot capture failed: ${error.message || "unknown error"}.`);
    return null;
  }
}

function renderRiskCard() {
  if (!activeDraft) {
    const { policy } = getActiveRows();
    const evaluation = approvalLevelForText(els.draftText.value, policy);
    els.riskCard.className = `risk-card ${evaluation.level === "auto_allowed" ? "good" : "warn"}`;
    els.riskCard.textContent = `Live precheck: ${evaluation.level}. ${evaluation.flags.length ? `Flags: ${evaluation.flags.join(", ")}.` : "No risk flags."}`;
    return;
  }

  const sessionCheck = validateSessionForStaging(getActiveSession(), getContext());
  const stageCheck = canStageDraft(activeDraft, { sessionCheck });
  const flags = activeDraft.riskFlags.length ? ` Flags: ${activeDraft.riskFlags.join(", ")}.` : "";
  const summary = `Draft ${activeDraft.id}: ${activeDraft.approvalLevel}. Status: ${activeDraft.status}.${flags}`;

  if (lastStageMessage) {
    els.riskCard.className = "risk-card bad";
    els.riskCard.textContent = `${summary} Staging blocked: ${lastStageMessage}.`;
    return;
  }

  if (activeDraft.status === "staged") {
    els.riskCard.className = stageCheck.ok ? "risk-card good" : "risk-card warn";
    els.riskCard.textContent = `${summary} Copied to clipboard and opened in the browser.`;
    return;
  }

  if (activeDraft.status === "posted") {
    els.riskCard.className = "risk-card good";
    els.riskCard.textContent = `${summary} Posted URL: ${activeDraft.postUrl || "captured in run history"}.`;
    return;
  }

  if (activeDraft.status === "scheduled") {
    els.riskCard.className = "risk-card good";
    els.riskCard.textContent = `${summary} Scheduled for ${formatScheduleTime(activeDraft.scheduledAt)}.`;
    return;
  }

  els.riskCard.className = activeDraft.approvalLevel === "auto_allowed" ? "risk-card good" : "risk-card warn";
  els.riskCard.textContent = `${summary} ${activeDraft.approvalLevel === "review_required" && activeDraft.status !== "approved" ? "Approval required before staging." : "Draft is ready for approval or staging."}`;
}

function renderRunHistory() {
  const runs = state.postRuns || [];
  els.runHistory.innerHTML = "";
  if (!runs.length) {
    const empty = document.createElement("div");
    empty.className = "run-history-empty";
    empty.textContent = "No post runs captured yet.";
    els.runHistory.append(empty);
    return;
  }

  runs.slice(0, 8).forEach((run) => {
    const item = document.createElement("article");
    item.className = `run-item ${run.status || ""}`;
    const created = run.createdAt ? new Date(run.createdAt).toLocaleString() : "Unknown time";
    item.innerHTML = `
      <header>
        <strong>${run.status}</strong>
        <span class="session-label">${created}</span>
      </header>
      <p>${run.note || "No note."}</p>
      <p>${run.media?.length || 0} media file(s) - ${run.postUrl || run.platformUrl || "No platform URL"}</p>
      <div class="run-actions">
        <button type="button" data-run-action="copy-url" data-run-id="${run.id}">Copy URL</button>
        <button type="button" data-run-action="copy-shot" data-run-id="${run.id}">Copy screenshot</button>
        <button type="button" data-run-action="copy-media" data-run-id="${run.id}">Copy media</button>
      </div>
    `;
    els.runHistory.append(item);
  });
}

function renderDraftHistory() {
  const drafts = draftsForActiveContext();
  els.draftHistory.innerHTML = "";
  if (!drafts.length) {
    const empty = document.createElement("div");
    empty.className = "draft-history-empty";
    empty.textContent = "No drafts in this queue yet.";
    els.draftHistory.append(empty);
    return;
  }

  drafts.slice(0, 10).forEach((draft) => {
    const item = document.createElement("article");
    item.className = `draft-item ${activeDraft?.id === draft.id ? "active" : ""}`;
    const created = draft.createdAt ? new Date(draft.createdAt).toLocaleString() : "Unknown time";
    const preview = draft.text.length > 140 ? `${draft.text.slice(0, 140)}...` : draft.text;
    item.innerHTML = `
      <header>
        <strong>${draft.status}</strong>
        <span class="session-label">${created}</span>
      </header>
      <p>${preview}</p>
      <p>${draft.approvalLevel}${draft.riskFlags?.length ? ` - ${draft.riskFlags.join(", ")}` : ""}</p>
      <div class="draft-history-actions">
        <button type="button" data-draft-action="load" data-draft-id="${draft.id}">Load</button>
        <button type="button" data-draft-action="copy" data-draft-id="${draft.id}">Copy text</button>
        <button type="button" data-draft-action="remove" data-draft-id="${draft.id}">Remove</button>
      </div>
    `;
    els.draftHistory.append(item);
  });
}

function renderScheduleCalendar() {
  const schedules = schedulesForActiveContext()
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  els.scheduleCalendar.innerHTML = "";
  if (!schedules.length) {
    const empty = document.createElement("div");
    empty.className = "schedule-empty";
    empty.textContent = "No scheduled posts yet.";
    els.scheduleCalendar.append(empty);
    return;
  }

  const groups = groupByDay(schedules);
  Object.entries(groups).forEach(([day, items]) => {
    const section = document.createElement("section");
    section.className = "schedule-day";
    const title = document.createElement("strong");
    title.textContent = day;
    section.append(title);
    items.forEach((item) => {
      const div = document.createElement("article");
      div.className = "schedule-item";
      const preview = item.text.length > 120 ? `${item.text.slice(0, 120)}...` : item.text;
      div.innerHTML = `
        <header>
          <strong>${new Date(item.scheduledAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</strong>
          <span class="session-label">${item.status}</span>
        </header>
        <p>${preview}</p>
        <p>${item.context.platform.toUpperCase()} / ${item.context.socialAccountId} / ${item.timezone}</p>
        <div class="draft-history-actions">
          <button type="button" data-schedule-action="load" data-schedule-id="${item.id}">Load draft</button>
          <button type="button" data-schedule-action="cancel" data-schedule-id="${item.id}">Cancel</button>
        </div>
      `;
      section.append(div);
    });
    els.scheduleCalendar.append(section);
  });
}

function schedulesForActiveContext() {
  const context = getContext();
  return (state.scheduledPosts || []).filter((item) => item.status !== "canceled" && contextsEqual(item.context, context));
}

function groupByDay(items) {
  return items.reduce((groups, item) => {
    const key = new Date(item.scheduledAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    groups[key] ||= [];
    groups[key].push(item);
    return groups;
  }, {});
}

async function handleScheduleClick(event) {
  const button = event.target.closest("button[data-schedule-action]");
  if (!button) return;
  const schedule = (state.scheduledPosts || []).find((item) => item.id === button.dataset.scheduleId);
  if (!schedule) return;

  if (button.dataset.scheduleAction === "load") {
    const draft = (state.drafts || []).find((item) => item.id === schedule.draftId);
    if (draft) loadDraft(draft);
  }
  if (button.dataset.scheduleAction === "cancel") {
    schedule.status = "canceled";
    schedule.canceledAt = new Date().toISOString();
    const draft = (state.drafts || []).find((item) => item.id === schedule.draftId);
    if (draft && draft.status === "scheduled") {
      draft.status = "approved";
      draft.updatedAt = schedule.canceledAt;
    }
    await window.diamond.saveState(state);
    renderDraftHistory();
    renderScheduleCalendar();
    log(`Canceled scheduled post ${schedule.id}.`);
  }
}

function draftsForActiveContext() {
  const context = getContext();
  return (state.drafts || []).filter((draft) => contextsEqual(draft.context, context));
}

function contextsEqual(left, right) {
  return left?.companyId === right.companyId
    && left?.brandId === right.brandId
    && left?.platform === right.platform
    && left?.socialAccountId === right.socialAccountId
    && left?.campaignId === right.campaignId;
}

async function handleDraftHistoryClick(event) {
  const button = event.target.closest("button[data-draft-action]");
  if (!button) return;
  const draft = (state.drafts || []).find((item) => item.id === button.dataset.draftId);
  if (!draft) return;

  if (button.dataset.draftAction === "load") {
    loadDraft(draft);
  }
  if (button.dataset.draftAction === "copy") {
    await window.diamond.writeClipboard(draft.text || "");
    log(`Copied draft text for ${draft.id}.`);
  }
  if (button.dataset.draftAction === "remove") {
    removeDraft(draft.id);
  }
}

function loadDraft(draft) {
  activeDraft = draft;
  lastStageMessage = null;
  media = Array.isArray(draft.media) ? [...draft.media] : [];
  els.draftText.value = draft.text || "";
  renderMedia();
  renderRiskCard();
  renderDraftHistory();
  log(`Loaded draft ${draft.id}.`);
}

async function removeDraft(draftId) {
  state.drafts = (state.drafts || []).filter((draft) => draft.id !== draftId);
  if (activeDraft?.id === draftId) {
    activeDraft = null;
    lastStageMessage = null;
  }
  await window.diamond.saveState(state);
  renderRiskCard();
  renderDraftHistory();
  log(`Removed draft ${draftId}.`);
}

async function handleRunHistoryClick(event) {
  const button = event.target.closest("button[data-run-action]");
  if (!button) return;
  const run = (state.postRuns || []).find((item) => item.id === button.dataset.runId);
  if (!run) return;

  if (button.dataset.runAction === "copy-url") {
    await window.diamond.writeClipboard(run.postUrl || run.platformUrl || "");
    log(`Copied run URL for ${run.id}.`);
  }
  if (button.dataset.runAction === "copy-shot") {
    await window.diamond.writeClipboard(run.screenshotPath || "");
    log(run.screenshotPath ? `Copied screenshot path for ${run.id}.` : `Run ${run.id} has no screenshot path.`);
  }
  if (button.dataset.runAction === "copy-media") {
    await window.diamond.writeClipboard((run.media || []).join("\n"));
    log(`Copied ${run.media?.length || 0} media path(s) for ${run.id}.`);
  }
}

function log(message) {
  const time = new Date().toLocaleTimeString();
  const div = document.createElement("div");
  div.textContent = `[${time}] ${message}`;
  els.runLog.prepend(div);
}

function syncModeButtons() {
  document.querySelectorAll(".mode").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === activeMode);
  });
}

function setBrowserFocus(focused) {
  document.body.classList.toggle("browser-focus", focused);
  document.querySelector("#focus-browser").classList.toggle("hidden", focused);
  document.querySelector("#exit-focus").classList.toggle("hidden", !focused);
  requestAnimationFrame(sizeWebviewToShell);
  setTimeout(sizeWebviewToShell, 120);
  setTimeout(refreshGuestBounds, 300);
  log(focused ? "Browser focus mode enabled." : "Browser focus mode closed.");
}

function wireWebviewEvents(webview) {
  webview.addEventListener("dom-ready", () => {
    applyBrowserZoom();
    sizeWebviewToShell();
  });
}

function applyBrowserZoom() {
  if (typeof els.webview.setZoomFactor === "function") {
    els.webview.setZoomFactor(browserZoom);
  }
}

async function adjustBrowserZoom(delta) {
  browserZoom = Math.min(1.4, Math.max(0.5, Number((browserZoom + delta).toFixed(2))));
  state.browserZoom = browserZoom;
  applyBrowserZoom();
  await window.diamond.saveState(state);
  log(`Browser zoom set to ${Math.round(browserZoom * 100)}%.`);
}

function sizeWebviewToShell() {
  const rect = els.browserShell.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width));
  const height = Math.max(320, Math.floor(rect.height));
  els.webview.style.minWidth = `${width}px`;
  els.webview.style.minHeight = `${height}px`;
  els.webview.style.width = `${width}px`;
  els.webview.style.height = `${height}px`;
  els.webview.setAttribute("width", String(width));
  els.webview.setAttribute("height", String(height));
  requestGuestLayout();
}

wireWebviewEvents(els.webview);

function requestGuestLayout() {
  if (typeof els.webview.executeJavaScript !== "function") return;
  els.webview.executeJavaScript(
    "window.dispatchEvent(new Event('resize')); document.documentElement.style.minHeight = '100vh'; document.body.style.minHeight = '100vh';",
  ).catch(() => {});
}

function refreshGuestBounds() {
  sizeWebviewToShell();
  const currentUrl = typeof els.webview.getURL === "function" ? els.webview.getURL() : els.webview.src;
  const partition = els.webview.getAttribute("partition");
  replaceWebview(partition, currentUrl || "about:blank");
  log("Browser surface refreshed at full size.");
}

async function fillComposerText(text) {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    await wait(500);
    const result = await insertTextIntoComposer(text);
    if (result.ok) return result;
  }
  return { ok: false, reason: "composer textbox was not ready" };
}

async function insertTextIntoComposer(text) {
  if (typeof els.webview.executeJavaScript !== "function") {
    return { ok: false, reason: "embedded browser does not support script execution" };
  }

  const script = `
    (() => {
      const text = ${JSON.stringify(text)};
      const editor = document.querySelector('[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]');
      if (!editor) return { ok: false, reason: "composer textbox was not found" };
      editor.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("selectAll", false, null);
      document.execCommand("insertText", false, text);
      editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
      const value = editor.innerText || editor.textContent || "";
      return { ok: value.includes(text.slice(0, Math.min(24, text.length))), reason: "composer text inserted" };
    })();
  `;

  try {
    return await els.webview.executeJavaScript(script);
  } catch (error) {
    return { ok: false, reason: error.message || "script execution failed" };
  }
}

async function openPlatformMediaPicker() {
  if (typeof els.webview.executeJavaScript !== "function") {
    return { ok: false, reason: "embedded browser does not support script execution" };
  }

  const script = `
    (() => {
      const input = document.querySelector('input[data-testid="fileInput"][type="file"], input[type="file"]');
      if (!input) return { ok: false, reason: "file input was not found" };
      input.click();
      return { ok: true, reason: "platform file picker opened" };
    })();
  `;

  try {
    return await els.webview.executeJavaScript(script);
  } catch (error) {
    return { ok: false, reason: error.message || "script execution failed" };
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toDatetimeLocal(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatScheduleTime(value) {
  return value ? new Date(value).toLocaleString() : "unknown time";
}
