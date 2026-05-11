import {
  approvalLevelForText,
  buildSlotDraftText,
  browserProfilePath,
  canStageDraft,
  createDefaultCadencePolicy,
  createDiamondLicense,
  createPostDraft,
  createSeedWorkspace,
  createTenantContext,
  createPostMemoryRecord,
  createPostMetrics,
  createInboxTriage,
  createReplyRoute,
  createResponseDraftForReply,
  createSocialReply,
  createBrandRecord,
  createCampaignRecord,
  createCompanyRecord,
  buildTourVoiceoverScript,
  createElevenLabsSpeechRequest,
  evaluateDraftQuality,
  evaluateDiamondAccess,
  ensurePlatformProofRecords,
  evaluatePlatformProof,
  getDiamondGuideSections,
  getDiamondTourSteps,
  getPlatformBrowserAdapter,
  getSessionForContext,
  inferSessionStatusFromUrl,
  normalizeAccountUrl,
  normalizeBrowserProfileId,
  normalizeComposeUrl,
  normalizeHost,
  normalizeLoginUrl,
  platformLabel,
  markPlatformProof,
  resolveComposeUrl,
  resolveLoginUrl,
  isMonitoringOnlyPlatform,
  PLATFORMS,
  summarizePostMetrics,
  classifySocialReply,
  migrateWorkspaceState,
  insertPlatformComposerText,
  openPlatformMediaPicker,
  platformProofId,
  buildGeneratedAssetRecord,
  renderWorldCupAssetSvg,
  buildFirestoreSyncBundle,
  summarizeFirestoreSyncBundle,
  upsertSessionForContext,
  validateCadenceForStaging,
  validateAssetForUse,
  validateSessionForStaging,
  validateTemplateForRender,
} from "../index.js";

const state = await loadInitialState();
let activeMode = state.context?.postingMode || "stage_for_review";
let activeDraft = null;
let packageFilter = "active";
let slotFilter = "active";
let assetFilter = "usable";
let scheduleScope = "target";
let scheduleStatusFilter = "open";
let selectedScheduleId = null;
let selectedSlotId = null;
let lastStageMessage = null;
let media = [];
let browserZoom = Number(state.browserZoom || 0.85);
let activeTourIndex = 0;
let activeTourTarget = null;
let voiceoverStatus = { configured: false, files: [] };
let tourAudio = null;
const guideSections = getDiamondGuideSections();
const tourSteps = getDiamondTourSteps();

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
  cadenceMaxPosts: document.querySelector("#cadence-max-posts"),
  cadenceMaxReplies: document.querySelector("#cadence-max-replies"),
  cadenceQuietStart: document.querySelector("#cadence-quiet-start"),
  cadenceQuietEnd: document.querySelector("#cadence-quiet-end"),
  cadenceCooldown: document.querySelector("#cadence-cooldown"),
  cadenceDuplicateDays: document.querySelector("#cadence-duplicate-days"),
  cadenceDoNotEngage: document.querySelector("#cadence-do-not-engage"),
  cadenceEscalation: document.querySelector("#cadence-escalation"),
  brandVoice: document.querySelector("#brand-voice"),
  approvedPhrases: document.querySelector("#approved-phrases"),
  bannedPhrases: document.querySelector("#banned-phrases"),
  reviewClaims: document.querySelector("#review-claims"),
  blockedClaims: document.querySelector("#blocked-claims"),
  prizeLanguage: document.querySelector("#prize-language"),
  freePlayLanguage: document.querySelector("#free-play-language"),
  strategyGoals: document.querySelector("#strategy-goals"),
  strategyAudience: document.querySelector("#strategy-audience"),
  strategyPillars: document.querySelector("#strategy-pillars"),
  strategyCta: document.querySelector("#strategy-cta"),
  strategyCtaEs: document.querySelector("#strategy-cta-es"),
  strategyOffer: document.querySelector("#strategy-offer"),
  strategyOfferEs: document.querySelector("#strategy-offer-es"),
  strategyReferences: document.querySelector("#strategy-references"),
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
  replyAuthor: document.querySelector("#reply-author"),
  replyUrl: document.querySelector("#reply-url"),
  replyOwner: document.querySelector("#reply-owner"),
  replyNotes: document.querySelector("#reply-notes"),
  replyText: document.querySelector("#reply-text"),
  replyResponse: document.querySelector("#reply-response"),
  replyInbox: document.querySelector("#reply-inbox"),
  routineRuns: document.querySelector("#routine-runs"),
  platformProofList: document.querySelector("#platform-proof-list"),
  assetPath: document.querySelector("#asset-path"),
  assetType: document.querySelector("#asset-type"),
  assetLanguage: document.querySelector("#asset-language"),
  assetPlatform: document.querySelector("#asset-platform"),
  assetAlt: document.querySelector("#asset-alt"),
  assetSafeZone: document.querySelector("#asset-safe-zone"),
  assetNotes: document.querySelector("#asset-notes"),
  assetDoNotUse: document.querySelector("#asset-do-not-use"),
  assetFilters: document.querySelector("#asset-filters"),
  assetLibrary: document.querySelector("#asset-library"),
  slotTopic: document.querySelector("#slot-topic"),
  slotTime: document.querySelector("#slot-time"),
  slotLanguage: document.querySelector("#slot-language"),
  slotAsset: document.querySelector("#slot-asset"),
  slotDeadline: document.querySelector("#slot-deadline"),
  slotFilters: document.querySelector("#slot-filters"),
  editorialSlots: document.querySelector("#editorial-slots"),
  draftHistory: document.querySelector("#draft-history"),
  packageFilters: document.querySelector("#package-filters"),
  scheduleScope: document.querySelector("#schedule-scope"),
  scheduleStatusFilter: document.querySelector("#schedule-status-filter"),
  scheduleDetail: document.querySelector("#schedule-detail"),
  scheduleCalendar: document.querySelector("#schedule-calendar"),
  guideContent: document.querySelector("#guide-content"),
  tourLayer: document.querySelector("#tour-layer"),
  tourPopover: document.querySelector("#tour-popover"),
  tourProgress: document.querySelector("#tour-progress"),
  tourTitle: document.querySelector("#tour-title"),
  tourBody: document.querySelector("#tour-body"),
  tourVoice: document.querySelector("#tour-voice"),
  sessionCard: document.querySelector("#session-card"),
  sessionStatus: document.querySelector("#session-status"),
  sessionNote: document.querySelector("#session-note"),
  firebaseStatus: document.querySelector("#firebase-status"),
  firebaseNote: document.querySelector("#firebase-note"),
  licenseStatus: document.querySelector("#license-status"),
  licenseNote: document.querySelector("#license-note"),
};

hydrate();
await refreshVoiceoverStatus();
render();
window.addEventListener("resize", () => requestAnimationFrame(sizeWebviewToShell));
const browserResizeObserver = new ResizeObserver(() => requestAnimationFrame(sizeWebviewToShell));
browserResizeObserver.observe(els.browserShell);

document.querySelector("#save-state").addEventListener("click", async () => {
  await window.diamond.saveState(state);
  log("State saved.");
});
document.querySelector("#add-company").addEventListener("click", addCompany);
document.querySelector("#add-brand").addEventListener("click", addBrand);

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
document.querySelector("#capture-reply").addEventListener("click", captureReply);
document.querySelector("#save-account").addEventListener("click", saveAccountSettings);
document.querySelector("#save-cadence").addEventListener("click", saveCadencePolicy);
document.querySelector("#save-brand-rules").addEventListener("click", saveBrandRules);
document.querySelector("#save-strategy").addEventListener("click", saveStrategy);
document.querySelector("#add-editorial-slot").addEventListener("click", addEditorialSlot);
document.querySelector("#generate-next-slot").addEventListener("click", generateFromNextSlot);
document.querySelector("#run-due-slots").addEventListener("click", runDueSlots);
document.querySelector("#add-asset").addEventListener("click", addAsset);
document.querySelector("#generate-asset").addEventListener("click", generateAssetFromTemplate);
document.querySelector("#jump-user-guide").addEventListener("click", () => scrollPanelIntoView("#user-guide-panel"));
document.querySelector("#start-tour").addEventListener("click", startGuideTour);
document.querySelector("#guide-start-tour").addEventListener("click", startGuideTour);
document.querySelector("#generate-tour-voiceovers").addEventListener("click", generateTourVoiceovers);
document.querySelector("#copy-tour-script").addEventListener("click", copyTourVoiceoverScript);
document.querySelector("#copy-elevenlabs-request").addEventListener("click", copyElevenLabsRequest);
document.querySelector("#tour-play-voiceover").addEventListener("click", playTourVoiceover);
document.querySelector("#tour-prev").addEventListener("click", () => moveTour(-1));
document.querySelector("#tour-next").addEventListener("click", () => moveTour(1));
document.querySelector("#tour-close").addEventListener("click", closeGuideTour);
document.querySelector("#jump-editorial-calendar").addEventListener("click", () => scrollPanelIntoView("#editorial-calendar-panel"));
document.querySelector("#jump-schedule-calendar").addEventListener("click", () => scrollPanelIntoView("#schedule-calendar-panel"));
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
document.querySelector("#check-firebase").addEventListener("click", checkFirebaseAdmin);
document.querySelector("#export-sync-bundle").addEventListener("click", exportFirestoreSyncBundle);
document.querySelector("#check-license").addEventListener("click", () => checkLicense(false));
els.runHistory.addEventListener("click", handleRunHistoryClick);
els.replyInbox.addEventListener("click", handleReplyInboxClick);
els.editorialSlots.addEventListener("click", handleSlotClick);
els.slotFilters.addEventListener("click", handleSlotFilterClick);
els.assetFilters.addEventListener("click", handleAssetFilterClick);
els.assetLibrary.addEventListener("click", handleAssetClick);
els.draftHistory.addEventListener("click", handleDraftHistoryClick);
els.packageFilters.addEventListener("click", handlePackageFilterClick);
els.scheduleScope.addEventListener("click", handleScheduleScopeClick);
els.scheduleStatusFilter.addEventListener("change", () => {
  scheduleStatusFilter = els.scheduleStatusFilter.value;
  renderScheduleCalendar();
});
els.scheduleCalendar.addEventListener("click", handleScheduleClick);
els.scheduleDetail.addEventListener("click", handleScheduleClick);
els.platformProofList.addEventListener("click", handlePlatformProofClick);
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
    if (select === els.company || select === els.brand) hydrateDependentSelectors();
    render();
  });
});

async function loadInitialState() {
  const saved = await window.diamond.getState();
  if (saved) {
    const migrated = migrateWorkspaceState(saved);
    const hydrated = ensureWorkspaceData(migrated);
    if (hydrated !== saved) await window.diamond.saveState(hydrated);
    return hydrated;
  }
  const seed = createSeedWorkspace();
  return {
    ...seed,
    drafts: [],
    postRuns: [],
    postMemory: [],
    socialReplies: [],
    socialResponseDrafts: [],
    licenseCache: createLocalDevLicense(seed.context),
    scheduledPosts: [],
    editorialSlots: seed.editorialSlots || [],
    contentStrategies: seed.contentStrategies || [],
    routineRuns: [],
    sessions: {},
    runLog: [],
  };
}

function ensureWorkspaceData(workspace) {
  const seed = createSeedWorkspace();
  const next = structuredClone(workspace);
  let changed = false;
  next.brandLibraries ||= [];
  next.claimLibraries ||= [];
  next.contentStrategies ||= [];
  next.cadencePolicies ||= [];
  next.editorialSlots ||= [];
  next.assetLibrary ||= [];
  next.socialTemplates ||= [];
  next.postMemory ||= [];
  next.socialReplies ||= [];
  next.socialResponseDrafts ||= [];
  next.platformProofs ||= [];
  next.licenseCache ||= createLocalDevLicense(next.context || seed.context);
  seed.brandLibraries.forEach((library) => {
    if (!next.brandLibraries.some((row) => row.companyId === library.companyId && row.brandId === library.brandId)) {
      next.brandLibraries.push(library);
      changed = true;
    }
  });
  seed.socialAccounts.forEach((account) => {
    if (!next.socialAccounts.some((row) => row.companyId === account.companyId && row.brandId === account.brandId && row.platform === account.platform && row.id === account.id)) {
      next.socialAccounts.push(account);
      changed = true;
    }
  });
  seed.claimLibraries.forEach((library) => {
    if (!next.claimLibraries.some((row) => row.companyId === library.companyId && row.brandId === library.brandId)) {
      next.claimLibraries.push(library);
      changed = true;
    }
  });
  seed.contentStrategies.forEach((strategy) => {
    if (!next.contentStrategies.some((row) => row.companyId === strategy.companyId && row.brandId === strategy.brandId && row.campaignId === strategy.campaignId)) {
      next.contentStrategies.push(strategy);
      changed = true;
    }
  });
  seed.cadencePolicies.forEach((policy) => {
    if (!next.cadencePolicies.some((row) => row.companyId === policy.companyId && row.brandId === policy.brandId && row.campaignId === policy.campaignId)) {
      next.cadencePolicies.push(policy);
      changed = true;
    }
  });
  seed.editorialSlots.forEach((slot) => {
    if (!next.editorialSlots.some((row) => row.id === slot.id)) {
      next.editorialSlots.push(slot);
      changed = true;
    }
  });
  seed.assetLibrary.forEach((asset) => {
    if (!next.assetLibrary.some((row) => row.id === asset.id)) {
      next.assetLibrary.push(asset);
      changed = true;
    }
  });
  seed.socialTemplates.forEach((template) => {
    if (!next.socialTemplates.some((row) => row.id === template.id)) {
      next.socialTemplates.push(template);
      changed = true;
    }
  });
  const withProofs = ensurePlatformProofRecords(next);
  if ((withProofs.platformProofs || []).length !== (next.platformProofs || []).length) {
    next.platformProofs = withProofs.platformProofs;
    changed = true;
  }
  return changed ? next : workspace;
}

