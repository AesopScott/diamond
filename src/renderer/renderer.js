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
document.querySelector("#pick-media").addEventListener("click", async () => {
  media = await window.diamond.pickMedia();
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
  if (saved) return saved;
  const seed = createSeedWorkspace();
  return {
    ...seed,
    drafts: [],
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
    div.textContent = file;
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
  await window.diamond.saveState(state);
  els.webview.src = composeUrl;
  setBrowserFocus(true);
  log("Draft copied to clipboard and X compose opened. Paste the text, attach media if needed, then publish manually.");
  renderRiskCard();
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

  els.riskCard.className = activeDraft.approvalLevel === "auto_allowed" ? "risk-card good" : "risk-card warn";
  els.riskCard.textContent = `${summary} ${activeDraft.approvalLevel === "review_required" && activeDraft.status !== "approved" ? "Approval required before staging." : "Draft is ready for approval or staging."}`;
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
