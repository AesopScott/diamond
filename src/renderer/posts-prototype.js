import {
  buildSocialAccountSetupKit,
  buildDiamondLicenseModel,
  buildPostBoardView,
  createPostMetrics,
  createTemporaryUnlimitedDiamondLicense,
  createPlatformDraft,
  createPostDraft,
  createPostPackage,
  createSeedWorkspace,
  derivePostPackagesFromWorkspace,
  evaluateDiamondLicense,
  getDiamondLegalDocuments,
  migrateWorkspaceState,
  resolveFirebaseAdminConfig,
  resolveComposeUrl,
  resolveLoginUrl,
  summarizePostMetrics,
  summarizeFirestoreSyncBundle,
  buildFirestoreSyncBundle,
} from "../index.js";

const state = await loadProductionState();
let prototypeModel = buildProductionPostModel(state);
let board = buildPostBoardView(prototypeModel);
let activePostPackageId = null;
renderBoard(board);
renderCalendar();
renderAccounts();
renderBrands();
renderTemplates();
renderSettings();
renderAnalytics();
renderOperatorDrawer();
wirePrototypeControls();

async function loadProductionState() {
  const saved = await window.diamond?.getState?.();
  if (saved && typeof saved === "object") return hydrateSavedWorkspace(saved);
  return buildSampleWorkspace();
}

function hydrateSavedWorkspace(saved) {
  const defaults = createSeedWorkspace();
  const workspace = migrateWorkspaceState({
    ...defaults,
    ...saved,
    companies: saved.companies?.length ? saved.companies : defaults.companies,
    brands: saved.brands?.length ? saved.brands : defaults.brands,
    campaigns: saved.campaigns?.length ? saved.campaigns : defaults.campaigns,
    socialAccounts: saved.socialAccounts?.length ? saved.socialAccounts : defaults.socialAccounts,
    contentStrategies: saved.contentStrategies?.length ? saved.contentStrategies : defaults.contentStrategies,
    editorialSlots: saved.editorialSlots?.length ? saved.editorialSlots : defaults.editorialSlots,
    assetLibrary: saved.assetLibrary?.length ? saved.assetLibrary : defaults.assetLibrary,
    socialTemplates: saved.socialTemplates?.length ? saved.socialTemplates : defaults.socialTemplates,
    brandLibraries: saved.brandLibraries?.length ? saved.brandLibraries : defaults.brandLibraries,
    claimLibraries: saved.claimLibraries?.length ? saved.claimLibraries : defaults.claimLibraries,
    approvalPolicies: saved.approvalPolicies?.length ? saved.approvalPolicies : defaults.approvalPolicies,
    cadencePolicies: saved.cadencePolicies?.length ? saved.cadencePolicies : defaults.cadencePolicies,
    drafts: saved.drafts || [],
    scheduledPosts: saved.scheduledPosts || [],
    postRuns: saved.postRuns || [],
    postPackages: saved.postPackages || [],
    platformDrafts: saved.platformDrafts || [],
    context: saved.context || defaults.context,
  });
  return workspace;
}

function buildProductionPostModel(workspace) {
  if ((workspace.postPackages || []).length || (workspace.platformDrafts || []).length) {
    return {
      postPackages: workspace.postPackages || [],
      platformDrafts: workspace.platformDrafts || [],
    };
  }
  return derivePostPackagesFromWorkspace(workspace);
}

async function saveProductionState() {
  state.postPackages = prototypeModel.postPackages;
  state.platformDrafts = prototypeModel.platformDrafts;
  board = buildPostBoardView(prototypeModel);
  await window.diamond?.saveState?.(state);
}

async function refreshProductionBoard() {
  prototypeModel = buildProductionPostModel(state);
  board = buildPostBoardView(prototypeModel);
  renderBoard(board);
}

function buildSampleWorkspace() {
  const workspace = createSeedWorkspace();
  const samples = [
    ["draft", "World Cup fans can join the free leaderboard before the opening match.", "2026-05-14T11:00:00.000Z"],
    ["needs_review", "$1,000 in total payouts makes the World Cup league feel real.", "2026-05-14T10:30:00.000Z"],
    ["scheduled", "Show your country on the board before matchday.", "2026-05-15T18:00:00.000Z"],
    ["published", "The free World Cup league is open. Make your picks and climb the board.", "2026-05-13T18:00:00.000Z"],
    ["failed", "Live markets need a cleaner Spanish variant before posting.", "2026-05-12T18:00:00.000Z"],
  ];
  workspace.drafts = samples.map(([status, text, createdAt], index) => {
    const draft = createPostDraft({
      context: workspace.context,
      text,
      approvalPolicy: workspace.approvalPolicies[0],
      draftId: `prototype-${status}-${index}`,
    });
    draft.status = status === "published" ? "posted" : status;
    draft.createdAt = createdAt;
    draft.updatedAt = createdAt;
    draft.tags = status === "published" ? ["World Cup", "Launch"] : ["World Cup"];
    return draft;
  });
  workspace.scheduledPosts = [{
    id: "prototype-schedule-1",
    draftId: "prototype-scheduled-2",
    context: workspace.context,
    status: "scheduled",
    scheduledAt: "2026-05-15T18:00:00.000Z",
    text: "Show your country on the board before matchday.",
    media: [],
    createdAt: "2026-05-14T12:00:00.000Z",
  }, {
    id: "prototype-schedule-2",
    draftId: "prototype-draft-0",
    context: workspace.context,
    status: "posted",
    scheduledAt: "2026-05-13T18:00:00.000Z",
    text: "The free World Cup league is open. Make your picks and climb the board.",
    media: [],
    createdAt: "2026-05-13T12:00:00.000Z",
  }];
  workspace.postRuns = [{
    id: "prototype-run-1",
    draftId: "prototype-published-3",
    context: workspace.context,
    status: "posted",
    text: "The free World Cup league is open. Make your picks and climb the board.",
    media: [],
    createdAt: "2026-05-13T18:00:00.000Z",
    metrics: createPostMetrics({
      impressions: 1800,
      clicks: 210,
      signups: 42,
      leagueJoins: 18,
      leagueId: "wc-free-2026",
      leagueName: "World Cup Free League",
      notes: "Launch copy pulled strong signup intent.",
      capturedAt: "2026-05-14T09:00:00.000Z",
    }),
  }, {
    id: "prototype-run-2",
    draftId: "prototype-scheduled-2",
    context: { ...workspace.context, platform: "instagram", socialAccountId: "the-card-instagram" },
    status: "posted",
    text: "Show your country on the board before matchday.",
    media: ["assets/world-cup-leaderboard-placeholder.png"],
    createdAt: "2026-05-14T15:00:00.000Z",
    metrics: createPostMetrics({
      impressions: 2400,
      clicks: 330,
      signups: 61,
      leagueJoins: 27,
      leagueId: "wc-free-2026",
      leagueName: "World Cup Free League",
      notes: "Country leaderboard image outperformed plain copy.",
      capturedAt: "2026-05-14T18:00:00.000Z",
    }),
  }];
  workspace.socialAccounts = workspace.socialAccounts.map((account) => ({
    ...account,
    accountUrl: account.platform === "x" ? "https://x.com/thecardbet" : account.accountUrl,
    sessionStatus: {
      x: "ready",
      facebook: "ready",
      tiktok: "ready",
      instagram: "needs_login",
      linkedin: "unknown",
      "youtube-shorts": "blocked",
      reddit: "monitoring",
    }[account.platform] || "unknown",
    handle: {
      x: "@thecardbet",
      instagram: "thecard.bet",
      tiktok: "thecardbet",
      facebook: "thecard.bet",
    }[account.platform] || "",
    proofCount: {
      x: 3,
      facebook: 2,
      tiktok: 2,
      instagram: 0,
      linkedin: 0,
      "youtube-shorts": 0,
      reddit: 1,
    }[account.platform] || 0,
  }));
  workspace.licenseCache = createTemporaryUnlimitedDiamondLicense({
    userId: "scott",
    brands: [workspace.context.brandId],
    platforms: workspace.socialAccounts.map((account) => account.platform),
  });
  workspace.themeId = "custom";
  workspace.accessibility = {
    keyboardNavigation: "baseline",
    screenReaderLabels: "baseline",
    colorContrast: "needs full audit",
    reducedMotion: "planned",
  };
  return workspace;
}