function hydrate() {
  const selectedCompany = state.context?.companyId;
  fillSelect(els.company, state.companies);
  setSelectIfPresent(els.company, selectedCompany);
  hydrateDependentSelectors();
  fillPlatformSelect(els.assetPlatform);
  els.draftText.value = "Join the free World Cup league, make your picks, and see where your country lands on the board.";
  syncModeButtons();
}

function hydrateDependentSelectors() {
  const companyId = els.company.value || state.context?.companyId || state.companies[0]?.id;
  const selectedBrand = state.context?.companyId === companyId ? state.context?.brandId : els.brand.value;
  const brands = state.brands.filter((brand) => !companyId || brand.companyId === companyId);
  fillSelect(els.brand, brands.length ? brands : state.brands);
  setSelectIfPresent(els.brand, selectedBrand);
  const brandId = els.brand.value || brands[0]?.id;
  const selectedCampaign = state.context?.companyId === companyId && state.context?.brandId === brandId ? state.context?.campaignId : els.campaign.value;
  const campaigns = state.campaigns.filter((campaign) => (!companyId || campaign.companyId === companyId) && (!brandId || campaign.brandId === brandId));
  fillSelect(els.campaign, campaigns.length ? campaigns : state.campaigns);
  setSelectIfPresent(els.campaign, selectedCampaign);
  const selectedAccount = state.context?.companyId === companyId && state.context?.brandId === brandId ? state.context?.socialAccountId : els.account.value;
  const accounts = state.socialAccounts.filter((account) => (!companyId || account.companyId === companyId) && (!brandId || account.brandId === brandId));
  fillSelect(els.account, accounts.length ? accounts : state.socialAccounts, (account) => `${platformLabel(account.platform)} / ${account.id}`);
  setSelectIfPresent(els.account, selectedAccount);
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

function fillPlatformSelect(select) {
  select.innerHTML = "";
  PLATFORMS.forEach((platform) => {
    const option = document.createElement("option");
    option.value = platform;
    option.textContent = platformLabel(platform);
    select.append(option);
  });
}

async function addCompany() {
  const name = prompt("Company name", "");
  if (name === null) return;
  const company = createCompanyRecord({
    name,
    defaultApprovalPolicyId: `${normalizeBrowserProfileId(name)}-default-risk-review`,
  });
  if (state.companies.some((row) => row.id === company.id)) {
    log(`Company already exists: ${company.name}.`);
    setSelectIfPresent(els.company, company.id);
    hydrateDependentSelectors();
    render();
    return;
  }
  state.companies.push(company);
  state.approvalPolicies ||= [];
  state.approvalPolicies.push({
    id: company.defaultApprovalPolicyId,
    companyId: company.id,
    reviewRequiredFlags: ["money", "prize", "gambling", "regulatory", "legal", "equity", "investment", "support_sensitive", "hostile"],
    blockedFlags: [],
  });
  await window.diamond.saveState(state);
  fillSelect(els.company, state.companies);
  els.company.value = company.id;
  hydrateDependentSelectors();
  log(`Company created: ${company.name}. Add a brand next.`);
  render();
}

async function addBrand() {
  const company = state.companies.find((row) => row.id === els.company.value) || state.companies[0];
  if (!company) {
    log("Add brand refused: create a company first.");
    return;
  }
  const name = prompt("Brand name", "");
  if (name === null) return;
  const brand = createBrandRecord({ name, companyId: company.id, languages: ["en", "es"] });
  if (state.brands.some((row) => row.companyId === company.id && row.id === brand.id)) {
    log(`Brand already exists: ${brand.name}.`);
    setSelectIfPresent(els.brand, brand.id);
    hydrateDependentSelectors();
    render();
    return;
  }
  const campaign = createCampaignRecord({ name: "General", companyId: company.id, brandId: brand.id });
  const account = {
    id: `${brand.id}-x-main`,
    companyId: company.id,
    brandId: brand.id,
    platform: "x",
    accountUrl: normalizeAccountUrl("", "x"),
    loginUrl: normalizeLoginUrl("", "x"),
    composeUrl: normalizeComposeUrl("", "x"),
    expectedHost: normalizeHost("https://x.com/"),
    sessionStatus: "unknown",
    browserProfileId: normalizeBrowserProfileId(`${company.id}-${brand.id}-x-main`),
  };
  state.brands.push(brand);
  state.campaigns.push(campaign);
  state.socialAccounts.push(account);
  state.platformProofs ||= [];
  state.platformProofs.push(createPlatformProofForAccount(account));
  await window.diamond.saveState(state);
  setSelectIfPresent(els.company, company.id);
  hydrateDependentSelectors();
  setSelectIfPresent(els.brand, brand.id);
  hydrateDependentSelectors();
  setSelectIfPresent(els.campaign, campaign.id);
  setSelectIfPresent(els.account, account.id);
  log(`Brand created: ${brand.name}. A General campaign and X account shell were added.`);
  render();
}

function getActiveRows() {
  const company = state.companies.find((row) => row.id === els.company.value) || state.companies[0];
  const brand = state.brands.find((row) => row.id === els.brand.value) || state.brands[0];
  const campaign = state.campaigns.find((row) => row.id === els.campaign.value) || state.campaigns[0];
  const account = state.socialAccounts.find((row) => row.id === els.account.value) || state.socialAccounts[0];
  const policy = state.approvalPolicies.find((row) => row.id === company.defaultApprovalPolicyId) || state.approvalPolicies[0];
  const brandLibrary = getBrandLibrary(company.id, brand.id);
  const claimLibrary = getClaimLibrary(company.id, brand.id);
  const strategy = getContentStrategy(company.id, brand.id, campaign.id);
  const cadencePolicy = getCadencePolicy(company.id, brand.id, campaign.id);
  return { company, brand, campaign, account, policy, brandLibrary, claimLibrary, strategy, cadencePolicy };
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
  els.activeTarget.textContent = `${company.name} / ${brand.name} / ${campaign.name} / ${platformLabel(account.platform)}`;
  els.targetStatus.textContent = activeMode === "auto_publish" ? "Auto locked" : "Fail closed";
  renderAccountSettings(account);
  renderCadencePolicy();
  renderBrandRules();
  renderStrategy();
  renderValidation(context);
  renderSession(context);
  renderBrowserTabs();
  renderMedia();
  renderRiskCard();
  renderRunHistory();
  renderReplyInbox();
  renderRoutineRuns();
  renderPlatformProofs();
  renderAssetFilters();
  renderAssetLibrary();
  renderSlotFilters();
  renderEditorialSlots();
  renderDraftHistory();
  renderPackageFilters();
  renderScheduleCalendar();
  renderUserGuide();
  syncModeButtons();
  requestAnimationFrame(sizeWebviewToShell);
}

function renderUserGuide() {
  els.guideContent.innerHTML = `
    <div class="guide-grid">
      ${guideSections.map((section) => `
        <article class="guide-card" id="guide-${escapeHtml(section.id)}">
          <h3>${escapeHtml(section.title)}</h3>
          <p>${escapeHtml(section.summary)}</p>
          <ol>
            ${section.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
          </ol>
        </article>
      `).join("")}
    </div>
    <div class="tour-step-list">
      ${tourSteps.map((step) => `
        <button type="button" data-tour-step="${step.order - 1}">
          <span>${step.order}</span>
          ${escapeHtml(step.title)}
        </button>
      `).join("")}
    </div>
  `;
  els.guideContent.querySelectorAll("[data-tour-step]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTourIndex = Number(button.dataset.tourStep || 0);
      showTourStep();
    });
  });
}

function startGuideTour() {
  activeTourIndex = 0;
  showTourStep();
}

function showTourStep() {
  const step = tourSteps[activeTourIndex];
  if (!step) return closeGuideTour();
  clearTourHighlight();
  els.tourLayer.classList.remove("hidden");
  els.tourProgress.textContent = `Step ${activeTourIndex + 1} of ${tourSteps.length}`;
  els.tourTitle.textContent = step.title;
  els.tourBody.textContent = step.voiceoverText;
  els.tourVoice.textContent = "Voiceover: " + step.voiceoverText;
  document.querySelector("#tour-prev").disabled = activeTourIndex === 0;
  document.querySelector("#tour-next").textContent = activeTourIndex === tourSteps.length - 1 ? "Done" : "Next";
  const audio = audioForTourStep(step);
  document.querySelector("#tour-play-voiceover").disabled = !audio;
  document.querySelector("#tour-play-voiceover").textContent = audio ? "Play voiceover" : "No audio yet";

  const target = document.querySelector(step.targetSelector);
  activeTourTarget = target;
  if (target) {
    target.classList.add("tour-highlight");
    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  }
  requestAnimationFrame(() => placeTourPopover(target));
}

function placeTourPopover(target) {
  if (!target) {
    els.tourPopover.style.left = "24px";
    els.tourPopover.style.top = "24px";
    return;
  }
  const rect = target.getBoundingClientRect();
  const popoverRect = els.tourPopover.getBoundingClientRect();
  const gap = 14;
  const left = Math.min(
    window.innerWidth - popoverRect.width - gap,
    Math.max(gap, rect.left + Math.min(40, rect.width / 4)),
  );
  const belowTop = rect.bottom + gap;
  const aboveTop = rect.top - popoverRect.height - gap;
  const top = belowTop + popoverRect.height < window.innerHeight
    ? belowTop
    : Math.max(gap, aboveTop);
  els.tourPopover.style.left = `${left}px`;
  els.tourPopover.style.top = `${top}px`;
}

function moveTour(delta) {
  if (activeTourIndex === tourSteps.length - 1 && delta > 0) {
    closeGuideTour();
    return;
  }
  activeTourIndex = Math.min(tourSteps.length - 1, Math.max(0, activeTourIndex + delta));
  showTourStep();
}

function closeGuideTour() {
  clearTourHighlight();
  els.tourLayer.classList.add("hidden");
}

function clearTourHighlight() {
  if (activeTourTarget) activeTourTarget.classList.remove("tour-highlight");
  activeTourTarget = null;
}

async function copyTourVoiceoverScript() {
  await window.diamond.writeClipboard(buildTourVoiceoverScript(tourSteps));
  log("Copied tour voiceover script.");
}

async function copyElevenLabsRequest() {
  const request = createElevenLabsSpeechRequest({
    voiceId: "REPLACE_WITH_ELEVENLABS_VOICE_ID",
    text: buildTourVoiceoverScript(tourSteps),
  });
  await window.diamond.writeClipboard(JSON.stringify(request, null, 2));
  log("Copied ElevenLabs request template. Add a real voice ID and keep the API key outside the renderer.");
}

async function refreshVoiceoverStatus() {
  if (!window.diamond.getVoiceoverStatus) return;
  voiceoverStatus = await window.diamond.getVoiceoverStatus();
}

async function generateTourVoiceovers() {
  if (!window.diamond.generateTourVoiceovers) {
    log("Voiceover generation is not available in this build.");
    return;
  }
  log("Generating tour voiceovers with ElevenLabs.");
  const result = await window.diamond.generateTourVoiceovers({ steps: tourSteps });
  voiceoverStatus = { ...(voiceoverStatus || {}), files: result.files || [] };
  if (!result.ok) {
    log(`Voiceover generation failed: ${result.reason}`);
    return;
  }
  log(`Generated ${result.written?.length || 0} tour voiceover file(s).`);
  if (!els.tourLayer.classList.contains("hidden")) showTourStep();
}

function audioForTourStep(step) {
  const prefix = `${String(step.order).padStart(2, "0")}-${step.id}`;
  return (voiceoverStatus.files || []).find((file) => file.name?.startsWith(prefix));
}

async function playTourVoiceover() {
  const step = tourSteps[activeTourIndex];
  const audioFile = audioForTourStep(step);
  if (!audioFile?.url) {
    log(`No generated voiceover found for step ${activeTourIndex + 1}.`);
    return;
  }
  if (tourAudio) {
    tourAudio.pause();
    tourAudio = null;
  }
  tourAudio = new Audio(audioFile.url);
  await tourAudio.play();
}

