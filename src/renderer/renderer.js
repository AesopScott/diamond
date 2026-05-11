import {
  approvalLevelForText,
  browserProfilePath,
  canStageDraft,
  createPostDraft,
  createSeedWorkspace,
  createTenantContext,
} from "../index.js";

const state = await loadInitialState();
let activeMode = "draft_only";
let activeDraft = null;
let media = [];

const els = {
  company: document.querySelector("#company-select"),
  brand: document.querySelector("#brand-select"),
  campaign: document.querySelector("#campaign-select"),
  account: document.querySelector("#account-select"),
  activeTarget: document.querySelector("#active-target"),
  targetStatus: document.querySelector("#target-status"),
  draftText: document.querySelector("#draft-text"),
  riskCard: document.querySelector("#risk-card"),
  validationList: document.querySelector("#validation-list"),
  webview: document.querySelector("#social-webview"),
  browserTabs: document.querySelector("#browser-tabs"),
  mediaRow: document.querySelector("#media-row"),
  runLog: document.querySelector("#run-log"),
};

hydrate();
render();

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
    runLog: [],
  };
}

function hydrate() {
  fillSelect(els.company, state.companies);
  fillSelect(els.brand, state.brands);
  fillSelect(els.campaign, state.campaigns);
  fillSelect(els.account, state.socialAccounts, (account) => `${account.platform.toUpperCase()} / ${account.id}`);
  els.draftText.value = "Join the free World Cup league, make your picks, and see where your country lands on the board.";
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
  renderValidation(context);
  renderBrowserTabs();
  renderMedia();
  renderRiskCard();
}

function renderValidation(context) {
  const items = [
    ["Company selected", Boolean(context.companyId)],
    ["Brand selected", Boolean(context.brandId)],
    ["Social account selected", Boolean(context.socialAccountId)],
    ["Browser profile isolated", browserProfilePath(context).includes(context.companyId)],
    ["Auto-publish locked until signoff", activeMode !== "auto_publish"],
  ];

  els.validationList.innerHTML = "";
  items.forEach(([label, ok]) => {
    const li = document.createElement("li");
    li.className = ok ? "ok" : "warn";
    li.textContent = `${ok ? "OK" : "Review"} - ${label}`;
    els.validationList.append(li);
  });
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
  els.webview.partition = `persist:${browserProfilePath(context).replace(/[^a-z0-9-]+/g, "-")}`;
  if (els.webview.getURL?.() !== account.accountUrl) {
    els.webview.src = account.accountUrl || "about:blank";
  }
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
  activeDraft.status = "approved";
  activeDraft.updatedAt = new Date().toISOString();
  log("Draft approved for staging.");
  renderRiskCard();
}

function stageDraft() {
  if (!activeDraft) evaluateDraft();
  const check = canStageDraft(activeDraft);
  if (!check.ok) {
    log(`Staging refused: ${check.reason}.`);
    renderRiskCard();
    return;
  }

  log("Staging handoff ready. Browser is visible; manual paste/upload remains required in this slice.");
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

  const check = canStageDraft(activeDraft);
  els.riskCard.className = `risk-card ${activeDraft.approvalLevel === "auto_allowed" ? "good" : check.ok ? "warn" : "bad"}`;
  els.riskCard.textContent = `Draft ${activeDraft.id}: ${activeDraft.approvalLevel}. Status: ${activeDraft.status}. ${activeDraft.riskFlags.length ? `Flags: ${activeDraft.riskFlags.join(", ")}. ` : ""}${check.reason}.`;
}

function log(message) {
  const time = new Date().toLocaleTimeString();
  const div = document.createElement("div");
  div.textContent = `[${time}] ${message}`;
  els.runLog.prepend(div);
}