function renderBoard(columns) {
  document.querySelector("#posts-board").classList.remove("hidden");
  document.querySelector(".prototype-toolbar").classList.remove("hidden");
  document.querySelector("#post-detail").classList.add("hidden");
  const target = document.querySelector("#posts-board");
  target.innerHTML = columns.map((column) => `
    <article class="post-column" aria-labelledby="column-${escapeHtml(column.id)}">
      <header>
        <h2 id="column-${escapeHtml(column.id)}">${escapeHtml(column.label)}</h2>
        <span class="count">${column.count}</span>
      </header>
      <div class="post-list">
        ${column.posts.length ? column.posts.map(renderCard).join("") : `<div class="empty-column">No posts</div>`}
      </div>
    </article>
  `).join("");
}

function renderCard(post) {
  return `
    <button class="post-card" type="button" data-package-id="${escapeHtml(post.id)}">
      <strong>${escapeHtml(post.excerpt || post.title)}</strong>
      <time datetime="${escapeHtml(post.updatedAt || post.createdAt || "")}">${formatDate(post.updatedAt || post.createdAt)}</time>
      ${post.platforms?.length ? `<div class="platform-row">${post.platforms.map((platform) => `<span>${escapeHtml(platform)}</span>`).join("")}</div>` : ""}
      ${post.tags?.length ? `<div class="tag-row">${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
    </button>
  `;
}

function wirePrototypeControls() {
  document.querySelector("#prototype-nav").addEventListener("click", handlePrototypeNav);
  document.querySelector("#operator-toggle")?.addEventListener("click", toggleOperatorDrawer);
  document.querySelector("#operator-close")?.addEventListener("click", closeOperatorDrawer);
  document.querySelector("#create-post").addEventListener("click", openCreateDetail);
  document.querySelector("#back-to-board").addEventListener("click", () => renderBoard(board));
  document.querySelector("#posts-board").addEventListener("click", (event) => {
    const card = event.target.closest("[data-package-id]");
    if (!card) return;
    openPackageDetail(card.dataset.packageId);
  });
  document.querySelector("#idea-text").addEventListener("input", handleIdeaInput);
  document.querySelector("#post-tags").addEventListener("input", handleTagsInput);
  document.querySelector("#accounts-grid")?.addEventListener("click", (event) => {
    const card = event.target.closest("[data-account-id]");
    if (!card) return;
    renderAccounts(card.dataset.accountId);
  });
}

function toggleOperatorDrawer() {
  const drawer = document.querySelector("#operator-drawer");
  const button = document.querySelector("#operator-toggle");
  const willOpen = drawer.classList.contains("hidden");
  drawer.classList.toggle("hidden", !willOpen);
  button?.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) renderOperatorDrawer();
}

function closeOperatorDrawer() {
  document.querySelector("#operator-drawer")?.classList.add("hidden");
  document.querySelector("#operator-toggle")?.setAttribute("aria-expanded", "false");
}

function handlePrototypeNav(event) {
  const link = event.target.closest("[data-view]");
  if (!link) return;
  event.preventDefault();
  showPrototypeView(link.dataset.view);
  document.querySelectorAll("#prototype-nav a").forEach((item) => item.classList.toggle("active", item === link));
}

function showPrototypeView(viewId) {
  document.querySelectorAll(".prototype-view").forEach((view) => {
    view.classList.toggle("hidden", view.id !== viewId);
  });
  if (viewId === "posts-view") renderBoard(board);
  if (viewId === "analytics-view") renderAnalytics();
  if (viewId === "calendar-view") renderCalendar();
  if (viewId === "templates-view") renderTemplates();
  if (viewId === "accounts-view") renderAccounts();
  if (viewId === "brands-view") renderBrands();
  if (viewId === "settings-view") renderSettings();
}

function renderCalendar() {
  const target = document.querySelector("#calendar-board");
  if (!target) return;
  const groups = calendarGroups(state.scheduledPosts || []);
  target.innerHTML = groups.map((group) => `
    <article class="calendar-group ${escapeHtml(group.id)}" aria-labelledby="calendar-${escapeHtml(group.id)}">
      <header>
        <div>
          <h2 id="calendar-${escapeHtml(group.id)}">${escapeHtml(group.label)}</h2>
          <p>${escapeHtml(group.description)}</p>
        </div>
        <span class="count">${group.items.length}</span>
      </header>
      <div class="calendar-list">
        ${group.items.length ? group.items.map(renderCalendarItem).join("") : `<div class="empty-column">No scheduled posts</div>`}
      </div>
    </article>
  `).join("");
}

function calendarGroups(schedules) {
  const now = new Date();
  const groups = [
    { id: "overdue", label: "Overdue", description: "Scheduled windows that need attention.", items: [] },
    { id: "today", label: "Ready Today", description: "Posts due today.", items: [] },
    { id: "upcoming", label: "Upcoming", description: "Planned posts after today.", items: [] },
    { id: "completed", label: "Completed", description: "Posted or closed schedule records.", items: [] },
  ];
  schedules.forEach((schedule) => {
    const scheduledAt = new Date(schedule.scheduledAt);
    if (["posted", "published", "completed"].includes(schedule.status)) {
      groups[3].items.push(schedule);
    } else if (scheduledAt.getTime() < now.getTime() && !isSameLocalDay(scheduledAt, now)) {
      groups[0].items.push(schedule);
    } else if (isSameLocalDay(scheduledAt, now)) {
      groups[1].items.push(schedule);
    } else {
      groups[2].items.push(schedule);
    }
  });
  groups.forEach((group) => {
    group.items.sort((left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime());
  });
  return groups;
}

function renderCalendarItem(item) {
  return `
    <article class="calendar-item">
      <strong>${escapeHtml(item.text || "Untitled scheduled post")}</strong>
      <time datetime="${escapeHtml(item.scheduledAt || "")}">${formatDateTime(item.scheduledAt)}</time>
      <div class="platform-row">
        <span>${escapeHtml(item.context?.platform || "x")}</span>
        <span>${escapeHtml(item.status || "scheduled")}</span>
      </div>
    </article>
  `;
}

function renderAccounts(selectedAccountId) {
  const target = document.querySelector("#accounts-grid");
  const detail = document.querySelector("#account-detail");
  const scope = document.querySelector("#account-scope-strip");
  if (!target || !detail) return;
  const accounts = state.socialAccounts || [];
  const selected = accounts.find((account) => account.id === selectedAccountId) || accounts[0];
  if (scope) scope.innerHTML = renderAccountScope(selected);
  target.innerHTML = accounts.map((account) => renderAccountCard(account, selected?.id)).join("");
  detail.innerHTML = selected ? renderAccountDetail(selected) : `<div class="empty-column">No social accounts configured.</div>`;
}

function renderAccountCard(account, selectedAccountId) {
  const status = account.sessionStatus || "unknown";
  const company = companyName(account.companyId);
  const brand = brandName(account.brandId);
  return `
    <button class="account-card ${account.id === selectedAccountId ? "active" : ""}" type="button" data-account-id="${escapeHtml(account.id)}">
      <span class="platform-mark">${platformIcon(account.platform)}</span>
      <span>
        <strong>${escapeHtml(platformLabel(account.platform))}</strong>
        <small>${escapeHtml(account.handle || account.id)}</small>
        <small>${escapeHtml(company)} / ${escapeHtml(brand)}</small>
      </span>
      <em class="session-pill ${escapeHtml(status)}">${escapeHtml(titleCase(status))}</em>
    </button>
  `;
}

function renderAccountScope(account) {
  if (!account) return "";
  return `
    <article>
      <span class="eyebrow">Company</span>
      <strong>${escapeHtml(companyName(account.companyId))}</strong>
    </article>
    <article>
      <span class="eyebrow">Brand</span>
      <strong>${escapeHtml(brandName(account.brandId))}</strong>
    </article>
    <article>
      <span class="eyebrow">Campaign</span>
      <strong>${escapeHtml(campaignName(state.context?.campaignId))}</strong>
    </article>
    <article>
      <span class="eyebrow">Rule</span>
      <strong>Accounts are brand-scoped</strong>
    </article>
  `;
}

function renderAccountDetail(account) {
  const company = (state.companies || []).find((item) => item.id === account.companyId);
  const brand = (state.brands || []).find((item) => item.id === account.brandId);
  const campaign = (state.campaigns || []).find((item) => item.id === state.context?.campaignId);
  const strategy = (state.contentStrategies || []).find((item) => item.campaignId === campaign?.id);
  const kit = buildSocialAccountSetupKit({ company, brand, campaign, account, strategy });
  return `
    <article class="account-detail-card">
      <header>
        <div>
          <span class="eyebrow">Active account</span>
          <h2>${escapeHtml(platformLabel(account.platform))}</h2>
          <p>${escapeHtml(account.handle || account.accountUrl || account.id)}</p>
        </div>
        <em class="session-pill ${escapeHtml(account.sessionStatus || "unknown")}">${escapeHtml(titleCase(account.sessionStatus || "unknown"))}</em>
      </header>
      <dl class="account-meta">
        <div><dt>Company</dt><dd>${escapeHtml(company?.name || account.companyId || "Unassigned")}</dd></div>
        <div><dt>Brand</dt><dd>${escapeHtml(brand?.name || account.brandId || "Unassigned")}</dd></div>
        <div><dt>Campaign context</dt><dd>${escapeHtml(campaign?.name || campaign?.id || "No campaign")}</dd></div>
        <div><dt>Browser profile</dt><dd>${escapeHtml(account.browserProfileId || "Not assigned")}</dd></div>
        <div><dt>Public account</dt><dd>${escapeHtml(account.accountUrl || "Not saved")}</dd></div>
        <div><dt>Login URL</dt><dd>${escapeHtml(resolveLoginUrl(account) || "Not configured")}</dd></div>
        <div><dt>Compose URL</dt><dd>${escapeHtml(resolveComposeUrl(account) || "Not configured")}</dd></div>
        <div><dt>Proof captures</dt><dd>${escapeHtml(account.proofCount || 0)}</dd></div>
        <div><dt>Mode</dt><dd>${account.monitoringOnly ? "Monitoring only" : "Posting enabled"}</dd></div>
      </dl>
      <section class="account-actions" aria-label="Account actions">
        <button type="button">Open login</button>
        <button type="button">Check session</button>
        <button type="button">Capture proof</button>
        <button type="button">Open composer</button>
      </section>
      <section class="setup-kit" aria-labelledby="setup-kit-heading">
        <h3 id="setup-kit-heading">Setup kit</h3>
        <p>${escapeHtml(kit.summary)}</p>
        <ul>
          ${kit.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    </article>
  `;
}

function companyName(companyId) {
  return (state.companies || []).find((company) => company.id === companyId)?.name || companyId || "Unassigned company";
}

function brandName(brandId) {
  return (state.brands || []).find((brand) => brand.id === brandId)?.name || brandId || "Unassigned brand";
}

function campaignName(campaignId) {
  return (state.campaigns || []).find((campaign) => campaign.id === campaignId)?.name || campaignId || "No campaign";
}

function renderBrands() {
  const target = document.querySelector("#brand-workspace");
  if (!target) return;
  const company = (state.companies || [])[0] || {};
  const brand = (state.brands || [])[0] || {};
  const campaign = (state.campaigns || [])[0] || {};
  const strategy = (state.contentStrategies || [])[0] || {};
  const library = (state.brandLibraries || [])[0] || {};
  const claims = (state.claimLibraries || [])[0] || {};
  target.innerHTML = `
    <aside class="brand-overview" aria-label="Brand overview">
      <article class="brand-identity-card">
        <span class="eyebrow">Company</span>
        <h2>${escapeHtml(company.name || company.id || "Company")}</h2>
        <dl class="brand-facts">
          <div><dt>Brand</dt><dd>${escapeHtml(brand.name || brand.id || "Unassigned")}</dd></div>
          <div><dt>Campaign</dt><dd>${escapeHtml(campaign.name || campaign.id || "No campaign")}</dd></div>
          <div><dt>Status</dt><dd>${escapeHtml(titleCase(campaign.status || "draft"))}</dd></div>
          <div><dt>Languages</dt><dd>${escapeHtml((brand.languages || []).join(", ") || "English")}</dd></div>
        </dl>
      </article>
      <article class="strategy-card">
        <h3>Primary CTA</h3>
        <p>${escapeHtml(strategy.cta || "No CTA set.")}</p>
        <h3>Offer</h3>
        <p>${escapeHtml(strategy.offer || "No offer set.")}</p>
      </article>
    </aside>
    <section class="brand-panels" aria-label="Brand operating rules">
      ${renderBrandPanel("Goals", strategy.goals)}
      ${renderBrandPanel("Audience", strategy.audience)}
      ${renderBrandPanel("Pillars", strategy.pillars)}
      ${renderBrandPanel("Voice", [library.voice])}
      ${renderBrandPanel("Approved phrases", library.approvedPhrases)}
      ${renderBrandPanel("Banned phrases", library.bannedPhrases)}
      ${renderBrandPanel("Prize language", claims.prizeLanguage)}
      ${renderBrandPanel("Requires review", claims.requiresReviewClaims)}
      ${renderBrandPanel("Blocked claims", claims.blockedClaims)}
      ${renderBrandPanel("Reference accounts", strategy.referenceAccounts)}
    </section>
  `;
}

function renderBrandPanel(title, items = []) {
  const list = (items || []).filter(Boolean);
  return `
    <article class="brand-panel">
      <header>
        <h3>${escapeHtml(title)}</h3>
        <span class="count">${list.length}</span>
      </header>
      ${list.length ? `<ul>${list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : `<p>No ${escapeHtml(title.toLowerCase())} set.</p>`}
    </article>
  `;
}

function renderTemplates() {
  const target = document.querySelector("#templates-workspace");
  if (!target) return;
  const templates = state.socialTemplates || [];
  const assets = state.assetLibrary || [];
  const slots = state.editorialSlots || [];
  target.innerHTML = `
    <aside class="template-summary" aria-label="Template summary">
      <article>
        <span class="eyebrow">Company</span>
        <strong>${escapeHtml(companyName(state.context?.companyId))}</strong>
      </article>
      <article>
        <span class="eyebrow">Brand</span>
        <strong>${escapeHtml(brandName(state.context?.brandId))}</strong>
      </article>
      <article>
        <span class="eyebrow">Templates</span>
        <strong>${templates.length}</strong>
      </article>
      <article>
        <span class="eyebrow">Assets</span>
        <strong>${assets.length}</strong>
      </article>
    </aside>
    <section class="template-columns" aria-label="Reusable template columns">
      <article class="template-column">
        <header>
          <h2>Social templates</h2>
          <span class="count">${templates.length}</span>
        </header>
        <div class="template-list">
          ${templates.map(renderTemplateCard).join("") || `<div class="empty-column">No templates</div>`}
        </div>
      </article>
      <article class="template-column">
        <header>
          <h2>Asset library</h2>
          <span class="count">${assets.length}</span>
        </header>
        <div class="template-list">
          ${assets.map(renderAssetCard).join("") || `<div class="empty-column">No assets</div>`}
        </div>
      </article>
      <article class="template-column">
        <header>
          <h2>Creative needs</h2>
          <span class="count">${slots.length}</span>
        </header>
        <div class="template-list">
          ${slots.map(renderCreativeNeedCard).join("") || `<div class="empty-column">No creative needs</div>`}
        </div>
      </article>
    </section>
  `;
}

function renderTemplateCard(template) {
  return `
    <article class="template-card">
      <header>
        <strong>${escapeHtml(titleCase(template.type || "template"))}</strong>
        <span>${escapeHtml(platformLabel(template.platform))}</span>
      </header>
      <p>${escapeHtml(template.notes || "Reusable social template.")}</p>
      <dl>
        <div><dt>Campaign</dt><dd>${escapeHtml(campaignName(template.campaignId))}</dd></div>
        <div><dt>Safe zone</dt><dd>${escapeHtml(template.safeZone || "Not set")}</dd></div>
      </dl>
    </article>
  `;
}

function renderAssetCard(asset) {
  return `
    <article class="template-card asset-card">
      <header>
        <strong>${escapeHtml(titleCase(asset.type || "asset"))}</strong>
        <span>${escapeHtml(asset.language || "en")}</span>
      </header>
      <p>${escapeHtml(asset.altText || asset.notes || "Creative asset.")}</p>
      <dl>
        <div><dt>File</dt><dd>${escapeHtml(asset.filePath || "Not linked")}</dd></div>
        <div><dt>Safe zone</dt><dd>${escapeHtml(asset.safeZone || "Not set")}</dd></div>
      </dl>
    </article>
  `;
}

function renderCreativeNeedCard(slot) {
  return `
    <article class="template-card">
      <header>
        <strong>${escapeHtml(platformLabel(slot.platform))}</strong>
        <span>${escapeHtml(titleCase(slot.status || "planned"))}</span>
      </header>
      <p>${escapeHtml(slot.assetNeed || slot.topic || "Creative needed.")}</p>
      <dl>
        <div><dt>Topic</dt><dd>${escapeHtml(slot.topic || "No topic")}</dd></div>
        <div><dt>Language</dt><dd>${escapeHtml(slot.language || "en")}</dd></div>
      </dl>
    </article>
  `;
}

function renderSettings() {
  const target = document.querySelector("#settings-workspace");
  if (!target) return;
  const license = state.licenseCache || createTemporaryUnlimitedDiamondLicense({
    userId: "scott",
    brands: [state.context?.brandId].filter(Boolean),
    platforms: (state.socialAccounts || []).map((account) => account.platform),
  });
  const licenseCheck = evaluateDiamondLicense(license, {
    requestedBrands: [state.context?.brandId].filter(Boolean),
    requestedPlatforms: [state.context?.platform].filter(Boolean),
  });
  const model = buildDiamondLicenseModel();
  const firebase = resolveFirebaseAdminConfig({
    env: {},
    projectId: "diamond-local-preview",
    files: ["C:/Users/scott/Code/diamond/firebase-admin.json"],
  });
  const legalDocuments = getDiamondLegalDocuments();
  const syncSummary = summarizeFirestoreSyncBundle(buildFirestoreSyncBundle(state));
  const cadencePolicy = (state.cadencePolicies || [])[0] || {};
  target.innerHTML = `
    <section class="settings-grid">
      ${renderSettingsPanel("License", [
        ["Status", licenseCheck.ok ? "Ready" : "Blocked"],
        ["Plan", license.planId || "custom"],
        ["Role", license.role || "user"],
        ["Brands", String(licenseCheck.brandLimit || license.brandLimit || "0")],
        ["Platforms", String(licenseCheck.platformLimit || license.platformLimit || "0")],
        ["Automation", formatAutomation(licenseCheck.automationPlatforms || license.automationPlatforms)],
        ["Firebase path", license.firebasePath || model.firebase.collectionPath],
      ])}
      ${renderSettingsPanel("Firebase", [
        ["Status", firebase.ok ? "Configured" : "Not configured"],
        ["Admin JSON", firebase.redactedPath || "Missing"],
        ["Project", firebase.projectId || "Missing"],
        ["Source", firebase.source],
        ["License collection", model.firebase.collectionPath],
      ])}
      ${renderSettingsPanel("Routine timing", [
        ["Due window", `${cadencePolicy.routineDueWindowMinutes ?? 15} minutes`],
        ["Max posts/day", String(cadencePolicy.maxPostsPerDay ?? "Not set")],
        ["Max replies/hour", String(cadencePolicy.maxRepliesPerHour ?? "Not set")],
        ["Cooldown", `${cadencePolicy.cooldownMinutes ?? 0} minutes`],
      ])}
      ${renderSettingsPanel("Theme", [
        ["Selected", titleCase(state.themeId || "broadcast")],
        ["Shell color", "#080808"],
        ["Panel color", "#111113"],
        ["Accent color", "#f5f5f7"],
        ["Custom swatches", "4 editable dots"],
      ])}
      ${renderSettingsPanel("Accessibility", [
        ["Keyboard navigation", state.accessibility?.keyboardNavigation || "baseline"],
        ["Screen reader labels", state.accessibility?.screenReaderLabels || "baseline"],
        ["Color contrast", state.accessibility?.colorContrast || "planned"],
        ["Reduced motion", state.accessibility?.reducedMotion || "planned"],
      ])}
      ${renderSettingsPanel("Firestore sync", Object.entries(syncSummary).map(([key, value]) => [titleCase(key), String(value)]))}
    </section>
    <section class="legal-settings" aria-label="Legal drafts">
      <header>
        <h2>Legal drafts</h2>
        <span class="count">${legalDocuments.length}</span>
      </header>
      <div class="legal-list">
        ${legalDocuments.map(renderLegalCard).join("")}
      </div>
    </section>
  `;
}

function renderAnalytics() {
  const target = document.querySelector("#analytics-workspace");
  if (!target) return;
  const metricsRuns = (state.postRuns || []).filter((run) => run.metrics);
  const totals = totalMetrics(metricsRuns);
  const statusCounts = countBy(state.drafts || [], (draft) => draft.status || "draft");
  const platformRows = analyticsPlatformRows(metricsRuns);
  const readinessRows = (state.socialAccounts || []).map((account) => ({
    label: platformLabel(account.platform),
    primary: titleCase(account.sessionStatus || "unknown"),
    secondary: `${account.proofCount || 0} proof captures`,
    status: account.sessionStatus || "unknown",
  }));
  target.innerHTML = `
    <section class="analytics-summary" aria-label="Campaign summary">
      ${renderMetricTile("Impressions", formatNumber(totals.impressions), "Captured from posted runs")}
      ${renderMetricTile("Clicks", formatNumber(totals.clicks), `${formatRate(totals.ctr)} CTR`)}
      ${renderMetricTile("Signups", formatNumber(totals.signups), `${formatRate(totals.signupRate)} signup rate`)}
      ${renderMetricTile("League joins", formatNumber(totals.leagueJoins), `${formatRate(totals.leagueJoinRate)} join rate`)}
    </section>
    <section class="analytics-layout">
      <article class="analytics-panel">
        <header>
          <h2>Content funnel</h2>
          <span class="count">${(state.drafts || []).length}</span>
        </header>
        <div class="funnel-list">
          ${renderFunnelRow("Draft", statusCounts.draft || 0)}
          ${renderFunnelRow("Needs review", statusCounts.needs_review || 0)}
          ${renderFunnelRow("Scheduled", (state.scheduledPosts || []).filter((item) => item.status === "scheduled").length)}
          ${renderFunnelRow("Posted", (state.postRuns || []).filter((run) => run.status === "posted").length)}
          ${renderFunnelRow("Failed", statusCounts.failed || 0)}
        </div>
      </article>
      <article class="analytics-panel">
        <header>
          <h2>Platform performance</h2>
          <span class="count">${platformRows.length}</span>
        </header>
        <div class="analytics-table">
          ${platformRows.map(renderAnalyticsRow).join("") || `<div class="empty-column">No platform metrics</div>`}
        </div>
      </article>
      <article class="analytics-panel">
        <header>
          <h2>Account readiness</h2>
          <span class="count">${readinessRows.length}</span>
        </header>
        <div class="analytics-table">
          ${readinessRows.map(renderReadinessRow).join("")}
        </div>
      </article>
    </section>
    <section class="analytics-runs" aria-label="Recent measured posts">
      <header>
        <h2>Recent measured posts</h2>
        <span class="count">${metricsRuns.length}</span>
      </header>
      <div class="analytics-run-list">
        ${metricsRuns.map(renderRunMetricCard).join("") || `<div class="empty-column">No measured posts yet</div>`}
      </div>
    </section>
  `;
}

function renderOperatorDrawer() {
  const target = document.querySelector("#operator-workspace");
  if (!target) return;
  const context = state.context || {};
  const account = activeSocialAccount();
  const checks = operatorChecks(account);
  const syncSummary = summarizeFirestoreSyncBundle(buildFirestoreSyncBundle(state));
  const recentLogs = operatorRunLogs();
  target.innerHTML = `
    <section class="operator-panel">
      <header>
        <h3>Active target</h3>
        <span class="session-pill ${escapeHtml(account?.sessionStatus || "unknown")}">${escapeHtml(titleCase(account?.sessionStatus || "unknown"))}</span>
      </header>
      <dl class="operator-meta">
        <div><dt>Company</dt><dd>${escapeHtml(companyName(context.companyId))}</dd></div>
        <div><dt>Brand</dt><dd>${escapeHtml(brandName(context.brandId))}</dd></div>
        <div><dt>Campaign</dt><dd>${escapeHtml(campaignName(context.campaignId))}</dd></div>
        <div><dt>Platform</dt><dd>${escapeHtml(platformLabel(account?.platform || context.platform || "x"))}</dd></div>
        <div><dt>Account</dt><dd>${escapeHtml(account?.handle || account?.id || "No account selected")}</dd></div>
        <div><dt>Browser profile</dt><dd>${escapeHtml(account?.browserProfileId || "Not assigned")}</dd></div>
      </dl>
    </section>

    <section class="operator-panel">
      <header>
        <h3>Preflight checks</h3>
        <span class="count">${checks.filter((check) => check.ok).length}/${checks.length}</span>
      </header>
      <div class="operator-checks">
        ${checks.map(renderOperatorCheck).join("")}
      </div>
    </section>

    <section class="operator-panel">
      <header>
        <h3>Browser staging</h3>
        <span class="count">4</span>
      </header>
      <div class="operator-action-grid">
        ${renderOperatorAction("Open account", resolveLoginUrl(account) || "Login URL missing")}
        ${renderOperatorAction("Check session", `Current state: ${titleCase(account?.sessionStatus || "unknown")}`)}
        ${renderOperatorAction("Stage in browser", resolveComposeUrl(account) || "Compose URL missing")}
        ${renderOperatorAction("Capture proof", `${account?.proofCount || 0} proof captures saved`)}
      </div>
    </section>

    <section class="operator-panel">
      <header>
        <h3>Validation and sync</h3>
        <span class="count">${Object.keys(syncSummary).length}</span>
      </header>
      <div class="operator-action-grid">
        ${renderOperatorAction("Validate package", "Checks policy, platform limits, and missing media.")}
        ${renderOperatorAction("Sync license", "Reads the Firebase license cache and offline grace window.")}
        ${renderOperatorAction("Check Firebase", "Validates admin config and expected collection paths.")}
        ${renderOperatorAction("Export bundle", `${formatNumber(syncSummary.totalDocuments || 0)} Firestore documents staged.`)}
      </div>
    </section>

    <section class="operator-panel operator-log-panel">
      <header>
        <h3>Run log</h3>
        <span class="count">${recentLogs.length}</span>
      </header>
      <ol class="operator-log">
        ${recentLogs.map((log) => `<li><time>${escapeHtml(formatDateTime(log.createdAt))}</time><span>${escapeHtml(log.message)}</span></li>`).join("")}
      </ol>
    </section>
  `;
}

function operatorChecks(account) {
  const license = state.licenseCache || createTemporaryUnlimitedDiamondLicense({
    userId: "scott",
    brands: [state.context?.brandId].filter(Boolean),
    platforms: (state.socialAccounts || []).map((item) => item.platform),
  });
  const licenseCheck = evaluateDiamondLicense(license, {
    requestedBrands: [account?.brandId || state.context?.brandId].filter(Boolean),
    requestedPlatforms: [account?.platform || state.context?.platform].filter(Boolean),
  });
  const firebase = resolveFirebaseAdminConfig({
    env: {},
    projectId: "diamond-local-preview",
    files: ["C:/Users/scott/Code/diamond/firebase-admin.json"],
  });
  const cadencePolicy = (state.cadencePolicies || [])[0] || {};
  return [
    {
      label: "License permits target",
      ok: licenseCheck.ok,
      note: licenseCheck.ok ? `${licenseCheck.planId || license.planId || "custom"} permits this brand/platform.` : licenseCheck.reason || "License blocked.",
    },
    {
      label: "Firebase admin config",
      ok: firebase.ok,
      note: firebase.ok ? firebase.redactedPath || "Configured" : "Admin JSON or project id missing.",
    },
    {
      label: "Account session",
      ok: account?.sessionStatus === "ready",
      note: `${platformLabel(account?.platform || "x")} is ${titleCase(account?.sessionStatus || "unknown")}.`,
    },
    {
      label: "Browser profile",
      ok: Boolean(account?.browserProfileId),
      note: account?.browserProfileId || "No browser profile assigned.",
    },
    {
      label: "Cadence window",
      ok: Number(cadencePolicy.routineDueWindowMinutes ?? 15) > 0,
      note: `${cadencePolicy.routineDueWindowMinutes ?? 15} minute due window.`,
    },
    {
      label: "Manual approval policy",
      ok: (state.approvalPolicies || []).some((policy) => policy.autoAllowed),
      note: (state.approvalPolicies || [])[0]?.name || "No approval policy configured.",
    },
  ];
}

function renderOperatorCheck(check) {
  return `
    <article class="operator-check ${check.ok ? "ready" : "blocked"}">
      <span>${check.ok ? "Ready" : "Needs attention"}</span>
      <strong>${escapeHtml(check.label)}</strong>
      <p>${escapeHtml(check.note)}</p>
    </article>
  `;
}

function renderOperatorAction(label, note) {
  return `
    <button class="operator-action" type="button">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(note)}</span>
    </button>
  `;
}

function activeSocialAccount() {
  const context = state.context || {};
  return (state.socialAccounts || []).find((account) => account.id === context.socialAccountId)
    || (state.socialAccounts || []).find((account) => account.platform === context.platform)
    || (state.socialAccounts || [])[0];
}

function operatorRunLogs() {
  const runLogs = (state.postRuns || []).map((run) => ({
    createdAt: run.createdAt,
    message: `${platformLabel(run.context?.platform || "x")} ${run.status || "run"}: ${run.text || run.id}`,
  }));
  return [
    ...runLogs,
    {
      createdAt: new Date().toISOString(),
      message: "Prototype operator drawer rendered with validation, staging, and sync panels.",
    },
  ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()).slice(0, 5);
}

function renderMetricTile(label, value, note) {
  return `
    <article class="metric-tile">
      <span class="eyebrow">${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <p>${escapeHtml(note)}</p>
    </article>
  `;
}

function renderFunnelRow(label, count) {
  const total = Math.max((state.drafts || []).length + (state.scheduledPosts || []).length + (state.postRuns || []).length, 1);
  const percent = Math.round((count / total) * 100);
  return `
    <div class="funnel-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(count)}</strong>
      <div><i style="width:${percent}%"></i></div>
    </div>
  `;
}

function renderAnalyticsRow(row) {
  return `
    <div class="analytics-row">
      <strong>${escapeHtml(row.label)}</strong>
      <span>${formatNumber(row.impressions)} impressions</span>
      <span>${formatRate(row.ctr)} CTR</span>
      <span>${formatNumber(row.leagueJoins)} joins</span>
    </div>
  `;
}

function renderReadinessRow(row) {
  return `
    <div class="analytics-row">
      <strong>${escapeHtml(row.label)}</strong>
      <span>${escapeHtml(row.primary)}</span>
      <span>${escapeHtml(row.secondary)}</span>
      <span>${escapeHtml(row.status)}</span>
    </div>
  `;
}

function renderRunMetricCard(run) {
  return `
    <article class="analytics-run-card">
      <header>
        <strong>${escapeHtml(platformLabel(run.context?.platform || "x"))}</strong>
        <time datetime="${escapeHtml(run.createdAt || "")}">${formatDateTime(run.createdAt)}</time>
      </header>
      <p>${escapeHtml(run.text || "Measured post")}</p>
      <small>${escapeHtml(summarizePostMetrics(run.metrics))}</small>
    </article>
  `;
}

function analyticsPlatformRows(runs) {
  const rows = new Map();
  runs.forEach((run) => {
    const platform = run.context?.platform || "x";
    const current = rows.get(platform) || { label: platformLabel(platform), impressions: 0, clicks: 0, signups: 0, leagueJoins: 0 };
    current.impressions += run.metrics?.impressions || 0;
    current.clicks += run.metrics?.clicks || 0;
    current.signups += run.metrics?.signups || 0;
    current.leagueJoins += run.metrics?.leagueJoins || 0;
    rows.set(platform, current);
  });
  return [...rows.values()].map((row) => ({
    ...row,
    ctr: row.impressions ? row.clicks / row.impressions : null,
  }));
}

function totalMetrics(runs) {
  const total = runs.reduce((acc, run) => {
    acc.impressions += run.metrics?.impressions || 0;
    acc.clicks += run.metrics?.clicks || 0;
    acc.signups += run.metrics?.signups || 0;
    acc.leagueJoins += run.metrics?.leagueJoins || 0;
    return acc;
  }, { impressions: 0, clicks: 0, signups: 0, leagueJoins: 0 });
  total.ctr = total.impressions ? total.clicks / total.impressions : null;
  total.signupRate = total.clicks ? total.signups / total.clicks : null;
  total.leagueJoinRate = total.signups ? total.leagueJoins / total.signups : null;
  return total;
}

function countBy(items, mapper) {
  return items.reduce((acc, item) => {
    const key = mapper(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function renderSettingsPanel(title, rows) {
  return `
    <article class="settings-panel">
      <header>
        <h2>${escapeHtml(title)}</h2>
      </header>
      <dl>
        ${rows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
      </dl>
    </article>
  `;
}

function renderLegalCard(document) {
  return `
    <article class="legal-card">
      <header>
        <strong>${escapeHtml(document.title)}</strong>
        <span>${escapeHtml(titleCase(document.status))}</span>
      </header>
      <p>${escapeHtml(document.summary)}</p>
      <dl>
        <div><dt>Updated</dt><dd>${escapeHtml(document.updatedAt)}</dd></div>
        <div><dt>Sections</dt><dd>${escapeHtml((document.sections || []).length)}</dd></div>
      </dl>
    </article>
  `;
}

function formatAutomation(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "off";
  return String(value || "off");
}

function openCreateDetail() {
  const context = state.context;
  const now = new Date().toISOString();
  const postPackage = createPostPackage({
    id: `package-${Date.now()}`,
    context,
    ideaText: "Write the core post idea here, then generate platform versions.",
    tags: ["draft"],
    source: "diamond-shell",
    createdAt: now,
    updatedAt: now,
  });
  const platforms = ["linkedin", "x"];
  const drafts = platforms.map((platform) => createPlatformDraft({
    id: `${postPackage.id}-${platform}`,
    postPackage,
    context,
    platform,
    socialAccountId: socialAccountIdForPlatform(platform),
    text: platformCopy(postPackage.ideaText, platform),
    status: "draft",
    createdAt: now,
    updatedAt: now,
  }));
  upsertPostPackage(postPackage, drafts);
  saveProductionState();
  openDetail(postPackage, drafts);
}

function openPackageDetail(packageId) {
  const postPackage = prototypeModel.postPackages.find((item) => item.id === packageId);
  if (!postPackage) return;
  const drafts = prototypeModel.platformDrafts.filter((draft) => draft.postPackageId === postPackage.id);
  openDetail(postPackage, drafts.length ? drafts : [createPlatformDraft({
    postPackage,
    context: postPackage.context,
    platform: postPackage.context.platform,
    socialAccountId: postPackage.context.socialAccountId,
    text: postPackage.ideaText,
    status: postPackage.status,
  })]);
}

function openDetail(postPackage, drafts) {
  activePostPackageId = postPackage.id;
  document.querySelector("#posts-board").classList.add("hidden");
  document.querySelector(".prototype-toolbar").classList.add("hidden");
  document.querySelector("#post-detail").classList.remove("hidden");
  document.querySelector("#post-detail-heading").textContent = postPackage.title || "Draft";
  document.querySelector("#detail-status").textContent = titleCase(postPackage.status);
  document.querySelector("#detail-status").className = `status-badge ${postPackage.status}`;
  document.querySelector("#idea-text").value = postPackage.ideaText || "";
  document.querySelector("#post-tags").value = (postPackage.tags || []).join(", ");
  renderPlatformButtons(drafts);
  renderPlatformPreviews(drafts);
}

function renderPlatformButtons(drafts) {
  const target = document.querySelector("#platform-buttons");
  target.innerHTML = drafts.map((draft) => `
    <button type="button" class="platform-button active">${platformIcon(draft.platform)} ${escapeHtml(platformLabel(draft.platform))}</button>
  `).join("");
}

function renderPlatformPreviews(drafts) {
  const target = document.querySelector("#platform-previews");
  target.innerHTML = drafts.map((draft) => `
    <article class="platform-preview" data-preview-platform="${escapeHtml(draft.platform)}">
      <header>
        <strong>${platformIcon(draft.platform)} ${escapeHtml(platformLabel(draft.platform))}</strong>
        ${draft.charLimit ? `<span>${draft.text.length}/${draft.charLimit}</span>` : ""}
      </header>
      <textarea rows="${draft.platform === "x" ? 4 : 7}">${escapeHtml(draft.text)}</textarea>
      <button type="button" class="media-button">+ Media</button>
      <div class="social-preview">
        <div class="avatar"></div>
        <div>
          <strong>Your Name</strong>
          <p>Your headline<br>now</p>
        </div>
        <p>${escapeHtml(draft.text)}</p>
      </div>
    </article>
  `).join("");
}

function handleIdeaInput() {
  updatePreviewCopy();
  persistActiveDetail();
}

function handleTagsInput() {
  updatePreviewTags();
  persistActiveDetail();
}

function updatePreviewCopy() {
  const idea = document.querySelector("#idea-text").value;
  document.querySelectorAll("[data-preview-platform]").forEach((preview) => {
    const platform = preview.dataset.previewPlatform;
    const text = platformCopy(idea, platform);
    const textarea = preview.querySelector("textarea");
    textarea.value = text;
    const counter = preview.querySelector("header span");
    if (counter) counter.textContent = `${text.length}/${platform === "x" ? 280 : 2200}`;
    preview.querySelector(".social-preview > p").textContent = text;
  });
}

function updatePreviewTags() {
  const value = document.querySelector("#post-tags").value;
  document.querySelector("#detail-status").title = `Tags: ${value || "none"}`;
}

function persistActiveDetail() {
  if (!activePostPackageId) return;
  const postPackage = prototypeModel.postPackages.find((item) => item.id === activePostPackageId);
  if (!postPackage) return;
  const idea = document.querySelector("#idea-text").value;
  const tags = document.querySelector("#post-tags").value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  const updatedAt = new Date().toISOString();
  postPackage.ideaText = idea;
  postPackage.title = idea.length > 64 ? `${idea.slice(0, 61)}...` : idea;
  postPackage.tags = [...new Set(tags)];
  postPackage.updatedAt = updatedAt;
  prototypeModel.platformDrafts
    .filter((draft) => draft.postPackageId === activePostPackageId)
    .forEach((draft) => {
      draft.text = platformCopy(idea, draft.platform);
      draft.updatedAt = updatedAt;
    });
  saveProductionState();
}

function upsertPostPackage(postPackage, drafts) {
  const packageIndex = prototypeModel.postPackages.findIndex((item) => item.id === postPackage.id);
  if (packageIndex >= 0) {
    prototypeModel.postPackages[packageIndex] = postPackage;
  } else {
    prototypeModel.postPackages.unshift(postPackage);
  }
  drafts.forEach((draft) => {
    const draftIndex = prototypeModel.platformDrafts.findIndex((item) => item.id === draft.id);
    if (draftIndex >= 0) {
      prototypeModel.platformDrafts[draftIndex] = draft;
    } else {
      prototypeModel.platformDrafts.unshift(draft);
    }
  });
  postPackage.platformDraftIds = drafts.map((draft) => draft.id);
}

function platformCopy(idea, platform) {
  const text = String(idea || "").trim();
  if (platform === "x") return text.length > 220 ? `${text.slice(0, 217)}...` : text;
  if (platform === "linkedin") return text;
  return text;
}

function socialAccountIdForPlatform(platform) {
  return (state.socialAccounts || []).find((account) => account.platform === platform)?.id || state.context.socialAccountId;
}

function platformIcon(platform) {
  return {
    linkedin: "in",
    x: "X",
    instagram: "IG",
    tiktok: "TT",
    facebook: "f",
  }[platform] || "+";
}

function platformLabel(platform) {
  return {
    linkedin: "LinkedIn",
    x: "X",
    instagram: "Instagram",
    tiktok: "TikTok",
    facebook: "Facebook",
  }[platform] || platform;
}

function titleCase(value) {
  return String(value || "draft").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString([], { month: "numeric", day: "numeric", year: "numeric" });
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatRate(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "0.0%";
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function isSameLocalDay(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  }[char]));
}