function getBrandLibrary(companyId, brandId) {
  state.brandLibraries ||= [];
  let library = state.brandLibraries.find((row) => row.companyId === companyId && row.brandId === brandId);
  if (!library) {
    library = {
      id: `${companyId}-${brandId}-brand-library`,
      companyId,
      brandId,
      voice: "",
      approvedPhrases: [],
      bannedPhrases: [],
      links: [],
      identityRules: [],
    };
    state.brandLibraries.push(library);
  }
  return library;
}

function getClaimLibrary(companyId, brandId) {
  state.claimLibraries ||= [];
  let library = state.claimLibraries.find((row) => row.companyId === companyId && row.brandId === brandId);
  if (!library) {
    library = {
      id: `${companyId}-${brandId}-claim-library`,
      companyId,
      brandId,
      prizeLanguage: [],
      freeToPlayLanguage: [],
      requiresReviewClaims: [],
      blockedClaims: [],
    };
    state.claimLibraries.push(library);
  }
  return library;
}

function getContentStrategy(companyId, brandId, campaignId) {
  state.contentStrategies ||= [];
  let strategy = state.contentStrategies.find((row) => row.companyId === companyId && row.brandId === brandId && row.campaignId === campaignId);
  if (!strategy) {
    strategy = {
      id: `${companyId}-${brandId}-${campaignId}-strategy`,
      companyId,
      brandId,
      campaignId,
      goals: [],
      audience: [],
      pillars: [],
      cta: "",
      ctaEs: "",
      offer: "",
      offerEs: "",
      referenceAccounts: [],
    };
    state.contentStrategies.push(strategy);
  }
  return strategy;
}

function getCadencePolicy(companyId, brandId, campaignId) {
  state.cadencePolicies ||= [];
  let policy = state.cadencePolicies.find((row) => row.companyId === companyId && row.brandId === brandId && row.campaignId === campaignId);
  if (!policy) {
    policy = createDefaultCadencePolicy({ companyId, brandId, campaignId });
    state.cadencePolicies.push(policy);
  }
  return policy;
}

function renderBrandRules() {
  if (document.activeElement && [
    "brand-voice",
    "approved-phrases",
    "banned-phrases",
    "review-claims",
    "blocked-claims",
    "prize-language",
    "free-play-language",
  ].includes(document.activeElement.id)) {
    return;
  }
  const { brandLibrary, claimLibrary } = getActiveRows();
  els.brandVoice.value = brandLibrary.voice || "";
  els.approvedPhrases.value = linesFor(brandLibrary.approvedPhrases);
  els.bannedPhrases.value = linesFor(brandLibrary.bannedPhrases);
  els.reviewClaims.value = linesFor(claimLibrary.requiresReviewClaims);
  els.blockedClaims.value = linesFor(claimLibrary.blockedClaims);
  els.prizeLanguage.value = linesFor(claimLibrary.prizeLanguage);
  els.freePlayLanguage.value = linesFor(claimLibrary.freeToPlayLanguage);
}

function renderStrategy() {
  if (document.activeElement && [
    "strategy-goals",
    "strategy-audience",
    "strategy-pillars",
    "strategy-cta",
    "strategy-cta-es",
    "strategy-offer",
    "strategy-offer-es",
    "strategy-references",
  ].includes(document.activeElement.id)) {
    return;
  }
  const { strategy } = getActiveRows();
  els.strategyGoals.value = linesFor(strategy.goals);
  els.strategyAudience.value = linesFor(strategy.audience);
  els.strategyPillars.value = linesFor(strategy.pillars);
  els.strategyCta.value = strategy.cta || "";
  els.strategyCtaEs.value = strategy.ctaEs || "";
  els.strategyOffer.value = strategy.offer || "";
  els.strategyOfferEs.value = strategy.offerEs || "";
  els.strategyReferences.value = linesFor(strategy.referenceAccounts);
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

function renderCadencePolicy() {
  if (document.activeElement && document.activeElement.id?.startsWith("cadence-")) return;
  const { cadencePolicy } = getActiveRows();
  els.cadenceMaxPosts.value = cadencePolicy.maxPostsPerDay ?? 3;
  els.cadenceMaxReplies.value = cadencePolicy.maxRepliesPerHour ?? 8;
  els.cadenceQuietStart.value = cadencePolicy.quietHoursStart ?? 22;
  els.cadenceQuietEnd.value = cadencePolicy.quietHoursEnd ?? 7;
  els.cadenceCooldown.value = cadencePolicy.cooldownMinutes ?? 45;
  els.cadenceDuplicateDays.value = cadencePolicy.duplicateLookbackDays ?? 14;
  els.cadenceDoNotEngage.value = (cadencePolicy.doNotEngageTerms || []).join("\n");
  els.cadenceEscalation.value = (cadencePolicy.escalationTerms || []).join("\n");
}

function renderValidation(context) {
  const session = getActiveSession();
  const sessionCheck = validateSessionForStaging(session, context);
  const { account, cadencePolicy } = getActiveRows();
  const cadenceCheck = validateCadenceForStaging({
    policy: cadencePolicy,
    context,
    draft: activeDraft || { text: els.draftText.value },
    runs: state.postRuns || [],
    memory: state.postMemory || [],
  });
  const licenseCheck = evaluateLicenseForActiveTarget(false);
  const items = [
    ["Company selected", Boolean(context.companyId)],
    ["Brand selected", Boolean(context.brandId)],
    ["Social account selected", Boolean(context.socialAccountId)],
    ["Account URL configured", Boolean(account.accountUrl)],
    ["Expected host configured", Boolean(account.expectedHost)],
    ["Browser profile isolated", browserProfilePath(context).includes(context.companyId)],
    ["Auto-publish locked until signoff", activeMode !== "auto_publish"],
    ["Browser session ready", sessionCheck.ok],
    ["License permits active brand/platform", licenseCheck.ok],
    ["Cadence guardrails clear", cadenceCheck.ok],
  ];

  els.validationList.innerHTML = "";
  items.forEach(([label, ok]) => {
    const li = document.createElement("li");
    li.className = ok ? "ok" : "warn";
    li.textContent = `${ok ? "OK" : "Review"} - ${label}`;
    els.validationList.append(li);
  });
}

function createLocalDevLicense(context) {
  return createDiamondLicense({
    userId: "local-dev",
    email: "dev@thecard.bet",
    role: "dev",
    status: "active",
    brandLimit: 0,
    brands: [context.brandId],
    platformLimit: 0,
    platforms: [context.platform],
    automationPlatforms: [context.platform],
    lastVerifiedAt: new Date().toISOString(),
    source: "firebase-dev-seed",
  });
}

function getCachedLicense() {
  state.licenseCache ||= createLocalDevLicense(getContext());
  return state.licenseCache;
}

function evaluateLicenseForActiveTarget(automation = false) {
  return evaluateDiamondAccess({
    license: getCachedLicense(),
    context: getContext(),
    automation,
    online: false,
  });
}

function checkLicense(automation = false) {
  const result = evaluateLicenseForActiveTarget(automation);
  const license = getCachedLicense();
  els.licenseStatus.textContent = result.ok ? "Ready" : "Blocked";
  els.licenseNote.textContent = `${result.reason} User: ${license.email || license.userId || "unknown"}. Brands: ${result.brandLimit || license.brandLimit}. Platforms: ${result.platformLimit || license.platformLimit}. Automation: ${Array.isArray(result.automationPlatforms) ? result.automationPlatforms.join(", ") || "off" : result.automationPlatforms || "off"}.`;
  log(`License check: ${result.reason}`);
  return result;
}

async function checkFirebaseAdmin() {
  const status = await window.diamond.getFirebaseAdminStatus();
  els.firebaseStatus.textContent = status.configured && status.exists ? "Ready" : status.configured ? "Missing file" : "Not configured";
  els.firebaseNote.textContent = `${status.reason}${status.redactedPath ? ` Path: ${status.redactedPath}.` : ""}${status.projectId ? ` Project: ${status.projectId}.` : ""}`;
  log(`Firebase admin check: ${status.reason}`);
  return status;
}

async function exportFirestoreSyncBundle() {
  const bundle = buildFirestoreSyncBundle(state);
  const summary = summarizeFirestoreSyncBundle(bundle);
  const target = await window.diamond.exportSyncBundle({
    name: `firestore-sync-${new Date().toISOString().replace(/[:.]/g, "-")}`,
    bundle,
  });
  log(`Firestore sync bundle exported: ${target}. ${Object.entries(summary).map(([name, count]) => `${name}=${count}`).join(", ")}.`);
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

async function saveCadencePolicy() {
  const { cadencePolicy } = getActiveRows();
  cadencePolicy.maxPostsPerDay = numberFromInput(els.cadenceMaxPosts.value, 3);
  cadencePolicy.maxRepliesPerHour = numberFromInput(els.cadenceMaxReplies.value, 8);
  cadencePolicy.quietHoursStart = numberFromInput(els.cadenceQuietStart.value, 22);
  cadencePolicy.quietHoursEnd = numberFromInput(els.cadenceQuietEnd.value, 7);
  cadencePolicy.cooldownMinutes = numberFromInput(els.cadenceCooldown.value, 45);
  cadencePolicy.duplicateLookbackDays = numberFromInput(els.cadenceDuplicateDays.value, 14);
  cadencePolicy.doNotEngageTerms = linesFrom(els.cadenceDoNotEngage.value);
  cadencePolicy.escalationTerms = linesFrom(els.cadenceEscalation.value);
  cadencePolicy.updatedAt = new Date().toISOString();
  await window.diamond.saveState(state);
  renderValidation(getContext());
  renderRiskCard();
  log("Cadence guardrails saved for the active campaign.");
}

async function saveBrandRules() {
  const { brandLibrary, claimLibrary } = getActiveRows();
  brandLibrary.voice = els.brandVoice.value.trim();
  brandLibrary.approvedPhrases = linesFrom(els.approvedPhrases.value);
  brandLibrary.bannedPhrases = linesFrom(els.bannedPhrases.value);
  claimLibrary.requiresReviewClaims = linesFrom(els.reviewClaims.value);
  claimLibrary.blockedClaims = linesFrom(els.blockedClaims.value);
  claimLibrary.prizeLanguage = linesFrom(els.prizeLanguage.value);
  claimLibrary.freeToPlayLanguage = linesFrom(els.freePlayLanguage.value);
  brandLibrary.updatedAt = new Date().toISOString();
  claimLibrary.updatedAt = brandLibrary.updatedAt;
  await window.diamond.saveState(state);
  activeDraft = null;
  lastStageMessage = null;
  renderRiskCard();
  renderDraftHistory();
  renderPackageFilters();
  log("Brand and claim rules saved for the active brand.");
}

async function saveStrategy() {
  const { strategy } = getActiveRows();
  strategy.goals = linesFrom(els.strategyGoals.value);
  strategy.audience = linesFrom(els.strategyAudience.value);
  strategy.pillars = linesFrom(els.strategyPillars.value);
  strategy.cta = els.strategyCta.value.trim();
  strategy.ctaEs = els.strategyCtaEs.value.trim();
  strategy.offer = els.strategyOffer.value.trim();
  strategy.offerEs = els.strategyOfferEs.value.trim();
  strategy.referenceAccounts = linesFrom(els.strategyReferences.value);
  strategy.updatedAt = new Date().toISOString();
  await window.diamond.saveState(state);
  renderEditorialSlots();
  log("Campaign strategy saved.");
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
    button.textContent = platformLabel(account.platform);
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
    const asset = findAssetByPath(file);
    const name = document.createElement("span");
    name.textContent = file.split(/[\\/]/).pop() || file;
    name.title = asset?.altText ? `${file} - ${asset.altText}` : file;
    const badge = document.createElement("strong");
    badge.textContent = asset ? asset.type.toUpperCase() : file.split(".").pop()?.toUpperCase() || "FILE";
    div.append(name, badge);
    els.mediaRow.append(div);
  });
}

function evaluateDraft() {
  const { policy, brandLibrary, claimLibrary, strategy } = getActiveRows();
  const selectedSlot = (state.editorialSlots || []).find((slot) => slot.id === selectedSlotId);
  lastStageMessage = null;
  activeDraft = createPostDraft({
    context: getContext(),
    text: els.draftText.value,
    language: selectedSlot?.language || "en",
    media,
    approvalPolicy: policy,
    brandLibrary,
    claimLibrary,
  });
  const quality = evaluateDraftQuality({
    draft: activeDraft,
    strategy,
    memory: state.postMemory || [],
    assets: media.map((file) => findAssetByPath(file)).filter(Boolean),
    slot: selectedSlot,
  });
  applyDraftQuality(activeDraft, quality);
  if (selectedSlotId) {
    activeDraft.editorialSlotId = selectedSlotId;
    syncSlotForDraft(activeDraft, { status: "drafted", draftedAt: activeDraft.createdAt });
  }
  state.drafts.unshift(activeDraft);
  rememberDraft(activeDraft, "draft");
  void window.diamond.saveState(state);
  log(`Draft evaluated: ${activeDraft.approvalLevel}; quality ${activeDraft.qualityScore}/${activeDraft.qualityGate}${activeDraft.riskFlags.length ? ` (${activeDraft.riskFlags.join(", ")})` : ""}.`);
  renderRiskCard();
  renderPackageFilters();
  renderDraftHistory();
}

function approveDraft() {
  if (!activeDraft) evaluateDraft();
  if (activeDraft.status === "blocked") {
    log("Cannot approve blocked draft.");
    return;
  }
  if (activeDraft.qualityGate === "hold") {
    log("Cannot approve draft on quality hold. Revise the copy or asset package first.");
    return;
  }
  lastStageMessage = null;
  activeDraft.status = "approved";
  activeDraft.updatedAt = new Date().toISOString();
  syncSlotForDraft(activeDraft, { status: "approved", approvedAt: activeDraft.updatedAt });
  rememberDraft(activeDraft, "approved");
  void window.diamond.saveState(state);
  log("Draft approved for staging.");
  renderRiskCard();
  renderPackageFilters();
  renderDraftHistory();
  renderEditorialSlots();
}

async function stageDraft() {
  if (!activeDraft) evaluateDraft();
  const session = inferAndSaveSession();
  const context = getContext();
  const sessionCheck = validateSessionForStaging(session, context);
  const licenseCheck = evaluateLicenseForActiveTarget(false);
  const cadenceCheck = validateCadenceForStaging({
    policy: getActiveRows().cadencePolicy,
    context,
    draft: activeDraft,
    runs: state.postRuns || [],
    memory: state.postMemory || [],
  });
  const check = canStageDraft(activeDraft, { sessionCheck, licenseCheck, cadenceCheck });
  if (!check.ok) {
    lastStageMessage = check.reason;
    log(`Staging refused: ${check.reason}.`);
    renderRiskCard();
    return;
  }

  const { account } = getActiveRows();
  if (isMonitoringOnlyPlatform(account.platform)) {
    lastStageMessage = `${platformLabel(account.platform)} is configured as monitoring-only. Draft and capture replies, but do not stage posts there yet.`;
    log(`Staging refused: ${lastStageMessage}`);
    renderRiskCard();
    return;
  }
  const composeUrl = resolveComposeUrl(account);
  lastStageMessage = null;
  await window.diamond.writeClipboard(activeDraft.text);
  activeDraft.status = "staged";
  activeDraft.stagedAt = new Date().toISOString();
  activeDraft.updatedAt = activeDraft.stagedAt;
  activeDraft.stageUrl = composeUrl;
  activeDraft.media = media;
  syncScheduleForDraft(activeDraft, {
    status: "staged",
    stagedAt: activeDraft.stagedAt,
  });
  syncSlotForDraft(activeDraft, { status: "staged", stagedAt: activeDraft.stagedAt });
  await window.diamond.saveState(state);
  els.webview.src = composeUrl;
  const fillResult = await fillComposerText(activeDraft.text);
  const mediaResult = media.length ? await prepareMediaUpload() : { ok: true, reason: "No media selected." };
  await capturePostRun({
    status: fillResult.ok && mediaResult.ok ? "staged" : "needs_manual_finish",
    note: buildStageNote(fillResult, mediaResult),
  });
  log(fillResult.ok
    ? `Draft copied to clipboard, ${platformLabel(account.platform)} compose opened, and text inserted. ${media.length ? `${media.length} media file path(s) copied for upload. ` : ""}Review it, attach media if needed, then publish manually.`
    : `Draft copied to clipboard and ${platformLabel(account.platform)} compose opened. Auto-fill did not complete: ${fillResult.reason}. Paste manually if needed.`);
  renderRiskCard();
  renderPackageFilters();
  renderDraftHistory();
  renderScheduleCalendar();
  renderEditorialSlots();
}

async function assistMediaUpload() {
  const result = await prepareMediaUpload();
  log(result.ok ? result.reason : `Media upload helper could not finish: ${result.reason}.`);
}

async function prepareMediaUpload() {
  if (!media.length) return { ok: false, reason: "No media selected." };
  await window.diamond.writeClipboard(media.join("\n"));
  const picker = await openActivePlatformMediaPicker();
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
    companyName: getActiveRows().company.name,
    brandName: getActiveRows().brand.name,
    campaignName: getActiveRows().campaign.name,
    accountLabel: `${getActiveRows().account.platform.toUpperCase()} / ${getActiveRows().account.id}`,
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
  selectedScheduleId = schedule.id;
  syncSlotForDraft(activeDraft, {
    status: "scheduled",
    scheduledAt: schedule.scheduledAt,
    scheduledPostId: schedule.id,
  });
  await window.diamond.saveState(state);
  renderRiskCard();
  renderPackageFilters();
  renderDraftHistory();
  renderScheduleCalendar();
  renderEditorialSlots();
  log(`Scheduled draft ${activeDraft.id} for ${formatScheduleTime(schedule.scheduledAt)}.`);
}

function syncScheduleForDraft(draft, patch) {
  const schedule = (state.scheduledPosts || []).find((item) => item.id === draft.scheduledPostId || item.draftId === draft.id);
  if (!schedule) return null;
  Object.assign(schedule, patch, {
    updatedAt: new Date().toISOString(),
    text: draft.text,
    media: [...(draft.media || media)],
  });
  selectedScheduleId = schedule.id;
  return schedule;
}

function syncSlotForDraft(draft, patch) {
  const slot = (state.editorialSlots || []).find((item) => item.id === draft.editorialSlotId);
  if (!slot) return null;
  Object.assign(slot, patch, {
    draftId: draft.id,
    updatedAt: new Date().toISOString(),
  });
  selectedSlotId = slot.id;
  return slot;
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
    syncScheduleForDraft(activeDraft, {
      status: "posted",
      postedAt: run.postedAt,
      postUrl: currentUrl,
    });
    syncSlotForDraft(activeDraft, {
      status: "posted",
      postedAt: run.postedAt,
      postUrl: currentUrl,
    });
    rememberDraft(activeDraft, "posted", run);
  }
  await window.diamond.saveState(state);
  renderRunHistory();
  renderRiskCard();
  renderPackageFilters();
  renderDraftHistory();
  renderScheduleCalendar();
  renderEditorialSlots();
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
    syncScheduleForDraft(activeDraft, {
      status: "scheduled",
      abandonedRunAt: run.abandonedAt,
    });
  }
  await window.diamond.saveState(state);
  renderRunHistory();
  renderRiskCard();
  renderPackageFilters();
  renderDraftHistory();
  renderScheduleCalendar();
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
    metrics: createPostMetrics(),
    createdAt: new Date().toISOString(),
  };
  state.postRuns.unshift(run);
  activeDraft.lastRunId = run.id;
  activeDraft.screenshotPath = screenshotPath;
  rememberDraft(activeDraft, status, run);
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
    const { policy, brandLibrary, claimLibrary, strategy } = getActiveRows();
    const selectedSlot = (state.editorialSlots || []).find((slot) => slot.id === selectedSlotId);
    const evaluation = approvalLevelForText(els.draftText.value, {
      ...policy,
      brandLibrary,
      claimLibrary,
    });
    const quality = evaluateDraftQuality({
      draft: {
        text: els.draftText.value,
        language: selectedSlot?.language || "en",
        context: getContext(),
        media,
        approvalLevel: evaluation.level,
        riskFlags: evaluation.flags,
      },
      strategy,
      memory: state.postMemory || [],
      assets: media.map((file) => findAssetByPath(file)).filter(Boolean),
      slot: selectedSlot,
    });
    els.riskCard.className = `risk-card ${evaluation.level === "auto_allowed" ? "good" : "warn"}`;
    els.riskCard.innerHTML = riskSummaryHtml(`Live precheck: ${evaluation.level}. Quality: ${quality.score}/${quality.level}.`, evaluation.flags, [...evaluation.details, ...quality.details]);
    return;
  }

  const sessionCheck = validateSessionForStaging(getActiveSession(), getContext());
  const licenseCheck = evaluateLicenseForActiveTarget(false);
  const cadenceCheck = validateCadenceForStaging({
    policy: getActiveRows().cadencePolicy,
    context: getContext(),
    draft: activeDraft,
    runs: state.postRuns || [],
    memory: state.postMemory || [],
  });
  const stageCheck = canStageDraft(activeDraft, { sessionCheck, licenseCheck, cadenceCheck });
  const flags = activeDraft.riskFlags.length ? ` Flags: ${activeDraft.riskFlags.join(", ")}.` : "";
  const summary = `Draft ${activeDraft.id}: ${activeDraft.approvalLevel}. Status: ${activeDraft.status}.${flags}`;

  if (lastStageMessage) {
    els.riskCard.className = "risk-card bad";
    els.riskCard.innerHTML = riskSummaryHtml(`${summary} Staging blocked: ${lastStageMessage}.`, activeDraft.riskFlags, draftDetailLines(activeDraft));
    return;
  }

  if (activeDraft.status === "staged") {
    els.riskCard.className = stageCheck.ok ? "risk-card good" : "risk-card warn";
    els.riskCard.innerHTML = riskSummaryHtml(`${summary} Copied to clipboard and opened in the browser.`, activeDraft.riskFlags, draftDetailLines(activeDraft));
    return;
  }

  if (activeDraft.status === "posted") {
    els.riskCard.className = "risk-card good";
    els.riskCard.innerHTML = riskSummaryHtml(`${summary} Posted URL: ${activeDraft.postUrl || "captured in run history"}.`, activeDraft.riskFlags, draftDetailLines(activeDraft));
    return;
  }

  if (activeDraft.status === "scheduled") {
    els.riskCard.className = "risk-card good";
    els.riskCard.innerHTML = riskSummaryHtml(`${summary} Scheduled for ${formatScheduleTime(activeDraft.scheduledAt)}.`, activeDraft.riskFlags, draftDetailLines(activeDraft));
    return;
  }

  els.riskCard.className = activeDraft.approvalLevel === "auto_allowed" ? "risk-card good" : "risk-card warn";
  els.riskCard.innerHTML = riskSummaryHtml(
    `${summary} ${activeDraft.approvalLevel === "review_required" && activeDraft.status !== "approved" ? "Approval required before staging." : "Draft is ready for approval or staging."}`,
    activeDraft.riskFlags,
    draftDetailLines(activeDraft),
  );
}

function applyDraftQuality(draft, quality) {
  draft.qualityScore = quality.score;
  draft.qualityGate = quality.level;
  draft.qualityDetails = quality.details || [];
  draft.repeatedMemoryId = quality.repeatedMemoryId || null;
  if (quality.level === "hold") draft.status = "blocked";
}

function draftDetailLines(draft) {
  const lines = [...(draft.riskDetails || [])];
  if (draft.qualityScore !== null && draft.qualityScore !== undefined) {
    lines.push(`Quality score: ${draft.qualityScore}/${draft.qualityGate || "unscored"}.`);
  }
  if (draft.qualityDetails?.length) lines.push(...draft.qualityDetails);
  return lines;
}

function rememberDraft(draft, status, run = null) {
  if (!draft) return null;
  state.postMemory ||= [];
  const existing = state.postMemory.find((item) => item.sourceId === draft.id);
  if (existing) {
    Object.assign(existing, {
      context: draft.context,
      text: draft.text,
      normalizedText: String(draft.text || "").trim().replace(/\s+/g, " ").toLowerCase(),
      language: draft.language || "en",
      status,
      runId: run?.id || existing.runId || null,
      qualityScore: draft.qualityScore ?? existing.qualityScore ?? null,
      qualityGate: draft.qualityGate || existing.qualityGate || null,
      updatedAt: new Date().toISOString(),
    });
    return existing;
  }
  const record = createPostMemoryRecord({ draft, status, sourceType: run ? "run" : "draft" });
  if (run) record.runId = run.id;
  state.postMemory.unshift(record);
  return record;
}

function riskSummaryHtml(summary, flags = [], details = []) {
  const lines = [];
  if (flags?.length) lines.push(`Flags: ${flags.join(", ")}`);
  if (details?.length) lines.push(...details);
  if (!lines.length) lines.push("No brand or claim rule hits.");
  return `<p>${escapeHtml(summary)}</p><ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
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
      <p>${escapeHtml(summarizePostMetrics(run.metrics || {}))}</p>
      ${run.metrics?.notes ? `<p>${escapeHtml(run.metrics.notes)}</p>` : ""}
      <div class="run-actions">
        <button type="button" data-run-action="copy-url" data-run-id="${run.id}">Copy URL</button>
        <button type="button" data-run-action="copy-shot" data-run-id="${run.id}">Copy screenshot</button>
        <button type="button" data-run-action="copy-media" data-run-id="${run.id}">Copy media</button>
        <button type="button" data-run-action="metrics" data-run-id="${run.id}">Update metrics</button>
        <button type="button" data-run-action="copy-metrics" data-run-id="${run.id}">Copy metrics</button>
      </div>
    `;
    els.runHistory.append(item);
  });
}

function renderReplyInbox() {
  const context = getContext();
  const replies = (state.socialReplies || []).filter((reply) => contextsEqual(reply.context, context));
  els.replyInbox.innerHTML = "";
  if (!replies.length) {
    const empty = document.createElement("div");
    empty.className = "run-history-empty";
    empty.textContent = "No replies captured yet.";
    els.replyInbox.append(empty);
    return;
  }

  replies.slice(0, 10).forEach((reply) => {
    const draft = (state.socialResponseDrafts || []).find((item) => item.replyId === reply.id);
    const triage = reply.triage || createInboxTriage({ classification: reply.classification, text: reply.text });
    const route = reply.route || createReplyRoute({ classification: reply.classification, triage, replyId: reply.id });
    const item = document.createElement("article");
    item.className = `reply-item ${reply.status || ""} ${triage.priority || ""}`;
    const created = reply.createdAt ? new Date(reply.createdAt).toLocaleString() : "Unknown time";
    item.innerHTML = `
      <header>
        <strong>${escapeHtml(reply.classification?.category || "unclassified")} / ${escapeHtml(triage.priority || "normal")}</strong>
        <span class="session-label">${escapeHtml(reply.status || "captured")} / ${escapeHtml(triage.status || "ready_for_review")}</span>
      </header>
      <p>${escapeHtml(reply.author || "Unknown author")} - ${created}</p>
      <p>${escapeHtml(reply.text || "")}</p>
      <p>Owner: ${escapeHtml(triage.owner || "Social")} / Due: ${escapeHtml(formatScheduleTime(triage.dueAt))}</p>
      <p>Route: ${escapeHtml(route.target || "product_feedback")} / ${escapeHtml(route.status || "open")} / ${escapeHtml(route.owner || triage.owner || "Social")}</p>
      <p>Action: ${escapeHtml(triage.nextAction || reply.classification?.suggestedAction || "draft_response")}${reply.sourceUrl ? ` / ${escapeHtml(reply.sourceUrl)}` : ""}</p>
      ${triage.notes ? `<p>Notes: ${escapeHtml(triage.notes)}</p>` : ""}
      ${triage.escalationReason ? `<p>${escapeHtml(triage.escalationReason)}</p>` : ""}
      ${draft ? `<p>Response: ${escapeHtml(draft.status)} - ${escapeHtml(draft.text)}</p>` : ""}
      <div class="reply-actions">
        <button type="button" data-reply-action="load" data-reply-id="${reply.id}">Load</button>
        <button type="button" data-reply-action="assign" data-reply-id="${reply.id}">Assign</button>
        <button type="button" data-reply-action="route" data-reply-id="${reply.id}">Route</button>
        <button type="button" data-reply-action="progress" data-reply-id="${reply.id}">In progress</button>
        <button type="button" data-reply-action="approve" data-reply-id="${reply.id}">Approve response</button>
        <button type="button" data-reply-action="copy" data-reply-id="${reply.id}">Copy response</button>
        <button type="button" data-reply-action="escalate" data-reply-id="${reply.id}">Escalate</button>
        <button type="button" data-reply-action="resolve" data-reply-id="${reply.id}">Resolve</button>
        <button type="button" data-reply-action="ignore" data-reply-id="${reply.id}">Ignore</button>
      </div>
    `;
    els.replyInbox.append(item);
  });
}

async function captureReply() {
  const text = els.replyText.value.trim();
  if (!text) {
    log("Reply capture refused: add reply text first.");
    return;
  }
  const classification = classifySocialReply({ text });
  const triage = createInboxTriage({
    classification,
    text,
    owner: els.replyOwner.value,
    notes: els.replyNotes.value,
  });
  const reply = createSocialReply({
    context: getContext(),
    author: els.replyAuthor.value,
    sourceUrl: els.replyUrl.value,
    text,
    classification,
    triage,
  });
  reply.route.replyId = reply.id;
  const responseDraft = createResponseDraftForReply({
    reply,
    text: els.replyResponse.value,
  });
  state.socialReplies ||= [];
  state.socialResponseDrafts ||= [];
  state.socialReplies.unshift(reply);
  state.socialResponseDrafts.unshift(responseDraft);
  await window.diamond.saveState(state);
  renderReplyInbox();
  log(`Reply captured: ${classification.category}/${classification.priority}. ${classification.suggestedAction}.`);
}

function renderRoutineRuns() {
  const runs = (state.routineRuns || []).filter((run) => contextsEqual(run.context, getContext()));
  els.routineRuns.innerHTML = "";
  if (!runs.length) {
    const empty = document.createElement("div");
    empty.className = "run-history-empty";
    empty.textContent = "No routine runs yet.";
    els.routineRuns.append(empty);
    return;
  }
  runs.slice(0, 8).forEach((run) => {
    const item = document.createElement("article");
    item.className = `routine-item ${run.status || ""}`;
    const created = run.createdAt ? new Date(run.createdAt).toLocaleString() : "Unknown time";
    item.innerHTML = `
      <header>
        <strong>${escapeHtml(run.name || run.id)}</strong>
        <span class="session-label">${run.status}</span>
      </header>
      <p>${created} / slot ${escapeHtml(run.slotId || "none")} / draft ${escapeHtml(run.draftId || "none")}</p>
      <p>${escapeHtml(run.note || "No note.")}</p>
    `;
    els.routineRuns.append(item);
  });
}

function renderPlatformProofs() {
  const accounts = state.socialAccounts.filter((account) => account.companyId === els.company.value && account.brandId === els.brand.value);
  state.platformProofs ||= [];
  els.platformProofList.innerHTML = "";
  if (!accounts.length) {
    const empty = document.createElement("div");
    empty.className = "run-history-empty";
    empty.textContent = "No platform accounts for this brand yet.";
    els.platformProofList.append(empty);
    return;
  }
  accounts.forEach((account) => {
    let proof = getPlatformProof(account);
    const adapter = getPlatformBrowserAdapter(account.platform);
    const evaluation = evaluatePlatformProof(proof, adapter);
    const item = document.createElement("article");
    item.className = `platform-proof-item ${evaluation.status}`;
    item.innerHTML = `
      <header>
        <strong>${escapeHtml(platformLabel(account.platform))}</strong>
        <span class="session-label">${escapeHtml(evaluation.label)}</span>
      </header>
      <p>${escapeHtml(adapter.note)}</p>
      <div class="proof-meters">
        <span>Text ${proof.textProofCount}/3</span>
        <span>Media ${proof.mediaProofCount}/1</span>
        <span>Manual ${proof.manualProofCount}/3</span>
      </div>
      <p>${escapeHtml(evaluation.summary)}${proof.lastProofAt ? ` Last proof: ${escapeHtml(new Date(proof.lastProofAt).toLocaleString())}.` : ""}</p>
      <div class="proof-actions">
        <button type="button" data-proof-action="text" data-proof-id="${escapeHtml(proof.id)}">Mark text proof</button>
        <button type="button" data-proof-action="media" data-proof-id="${escapeHtml(proof.id)}">Mark media proof</button>
        <button type="button" data-proof-action="manual" data-proof-id="${escapeHtml(proof.id)}">Mark manual proof</button>
      </div>
    `;
    if (adapter.stageMode === "monitoring_only") {
      item.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    }
    els.platformProofList.append(item);
  });
}

async function handlePlatformProofClick(event) {
  const button = event.target.closest("button[data-proof-action]");
  if (!button) return;
  const proof = (state.platformProofs || []).find((item) => item.id === button.dataset.proofId);
  if (!proof) return;
  const next = markPlatformProof(proof, button.dataset.proofAction);
  state.platformProofs = (state.platformProofs || []).map((item) => item.id === next.id ? next : item);
  await window.diamond.saveState(state);
  renderPlatformProofs();
  log(`Marked ${button.dataset.proofAction} proof for ${platformLabel(next.platform)}.`);
}

function getPlatformProof(account) {
  state.platformProofs ||= [];
  const id = platformProofId({
    companyId: account.companyId,
    brandId: account.brandId,
    platform: account.platform,
    socialAccountId: account.id,
  });
  let proof = state.platformProofs.find((item) => item.id === id);
  if (!proof) {
    proof = createPlatformProofForAccount(account);
    state.platformProofs.push(proof);
  }
  return proof;
}

function createPlatformProofForAccount(account) {
  return {
    id: platformProofId({
      companyId: account.companyId,
      brandId: account.brandId,
      platform: account.platform,
      socialAccountId: account.id,
    }),
    companyId: account.companyId,
    brandId: account.brandId,
    platform: account.platform,
    socialAccountId: account.id,
    stageMode: getPlatformBrowserAdapter(account.platform).stageMode,
    textProofCount: 0,
    mediaProofCount: 0,
    manualProofCount: 0,
    lastProofAt: null,
    notes: getPlatformBrowserAdapter(account.platform).note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function addAsset() {
  const filePath = els.assetPath.value.trim();
  if (!filePath) {
    log("Asset refused: add a file path first.");
    return;
  }
  const { company, brand, campaign, account } = getActiveRows();
  const asset = {
    id: `asset-${Date.now()}`,
    companyId: company.id,
    brandId: brand.id,
    campaignId: campaign.id,
    platform: els.assetPlatform.value || account.platform,
    language: els.assetLanguage.value,
    type: els.assetType.value,
    filePath,
    altText: els.assetAlt.value.trim(),
    safeZone: els.assetSafeZone.value.trim(),
    notes: els.assetNotes.value.trim(),
    doNotUse: els.assetDoNotUse.checked,
    createdAt: new Date().toISOString(),
  };
  state.assetLibrary ||= [];
  state.assetLibrary.unshift(asset);
  els.assetPath.value = "";
  els.assetAlt.value = "";
  els.assetSafeZone.value = "";
  els.assetNotes.value = "";
  els.assetDoNotUse.checked = false;
  await window.diamond.saveState(state);
  renderAssetFilters();
  renderAssetLibrary();
  log(`Asset added: ${asset.filePath}.`);
}

async function generateAssetFromTemplate() {
  const { company, brand, campaign, account, strategy } = getActiveRows();
  const type = els.assetType.value || "leaderboard";
  const template = (state.socialTemplates || []).find((item) => item.companyId === company.id
    && item.brandId === brand.id
    && item.campaignId === campaign.id
    && item.platform === account.platform
    && item.type === type);
  const check = validateTemplateForRender(template);
  if (!check.ok) {
    log(`Asset generation refused: ${check.reason}.`);
    return;
  }
  const svg = renderWorldCupAssetSvg(type, {
    title: assetTitleForType(type, campaign.name || "World Cup", els.assetLanguage.value || "en"),
    subtitle: strategyText(strategy, "offer", els.assetLanguage.value || "en") || "Free picks. Country pride. Real leaderboard heat.",
    cta: strategyText(strategy, "cta", els.assetLanguage.value || "en") || "Join at thecard.bet",
    country: els.assetLanguage.value === "es" ? "Tu pais" : "Your country",
    language: els.assetLanguage.value || "en",
  });
  const filePath = await window.diamond.saveGeneratedAsset({
    name: `${campaign.id || "campaign"}-${Date.now()}-${type}`,
    extension: "svg",
    contents: svg,
  });
  const asset = buildGeneratedAssetRecord({
    template,
    filePath,
    language: els.assetLanguage.value || "en",
    type,
  });
  state.assetLibrary ||= [];
  state.assetLibrary.unshift(asset);
  media = [...new Set([...media, asset.filePath])];
  if (activeDraft) {
    activeDraft.media = media;
    activeDraft.assetIds = [...new Set([...(activeDraft.assetIds || []), asset.id])];
    activeDraft.updatedAt = new Date().toISOString();
  }
  await window.diamond.saveState(state);
  renderMedia();
  renderAssetFilters();
  renderAssetLibrary();
  log(`Generated ${type} asset: ${asset.filePath}.`);
}

function assetTitleForType(type, campaignName, language = "en") {
  if (language === "es" && type === "prize") return "$1,000 en premios del Mundial";
  if (language === "es" && type === "country") return "Tu pais te necesita en la tabla";
  if (language === "es") return `Tabla de ${campaignName}`;
  if (type === "prize") return "$1,000 World Cup Payouts";
  if (type === "country") return "Your country needs you on the board";
  return `${campaignName} Leaderboard`;
}

function strategyText(strategy, key, language) {
  if (language === "es") return strategy[`${key}Es`] || translateFallback(strategy[key], key);
  return strategy[key] || "";
}

function translateFallback(value, key) {
  if (key === "cta") return "Unete gratis a la liga del Mundial en thecard.bet.";
  if (key === "offer") return "$1,000 en premios totales para la campana del Mundial.";
  return value || "";
}

function renderAssetFilters() {
  const filters = [
    ["usable", "Usable"],
    ["leaderboard", "Leaderboard"],
    ["prize", "Prize"],
    ["country", "Country"],
    ["campaign", "Campaign"],
    ["do-not-use", "Do not use"],
    ["all", "All"],
  ];
  els.assetFilters.innerHTML = "";
  filters.forEach(([value, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.assetFilter = value;
    button.className = assetFilter === value ? "active" : "";
    button.textContent = `${label} ${countAssetsForFilter(value)}`;
    els.assetFilters.append(button);
  });
}

function renderAssetLibrary() {
  const assets = filteredAssets();
  els.assetLibrary.innerHTML = "";
  if (!assets.length) {
    const empty = document.createElement("div");
    empty.className = "draft-history-empty";
    empty.textContent = "No assets match this filter.";
    els.assetLibrary.append(empty);
    return;
  }
  assets.slice(0, 16).forEach((asset) => {
    const check = validateAssetForUse(asset, { requireAltText: true });
    const item = document.createElement("article");
    item.className = `asset-item ${asset.doNotUse ? "blocked" : ""} ${check.ok ? "usable" : "warn"}`;
    item.innerHTML = `
      <header>
        <strong>${escapeHtml(asset.type || "asset")} / ${escapeHtml(asset.language || "en")}</strong>
        <span class="session-label">${asset.doNotUse ? "do not use" : check.reason}</span>
      </header>
      <p>${escapeHtml(asset.filePath || "")}</p>
      <p>${escapeHtml(asset.altText || "No alt text.")}</p>
      <p>${escapeHtml(asset.safeZone || "No safe-zone metadata.")}${asset.notes ? ` / ${escapeHtml(asset.notes)}` : ""}</p>
      <div class="draft-history-actions">
        <button type="button" data-asset-action="attach" data-asset-id="${asset.id}">Attach</button>
        <button type="button" data-asset-action="toggle" data-asset-id="${asset.id}">${asset.doNotUse ? "Allow use" : "Do not use"}</button>
        <button type="button" data-asset-action="copy" data-asset-id="${asset.id}">Copy path</button>
      </div>
    `;
    els.assetLibrary.append(item);
  });
}

function filteredAssets() {
  const context = getContext();
  const assets = (state.assetLibrary || []).filter((asset) => asset.companyId === context.companyId
    && asset.brandId === context.brandId
    && asset.campaignId === context.campaignId
    && asset.platform === context.platform);
  if (assetFilter === "all") return assets;
  if (assetFilter === "usable") return assets.filter((asset) => !asset.doNotUse);
  if (assetFilter === "do-not-use") return assets.filter((asset) => asset.doNotUse);
  return assets.filter((asset) => asset.type === assetFilter);
}

function countAssetsForFilter(filter) {
  const previous = assetFilter;
  assetFilter = filter;
  const count = filteredAssets().length;
  assetFilter = previous;
  return count;
}

async function handleAssetClick(event) {
  const button = event.target.closest("button[data-asset-action]");
  if (!button) return;
  const asset = (state.assetLibrary || []).find((item) => item.id === button.dataset.assetId);
  if (!asset) return;
  if (button.dataset.assetAction === "attach") {
    const check = validateAssetForUse(asset, { requireAltText: true });
    if (!check.ok) {
      log(`Asset attach refused: ${check.reason}.`);
      return;
    }
    media = [...new Set([...media, asset.filePath])];
    if (activeDraft) {
      activeDraft.media = media;
      activeDraft.assetIds = [...new Set([...(activeDraft.assetIds || []), asset.id])];
      activeDraft.updatedAt = new Date().toISOString();
    }
    renderMedia();
    log(`Asset attached: ${asset.filePath}.`);
  }
  if (button.dataset.assetAction === "toggle") {
    asset.doNotUse = !asset.doNotUse;
    asset.updatedAt = new Date().toISOString();
    await window.diamond.saveState(state);
    renderAssetFilters();
    renderAssetLibrary();
    log(`Asset ${asset.doNotUse ? "blocked" : "allowed"}: ${asset.filePath}.`);
  }
  if (button.dataset.assetAction === "copy") {
    await window.diamond.writeClipboard(asset.filePath || "");
    log(`Copied asset path for ${asset.id}.`);
  }
}

function handleAssetFilterClick(event) {
  const button = event.target.closest("button[data-asset-filter]");
  if (!button) return;
  assetFilter = button.dataset.assetFilter;
  renderAssetFilters();
  renderAssetLibrary();
}

function findAssetByPath(filePath) {
  return (state.assetLibrary || []).find((asset) => asset.filePath === filePath) || null;
}

async function generateFromNextSlot() {
  const licenseCheck = evaluateLicenseForActiveTarget(true);
  if (!licenseCheck.ok) {
    recordRoutineRun({
      status: "blocked",
      note: `Automation license blocked: ${licenseCheck.reason}`,
    });
    await window.diamond.saveState(state);
    renderRoutineRuns();
    checkLicense(true);
    log(`Routine blocked: ${licenseCheck.reason}`);
    return;
  }
  const slot = nextPlannedSlot();
  if (!slot) {
    recordRoutineRun({
      status: "skipped",
      note: "No planned editorial slot is available for the active target.",
    });
    await window.diamond.saveState(state);
    renderRoutineRuns();
    log("Routine skipped: no planned editorial slot for this target.");
    return;
  }

  const { run } = generateDraftFromSlot(slot);
  await window.diamond.saveState(state);
  renderRoutineRuns();
  renderSlotFilters();
  renderEditorialSlots();
  renderDraftHistory();
  renderPackageFilters();
  log(`Routine run ${run.id}: generated draft from ${slot.topic}.`);
}

async function runDueSlots() {
  const licenseCheck = evaluateLicenseForActiveTarget(true);
  if (!licenseCheck.ok) {
    const blocked = recordRoutineRun({
      status: "blocked",
      note: `Automation license blocked: ${licenseCheck.reason}`,
    });
    await window.diamond.saveState(state);
    renderRoutineRuns();
    checkLicense(true);
    log(`Routine run ${blocked.id}: automation blocked by license.`);
    return;
  }
  const slots = dueRoutineSlots();
  if (!slots.length) {
    const skipped = recordRoutineRun({
      status: "skipped",
      note: "No due editorial slots are ready for the active target.",
    });
    await window.diamond.saveState(state);
    renderRoutineRuns();
    log(`Routine run ${skipped.id}: no due slots were ready.`);
    return;
  }

  let generated = 0;
  let skipped = 0;
  slots.forEach((slot) => {
    const readiness = routineReadiness(slot);
    if (!readiness.ok) {
      slot.status = "skipped";
      slot.skipReason = readiness.reason;
      slot.skippedAt = new Date().toISOString();
      recordRoutineRun({
        status: "skipped",
        slotId: slot.id,
        note: readiness.reason,
      });
      skipped += 1;
      return;
    }
    generateDraftFromSlot(slot);
    generated += 1;
  });
  await window.diamond.saveState(state);
  renderRoutineRuns();
  renderSlotFilters();
  renderEditorialSlots();
  renderDraftHistory();
  renderPackageFilters();
  log(`Due slot routine finished: ${generated} generated, ${skipped} skipped.`);
}

function generateDraftFromSlot(slot) {
  selectedSlotId = slot.id;
  activateSlotContext(slot);
  draftSlotText(slot);
  evaluateDraft();
  slot.status = "drafted";
  slot.draftId = activeDraft.id;
  slot.draftedAt = activeDraft.createdAt;
  delete slot.skipReason;
  const run = recordRoutineRun({
    status: activeDraft.status === "blocked" ? "blocked" : "drafted",
    slotId: slot.id,
    draftId: activeDraft.id,
    note: `Generated ${activeDraft.id} from planned slot "${slot.topic}".`,
  });
  return { draft: activeDraft, run };
}

function nextPlannedSlot() {
  return (state.editorialSlots || [])
    .filter((slot) => slot.status === "planned" && slotMatchesActiveContext(slot))
    .sort((a, b) => new Date(a.plannedAt).getTime() - new Date(b.plannedAt).getTime())[0] || null;
}

function dueRoutineSlots() {
  return (state.editorialSlots || [])
    .filter((slot) => ["planned", "skipped"].includes(slot.status) && slotMatchesActiveContext(slot) && isSlotDue(slot))
    .sort((a, b) => new Date(a.plannedAt).getTime() - new Date(b.plannedAt).getTime());
}

function isSlotDue(slot) {
  const plannedAt = new Date(slot.plannedAt);
  if (Number.isNaN(plannedAt.getTime())) return true;
  return plannedAt.getTime() <= Date.now() + 15 * 60 * 1000;
}

function routineReadiness(slot) {
  const required = [
    ["company", slot.companyId],
    ["brand", slot.brandId],
    ["campaign", slot.campaignId],
    ["platform", slot.platform],
    ["social account", slot.socialAccountId],
    ["topic", slot.topic],
  ].filter(([, value]) => !value);
  if (required.length) return { ok: false, reason: `Missing ${required.map(([label]) => label).join(", ")}.` };
  const { strategy } = getActiveRows();
  if (!strategy.cta) return { ok: false, reason: "Campaign strategy is missing a CTA." };
  if (!Array.isArray(strategy.pillars) || !strategy.pillars.length) return { ok: false, reason: "Campaign strategy is missing content pillars." };
  return { ok: true, reason: "Ready for routine." };
}

function routineReadinessForDisplay(slot) {
  if (slot.status === "skipped") return { state: "skipped", label: "skipped" };
  if (slot.status !== "planned") return { state: "not-ready", label: "not ready" };
  if (!isSlotDue(slot)) return { state: "not-ready", label: "upcoming" };
  const readiness = routineReadiness(slot);
  return readiness.ok
    ? { state: "ready", label: "ready" }
    : { state: "not-ready", label: "not ready" };
}

function slotMatchesActiveContext(slot) {
  const context = getContext();
  return slot.companyId === context.companyId
    && slot.brandId === context.brandId
    && slot.campaignId === context.campaignId
    && slot.platform === context.platform
    && slot.socialAccountId === context.socialAccountId;
}

function recordRoutineRun(input) {
  state.routineRuns ||= [];
  const run = {
    id: `routine-${Date.now()}`,
    name: "x-next-slot-draft",
    context: getContext(),
    status: input.status,
    slotId: input.slotId || null,
    draftId: input.draftId || null,
    note: input.note || "",
    createdAt: new Date().toISOString(),
  };
  state.routineRuns.unshift(run);
  return run;
}

async function addEditorialSlot() {
  const topic = els.slotTopic.value.trim();
  if (!topic) {
    log("Slot refused: add a topic first.");
    return;
  }
  const plannedAt = els.slotTime.value ? new Date(els.slotTime.value) : new Date(Date.now() + 60 * 60 * 1000);
  const approvalDeadline = els.slotDeadline.value ? new Date(els.slotDeadline.value) : new Date(plannedAt.getTime() - 30 * 60 * 1000);
  if (Number.isNaN(plannedAt.getTime()) || Number.isNaN(approvalDeadline.getTime())) {
    log("Slot refused: invalid slot time or approval deadline.");
    return;
  }
  const { company, brand, campaign, account } = getActiveRows();
  const slot = {
    id: `slot-${Date.now()}`,
    companyId: company.id,
    brandId: brand.id,
    campaignId: campaign.id,
    platform: account.platform,
    socialAccountId: account.id,
    topic,
    language: els.slotLanguage.value,
    assetNeed: els.slotAsset.value.trim(),
    status: "planned",
    plannedAt: plannedAt.toISOString(),
    approvalDeadline: approvalDeadline.toISOString(),
    createdAt: new Date().toISOString(),
  };
  state.editorialSlots ||= [];
  state.editorialSlots.unshift(slot);
  selectedSlotId = slot.id;
  els.slotTopic.value = "";
  els.slotAsset.value = "";
  await window.diamond.saveState(state);
  renderSlotFilters();
  renderEditorialSlots();
  log(`Editorial slot added: ${slot.topic}.`);
}

function renderSlotFilters() {
  const filters = [
    ["active", "Active"],
    ["ready", "Ready"],
    ["planned", "Planned"],
    ["drafted", "Drafted"],
    ["approved", "Approved"],
    ["scheduled", "Scheduled"],
    ["skipped", "Skipped"],
    ["posted", "Posted"],
    ["all", "All"],
  ];
  els.slotFilters.innerHTML = "";
  filters.forEach(([value, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.slotFilter = value;
    button.className = slotFilter === value ? "active" : "";
    button.textContent = `${label} ${countSlotsForFilter(value)}`;
    els.slotFilters.append(button);
  });
}

function renderEditorialSlots() {
  const slots = filteredSlots()
    .sort((a, b) => new Date(a.plannedAt).getTime() - new Date(b.plannedAt).getTime());
  els.editorialSlots.innerHTML = "";
  if (!slots.length) {
    const empty = document.createElement("div");
    empty.className = "draft-history-empty";
    empty.textContent = "No editorial slots match this filter.";
    els.editorialSlots.append(empty);
    return;
  }
  slots.slice(0, 12).forEach((slot) => {
    const item = document.createElement("article");
    const readiness = routineReadinessForDisplay(slot);
    item.className = `slot-item ${selectedSlotId === slot.id ? "active" : ""} ${slot.status} ${readiness.state}`;
    const plannedAt = slot.plannedAt ? new Date(slot.plannedAt).toLocaleString() : "No time";
    const deadline = slot.approvalDeadline ? new Date(slot.approvalDeadline).toLocaleString() : "No deadline";
    item.innerHTML = `
      <header>
        <strong>${escapeHtml(slot.topic)}</strong>
        <span class="session-label">${slot.status} / ${readiness.label}</span>
      </header>
      <p>${plannedAt} / ${slot.platform?.toUpperCase() || "X"} / ${slot.language || "en"}</p>
      <p>Approval: ${deadline}${slot.assetNeed ? ` / Asset: ${escapeHtml(slot.assetNeed)}` : ""}</p>
      ${slot.skipReason ? `<p>Skipped: ${escapeHtml(slot.skipReason)}</p>` : ""}
      <div class="draft-history-actions">
        <button type="button" data-slot-action="select" data-slot-id="${slot.id}">Select</button>
        <button type="button" data-slot-action="draft" data-slot-id="${slot.id}">Draft from slot</button>
        <button type="button" data-slot-action="schedule" data-slot-id="${slot.id}">Schedule</button>
        <button type="button" data-slot-action="posted" data-slot-id="${slot.id}">Mark posted</button>
        <button type="button" data-slot-action="remove" data-slot-id="${slot.id}">Remove</button>
      </div>
    `;
    els.editorialSlots.append(item);
  });
}

function filteredSlots() {
  const context = getContext();
  const slots = (state.editorialSlots || []).filter((slot) => slot.companyId === context.companyId
    && slot.brandId === context.brandId
    && slot.campaignId === context.campaignId
    && slot.socialAccountId === context.socialAccountId);
  if (slotFilter === "all") return slots;
  if (slotFilter === "active") return slots.filter((slot) => !["posted", "removed"].includes(slot.status));
  if (slotFilter === "ready") return slots.filter((slot) => routineReadinessForDisplay(slot).state === "ready");
  if (slotFilter === "skipped") return slots.filter((slot) => slot.status === "skipped");
  return slots.filter((slot) => slot.status === slotFilter);
}

function countSlotsForFilter(filter) {
  const previous = slotFilter;
  slotFilter = filter;
  const count = filteredSlots().length;
  slotFilter = previous;
  return count;
}

async function handleSlotClick(event) {
  const button = event.target.closest("button[data-slot-action]");
  if (!button) return;
  const slot = (state.editorialSlots || []).find((item) => item.id === button.dataset.slotId);
  if (!slot) return;
  selectedSlotId = slot.id;
  activateSlotContext(slot);

  if (button.dataset.slotAction === "select") {
    draftSlotText(slot);
    renderEditorialSlots();
    return;
  }
  if (button.dataset.slotAction === "draft") {
    draftSlotText(slot);
    evaluateDraft();
    slot.status = "drafted";
    slot.draftId = activeDraft.id;
    slot.draftedAt = activeDraft.createdAt;
    await window.diamond.saveState(state);
    renderEditorialSlots();
  }
  if (button.dataset.slotAction === "schedule") {
    const draft = (state.drafts || []).find((item) => item.id === slot.draftId);
    if (draft) {
      loadDraft(draft);
      if (!["approved", "staged", "posted"].includes(activeDraft.status)) approveDraft();
    } else {
      draftSlotText(slot);
      evaluateDraft();
      approveDraft();
    }
    await scheduleActiveDraft();
  }
  if (button.dataset.slotAction === "posted") {
    slot.status = "posted";
    slot.postedAt = new Date().toISOString();
    const draft = (state.drafts || []).find((item) => item.id === slot.draftId);
    if (draft) draft.status = "posted";
    await window.diamond.saveState(state);
    renderEditorialSlots();
    renderDraftHistory();
    renderPackageFilters();
    log(`Editorial slot marked posted: ${slot.topic}.`);
  }
  if (button.dataset.slotAction === "remove") {
    slot.status = "removed";
    slot.removedAt = new Date().toISOString();
    await window.diamond.saveState(state);
    renderSlotFilters();
    renderEditorialSlots();
    log(`Editorial slot removed: ${slot.topic}.`);
  }
}

function handleSlotFilterClick(event) {
  const button = event.target.closest("button[data-slot-filter]");
  if (!button) return;
  slotFilter = button.dataset.slotFilter;
  renderSlotFilters();
  renderEditorialSlots();
}

function draftSlotText(slot) {
  const { strategy } = getActiveRows();
  const text = buildSlotDraftText(slot, strategy);
  els.draftText.value = text;
  activeDraft = null;
  lastStageMessage = null;
  renderRiskCard();
  log(`Draft text filled from editorial slot: ${slot.topic}.`);
}

function renderDraftHistory() {
  const drafts = filteredPackages();
  els.draftHistory.innerHTML = "";
  if (!drafts.length) {
    const empty = document.createElement("div");
    empty.className = "draft-history-empty";
    empty.textContent = "No post packages match this filter.";
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
      <p>Quality ${draft.qualityScore ?? "n/a"} / ${draft.qualityGate || "unscored"}</p>
      ${draft.riskDetails?.length ? `<p>${draft.riskDetails.slice(0, 3).map(escapeHtml).join(" / ")}</p>` : ""}
      ${draft.qualityDetails?.length ? `<p>${draft.qualityDetails.slice(0, 2).map(escapeHtml).join(" / ")}</p>` : ""}
      <div class="draft-history-actions">
        <button type="button" data-draft-action="load" data-draft-id="${draft.id}">Load</button>
        <button type="button" data-draft-action="approve" data-draft-id="${draft.id}">Approve</button>
        <button type="button" data-draft-action="stage" data-draft-id="${draft.id}">Stage</button>
        <button type="button" data-draft-action="schedule" data-draft-id="${draft.id}">Schedule</button>
        <button type="button" data-draft-action="copy" data-draft-id="${draft.id}">Copy text</button>
        <button type="button" data-draft-action="remove" data-draft-id="${draft.id}">Remove</button>
      </div>
    `;
    els.draftHistory.append(item);
  });
}

function renderPackageFilters() {
  const filters = [
    ["active", "Active"],
    ["draft", "Draft"],
    ["approved", "Approved"],
    ["scheduled", "Scheduled"],
    ["staged", "Staged"],
    ["posted", "Posted"],
    ["all", "All"],
  ];
  els.packageFilters.innerHTML = "";
  filters.forEach(([value, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.packageFilter = value;
    button.className = packageFilter === value ? "active" : "";
    button.textContent = `${label} ${countPackagesForFilter(value)}`;
    els.packageFilters.append(button);
  });
}

function filteredPackages() {
  const drafts = draftsForActiveContext();
  if (packageFilter === "all") return drafts;
  if (packageFilter === "active") {
    return drafts.filter((draft) => !["posted", "abandoned"].includes(draft.status));
  }
  return drafts.filter((draft) => draft.status === packageFilter);
}

function countPackagesForFilter(filter) {
  const previous = packageFilter;
  packageFilter = filter;
  const count = filteredPackages().length;
  packageFilter = previous;
  return count;
}

function renderScheduleCalendar() {
  const schedules = filteredSchedules()
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  els.scheduleCalendar.innerHTML = "";
  renderScheduleControls();
  renderScheduleDetail();
  if (!schedules.length) {
    const empty = document.createElement("div");
    empty.className = "schedule-empty";
    empty.textContent = "No scheduled posts match this view.";
    els.scheduleCalendar.append(empty);
    return;
  }

  const buckets = groupSchedulesByReadiness(schedules);
  Object.entries(buckets).forEach(([bucket, bucketSchedules]) => {
    if (!bucketSchedules.length) return;
    const bucketTitle = document.createElement("div");
    bucketTitle.className = `schedule-bucket ${bucket}`;
    bucketTitle.textContent = scheduleBucketLabel(bucket);
    els.scheduleCalendar.append(bucketTitle);
    renderScheduleDayGroups(bucketSchedules);
  });
}

function renderScheduleDayGroups(schedules) {
  const groups = groupByDay(schedules);
  Object.entries(groups).forEach(([day, items]) => {
    const section = document.createElement("section");
    section.className = "schedule-day";
    const title = document.createElement("strong");
    title.textContent = day;
    section.append(title);
    items.forEach((item) => {
      const div = document.createElement("article");
      div.className = `schedule-item ${selectedScheduleId === item.id ? "active" : ""} ${scheduleBucket(item)}`;
      const preview = item.text.length > 120 ? `${item.text.slice(0, 120)}...` : item.text;
      div.innerHTML = `
        <header>
          <strong>${new Date(item.scheduledAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</strong>
          <span class="session-label">${item.status}</span>
        </header>
        <p>${preview}</p>
        <p>${item.companyName || item.context.companyId} / ${item.brandName || item.context.brandId} / ${item.campaignName || item.context.campaignId}</p>
        <p>${item.accountLabel || `${item.context.platform.toUpperCase()} / ${item.context.socialAccountId}`} / ${item.timezone}</p>
        <div class="draft-history-actions">
          <button type="button" data-schedule-action="select" data-schedule-id="${item.id}">Details</button>
          <button type="button" data-schedule-action="load" data-schedule-id="${item.id}">Load draft</button>
          <button type="button" data-schedule-action="stage" data-schedule-id="${item.id}">Stage now</button>
          <button type="button" data-schedule-action="posted" data-schedule-id="${item.id}">Mark posted</button>
          <button type="button" data-schedule-action="cancel" data-schedule-id="${item.id}">Cancel</button>
        </div>
      `;
      section.append(div);
    });
    els.scheduleCalendar.append(section);
  });
}

function renderScheduleControls() {
  els.scheduleStatusFilter.value = scheduleStatusFilter;
  els.scheduleScope.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.scheduleScope === scheduleScope);
  });
}

function renderScheduleDetail() {
  const schedule = (state.scheduledPosts || []).find((item) => item.id === selectedScheduleId);
  if (!schedule || !scheduleMatchesScope(schedule)) {
    selectedScheduleId = null;
    els.scheduleDetail.innerHTML = "";
    return;
  }
  const preview = schedule.text.length > 220 ? `${schedule.text.slice(0, 220)}...` : schedule.text;
  els.scheduleDetail.innerHTML = `
    <article class="schedule-detail-card ${scheduleBucket(schedule)}">
      <header>
        <div>
          <strong>${formatScheduleTime(schedule.scheduledAt)}</strong>
          <p>${schedule.companyName || schedule.context.companyId} / ${schedule.brandName || schedule.context.brandId} / ${schedule.campaignName || schedule.context.campaignId}</p>
        </div>
        <span class="session-label">${schedule.status}</span>
      </header>
      <p>${preview}</p>
      <p>${schedule.accountLabel || `${schedule.context.platform.toUpperCase()} / ${schedule.context.socialAccountId}`} / ${schedule.timezone}</p>
      <div class="draft-history-actions">
        <button type="button" data-schedule-action="load" data-schedule-id="${schedule.id}">Load draft</button>
        <button type="button" data-schedule-action="stage" data-schedule-id="${schedule.id}">Stage now</button>
        <button type="button" data-schedule-action="posted" data-schedule-id="${schedule.id}">Mark posted</button>
        <button type="button" data-schedule-action="cancel" data-schedule-id="${schedule.id}">Cancel</button>
      </div>
    </article>
  `;
}

function filteredSchedules() {
  return schedulesForScope().filter((item) => {
    if (scheduleStatusFilter === "all") return true;
    if (scheduleStatusFilter === "open") return !["canceled", "posted"].includes(item.status);
    if (scheduleStatusFilter === "overdue") return scheduleBucket(item) === "overdue";
    if (scheduleStatusFilter === "ready-today") return scheduleBucket(item) === "ready-today";
    return item.status === scheduleStatusFilter;
  });
}

function schedulesForScope() {
  const context = getContext();
  return (state.scheduledPosts || []).filter((item) => item.status !== "canceled" && scheduleMatchesScope(item, context));
}

function scheduleMatchesScope(item, context = getContext()) {
  if (scheduleScope === "all") return true;
  if (scheduleScope === "company") return item.context?.companyId === context.companyId;
  return contextsEqual(item.context, context);
}

function groupSchedulesByReadiness(schedules) {
  return schedules.reduce((groups, item) => {
    groups[scheduleBucket(item)].push(item);
    return groups;
  }, {
    overdue: [],
    "ready-today": [],
    upcoming: [],
    completed: [],
  });
}

function scheduleBucket(item) {
  if (["posted", "canceled"].includes(item.status)) return "completed";
  const scheduledAt = new Date(item.scheduledAt);
  const now = new Date();
  if (scheduledAt.getTime() < now.getTime() && item.status === "scheduled") return "overdue";
  if (isSameLocalDay(scheduledAt, now) && item.status === "scheduled") return "ready-today";
  return "upcoming";
}

function scheduleBucketLabel(bucket) {
  if (bucket === "overdue") return `Overdue ${countSchedulesInBucket(bucket)}`;
  if (bucket === "ready-today") return `Ready today ${countSchedulesInBucket(bucket)}`;
  if (bucket === "completed") return `Completed ${countSchedulesInBucket(bucket)}`;
  return `Upcoming ${countSchedulesInBucket(bucket)}`;
}

function countSchedulesInBucket(bucket) {
  return filteredSchedules().filter((item) => scheduleBucket(item) === bucket).length;
}

function isSameLocalDay(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
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

  if (button.dataset.scheduleAction === "select") {
    selectedScheduleId = schedule.id;
    renderScheduleCalendar();
    return;
  }
  if (button.dataset.scheduleAction === "load") {
    const draft = (state.drafts || []).find((item) => item.id === schedule.draftId);
    activateScheduleContext(schedule);
    if (draft) loadDraft(draft);
    selectedScheduleId = schedule.id;
    renderScheduleCalendar();
  }
  if (button.dataset.scheduleAction === "stage") {
    const draft = (state.drafts || []).find((item) => item.id === schedule.draftId);
    if (!draft) {
      log(`Stage refused: scheduled draft ${schedule.draftId} was not found.`);
      return;
    }
    selectedScheduleId = schedule.id;
    activateScheduleContext(schedule);
    loadDraft(draft);
    await stageDraft();
  }
  if (button.dataset.scheduleAction === "posted") {
    const draft = (state.drafts || []).find((item) => item.id === schedule.draftId);
    activateScheduleContext(schedule);
    if (draft) loadDraft(draft);
    if (activeDraft?.lastRunId) {
      await markActiveRunPosted();
    } else {
      schedule.status = "posted";
      schedule.postedAt = new Date().toISOString();
      if (draft) {
        draft.status = "posted";
        draft.updatedAt = schedule.postedAt;
      }
      await window.diamond.saveState(state);
      renderScheduleCalendar();
      renderDraftHistory();
      renderPackageFilters();
      renderRiskCard();
      log(`Scheduled post marked posted: ${schedule.id}.`);
    }
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
    if (selectedScheduleId === schedule.id) selectedScheduleId = null;
    renderDraftHistory();
    renderPackageFilters();
    renderScheduleCalendar();
    log(`Canceled scheduled post ${schedule.id}.`);
  }
}

function handleScheduleScopeClick(event) {
  const button = event.target.closest("button[data-schedule-scope]");
  if (!button) return;
  scheduleScope = button.dataset.scheduleScope;
  selectedScheduleId = null;
  renderScheduleCalendar();
}

function activateScheduleContext(schedule) {
  const context = schedule.context || {};
  setSelectIfPresent(els.company, context.companyId);
  setSelectIfPresent(els.brand, context.brandId);
  setSelectIfPresent(els.campaign, context.campaignId);
  setSelectIfPresent(els.account, context.socialAccountId);
  activeMode = context.postingMode || activeMode;
  syncModeButtons();
}

function activateSlotContext(slot) {
  setSelectIfPresent(els.company, slot.companyId);
  setSelectIfPresent(els.brand, slot.brandId);
  setSelectIfPresent(els.campaign, slot.campaignId);
  setSelectIfPresent(els.account, slot.socialAccountId);
  syncModeButtons();
}

function setSelectIfPresent(select, value) {
  if (!value) return;
  if ([...select.options].some((option) => option.value === value)) {
    select.value = value;
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
  if (button.dataset.draftAction === "approve") {
    loadDraft(draft);
    approveDraft();
    await window.diamond.saveState(state);
  }
  if (button.dataset.draftAction === "stage") {
    loadDraft(draft);
    await stageDraft();
  }
  if (button.dataset.draftAction === "schedule") {
    loadDraft(draft);
    await scheduleActiveDraft();
  }
  if (button.dataset.draftAction === "copy") {
    await window.diamond.writeClipboard(draft.text || "");
    log(`Copied draft text for ${draft.id}.`);
  }
  if (button.dataset.draftAction === "remove") {
    removeDraft(draft.id);
  }
}

function handlePackageFilterClick(event) {
  const button = event.target.closest("button[data-package-filter]");
  if (!button) return;
  packageFilter = button.dataset.packageFilter;
  renderPackageFilters();
  renderDraftHistory();
}

function loadDraft(draft) {
  activeDraft = draft;
  lastStageMessage = null;
  media = Array.isArray(draft.media) ? [...draft.media] : [];
  els.draftText.value = draft.text || "";
  renderMedia();
  renderRiskCard();
  renderDraftHistory();
  renderPackageFilters();
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
  renderPackageFilters();
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
  if (button.dataset.runAction === "metrics") {
    await updateRunMetrics(run);
  }
  if (button.dataset.runAction === "copy-metrics") {
    await window.diamond.writeClipboard(buildMetricsExport(run));
    log(`Copied metrics summary for ${run.id}.`);
  }
}

async function handleReplyInboxClick(event) {
  const button = event.target.closest("button[data-reply-action]");
  if (!button) return;
  const reply = (state.socialReplies || []).find((item) => item.id === button.dataset.replyId);
  if (!reply) return;
  const draft = (state.socialResponseDrafts || []).find((item) => item.replyId === reply.id);

  if (button.dataset.replyAction === "load") {
    els.replyAuthor.value = reply.author || "";
    els.replyUrl.value = reply.sourceUrl || "";
    els.replyOwner.value = reply.triage?.owner || "";
    els.replyNotes.value = reply.triage?.notes || "";
    els.replyText.value = reply.text || "";
    els.replyResponse.value = draft?.text || "";
    log(`Loaded reply ${reply.id}.`);
  }
  if (button.dataset.replyAction === "assign") {
    reply.triage ||= createInboxTriage({ classification: reply.classification, text: reply.text });
    const owner = prompt("Assign owner", reply.triage.owner || "Social");
    if (owner === null) return;
    const notes = prompt("Triage notes", reply.triage.notes || "");
    if (notes === null) return;
    reply.triage.owner = owner.trim() || reply.triage.owner;
    reply.triage.notes = notes.trim();
    reply.triage.status = reply.triage.status === "resolved" ? "resolved" : "assigned";
    reply.updatedAt = new Date().toISOString();
    await window.diamond.saveState(state);
    renderReplyInbox();
    log(`Reply assigned: ${reply.id} -> ${reply.triage.owner}.`);
  }
  if (button.dataset.replyAction === "route") {
    reply.triage ||= createInboxTriage({ classification: reply.classification, text: reply.text });
    reply.route ||= createReplyRoute({ classification: reply.classification, triage: reply.triage, replyId: reply.id });
    const target = prompt("Route target", reply.route.target || "product_feedback");
    if (target === null) return;
    const owner = prompt("Route owner", reply.route.owner || reply.triage.owner || "Social");
    if (owner === null) return;
    reply.route.target = target.trim() || reply.route.target;
    reply.route.owner = owner.trim() || reply.route.owner;
    reply.route.status = reply.route.target === "ignored_item" ? "ignored" : reply.route.target === "escalation_record" ? "needs_escalation" : "open";
    reply.route.updatedAt = new Date().toISOString();
    reply.updatedAt = reply.route.updatedAt;
    await window.diamond.saveState(state);
    renderReplyInbox();
    log(`Reply routed: ${reply.id} -> ${reply.route.target}.`);
  }
  if (button.dataset.replyAction === "progress") {
    reply.triage ||= createInboxTriage({ classification: reply.classification, text: reply.text });
    reply.triage.status = "in_progress";
    reply.status = reply.status === "captured" ? "triaged" : reply.status;
    reply.updatedAt = new Date().toISOString();
    await window.diamond.saveState(state);
    renderReplyInbox();
    log(`Reply marked in progress: ${reply.id}.`);
  }
  if (button.dataset.replyAction === "approve") {
    if (!draft) {
      log(`Approve refused: reply ${reply.id} has no response draft.`);
      return;
    }
    if (draft.status === "escalation_required") {
      log(`Approve refused: reply ${reply.id} requires escalation.`);
      return;
    }
    draft.status = "approved";
    draft.updatedAt = new Date().toISOString();
    reply.status = "response_approved";
    reply.triage ||= createInboxTriage({ classification: reply.classification, text: reply.text });
    reply.triage.status = "response_approved";
    reply.updatedAt = draft.updatedAt;
    await window.diamond.saveState(state);
    renderReplyInbox();
    log(`Response approved for ${reply.id}.`);
  }
  if (button.dataset.replyAction === "copy") {
    if (!draft || draft.status !== "approved") {
      log(`Copy refused: approve the response for ${reply.id} first.`);
      return;
    }
    await window.diamond.writeClipboard(draft.text || "");
    log(`Copied approved response for ${reply.id}.`);
  }
  if (button.dataset.replyAction === "escalate") {
    reply.status = "escalated";
    reply.triage ||= createInboxTriage({ classification: reply.classification, text: reply.text });
    reply.triage.status = "escalation_required";
    reply.triage.nextAction = "escalate";
    reply.triage.escalationReason ||= "Operator escalated this reply.";
    reply.route ||= createReplyRoute({ classification: reply.classification, triage: reply.triage, replyId: reply.id });
    reply.route.target = "escalation_record";
    reply.route.status = "needs_escalation";
    reply.route.updatedAt = reply.updatedAt;
    reply.updatedAt = new Date().toISOString();
    if (draft) {
      draft.status = "escalation_required";
      draft.updatedAt = reply.updatedAt;
    }
    await window.diamond.saveState(state);
    renderReplyInbox();
    log(`Reply escalated: ${reply.id}.`);
  }
  if (button.dataset.replyAction === "resolve") {
    reply.status = "resolved";
    reply.triage ||= createInboxTriage({ classification: reply.classification, text: reply.text });
    reply.triage.status = "resolved";
    reply.route ||= createReplyRoute({ classification: reply.classification, triage: reply.triage, replyId: reply.id });
    reply.route.status = "resolved";
    reply.route.updatedAt = reply.updatedAt;
    reply.updatedAt = new Date().toISOString();
    if (draft && draft.status !== "ignored") {
      draft.status = draft.status === "approved" ? "sent_or_handled" : draft.status;
      draft.updatedAt = reply.updatedAt;
    }
    await window.diamond.saveState(state);
    renderReplyInbox();
    log(`Reply resolved: ${reply.id}.`);
  }
  if (button.dataset.replyAction === "ignore") {
    reply.status = "ignored";
    reply.triage ||= createInboxTriage({ classification: reply.classification, text: reply.text });
    reply.triage.status = "ignored";
    reply.triage.nextAction = "ignore";
    reply.route ||= createReplyRoute({ classification: reply.classification, triage: reply.triage, replyId: reply.id });
    reply.route.target = "ignored_item";
    reply.route.status = "ignored";
    reply.route.updatedAt = reply.updatedAt;
    reply.updatedAt = new Date().toISOString();
    if (draft) {
      draft.status = "ignored";
      draft.updatedAt = reply.updatedAt;
    }
    await window.diamond.saveState(state);
    renderReplyInbox();
    log(`Reply ignored: ${reply.id}.`);
  }
}

async function updateRunMetrics(run) {
  const current = run.metrics || {};
  const impressions = prompt("Impressions", current.impressions ?? 0);
  if (impressions === null) return;
  const clicks = prompt("Clicks", current.clicks ?? 0);
  if (clicks === null) return;
  const signups = prompt("Signups", current.signups ?? 0);
  if (signups === null) return;
  const leagueJoins = prompt("League joins", current.leagueJoins ?? 0);
  if (leagueJoins === null) return;
  const leagueId = prompt("League ID", current.leagueId || "");
  if (leagueId === null) return;
  const leagueName = prompt("League name", current.leagueName || "");
  if (leagueName === null) return;
  const notes = prompt("Performance notes", current.notes || "");
  if (notes === null) return;
  run.metrics = createPostMetrics({
    impressions,
    clicks,
    signups,
    leagueJoins,
    leagueId,
    leagueName,
    notes,
  });
  run.updatedAt = new Date().toISOString();
  await window.diamond.saveState(state);
  renderRunHistory();
  log(`Metrics updated for ${run.id}: ${summarizePostMetrics(run.metrics)}.`);
}

function buildMetricsExport(run) {
  return [
    `Run: ${run.id}`,
    `Status: ${run.status || "unknown"}`,
    `URL: ${run.postUrl || run.platformUrl || ""}`,
    `Screenshot: ${run.screenshotPath || ""}`,
    `Metrics: ${summarizePostMetrics(run.metrics || {})}`,
    `Notes: ${run.metrics?.notes || ""}`,
  ].join("\n");
}

function log(message) {
  const time = new Date().toLocaleTimeString();
  const div = document.createElement("div");
  div.textContent = `[${time}] ${message}`;
  els.runLog.prepend(div);
}

function scrollPanelIntoView(selector) {
  document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  const { account } = getActiveRows();
  let lastReason = "composer textbox was not ready";
  for (let attempt = 0; attempt < 16; attempt += 1) {
    await wait(500);
    const result = await insertPlatformComposerText(els.webview, text, account.platform);
    if (result.ok || result.manual) return result;
    lastReason = result.reason || lastReason;
  }
  return { ok: false, reason: lastReason };
}

async function openActivePlatformMediaPicker() {
  const { account } = getActiveRows();
  return openPlatformMediaPicker(els.webview, account.platform);
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

function linesFrom(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function numberFromInput(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function linesFor(value) {
  return Array.isArray(value) ? value.join("\n") : String(value || "");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
