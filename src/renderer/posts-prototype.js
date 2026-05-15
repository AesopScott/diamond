import {
  buildSocialAccountSetupKit,
  buildDiamondLicenseModel,
  buildPostBoardView,
  createBrandRecord,
  createCampaignRecord,
  createCompanyRecord,
  createPostMetrics,
  createTemporaryUnlimitedDiamondLicense,
  createPlatformDraft,
  createPostDraft,
  createPostPackage,
  createSeedWorkspace,
  derivePostPackagesFromWorkspace,
  evaluateDiamondLicense,
  evaluateDraftQuality,
  evaluateDraftRisk,
  getDiamondLegalDocuments,
  migrateWorkspaceState,
  normalizeAccountUrl,
  normalizeBrowserProfileId,
  normalizeComposeUrl,
  normalizeHost,
  normalizeId,
  normalizeLoginUrl,
  resolveFirebaseAdminConfig,
  resolveComposeUrl,
  resolveLoginUrl,
  summarizePostMetrics,
  summarizeFirestoreSyncBundle,
  buildFirestoreSyncBundle,
  buildTourVoiceoverScript,
  createElevenLabsSpeechRequest,
  getDiamondGuideSections,
  getDiamondTourSteps,
  captureRedditMonitoringItem,
  createPlatformProofRecord,
  ensurePlatformProofRecords,
  evaluatePlatformProof,
  markPlatformProofFromStage,
  platformProofId,
  platformStagingPlan,
  stagingProofSessionProgress,
} from "../index.js";

const PROFESSIONAL_THEMES = [
  {
    id: "graphite-red",
    label: "Graphite Red",
    description: "Closest to Diamond now, with sharper contrast and controlled red.",
    swatches: ["#11161d", "#191e26", "#d84f45", "#e6b85c"],
  },
  {
    id: "slate-blue",
    label: "Slate Blue",
    description: "Cool SaaS operating surface with blue action language.",
    swatches: ["#0f1722", "#18212c", "#4f8cff", "#7fc8ff"],
  },
  {
    id: "evergreen",
    label: "Evergreen",
    description: "Calm, focused, and credible without feeling cold.",
    swatches: ["#0f1713", "#17211a", "#4ca66a", "#83c985"],
  },
  {
    id: "ink-copper",
    label: "Ink Copper",
    description: "Editorial warmth with restrained action emphasis.",
    swatches: ["#15110e", "#211913", "#c77743", "#e0ad67"],
  },
  {
    id: "sportsbook-navy",
    label: "Sportsbook Navy",
    description: "Sports-adjacent navy and gold without casino noise.",
    swatches: ["#0b1420", "#172131", "#6aa6ff", "#f0c96a"],
  },
  {
    id: "burgundy-desk",
    label: "Burgundy Desk",
    description: "Distinct but grown-up, good for brand-heavy work.",
    swatches: ["#171016", "#21171d", "#c75b7b", "#e3b45f"],
  },
  {
    id: "warm-stone",
    label: "Warm Stone",
    description: "Neutral, readable, and restrained with quiet gold emphasis.",
    swatches: ["#151515", "#1e1e1e", "#d0a85c", "#a8c7e5"],
  },
  {
    id: "blue-steel",
    label: "Blue Steel",
    description: "Low-saturation color with clear section separation.",
    swatches: ["#10161c", "#192026", "#71a3a8", "#a8c66c"],
  },
  {
    id: "deep-plum",
    label: "Deep Plum",
    description: "A little distinctive, but still muted and structured.",
    swatches: ["#14111b", "#1f1928", "#8f7ad8", "#d0b36d"],
  },
  {
    id: "executive-neutral",
    label: "Executive Neutral",
    description: "Nearly monochrome, with status color doing the work.",
    swatches: ["#111318", "#1a1d23", "#b7c0ce", "#d6a85c"],
  },
];

const OPERATOR_LABELS_ES = {
  "Posts": "Publicaciones",
  "Analytics": "Analitica",
  "Templates": "Plantillas",
  "Calendar": "Calendario",
  "Accounts": "Cuentas",
  "Brands": "Marcas",
  "Settings": "Configuracion",
  "Operator": "Operador",
  "Create": "Crear",
  "Export": "Exportar",
  "Schedule": "Programar",
  "Sync": "Sincronizar",
  "Back": "Volver",
  "Draft": "Borrador",
  "Approved": "Aprobado",
  "Staged": "Preparado",
  "Scheduled": "Programado",
  "Published": "Publicado",
  "Posted": "Publicado",
  "Failed": "Fallido",
  "Unknown": "Desconocido",
  "Blocked": "Bloqueado",
  "Needs Login": "Necesita inicio",
  "Monitoring": "Monitoreo",
  "Needs Review": "Necesita revision",
  "Needs Attention": "Necesita atencion",
  "Ready": "Listo",
  "Evaluate": "Evaluar",
  "Approve": "Aprobar",
  "Stage": "Preparar",
  "Capture Proof": "Capturar prueba",
  "Capture Reddit": "Capturar Reddit",
  "Copy Proof": "Copiar prueba",
  "Copy Url": "Copiar URL",
  "Copy Screenshot": "Copiar captura",
  "Mark Posted": "Marcar publicado",
  "Abandon": "Abandonar",
  "Add Account": "Agregar cuenta",
  "Add Company": "Agregar empresa",
  "Add Brand": "Agregar marca",
  "Add Campaign": "Agregar campana",
  "Add Template": "Agregar plantilla",
  "Close": "Cerrar",
  "Save Settings": "Guardar configuracion",
  "Check Firebase": "Revisar Firebase",
  "Sync License": "Sincronizar licencia",
  "Export Firestore Bundle": "Exportar paquete Firestore",
  "Copy Legal Summary": "Copiar resumen legal",
  "Copy User Guide": "Copiar guia",
  "Copy Tour Script": "Copiar guion",
  "Generate Voiceovers": "Generar voces",
  "Start Walkthrough": "Iniciar guia",
  "Proof": "Prueba",
  "Proof Status": "Estado de prueba",
  "Proof Kind": "Tipo de prueba",
  "Stage Mode": "Modo de preparacion",
  "Text Insert": "Insercion de texto",
  "Proof Target": "Objetivo de prueba",
  "Staged Url": "URL preparada",
  "Screenshot": "Captura",
  "Run Id": "ID de ejecucion",
  "Account Proofs": "Pruebas de cuenta",
  "Next": "Siguiente",
  "Social Templates": "Plantillas sociales",
  "Creative Assets": "Activos creativos",
  "Planned Needs": "Necesidades planeadas",
  "Founder": "Fundador",
  "Campaign": "Campana",
  "Prize": "Premio",
  "Country": "Pais",
  "Leaderboard": "Tabla",
  "Asset": "Activo",
  "Template": "Plantilla",
  "Browser Staging": "Preparacion en navegador",
  "Assisted": "Asistido",
  "Manual Paste": "Pegado manual",
  "Opened": "Abierto",
  "Text": "Texto",
  "Inserted": "Insertado",
  "Manual Paste Required": "Pegado manual requerido",
  "Not Inserted": "No insertado",
  "Attached": "Adjunto",
  "Manual Upload Required": "Carga manual requerida",
  "No Assisted Upload": "Sin carga asistida",
  "Review Before Publishing": "Revisar antes de publicar",
  "Platform": "Plataforma",
  "Company": "Empresa",
  "Brand": "Marca",
  "Account": "Cuenta",
  "Session": "Sesion",
  "Approval": "Aprobacion",
  "Media": "Medios",
  "Missing": "Falta",
  "Not Scheduled": "No programado",
  "No Posts": "Sin publicaciones",
  "Platform Not Set": "Plataforma no definida",
  "Validation And Sync": "Validacion y sincronizacion",
  "Open Account": "Abrir cuenta",
  "Check Session": "Revisar sesion",
  "Stage In Browser": "Preparar en navegador",
  "Validate Package": "Validar paquete",
  "Export Bundle": "Exportar paquete",
  "Run Log": "Registro",
  "Preflight Checks": "Revisiones previas",
  "Repeated Staging Proof": "Prueba de preparacion repetida",
  "License Permits Target": "Licencia permite objetivo",
  "License permits target": "Licencia permite objetivo",
  "Firebase Admin Config": "Configuracion admin de Firebase",
  "Firebase admin config": "Configuracion admin de Firebase",
  "Account Session": "Sesion de cuenta",
  "Account session": "Sesion de cuenta",
  "Active Draft": "Borrador activo",
  "Active draft": "Borrador activo",
  "Manual Approval Policy": "Politica de aprobacion manual",
  "Manual approval policy": "Politica de aprobacion manual",
  "Browser profile": "Perfil de navegador",
  "Cadence window": "Ventana de cadencia",
  "Active Target": "Objetivo activo",
  "Operator Tools": "Herramientas de operador",
};

const state = await loadProductionState();
state.themeId = normalizeThemeId(state.themeId);
state.operatorLanguage = normalizeOperatorLanguage(state.operatorLanguage);
const APP_SESSION_ID = `diamond-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const guideSections = getDiamondGuideSections();
const tourSteps = getDiamondTourSteps();
let prototypeModel = buildProductionPostModel(state);
let board = buildPostBoardView(prototypeModel);
let activePostPackageId = null;
let selectedAccountId = state.context?.socialAccountId || null;
let latestFirebaseStatus = null;
let latestLicenseSync = null;
let latestSyncExportPath = state.lastSyncExportPath || "";
let latestOperatorMessage = "";
let latestGuideMessage = "";
let activeTourIndex = 0;
let activeTourTarget = null;
let activeTourAudio = null;
applyDiamondTheme(state.themeId);
applyOperatorLanguage();
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
    platformProofs: saved.platformProofs || defaults.platformProofs || [],
    postPackages: saved.postPackages || [],
    platformDrafts: saved.platformDrafts || [],
    context: saved.context || defaults.context,
  });
  return ensurePlatformProofRecords(workspace);
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
  workspace.themeId = "graphite-red";
  workspace.accessibility = {
    keyboardNavigation: "baseline",
    screenReaderLabels: "baseline",
    colorContrast: "needs full audit",
    reducedMotion: "planned",
  };
  return ensurePlatformProofRecords(workspace);
}

function renderBoard(columns) {
  document.querySelector("#posts-board").classList.remove("hidden");
  document.querySelector(".prototype-toolbar").classList.remove("hidden");
  document.querySelector("#post-detail").classList.add("hidden");
  const target = document.querySelector("#posts-board");
  target.innerHTML = columns.map((column) => `
    <article class="post-column" aria-labelledby="column-${escapeHtml(column.id)}">
      <header>
        <h2 id="column-${escapeHtml(column.id)}">${escapeHtml(t(column.label))}</h2>
        <span class="count">${column.count}</span>
      </header>
      <div class="post-list">
        ${column.posts.length ? column.posts.map(renderCard).join("") : `<div class="empty-column">${escapeHtml(t("No Posts"))}</div>`}
      </div>
    </article>
  `).join("");
}

function renderCard(post) {
  const platformStatuses = post.platformStatuses?.length
    ? post.platformStatuses
    : (post.platforms || []).map((platform) => ({ platform, status: post.status || "draft" }));
  return `
    <button class="post-card" type="button" data-package-id="${escapeHtml(post.id)}">
      <span class="card-status ${escapeHtml(post.status || "draft")}">${escapeHtml(statusLabel(post.status || "draft"))}</span>
      <strong>${escapeHtml(post.excerpt || post.title)}</strong>
      <time datetime="${escapeHtml(post.updatedAt || post.createdAt || "")}">${formatDate(post.updatedAt || post.createdAt)}</time>
      ${platformStatuses.length ? `<div class="platform-row" aria-label="Platform status">${platformStatuses.map((item) => `<span>${escapeHtml(platformLabel(item.platform))} / ${escapeHtml(statusLabel(item.status))}</span>`).join("")}</div>` : `<div class="platform-row missing"><span>${escapeHtml(t("Platform Not Set"))}</span></div>`}
      ${post.tags?.length ? `<div class="tag-row">${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
    </button>
  `;
}

function wirePrototypeControls() {
  document.querySelector("#prototype-nav").addEventListener("click", handlePrototypeNav);
  document.querySelector("#operator-toggle")?.addEventListener("click", toggleOperatorDrawer);
  document.querySelector("#operator-close")?.addEventListener("click", closeOperatorDrawer);
  document.querySelector("#create-post").addEventListener("click", openCreateDetail);
  document.querySelector("#calendar-create-schedule")?.addEventListener("click", () => {
    showPrototypeView("posts-view");
    document.querySelectorAll("#prototype-nav a").forEach((item) => item.classList.toggle("active", item.dataset.view === "posts-view"));
    openCreateDetail();
  });
  document.querySelector("#analytics-export")?.addEventListener("click", () => runSettingsAction("export-sync"));
  document.querySelector("#add-social-account")?.addEventListener("click", addSocialAccount);
  document.querySelector("#add-company-record")?.addEventListener("click", addCompanyRecord);
  document.querySelector("#add-brand-record")?.addEventListener("click", addBrandRecord);
  document.querySelector("#add-campaign-record")?.addEventListener("click", addCampaignRecord);
  document.querySelector("#back-to-board").addEventListener("click", () => renderBoard(board));
  document.querySelector("#posts-board").addEventListener("click", (event) => {
    const card = event.target.closest("[data-package-id]");
    if (!card) return;
    openPackageDetail(card.dataset.packageId);
  });
  document.querySelector("#idea-text").addEventListener("input", handleIdeaInput);
  document.querySelector("#post-tags").addEventListener("input", handleTagsInput);
  document.querySelector("#detail-add-media")?.addEventListener("click", attachMediaToActiveDrafts);
  document.querySelector("#detail-add-platform")?.addEventListener("click", addPlatformToActivePackage);
  document.querySelector("#platform-previews").addEventListener("click", handlePlatformDraftAction);
  document.querySelector("#platform-previews").addEventListener("input", handlePlatformDraftTextInput);
  document.querySelector("#calendar-board")?.addEventListener("click", handleCalendarAction);
  document.querySelector("#accounts-grid")?.addEventListener("click", (event) => {
    const card = event.target.closest("[data-account-id]");
    if (!card) return;
    selectedAccountId = card.dataset.accountId;
    renderAccounts(card.dataset.accountId);
  });
  document.querySelector("#account-detail")?.addEventListener("click", handleAccountDetailClick);
  document.querySelector("#brand-workspace")?.addEventListener("click", handleBrandWorkspaceClick);
  document.querySelector("#settings-workspace")?.addEventListener("click", handleSettingsAction);
  document.querySelector("#settings-workspace")?.addEventListener("change", handleSettingsChange);
  document.querySelector("#settings-sync")?.addEventListener("click", () => runSettingsAction("sync-license"));
  document.querySelector("#operator-workspace")?.addEventListener("click", handleOperatorAction);
  document.querySelector("#tour-start")?.addEventListener("click", startGuideTour);
  document.querySelector("#tour-play-voiceover")?.addEventListener("click", playTourVoiceover);
  document.querySelector("#tour-prev")?.addEventListener("click", () => moveTour(-1));
  document.querySelector("#tour-next")?.addEventListener("click", () => moveTour(1));
  document.querySelector("#tour-close")?.addEventListener("click", closeGuideTour);
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

async function refreshProductionViews() {
  board = buildPostBoardView(prototypeModel);
  renderAccounts(selectedAccountId);
  renderBrands();
  renderCalendar();
  renderSettings();
  renderAnalytics();
  renderOperatorDrawer();
  await window.diamond?.saveState?.(state);
}

function renderCalendar() {
  const target = document.querySelector("#calendar-board");
  if (!target) return;
  const groups = calendarGroups(calendarSchedulesForActiveScope());
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
    if (["posted", "published", "completed", "canceled"].includes(schedule.status)) {
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
    <article class="calendar-item ${escapeHtml(item.status || "scheduled")}" data-schedule-id="${escapeHtml(item.id)}">
      <strong>${escapeHtml(item.text || "Untitled scheduled post")}</strong>
      <time datetime="${escapeHtml(item.scheduledAt || "")}">${formatDateTime(item.scheduledAt)}</time>
      <div class="platform-row">
        <span>${escapeHtml(item.context?.platform || "x")}</span>
        <span>${escapeHtml(item.status || "scheduled")}</span>
        <span>${escapeHtml(campaignName(item.context?.campaignId))}</span>
      </div>
      <div class="calendar-actions">
        <button type="button" data-calendar-action="load" data-schedule-id="${escapeHtml(item.id)}">Load</button>
        <button type="button" data-calendar-action="stage" data-schedule-id="${escapeHtml(item.id)}">Stage</button>
        <button type="button" data-calendar-action="posted" data-schedule-id="${escapeHtml(item.id)}">Posted</button>
        <button type="button" data-calendar-action="cancel" data-schedule-id="${escapeHtml(item.id)}">Cancel</button>
      </div>
    </article>
  `;
}

function calendarSchedulesForActiveScope() {
  const context = state.context || {};
  return (state.scheduledPosts || []).filter((schedule) => {
    const scheduleContext = schedule.context || {};
    return (!context.companyId || scheduleContext.companyId === context.companyId)
      && (!context.brandId || scheduleContext.brandId === context.brandId)
      && (!context.campaignId || scheduleContext.campaignId === context.campaignId);
  });
}

async function handleCalendarAction(event) {
  const button = event.target.closest("[data-calendar-action]");
  if (!button) return;
  const schedule = (state.scheduledPosts || []).find((item) => item.id === button.dataset.scheduleId);
  if (!schedule) return;
  const draft = prototypeModel.platformDrafts.find((item) => item.id === schedule.draftId);
  if (button.dataset.calendarAction === "load") {
    openScheduleDetail(schedule, draft);
    return;
  }
  if (button.dataset.calendarAction === "stage" && draft) {
    await inspectDraftMedia(draft);
    stagePlatformDraft(draft);
    schedule.status = draft.status === "staged" ? "staged" : schedule.status;
    schedule.stagedAt = draft.stagedAt;
    schedule.updatedAt = draft.updatedAt;
    updatePostPackageFromDrafts(draft.postPackageId);
  }
  if (button.dataset.calendarAction === "posted") {
    if (draft) {
      markPlatformDraftPosted(draft);
      updatePostPackageFromDrafts(draft.postPackageId);
    } else {
      schedule.status = "posted";
      schedule.postedAt = new Date().toISOString();
      schedule.updatedAt = schedule.postedAt;
    }
  }
  if (button.dataset.calendarAction === "cancel") {
    schedule.status = "canceled";
    schedule.canceledAt = new Date().toISOString();
    schedule.updatedAt = schedule.canceledAt;
    if (draft && draft.status === "scheduled") {
      draft.status = "approved";
      draft.updatedAt = schedule.canceledAt;
      updatePostPackageFromDrafts(draft.postPackageId);
    }
  }
  await saveProductionState();
  await refreshProductionViews();
}

function openScheduleDetail(schedule, draft) {
  if (draft?.postPackageId) {
    const postPackage = prototypeModel.postPackages.find((item) => item.id === draft.postPackageId);
    if (postPackage) {
      openDetail(postPackage, prototypeModel.platformDrafts.filter((item) => item.postPackageId === postPackage.id));
      return;
    }
  }
  const postPackage = createPostPackage({
    id: schedule.postPackageId || `package-${normalizeId(schedule.id, "scheduleId")}`,
    context: schedule.context,
    ideaText: schedule.text || "Scheduled post",
    tags: ["scheduled"],
    status: schedule.status || "scheduled",
    source: "schedule",
    createdAt: schedule.createdAt || schedule.scheduledAt,
    updatedAt: schedule.updatedAt || schedule.createdAt || schedule.scheduledAt,
  });
  const scheduleDraft = draft || createPlatformDraft({
    id: schedule.draftId || `${postPackage.id}-${schedule.context?.platform || "x"}`,
    postPackage,
    context: schedule.context,
    platform: schedule.context?.platform || "x",
    socialAccountId: schedule.context?.socialAccountId || state.context?.socialAccountId,
    text: schedule.text || postPackage.ideaText,
    media: schedule.media || [],
    status: schedule.status || "scheduled",
    scheduledAt: schedule.scheduledAt,
    createdAt: schedule.createdAt || schedule.scheduledAt,
    updatedAt: schedule.updatedAt || schedule.createdAt || schedule.scheduledAt,
  });
  openDetail(postPackage, [scheduleDraft]);
}

function renderAccounts(selectedAccountId) {
  const target = document.querySelector("#accounts-grid");
  const detail = document.querySelector("#account-detail");
  const scope = document.querySelector("#account-scope-strip");
  if (!target || !detail) return;
  const accounts = state.socialAccounts || [];
  const selected = accounts.find((account) => account.id === selectedAccountId) || accounts.find((account) => account.id === state.context?.socialAccountId) || accounts[0];
  if (selected) selectedAccountId = selected.id;
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
        <div><dt>Company</dt><dd><select data-account-field="companyId">${companyOptions(account.companyId)}</select></dd></div>
        <div><dt>Brand</dt><dd><select data-account-field="brandId">${brandOptions(account.companyId, account.brandId)}</select></dd></div>
        <div><dt>Campaign context</dt><dd>${escapeHtml(campaign?.name || campaign?.id || "No campaign")}</dd></div>
        <div><dt>Platform</dt><dd><select data-account-field="platform">${platformOptions(account.platform)}</select></dd></div>
        <div><dt>Handle</dt><dd><input data-account-field="handle" type="text" value="${escapeHtml(account.handle || "")}"></dd></div>
        <div><dt>Browser profile</dt><dd><input data-account-field="browserProfileId" type="text" value="${escapeHtml(account.browserProfileId || "")}"></dd></div>
        <div><dt>Public account</dt><dd><input data-account-field="accountUrl" type="url" value="${escapeHtml(account.accountUrl || "")}"></dd></div>
        <div><dt>Login URL</dt><dd><input data-account-field="loginUrl" type="url" value="${escapeHtml(resolveLoginUrl(account) || "")}"></dd></div>
        <div><dt>Compose URL</dt><dd><input data-account-field="composeUrl" type="url" value="${escapeHtml(resolveComposeUrl(account) || "")}"></dd></div>
        <div><dt>Expected host</dt><dd><input data-account-field="expectedHost" type="text" value="${escapeHtml(account.expectedHost || "")}"></dd></div>
        <div><dt>Mode</dt><dd>${account.monitoringOnly ? "Monitoring only" : "Posting enabled"}</dd></div>
      </dl>
      <section class="account-actions" aria-label="Account actions">
        <button type="button" data-account-action="save" data-account-id="${escapeHtml(account.id)}">Save account</button>
        <button type="button" data-account-action="set-active" data-account-id="${escapeHtml(account.id)}">Set active</button>
        <button type="button" data-account-action="ready" data-account-id="${escapeHtml(account.id)}">Mark ready</button>
        <button type="button" data-account-action="needs-login" data-account-id="${escapeHtml(account.id)}">Needs login</button>
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

function companyOptions(selectedId) {
  return (state.companies || []).map((company) => `
    <option value="${escapeHtml(company.id)}" ${company.id === selectedId ? "selected" : ""}>${escapeHtml(company.name || company.id)}</option>
  `).join("");
}

function brandOptions(companyId, selectedId) {
  return (state.brands || [])
    .filter((brand) => !companyId || brand.companyId === companyId)
    .map((brand) => `
      <option value="${escapeHtml(brand.id)}" ${brand.id === selectedId ? "selected" : ""}>${escapeHtml(brand.name || brand.id)}</option>
    `).join("");
}

function campaignOptions(companyId, brandId, selectedId) {
  return (state.campaigns || [])
    .filter((campaign) => (!companyId || campaign.companyId === companyId) && (!brandId || campaign.brandId === brandId))
    .map((campaign) => `
      <option value="${escapeHtml(campaign.id)}" ${campaign.id === selectedId ? "selected" : ""}>${escapeHtml(campaign.name || campaign.id)}</option>
    `).join("");
}

function platformOptions(selectedPlatform) {
  const platforms = ["x", "instagram", "tiktok", "linkedin", "youtube-shorts", "facebook", "reddit"];
  return platforms.map((platform) => `
    <option value="${escapeHtml(platform)}" ${platform === selectedPlatform ? "selected" : ""}>${escapeHtml(platformLabel(platform))}</option>
  `).join("");
}

function renderBrands() {
  const target = document.querySelector("#brand-workspace");
  if (!target) return;
  const company = (state.companies || []).find((item) => item.id === state.context?.companyId) || (state.companies || [])[0] || {};
  const brand = (state.brands || []).find((item) => item.id === state.context?.brandId) || (state.brands || [])[0] || {};
  const campaign = (state.campaigns || []).find((item) => item.id === state.context?.campaignId) || (state.campaigns || [])[0] || {};
  const strategy = (state.contentStrategies || []).find((item) => item.campaignId === campaign.id) || (state.contentStrategies || [])[0] || {};
  const library = (state.brandLibraries || []).find((item) => item.brandId === brand.id) || (state.brandLibraries || [])[0] || {};
  const claims = (state.claimLibraries || []).find((item) => item.brandId === brand.id) || (state.claimLibraries || [])[0] || {};
  target.innerHTML = `
    <aside class="brand-overview" aria-label="Brand overview">
      <article class="brand-identity-card">
        <span class="eyebrow">Company</span>
        <h2>${escapeHtml(company.name || company.id || "Company")}</h2>
        <dl class="brand-facts">
          <div><dt>Company</dt><dd><select data-brand-field="contextCompanyId">${companyOptions(company.id)}</select></dd></div>
          <div><dt>Brand</dt><dd><select data-brand-field="contextBrandId">${brandOptions(company.id, brand.id)}</select></dd></div>
          <div><dt>Campaign</dt><dd><select data-brand-field="contextCampaignId">${campaignOptions(company.id, brand.id, campaign.id)}</select></dd></div>
          <div><dt>Company name</dt><dd><input data-brand-field="companyName" type="text" value="${escapeHtml(company.name || "")}"></dd></div>
          <div><dt>Brand name</dt><dd><input data-brand-field="brandName" type="text" value="${escapeHtml(brand.name || "")}"></dd></div>
          <div><dt>Campaign name</dt><dd><input data-brand-field="campaignName" type="text" value="${escapeHtml(campaign.name || "")}"></dd></div>
          <div><dt>Status</dt><dd><input data-brand-field="campaignStatus" type="text" value="${escapeHtml(campaign.status || "planning")}"></dd></div>
          <div><dt>Languages</dt><dd><input data-brand-field="brandLanguages" type="text" value="${escapeHtml((brand.languages || []).join(", ") || "en")}"></dd></div>
        </dl>
        <section class="account-actions" aria-label="Brand actions">
          <button type="button" data-brand-action="save">Save brand workspace</button>
          <button type="button" data-brand-action="set-active">Set active scope</button>
        </section>
      </article>
      <article class="strategy-card">
        <h3>Primary CTA</h3>
        <textarea data-brand-field="strategyCta" rows="3">${escapeHtml(strategy.cta || "")}</textarea>
        <h3>Offer</h3>
        <textarea data-brand-field="strategyOffer" rows="3">${escapeHtml(strategy.offer || "")}</textarea>
      </article>
    </aside>
    <section class="brand-panels" aria-label="Brand operating rules">
      ${renderEditableBrandPanel("Goals", "strategyGoals", strategy.goals, "One goal per line")}
      ${renderEditableBrandPanel("Audience", "strategyAudience", strategy.audience, "One audience segment per line")}
      ${renderEditableBrandPanel("Pillars", "strategyPillars", strategy.pillars, "One content pillar per line")}
      ${renderEditableBrandPanel("Voice", "brandVoice", [library.voice].filter(Boolean), "Describe how the brand should sound")}
      ${renderEditableBrandPanel("Approved phrases", "approvedPhrases", library.approvedPhrases, "One approved phrase per line")}
      ${renderEditableBrandPanel("Banned phrases", "bannedPhrases", library.bannedPhrases, "One banned phrase per line")}
      ${renderEditableBrandPanel("Prize language", "prizeLanguage", claims.prizeLanguage, "One approved prize phrase per line")}
      ${renderEditableBrandPanel("Free-to-play language", "freeToPlayLanguage", claims.freeToPlayLanguage, "One approved free-play phrase per line")}
      ${renderEditableBrandPanel("Requires review", "requiresReviewClaims", claims.requiresReviewClaims, "One review trigger per line")}
      ${renderEditableBrandPanel("Blocked claims", "blockedClaims", claims.blockedClaims, "One blocked claim per line")}
      ${renderEditableBrandPanel("Reference accounts", "referenceAccounts", strategy.referenceAccounts, "One reference account per line")}
    </section>
  `;
}

function renderEditableBrandPanel(title, field, items = [], placeholder = "") {
  const list = (items || []).filter(Boolean);
  const rows = field === "brandVoice" ? 4 : 5;
  return `
    <article class="brand-panel editable-brand-panel">
      <header>
        <h3>${escapeHtml(title)}</h3>
        <span class="count">${list.length}</span>
      </header>
      <textarea data-brand-field="${escapeHtml(field)}" rows="${rows}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(list.join("\n"))}</textarea>
    </article>
  `;
}

function renderBrandPanel(title, items = []) {
  return renderEditableBrandPanel(title, normalizeId(title, "brandPanel"), items);
}

async function addCompanyRecord() {
  const name = promptForText("Company name", "New company");
  if (!name) return;
  const company = createCompanyRecord({ name });
  state.companies ||= [];
  state.companies.push(company);
  state.context = {
    ...state.context,
    companyId: company.id,
  };
  await saveProductionState();
  renderBrands();
  renderAccounts(selectedAccountId);
}

async function addBrandRecord() {
  const companyId = state.context?.companyId || (state.companies || [])[0]?.id;
  if (!companyId) return;
  const name = promptForText("Brand name", "New brand");
  if (!name) return;
  const brand = createBrandRecord({ name, companyId });
  state.brands ||= [];
  state.brands.push(brand);
  state.context = {
    ...state.context,
    companyId,
    brandId: brand.id,
  };
  await ensureBrandSupportRecords(brand);
  await saveProductionState();
  renderBrands();
  renderAccounts(selectedAccountId);
}

async function addCampaignRecord() {
  const companyId = state.context?.companyId || (state.companies || [])[0]?.id;
  const brandId = state.context?.brandId || (state.brands || [])[0]?.id;
  if (!companyId || !brandId) return;
  const name = promptForText("Campaign name", "New campaign");
  if (!name) return;
  const campaign = createCampaignRecord({ name, companyId, brandId });
  state.campaigns ||= [];
  state.campaigns.push(campaign);
  state.context = {
    ...state.context,
    companyId,
    brandId,
    campaignId: campaign.id,
  };
  await ensureStrategyRecord(campaign);
  await saveProductionState();
  renderBrands();
}

async function addSocialAccount() {
  const platform = normalizeId(promptForText("Platform", "x"), "platform");
  if (!platform) return;
  const companyId = state.context?.companyId || (state.companies || [])[0]?.id;
  const brandId = state.context?.brandId || (state.brands || []).find((brand) => brand.companyId === companyId)?.id;
  if (!companyId || !brandId) return;
  const handle = promptForText("Handle or page", platform === "x" ? "@thecardbet" : "thecard.bet") || "";
  const id = normalizeId(`${brandId}-${platform}-${handle || Date.now()}`, "socialAccountId");
  const account = {
    id,
    companyId,
    brandId,
    platform,
    handle,
    accountUrl: normalizeAccountUrl(handle, platform),
    loginUrl: normalizeLoginUrl("", platform),
    composeUrl: normalizeComposeUrl("", platform),
    expectedHost: normalizeHost(normalizeAccountUrl(handle, platform)),
    sessionStatus: "unknown",
    browserProfileId: normalizeBrowserProfileId(`${companyId}-${brandId}-${platform}-${id}`),
    monitoringOnly: platform === "reddit",
    proofCount: 0,
    createdAt: new Date().toISOString(),
  };
  state.socialAccounts ||= [];
  state.socialAccounts.push(account);
  selectedAccountId = account.id;
  state.context = {
    ...state.context,
    companyId,
    brandId,
    platform,
    socialAccountId: account.id,
    browserProfileId: account.browserProfileId,
  };
  await saveProductionState();
  renderAccounts(account.id);
  renderOperatorDrawer();
}

async function handleAccountDetailClick(event) {
  const button = event.target.closest("[data-account-action]");
  if (!button) return;
  const account = (state.socialAccounts || []).find((item) => item.id === button.dataset.accountId);
  if (!account) return;
  if (button.dataset.accountAction === "save") saveAccountForm(account);
  if (button.dataset.accountAction === "set-active") setActiveAccount(account);
  if (button.dataset.accountAction === "ready") account.sessionStatus = "ready";
  if (button.dataset.accountAction === "needs-login") account.sessionStatus = "needs_login";
  account.updatedAt = new Date().toISOString();
  await saveProductionState();
  renderAccounts(account.id);
  renderOperatorDrawer();
}

function saveAccountForm(account) {
  const detail = document.querySelector("#account-detail");
  if (!detail) return;
  const valueFor = (field) => detail.querySelector(`[data-account-field="${field}"]`)?.value || "";
  account.companyId = normalizeId(valueFor("companyId") || account.companyId, "companyId");
  account.brandId = normalizeId(valueFor("brandId") || account.brandId, "brandId");
  account.platform = normalizeId(valueFor("platform") || account.platform, "platform");
  account.handle = valueFor("handle");
  account.accountUrl = normalizeAccountUrl(valueFor("accountUrl") || account.handle, account.platform);
  account.loginUrl = normalizeLoginUrl(valueFor("loginUrl"), account.platform);
  account.composeUrl = normalizeComposeUrl(valueFor("composeUrl"), account.platform);
  account.expectedHost = normalizeHost(valueFor("expectedHost") || account.accountUrl);
  account.browserProfileId = normalizeBrowserProfileId(valueFor("browserProfileId") || `${account.companyId}-${account.brandId}-${account.platform}-${account.id}`);
}

function setActiveAccount(account) {
  state.context = {
    ...state.context,
    companyId: account.companyId,
    brandId: account.brandId,
    platform: account.platform,
    socialAccountId: account.id,
    browserProfileId: account.browserProfileId,
  };
  selectedAccountId = account.id;
}

async function handleBrandWorkspaceClick(event) {
  const button = event.target.closest("[data-brand-action]");
  if (!button) return;
  const scope = saveBrandWorkspace();
  if (button.dataset.brandAction === "set-active") {
    state.context = {
      ...state.context,
      companyId: scope.companyId,
      brandId: scope.brandId,
      campaignId: scope.campaignId,
    };
  }
  await saveProductionState();
  renderBrands();
  renderAccounts(selectedAccountId);
  renderOperatorDrawer();
}

function saveBrandWorkspace() {
  const workspace = document.querySelector("#brand-workspace");
  const valueFor = (field) => workspace?.querySelector(`[data-brand-field="${field}"]`)?.value || "";
  const listValueFor = (field) => listValueForBrandField(workspace, field);
  const companyId = normalizeId(valueFor("contextCompanyId") || state.context?.companyId, "companyId");
  const brandId = normalizeId(valueFor("contextBrandId") || state.context?.brandId, "brandId");
  const campaignId = normalizeId(valueFor("contextCampaignId") || state.context?.campaignId, "campaignId");
  const company = (state.companies || []).find((item) => item.id === companyId);
  const brand = (state.brands || []).find((item) => item.id === brandId);
  const campaign = (state.campaigns || []).find((item) => item.id === campaignId);
  if (company) company.name = valueFor("companyName") || company.name;
  if (brand) {
    brand.name = valueFor("brandName") || brand.name;
    brand.languages = valueFor("brandLanguages").split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (campaign) {
    campaign.name = valueFor("campaignName") || campaign.name;
    campaign.status = normalizeId(valueFor("campaignStatus") || campaign.status, "campaignStatus");
  }
  const strategy = (state.contentStrategies || []).find((item) => item.campaignId === campaignId);
  if (strategy) {
    strategy.cta = valueFor("strategyCta") || strategy.cta;
    strategy.offer = valueFor("strategyOffer") || strategy.offer;
    strategy.goals = listValueFor("strategyGoals");
    strategy.audience = listValueFor("strategyAudience");
    strategy.pillars = listValueFor("strategyPillars");
    strategy.referenceAccounts = listValueFor("referenceAccounts");
    strategy.updatedAt = new Date().toISOString();
  }
  const library = (state.brandLibraries || []).find((item) => item.brandId === brandId);
  if (library) {
    library.voice = valueFor("brandVoice") || "";
    library.approvedPhrases = listValueFor("approvedPhrases");
    library.bannedPhrases = listValueFor("bannedPhrases");
    library.updatedAt = new Date().toISOString();
  }
  const claims = (state.claimLibraries || []).find((item) => item.brandId === brandId);
  if (claims) {
    claims.prizeLanguage = listValueFor("prizeLanguage");
    claims.freeToPlayLanguage = listValueFor("freeToPlayLanguage");
    claims.requiresReviewClaims = listValueFor("requiresReviewClaims");
    claims.blockedClaims = listValueFor("blockedClaims");
    claims.updatedAt = new Date().toISOString();
  }
  return { companyId, brandId, campaignId };
}

function listValueForBrandField(workspace, field) {
  return (workspace?.querySelector(`[data-brand-field="${field}"]`)?.value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function ensureBrandSupportRecords(brand) {
  state.brandLibraries ||= [];
  state.claimLibraries ||= [];
  if (!state.brandLibraries.some((library) => library.brandId === brand.id)) {
    state.brandLibraries.push({
      id: `${brand.id}-brand-library`,
      companyId: brand.companyId,
      brandId: brand.id,
      voice: "",
      approvedPhrases: [],
      bannedPhrases: [],
      links: [],
      identityRules: [],
    });
  }
  if (!state.claimLibraries.some((library) => library.brandId === brand.id)) {
    state.claimLibraries.push({
      id: `${brand.id}-claim-library`,
      companyId: brand.companyId,
      brandId: brand.id,
      prizeLanguage: [],
      freeToPlayLanguage: [],
      requiresReviewClaims: [],
      blockedClaims: [],
    });
  }
}

async function ensureStrategyRecord(campaign) {
  state.contentStrategies ||= [];
  if (state.contentStrategies.some((strategy) => strategy.campaignId === campaign.id)) return;
  state.contentStrategies.push({
    id: `${campaign.id}-strategy`,
    companyId: campaign.companyId,
    brandId: campaign.brandId,
    campaignId: campaign.id,
    goals: [],
    audience: [],
    pillars: [],
    cta: "",
    ctaEs: "",
    offer: "",
    offerEs: "",
    referenceAccounts: [],
  });
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
        <strong>${escapeHtml(t(titleCase(template.type || "template")))}</strong>
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
        <strong>${escapeHtml(t(titleCase(asset.type || "asset")))}</strong>
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
  const firebaseRows = latestFirebaseStatus || firebase;
  const licenseSyncLabel = latestLicenseSync
    ? latestLicenseSync.ok ? "Synced from Firebase" : "Firebase sync unavailable"
    : "Using local cache";
  target.innerHTML = `
    <section class="settings-actions" aria-label="Settings actions">
      <button type="button" data-settings-action="save-settings">${escapeHtml(t("Save Settings"))}</button>
      <button type="button" data-settings-action="check-firebase">${escapeHtml(t("Check Firebase"))}</button>
      <button type="button" data-settings-action="sync-license">${escapeHtml(t("Sync License"))}</button>
      <button type="button" data-settings-action="export-sync">${escapeHtml(t("Export Firestore Bundle"))}</button>
      <button type="button" data-settings-action="copy-legal">${escapeHtml(t("Copy Legal Summary"))}</button>
      <button type="button" data-settings-action="copy-guide">${escapeHtml(t("Copy User Guide"))}</button>
      <button type="button" data-settings-action="copy-tour-script">${escapeHtml(t("Copy Tour Script"))}</button>
      <button type="button" data-settings-action="copy-elevenlabs-request">Copy ElevenLabs request</button>
      <button type="button" data-settings-action="generate-tour-voiceovers">${escapeHtml(t("Generate Voiceovers"))}</button>
      <button id="settings-start-tour" type="button" data-settings-action="start-tour">${escapeHtml(t("Start Walkthrough"))}</button>
    </section>
    <section class="settings-status" aria-live="polite">
      <span>${escapeHtml(licenseSyncLabel)}</span>
      <span>${escapeHtml(latestFirebaseStatus?.reason || firebase.reason || "Firebase has not been checked in this session.")}</span>
      ${latestSyncExportPath ? `<span>Last export: ${escapeHtml(latestSyncExportPath)}</span>` : ""}
    </section>
    <section class="settings-grid">
      ${renderLicenseSettingsPanel(license, licenseCheck, model)}
      ${renderLanguageSettingsPanel()}
      ${renderSettingsPanel("Firebase", [
        ["Status", firebaseRows.ok || firebaseRows.configured ? "Configured" : "Not configured"],
        ["Admin JSON", firebaseRows.redactedPath || "Missing"],
        ["Project", firebaseRows.projectId || "Missing"],
        ["Source", firebaseRows.source || "local scan"],
        ["License collection", model.firebase.collectionPath],
      ])}
      ${renderRoutineSettingsPanel(cadencePolicy)}
      ${renderThemeSettingsPanel()}
      ${renderAccessibilitySettingsPanel()}
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
    ${renderUserGuidePanel()}
  `;
}

async function handleSettingsAction(event) {
  const button = event.target.closest("[data-settings-action]");
  if (!button) return;
  await runSettingsAction(button.dataset.settingsAction);
}

async function handleSettingsChange(event) {
  const field = event.target.closest("[data-settings-field]");
  if (!field) return;
  if (field.dataset.settingsField === "themeId") {
    state.themeId = normalizeThemeId(field.value);
    applyDiamondTheme(state.themeId);
    await saveProductionState();
    renderSettings();
  }
  if (field.dataset.settingsField === "operatorLanguage") {
    state.operatorLanguage = normalizeOperatorLanguage(field.value);
    applyOperatorLanguage();
    await saveProductionState();
    renderBoard(buildPostBoardView(buildProductionPostModel(state)));
    renderCalendar();
    renderAnalytics();
    renderTemplates();
    renderAccounts(selectedAccountId);
    renderSettings();
    renderOperatorDrawer();
    reopenActiveDetail();
  }
}

async function runSettingsAction(action) {
  if (action === "save-settings") {
    saveSettingsForm();
    await saveProductionState();
    renderSettings();
  }
  if (action === "check-firebase") {
    latestFirebaseStatus = await window.diamond?.getFirebaseAdminStatus?.();
    renderSettings();
  }
  if (action === "sync-license") {
    const userId = getSettingsFieldValue("licenseUserId") || state.licenseCache?.userId || "scott";
    latestLicenseSync = await window.diamond?.getFirebaseLicense?.({
      userId,
      email: getSettingsFieldValue("licenseEmail") || state.licenseCache?.email || "",
      firebasePath: state.licenseCache?.firebasePath,
    });
    if (latestLicenseSync?.ok && latestLicenseSync.license) {
      state.licenseCache = latestLicenseSync.license;
      await saveProductionState();
    }
    renderSettings();
  }
  if (action === "export-sync") {
    latestSyncExportPath = await window.diamond?.exportSyncBundle?.({
      name: `diamond-firestore-sync-${Date.now()}`,
      bundle: buildFirestoreSyncBundle(state),
    }) || "";
    state.lastSyncExportPath = latestSyncExportPath;
    state.lastSyncExportedAt = new Date().toISOString();
    await saveProductionState();
    renderSettings();
  }
  if (action === "copy-legal") {
    const summary = getDiamondLegalDocuments()
      .map((document) => `${document.title}\nStatus: ${document.status}\nUpdated: ${document.updatedAt}\n${document.summary}`)
      .join("\n\n");
    await window.diamond?.writeClipboard?.(summary);
    renderSettings();
  }
  if (action === "copy-guide") {
    await window.diamond?.writeClipboard?.(buildGuideMarkdown());
    latestGuideMessage = "Copied the Diamond user guide.";
    renderSettings();
  }
  if (action === "copy-tour-script") {
    await window.diamond?.writeClipboard?.(buildTourVoiceoverScript(tourSteps));
    latestGuideMessage = "Copied the walkthrough voiceover script.";
    renderSettings();
  }
  if (action === "copy-elevenlabs-request") {
    const request = createElevenLabsSpeechRequest({
      voiceId: "ELEVENLABS_VOICE_ID",
      text: buildTourVoiceoverScript(tourSteps),
    });
    await window.diamond?.writeClipboard?.(JSON.stringify(request, null, 2));
    latestGuideMessage = "Copied the ElevenLabs request template.";
    renderSettings();
  }
  if (action === "generate-tour-voiceovers") {
    latestGuideMessage = "Generating walkthrough voiceovers.";
    renderSettings();
    const result = await window.diamond?.generateTourVoiceovers?.({ steps: tourSteps });
    latestGuideMessage = result?.ok
      ? `Generated ${result.written?.length || 0} walkthrough voiceover file(s).`
      : result?.reason || "Voiceover generation is unavailable.";
    renderSettings();
    if (!document.querySelector("#tour-layer")?.classList.contains("hidden")) showTourStep();
  }
  if (action === "start-tour") {
    startGuideTour();
  }
}

function saveSettingsForm() {
  state.licenseCache ||= createTemporaryUnlimitedDiamondLicense({
    userId: "scott",
    brands: [state.context?.brandId].filter(Boolean),
    platforms: (state.socialAccounts || []).map((account) => account.platform),
  });
  state.licenseCache.userId = getSettingsFieldValue("licenseUserId") || state.licenseCache.userId;
  state.licenseCache.email = getSettingsFieldValue("licenseEmail") || state.licenseCache.email;
  state.themeId = normalizeThemeId(getSettingsFieldValue("themeId") || state.themeId);
  state.operatorLanguage = normalizeOperatorLanguage(getSettingsFieldValue("operatorLanguage") || state.operatorLanguage);
  applyDiamondTheme(state.themeId);
  applyOperatorLanguage();
  state.accessibility = {
    keyboardNavigation: getSettingsFieldValue("keyboardNavigation") || "baseline",
    screenReaderLabels: getSettingsFieldValue("screenReaderLabels") || "baseline",
    colorContrast: getSettingsFieldValue("colorContrast") || "planned",
    reducedMotion: getSettingsFieldValue("reducedMotion") || "planned",
  };
  state.cadencePolicies ||= [];
  let cadencePolicy = state.cadencePolicies[0];
  if (!cadencePolicy) {
    cadencePolicy = {
      id: `cadence-${Date.now()}`,
      companyId: state.context?.companyId || "",
      brandId: state.context?.brandId || "",
      campaignId: state.context?.campaignId || "",
    };
    state.cadencePolicies.push(cadencePolicy);
  }
  cadencePolicy.routineDueWindowMinutes = getSettingsNumber("routineDueWindowMinutes", cadencePolicy.routineDueWindowMinutes ?? 15);
  cadencePolicy.maxPostsPerDay = getSettingsNumber("maxPostsPerDay", cadencePolicy.maxPostsPerDay ?? 3);
  cadencePolicy.maxRepliesPerHour = getSettingsNumber("maxRepliesPerHour", cadencePolicy.maxRepliesPerHour ?? 8);
  cadencePolicy.cooldownMinutes = getSettingsNumber("cooldownMinutes", cadencePolicy.cooldownMinutes ?? 0);
  cadencePolicy.updatedAt = new Date().toISOString();
}

function getSettingsFieldValue(field) {
  return document.querySelector(`[data-settings-field="${field}"]`)?.value?.trim() || "";
}

function getSettingsNumber(field, fallback) {
  const value = Number.parseInt(getSettingsFieldValue(field), 10);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function renderLicenseSettingsPanel(license, licenseCheck, model) {
  return `
    <article class="settings-panel editable-settings">
      <header>
        <h2>License</h2>
        <span class="count">${escapeHtml(licenseCheck.ok ? "Ready" : "Blocked")}</span>
      </header>
      <dl>
        <div><dt>User ID</dt><dd><input data-settings-field="licenseUserId" type="text" value="${escapeHtml(license.userId || "scott")}"></dd></div>
        <div><dt>Email</dt><dd><input data-settings-field="licenseEmail" type="email" value="${escapeHtml(license.email || "")}"></dd></div>
        <div><dt>Plan</dt><dd>${escapeHtml(license.planId || "custom")}</dd></div>
        <div><dt>Role</dt><dd>${escapeHtml(license.role || "user")}</dd></div>
        <div><dt>Brands</dt><dd>${escapeHtml(String(licenseCheck.brandLimit || license.brandLimit || "0"))}</dd></div>
        <div><dt>Platforms</dt><dd>${escapeHtml(String(licenseCheck.platformLimit || license.platformLimit || "0"))}</dd></div>
        <div><dt>Automation</dt><dd>${escapeHtml(formatAutomation(licenseCheck.automationPlatforms || license.automationPlatforms))}</dd></div>
        <div><dt>Firebase path</dt><dd>${escapeHtml(license.firebasePath || model.firebase.collectionPath)}</dd></div>
      </dl>
    </article>
  `;
}

function renderRoutineSettingsPanel(policy = {}) {
  return `
    <article class="settings-panel editable-settings">
      <header>
        <h2>Routine timing</h2>
        <span class="count">Editable</span>
      </header>
      <dl>
        <div><dt>Due window</dt><dd><input data-settings-field="routineDueWindowMinutes" type="number" min="1" value="${escapeHtml(policy.routineDueWindowMinutes ?? 15)}"><span>minutes</span></dd></div>
        <div><dt>Max posts/day</dt><dd><input data-settings-field="maxPostsPerDay" type="number" min="0" value="${escapeHtml(policy.maxPostsPerDay ?? 3)}"></dd></div>
        <div><dt>Max replies/hour</dt><dd><input data-settings-field="maxRepliesPerHour" type="number" min="0" value="${escapeHtml(policy.maxRepliesPerHour ?? 8)}"></dd></div>
        <div><dt>Cooldown</dt><dd><input data-settings-field="cooldownMinutes" type="number" min="0" value="${escapeHtml(policy.cooldownMinutes ?? 0)}"><span>minutes</span></dd></div>
      </dl>
    </article>
  `;
}

function renderThemeSettingsPanel() {
  const themes = diamondThemes();
  const selectedTheme = normalizeThemeId(state.themeId);
  const theme = themes.find((item) => item.id === selectedTheme) || themes[0];
  return `
    <article class="settings-panel editable-settings">
      <header>
        <h2>Theme</h2>
        <span class="count">CSS module</span>
      </header>
      <dl>
        <div>
          <dt>Selected</dt>
          <dd>
            <select data-settings-field="themeId">
              ${themes.map((theme) => `<option value="${escapeHtml(theme.id)}" ${theme.id === selectedTheme ? "selected" : ""}>${escapeHtml(theme.label)}</option>`).join("")}
            </select>
          </dd>
        </div>
        <div><dt>Current</dt><dd>${escapeHtml(theme.label)}</dd></div>
        <div><dt>Preview</dt><dd>Applies immediately and saves to this workspace.</dd></div>
        <div><dt>Use case</dt><dd>${escapeHtml(theme.description)}</dd></div>
        <div><dt>Swatches</dt><dd><span class="theme-swatch-row">${theme.swatches.map((color) => `<span class="theme-swatch" style="--theme-swatch:${escapeHtml(color)}" title="${escapeHtml(color)}"></span>`).join("")}</span></dd></div>
        <div><dt>Palette source</dt><dd>Professional mockups set</dd></div>
      </dl>
    </article>
  `;
}

function renderLanguageSettingsPanel() {
  const language = currentOperatorLanguage();
  return `
    <article class="settings-panel editable-settings">
      <header>
        <h2>${escapeHtml(t("Operator"))}</h2>
        <span class="count">${escapeHtml(language === "es" ? "Espanol" : "English")}</span>
      </header>
      <dl>
        <div>
          <dt>${escapeHtml(t("Operator"))} language</dt>
          <dd>
            <select data-settings-field="operatorLanguage">
              <option value="en" ${language === "en" ? "selected" : ""}>English</option>
              <option value="es" ${language === "es" ? "selected" : ""}>Espanol</option>
            </select>
          </dd>
        </div>
        <div><dt>Scope</dt><dd>${escapeHtml(language === "es" ? "Revision del operador" : "Operator review")}</dd></div>
        <div><dt>Status</dt><dd>${escapeHtml(language === "es" ? "Etiquetas principales traducidas" : "Core labels translated")}</dd></div>
      </dl>
    </article>
  `;
}

function renderUserGuidePanel() {
  return `
    <section id="diamond-guide-panel" class="user-guide-panel" aria-labelledby="diamond-guide-heading">
      <header>
        <div>
          <span class="eyebrow">Walkthrough</span>
          <h2 id="diamond-guide-heading">Diamond user guide</h2>
          <p>Use this when you need the full operating path instead of guessing what the next button does.</p>
        </div>
        <div class="guide-actions">
          <button type="button" data-settings-action="start-tour">Start walkthrough</button>
          <button type="button" data-settings-action="copy-guide">Copy guide</button>
          <button type="button" data-settings-action="copy-tour-script">Copy script</button>
          <button type="button" data-settings-action="copy-elevenlabs-request">Copy ElevenLabs request</button>
        </div>
      </header>
      ${latestGuideMessage ? `<div class="guide-message">${escapeHtml(latestGuideMessage)}</div>` : ""}
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
    </section>
  `;
}

function buildGuideMarkdown() {
  return [
    "# Diamond User Guide",
    "",
    ...guideSections.flatMap((section) => [
      `## ${section.title}`,
      "",
      section.summary,
      "",
      ...section.steps.map((step, index) => `${index + 1}. ${step}`),
      "",
    ]),
    "## Walkthrough Voiceover Script",
    "",
    buildTourVoiceoverScript(tourSteps),
  ].join("\n");
}

function diamondThemes() {
  return PROFESSIONAL_THEMES;
}

function normalizeThemeId(themeId) {
  const legacyThemeMap = {
    broadcast: "graphite-red",
    custom: "graphite-red",
    charcoal: "executive-neutral",
    terminal: "evergreen",
    studio: "burgundy-desk",
    midnight: "slate-blue",
  };
  const requestedTheme = legacyThemeMap[themeId] || themeId || "graphite-red";
  return diamondThemes().some((item) => item.id === requestedTheme) ? requestedTheme : "graphite-red";
}

function applyDiamondTheme(themeId) {
  const theme = normalizeThemeId(themeId);
  document.body?.classList.remove(...diamondThemes().map((item) => `theme-${item.id}`));
  document.body?.classList.add(`theme-${theme}`);
}

function normalizeOperatorLanguage(language) {
  return language === "es" ? "es" : "en";
}

function currentOperatorLanguage() {
  return normalizeOperatorLanguage(state.operatorLanguage);
}

function t(label) {
  if (currentOperatorLanguage() !== "es") return label;
  return OPERATOR_LABELS_ES[label] || label;
}

function statusLabel(value) {
  return t(titleCase(value || "draft"));
}

function applyOperatorLanguage() {
  const language = currentOperatorLanguage();
  document.documentElement.lang = language;
  setStaticText('a[data-view="posts-view"]', "Posts");
  setStaticText('a[data-view="analytics-view"]', "Analytics");
  setStaticText('a[data-view="templates-view"]', "Templates");
  setStaticText('a[data-view="calendar-view"]', "Calendar");
  setStaticText('a[data-view="accounts-view"]', "Accounts");
  setStaticText('a[data-view="brands-view"]', "Brands");
  setStaticText('a[data-view="settings-view"]', "Settings");
  setStaticText("#operator-toggle", "Operator");
  setStaticText("#posts-view h1", "Posts");
  setStaticText("#analytics-heading", "Analytics");
  setStaticText("#templates-heading", "Templates");
  setStaticText("#calendar-heading", "Calendar");
  setStaticText("#accounts-heading", "Accounts");
  setStaticText("#brands-heading", "Brands");
  setStaticText("#settings-heading", "Settings");
  setStaticText("#create-post", "Create");
  setStaticText("#analytics-export", "Export");
  setStaticText("#calendar-create-schedule", "Schedule");
  setStaticText("#settings-sync", "Sync");
  setStaticText("#add-social-account", "Add Account");
  setStaticText("#add-company-record", "Add Company");
  setStaticText("#add-brand-record", "Add Brand");
  setStaticText("#add-campaign-record", "Add Campaign");
  setStaticText("#templates-view .create-button", "Add Template");
  setStaticText("#back-to-board", "Back");
  setStaticText("#detail-status", "Draft");
  setStaticText("#operator-close", "Close");
  setStaticText("#operator-drawer h2", "Operator Tools");
}

function setStaticText(selector, label) {
  const node = document.querySelector(selector);
  if (node) node.textContent = t(label);
}

function renderAccessibilitySettingsPanel() {
  const accessibility = state.accessibility || {};
  return `
    <article class="settings-panel editable-settings">
      <header>
        <h2>Accessibility</h2>
        <span class="count">Baseline</span>
      </header>
      <dl>
        <div><dt>Keyboard navigation</dt><dd><input data-settings-field="keyboardNavigation" type="text" value="${escapeHtml(accessibility.keyboardNavigation || "baseline")}"></dd></div>
        <div><dt>Screen reader labels</dt><dd><input data-settings-field="screenReaderLabels" type="text" value="${escapeHtml(accessibility.screenReaderLabels || "baseline")}"></dd></div>
        <div><dt>Color contrast</dt><dd><input data-settings-field="colorContrast" type="text" value="${escapeHtml(accessibility.colorContrast || "planned")}"></dd></div>
        <div><dt>Reduced motion</dt><dd><input data-settings-field="reducedMotion" type="text" value="${escapeHtml(accessibility.reducedMotion || "planned")}"></dd></div>
      </dl>
    </article>
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
  const proof = account ? getPlatformProofForAccount(account) : null;
  const proofProgress = proof ? stagingProofSessionProgress(proof) : null;
  const proofEvaluation = proof ? evaluatePlatformProof(proof) : null;
  target.innerHTML = `
    ${latestOperatorMessage ? `<section class="operator-status" aria-live="polite">${escapeHtml(latestOperatorMessage)}</section>` : ""}
    <section class="operator-panel">
      <header>
        <h3>${escapeHtml(t("Active Target"))}</h3>
        <span class="session-pill ${escapeHtml(account?.sessionStatus || "unknown")}">${escapeHtml(statusLabel(account?.sessionStatus || "unknown"))}</span>
      </header>
      <dl class="operator-meta">
        <div><dt>${escapeHtml(t("Company"))}</dt><dd>${escapeHtml(companyName(context.companyId))}</dd></div>
        <div><dt>${escapeHtml(t("Brand"))}</dt><dd>${escapeHtml(brandName(context.brandId))}</dd></div>
        <div><dt>${escapeHtml(t("Campaign"))}</dt><dd>${escapeHtml(campaignName(context.campaignId))}</dd></div>
        <div><dt>${escapeHtml(t("Platform"))}</dt><dd>${escapeHtml(platformLabel(account?.platform || context.platform || "x"))}</dd></div>
        <div><dt>${escapeHtml(t("Account"))}</dt><dd>${escapeHtml(account?.handle || account?.id || "No account selected")}</dd></div>
        <div><dt>Browser profile</dt><dd>${escapeHtml(account?.browserProfileId || "Not assigned")}</dd></div>
      </dl>
    </section>

    <section class="operator-panel">
      <header>
        <h3>${escapeHtml(t("Preflight Checks"))}</h3>
        <span class="count">${checks.filter((check) => check.ok).length}/${checks.length}</span>
      </header>
      <div class="operator-checks">
        ${checks.map(renderOperatorCheck).join("")}
      </div>
    </section>

    ${proof ? `
      <section class="operator-panel proof-session-panel">
        <header>
          <h3>${escapeHtml(t("Repeated Staging Proof"))}</h3>
          <span class="count">${escapeHtml(proofProgress.label)}</span>
        </header>
        <div class="proof-session-summary">
          <span class="session-pill ${proofProgress.complete ? "ready" : "needs_login"}">${escapeHtml(proofProgress.complete ? t("Ready") : t("Needs Attention"))}</span>
          <p>${escapeHtml(proofEvaluation?.summary || "")} ${escapeHtml(proofEvaluation?.loginSummary || "")}</p>
        </div>
        <ol class="proof-session-list">
          ${proofProgress.sessions.map((session) => `
            <li>
              <strong>${escapeHtml(formatDateTime(session.createdAt))}</strong>
              <span>${escapeHtml(session.draftId || "No draft")} / ${escapeHtml(session.screenshotPath || session.stageUrl || "No screenshot")}</span>
            </li>
          `).join("") || `<li><strong>${escapeHtml(t("No Posts"))}</strong><span>Stage X from Operator three separate app sessions.</span></li>`}
        </ol>
      </section>
    ` : ""}

    <section class="operator-panel">
      <header>
        <h3>${escapeHtml(t("Browser Staging"))}</h3>
        <span class="count">${account?.platform === "reddit" ? "5" : "4"}</span>
      </header>
      <div class="operator-action-grid">
        ${renderOperatorAction("Open Account", resolveLoginUrl(account) || "Login URL missing", "open-account", !resolveLoginUrl(account))}
        ${renderOperatorAction("Check Session", `Current state: ${statusLabel(account?.sessionStatus || "unknown")}`, "check-session", !account)}
        ${renderOperatorAction("Stage In Browser", resolveComposeUrl(account) || "Compose URL missing", "stage-browser", !account)}
        ${renderOperatorAction("Capture Proof", `${account?.proofCount || 0} proof captures saved`, "capture-proof", !account)}
        ${account?.platform === "reddit" ? renderOperatorAction("Capture Reddit", "Capture a Reddit thread or comment into the response queue.", "capture-reddit", !account) : ""}
      </div>
    </section>

    <section class="operator-panel">
      <header>
        <h3>${escapeHtml(t("Validation And Sync"))}</h3>
        <span class="count">${Object.keys(syncSummary).length}</span>
      </header>
      <div class="operator-action-grid">
        ${renderOperatorAction("Validate Package", "Checks policy, platform limits, and missing media.", "validate-package")}
        ${renderOperatorAction("Sync License", "Reads the Firebase license cache and offline grace window.", "sync-license")}
        ${renderOperatorAction("Check Firebase", "Validates admin config and expected collection paths.", "check-firebase")}
        ${renderOperatorAction("Export Bundle", `${formatNumber(syncSummary.totalDocuments || 0)} Firestore documents staged.`, "export-bundle")}
      </div>
    </section>

    <section class="operator-panel operator-log-panel">
      <header>
        <h3>${escapeHtml(t("Run Log"))}</h3>
        <span class="count">${recentLogs.length}</span>
      </header>
      <ol class="operator-log">
        ${recentLogs.map((log) => `<li><time>${escapeHtml(formatDateTime(log.createdAt))}</time><span>${escapeHtml(log.message)}</span></li>`).join("")}
      </ol>
    </section>
  `;
}

async function handleOperatorAction(event) {
  const button = event.target.closest("[data-operator-action]");
  if (!button || button.disabled) return;
  await runOperatorAction(button.dataset.operatorAction);
}

async function runOperatorAction(action) {
  const account = activeSocialAccount();
  const draft = activeOperatorDraft(account);
  if (action === "open-account") {
    const url = resolveLoginUrl(account);
    if (!url) return setOperatorMessage("Open account blocked: login URL is missing.");
    await window.diamond?.openExternal?.(url);
    return setOperatorMessage(`Opened ${platformLabel(account.platform)} account page.`);
  }
  if (action === "check-session") {
    if (!account) return setOperatorMessage("Session check blocked: no active account.");
    account.sessionStatus = resolveLoginUrl(account) ? "ready" : "needs_login";
    account.sessionCheckedAt = new Date().toISOString();
    await saveProductionState();
    renderAccounts(selectedAccountId);
    return setOperatorMessage(`${platformLabel(account.platform)} session marked ${titleCase(account.sessionStatus)}.`);
  }
  if (action === "stage-browser") {
    return stageOperatorDraft(account, draft);
  }
  if (action === "capture-proof") {
    return captureOperatorProof(account, draft);
  }
  if (action === "capture-reddit") {
    return captureRedditFromOperator(account);
  }
  if (action === "validate-package") {
    return validateOperatorPackage(account);
  }
  if (action === "sync-license") {
    await runSettingsAction("sync-license");
    return setOperatorMessage(latestLicenseSync?.reason || "License sync finished.");
  }
  if (action === "check-firebase") {
    await runSettingsAction("check-firebase");
    return setOperatorMessage(latestFirebaseStatus?.reason || "Firebase check finished.");
  }
  if (action === "export-bundle") {
    await runSettingsAction("export-sync");
    return setOperatorMessage(latestSyncExportPath ? `Exported Firestore bundle to ${latestSyncExportPath}.` : "Export finished.");
  }
}

async function stageOperatorDraft(account, draft) {
  if (!account) return setOperatorMessage("Browser staging blocked: no active account.");
  if (!draft) return setOperatorMessage("Browser staging blocked: no active draft.");
  await inspectDraftMedia(draft);
  if (!stagePlatformDraft(draft)) {
    await saveProductionState();
    reopenActiveDetail();
    return setOperatorMessage(draft.stageNote || "Browser staging blocked by preflight.");
  }
  const composeUrl = resolveComposeUrl(account);
  if (!composeUrl) {
    draft.stageNote = "Compose URL missing; set the account compose URL first.";
    await saveProductionState();
    return setOperatorMessage(draft.stageNote);
  }
  const context = {
    ...draft.context,
    platform: draft.platform || account.platform,
    socialAccountId: account.id,
    browserProfileId: account.browserProfileId,
  };
  await window.diamond?.writeClipboard?.(draft.text || "");
  let result;
  try {
    result = await window.diamond?.stageWithPlaywright?.({
      context,
      account,
      composeUrl,
      text: draft.text,
      media: draft.media || [],
      screenshotName: `operator-${draft.id}-${Date.now()}`,
    });
  } catch (error) {
    result = {
      ok: false,
      status: "needs_manual_finish",
      reason: error.message || "Playwright worker failed to start.",
    };
  }
  const stagedAt = new Date().toISOString();
  draft.status = result?.ok ? "staged" : result?.status || "needs_manual_finish";
  draft.stagedAt = stagedAt;
  draft.updatedAt = stagedAt;
  draft.stageUrl = result?.currentUrl || composeUrl;
  draft.stageNote = result?.reason || "Browser staging finished.";
  draft.stageResult = buildDraftStageResult(draft, result || {});
  draft.screenshotPath = result?.screenshotPath || draft.screenshotPath || "";
  createOperatorRun(draft, {
    status: draft.status,
    note: `Operator staging: ${draft.stageNote}`,
    screenshotPath: draft.screenshotPath,
    platformUrl: draft.stageUrl,
  });
  recordStagingProofForDraft(account, draft, result || {});
  updatePostPackageFromDrafts(draft.postPackageId);
  await saveProductionState();
  await refreshProductionViews();
  reopenActiveDetail();
  return setOperatorMessage(result?.ok ? "Draft staged in browser. Review before posting." : `Browser staging needs manual finish: ${draft.stageNote}`);
}

async function captureOperatorProof(account, draft) {
  if (!account) return setOperatorMessage("Proof capture blocked: no active account.");
  if (!draft) return setOperatorMessage("Proof capture blocked: no active draft.");
  capturePlatformDraftProof(draft, "staged_composer");
  await saveProductionState();
  await refreshProductionViews();
  return setOperatorMessage(`${platformLabel(account.platform)} proof recorded. Total proofs: ${account.proofCount}.`);
}

async function captureRedditFromOperator(account) {
  if (!account) return setOperatorMessage("Reddit capture blocked: no active account.");
  if (account.platform !== "reddit") return setOperatorMessage("Reddit capture blocked: active account is not Reddit.");
  const sourceUrl = promptForText("Reddit thread/comment URL", account.accountUrl || "https://www.reddit.com/r/");
  const text = promptForText("Reddit text to classify", "");
  const result = captureRedditMonitoringItem({
    context: {
      ...(state.context || {}),
      platform: "reddit",
      socialAccountId: account.id,
    },
    socialAccountId: account.id,
    sourceUrl,
    text,
    author: promptForText("Reddit author", "Reddit user"),
    subreddit: sourceUrl,
    threadTitle: promptForText("Reddit thread title", ""),
  });
  if (!result.ok) return setOperatorMessage(result.reason);
  state.socialReplies ||= [];
  state.socialResponseDrafts ||= [];
  state.socialReplies.unshift(result.reply);
  state.socialResponseDrafts.unshift(result.responseDraft);
  await saveProductionState();
  return setOperatorMessage(`Reddit monitoring captured: ${result.reason}`);
}

async function validateOperatorPackage(account) {
  const checks = operatorChecks(account);
  const drafts = activePostPackageId
    ? prototypeModel.platformDrafts.filter((draft) => draft.postPackageId === activePostPackageId)
    : activeOperatorDraft(account) ? [activeOperatorDraft(account)] : [];
  drafts.forEach(evaluatePlatformDraft);
  drafts.forEach((draft) => updatePostPackageFromDrafts(draft.postPackageId));
  await saveProductionState();
  await refreshProductionViews();
  reopenActiveDetail();
  const ready = checks.filter((check) => check.ok).length;
  return setOperatorMessage(`Validated ${drafts.length || 0} draft(s). Preflight ready: ${ready}/${checks.length}.`);
}

function createOperatorRun(draft, input = {}) {
  state.postRuns ||= [];
  const run = buildDraftRunRecord(draft, {
    id: `operator-run-${Date.now()}-${draft.platform || "platform"}`,
    status: input.status || "operator_recorded",
    note: input.note || "",
    platformUrl: input.platformUrl || "",
    screenshotPath: input.screenshotPath || "",
    metrics: createPostMetrics(),
  });
  state.postRuns.unshift(run);
  draft.lastRunId = run.id;
  return run;
}

function getPlatformProofForAccount(account) {
  if (!account) return null;
  state.platformProofs ||= [];
  const id = platformProofId({
    companyId: account.companyId,
    brandId: account.brandId,
    platform: account.platform,
    socialAccountId: account.id,
  });
  let proof = state.platformProofs.find((item) => item.id === id);
  if (!proof) {
    proof = createPlatformProofRecord({
      companyId: account.companyId,
      brandId: account.brandId,
      platform: account.platform,
      socialAccountId: account.id,
    });
    state.platformProofs.push(proof);
  }
  return proof;
}

function recordStagingProofForDraft(account, draft, result = {}) {
  if (!account || !draft) return null;
  const proof = getPlatformProofForAccount(account);
  const next = markPlatformProofFromStage(proof, {
    appSessionId: APP_SESSION_ID,
    draftId: draft.id,
    postPackageId: draft.postPackageId,
    stageUrl: draft.stageUrl || result.currentUrl || "",
    screenshotPath: draft.screenshotPath || result.screenshotPath || "",
    status: draft.status,
    ok: Boolean(result.ok),
    fillResult: result.fillResult || { ok: Boolean(result.ok), manual: draft.status === "needs_manual_finish" },
    mediaResult: result.mediaResult || {},
    hasMedia: Boolean((draft.media || []).length),
    notes: draft.stageNote || result.reason || "",
  });
  state.platformProofs = (state.platformProofs || []).map((item) => item.id === next.proof.id ? next.proof : item);
  return next.proof;
}

function setOperatorMessage(message) {
  latestOperatorMessage = message;
  state.operatorLogs ||= [];
  state.operatorLogs.unshift({
    createdAt: new Date().toISOString(),
    message,
  });
  state.operatorLogs = state.operatorLogs.slice(0, 20);
  window.diamond?.saveState?.(state);
  renderOperatorDrawer();
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
      <span>${escapeHtml(check.ok ? t("Ready") : t("Needs Attention"))}</span>
      <strong>${escapeHtml(t(check.label))}</strong>
      <p>${escapeHtml(check.note)}</p>
    </article>
  `;
}

function renderOperatorAction(label, note, action, disabled = false) {
  return `
    <button class="operator-action" type="button" data-operator-action="${escapeHtml(action)}" ${disabled ? "disabled" : ""}>
      <strong>${escapeHtml(t(label))}</strong>
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

function activeOperatorDraft(account) {
  const activeDrafts = activePostPackageId
    ? prototypeModel.platformDrafts.filter((draft) => draft.postPackageId === activePostPackageId)
    : [];
  return activeDrafts.find((draft) => draft.socialAccountId === account?.id)
    || activeDrafts.find((draft) => draft.platform === account?.platform)
    || activeDrafts[0]
    || prototypeModel.platformDrafts.find((draft) => draft.socialAccountId === account?.id)
    || prototypeModel.platformDrafts.find((draft) => draft.platform === account?.platform)
    || prototypeModel.platformDrafts[0];
}

function operatorRunLogs() {
  const runLogs = (state.postRuns || []).map((run) => ({
    createdAt: run.createdAt,
    message: `${platformLabel(run.context?.platform || "x")} ${run.status || "run"}: ${run.text || run.id}`,
  }));
  return [
    ...(state.operatorLogs || []),
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
        <h2>${escapeHtml(t(title))}</h2>
      </header>
      <dl>
        ${rows.map(([label, value]) => `<div><dt>${escapeHtml(t(label))}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
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
  document.querySelector("#detail-status").textContent = statusLabel(postPackage.status);
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
  target.innerHTML = drafts.map(renderPlatformPreview).join("");
}

function renderPlatformPreview(draft) {
  const preflight = platformDraftPreflight(draft);
  const plan = platformStagingPlan(draft.platform, { media: draft.media || [] });
  return `
    <article class="platform-preview" data-preview-platform="${escapeHtml(draft.platform)}" data-platform-draft-id="${escapeHtml(draft.id)}">
      <header>
        <div>
          <strong>${platformIcon(draft.platform)} ${escapeHtml(platformLabel(draft.platform))}</strong>
          <em class="session-pill ${escapeHtml(draft.status || "draft")}">${escapeHtml(statusLabel(draft.status || "draft"))}</em>
          <em class="session-pill ${preflight.ok ? "ready" : "needs_login"}">${escapeHtml(preflight.ok ? t("Ready") : t("Needs Attention"))}</em>
        </div>
        ${draft.charLimit ? `<span>${draft.text.length}/${draft.charLimit}</span>` : ""}
      </header>
      ${renderDraftReliability(draft, preflight)}
      ${renderStagingPlan(draft, plan)}
      <textarea rows="${draft.platform === "x" ? 4 : 7}" data-draft-text="${escapeHtml(draft.id)}">${escapeHtml(draft.text)}</textarea>
      <div class="draft-media-row">
        <button type="button" class="media-button" data-platform-action="add-media" data-platform-draft-id="${escapeHtml(draft.id)}">+ Media</button>
        <button type="button" class="media-button" data-platform-action="copy-media" data-platform-draft-id="${escapeHtml(draft.id)}">Copy paths</button>
        <span>${escapeHtml(mediaStatus(draft))}</span>
      </div>
      ${renderDraftMediaList(draft)}
      <div class="platform-action-row" aria-label="${escapeHtml(platformLabel(draft.platform))} actions">
        <button type="button" data-platform-action="evaluate" data-platform-draft-id="${escapeHtml(draft.id)}">${escapeHtml(t("Evaluate"))}</button>
        <button type="button" data-platform-action="approve" data-platform-draft-id="${escapeHtml(draft.id)}">${escapeHtml(t("Approve"))}</button>
        <button type="button" data-platform-action="schedule" data-platform-draft-id="${escapeHtml(draft.id)}">${escapeHtml(t("Schedule"))}</button>
        <button type="button" data-platform-action="stage" data-platform-draft-id="${escapeHtml(draft.id)}">${escapeHtml(t("Stage"))}</button>
        <button type="button" data-platform-action="proof" data-platform-draft-id="${escapeHtml(draft.id)}">${escapeHtml(t("Capture Proof"))}</button>
        <button type="button" data-platform-action="copy-proof" data-platform-draft-id="${escapeHtml(draft.id)}">${escapeHtml(t("Copy Proof"))}</button>
        <button type="button" data-platform-action="copy-url" data-platform-draft-id="${escapeHtml(draft.id)}">${escapeHtml(t("Copy Url"))}</button>
        <button type="button" data-platform-action="copy-screenshot" data-platform-draft-id="${escapeHtml(draft.id)}">${escapeHtml(t("Copy Screenshot"))}</button>
        <button type="button" data-platform-action="posted" data-platform-draft-id="${escapeHtml(draft.id)}">${escapeHtml(t("Mark Posted"))}</button>
        <button type="button" data-platform-action="abandoned" data-platform-draft-id="${escapeHtml(draft.id)}">${escapeHtml(t("Abandon"))}</button>
      </div>
      ${renderDraftEvaluation(draft)}
      ${renderDraftProofPanel(draft)}
      <div class="platform-note">${escapeHtml(plan.manualFinish)}</div>
      <div class="social-preview">
        <div class="avatar"></div>
        <div>
          <strong>Your Name</strong>
          <p>Your headline<br>now</p>
        </div>
        <p>${escapeHtml(draft.text)}</p>
      </div>
    </article>
  `;
}

function renderDraftProofPanel(draft) {
  const account = accountForDraft(draft);
  const run = latestRunForDraft(draft);
  const rows = [
    ["Proof status", proofStatus(draft, account)],
    ["Last proof", draft.proofCapturedAt ? formatDateTime(draft.proofCapturedAt) : "None"],
    ["Proof kind", titleCase(draft.proofKind || "not captured")],
    ["Staged URL", draft.stageUrl || run?.platformUrl || "Missing"],
    ["Screenshot", draft.screenshotPath || run?.screenshotPath || "Missing"],
    ["Run ID", draft.lastRunId || draft.runId || run?.id || "None"],
    ["Account proofs", String(account?.proofCount || 0)],
    ["Next", proofNextAction(draft)],
  ];
  return `
    <section class="draft-proof-panel" aria-label="${escapeHtml(platformLabel(draft.platform))} proof">
      <header>
        <strong>${escapeHtml(t("Proof"))}</strong>
        <span>${escapeHtml(draft.proofNote || "Capture proof after staging or manual posting.")}</span>
      </header>
      <dl>
        ${rows.map(([label, value]) => `<div><dt>${escapeHtml(t(label))}</dt><dd>${escapeHtml(t(value))}</dd></div>`).join("")}
      </dl>
      <p>${escapeHtml(buildDraftProofSummary(draft))}</p>
    </section>
  `;
}

function renderDraftMediaList(draft) {
  const media = draft.media || [];
  if (!media.length) return "";
  const inspections = mediaInspectionMap(draft);
  return `
    <ul class="draft-media-list" aria-label="${escapeHtml(platformLabel(draft.platform))} media files">
      ${media.map((filePath) => {
        const item = inspections.get(filePath) || mediaPathFallback(filePath);
        return `
          <li class="${item.exists === false ? "missing" : ""}">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(titleCase(item.kind || "file"))} / ${item.exists === false ? "missing" : item.exists ? "ready" : "unchecked"}</span>
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

function renderStagingPlan(draft, plan = platformStagingPlan(draft.platform, { media: draft.media || [] })) {
  const rows = [
    ["Stage Mode", titleCase(plan.stageMode)],
    ["Text Insert", plan.supportsTextInsert ? "Assisted" : "Manual Paste"],
    ["Media", titleCase(plan.mediaState)],
    ["Proof Target", plan.proofTarget],
  ];
  return `
    <section class="staging-plan" aria-label="${escapeHtml(plan.label)} staging plan">
      <header>
        <strong>${escapeHtml(`${plan.label} ${t("Browser Staging")}`)}</strong>
        <span>${escapeHtml(plan.composeUrl || "Account compose URL")}</span>
      </header>
      <dl>
        ${rows.map(([label, value]) => `<div><dt>${escapeHtml(t(label))}</dt><dd>${escapeHtml(t(value))}</dd></div>`).join("")}
      </dl>
      ${draft.stageResult ? renderStageResult(draft.stageResult) : ""}
      ${plan.blockers.length ? `<p class="staging-blockers">${escapeHtml(plan.blockers.join(" "))}</p>` : ""}
    </section>
  `;
}

function renderStageResult(result = {}) {
  const rows = [
    ["Opened", result.openedUrl || "Not opened yet"],
    ["Text", result.textInserted ? "Inserted" : result.textManual ? "Manual paste required" : "Not inserted"],
    ["Media", result.mediaAttached ? "Attached" : result.mediaManual ? "Manual upload required" : "No assisted upload"],
    ["Next", result.nextAction || "Review before publishing"],
  ];
  return `
    <div class="stage-result">
      ${rows.map(([label, value]) => `<span><strong>${escapeHtml(t(label))}</strong>${escapeHtml(t(value))}</span>`).join("")}
    </div>
  `;
}

function renderDraftReliability(draft, preflight = platformDraftPreflight(draft)) {
  const account = accountForDraft(draft);
  const rows = [
    ["Platform", platformLabel(draft.platform)],
    ["Account", account?.handle || account?.id || "Missing"],
    ["Session", statusLabel(account?.sessionStatus || "unknown")],
    ["Approval", statusLabel(draft.status || "draft")],
    ["Schedule", draft.scheduledAt ? formatDateTime(draft.scheduledAt) : "Not scheduled"],
    ["Media", mediaStatus(draft)],
    ["Proof", proofStatus(draft, account)],
  ];
  return `
    <dl class="draft-reliability-grid">
      ${rows.map(([label, value]) => `<div><dt>${escapeHtml(t(label))}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
    </dl>
    ${preflight.issues.length ? `<div class="draft-preflight ${preflight.ok ? "ready" : "blocked"}">${preflight.issues.map((issue) => `<span>${escapeHtml(issue)}</span>`).join("")}</div>` : ""}
  `;
}

function renderDraftEvaluation(draft) {
  const details = [
    draft.approvalLevel ? `Approval: ${titleCase(draft.approvalLevel)}` : "",
    Number.isFinite(Number(draft.qualityScore)) ? `Quality: ${draft.qualityScore}/${draft.qualityGate || "unknown"}` : "",
    draft.scheduledAt ? `Scheduled: ${formatDateTime(draft.scheduledAt)}` : "",
    draft.publishedAt ? `Posted: ${formatDateTime(draft.publishedAt)}` : "",
    draft.stageNote || "",
  ].filter(Boolean);
  if (!details.length && !draft.riskFlags?.length && !draft.qualityDetails?.length) return "";
  return `
    <div class="platform-evaluation">
      ${details.map((detail) => `<span>${escapeHtml(detail)}</span>`).join("")}
      ${draft.riskFlags?.length ? `<span>Risk: ${escapeHtml(draft.riskFlags.join(", "))}</span>` : ""}
      ${draft.qualityDetails?.length ? `<p>${escapeHtml(draft.qualityDetails.slice(0, 2).join(" "))}</p>` : ""}
    </div>
  `;
}

async function handlePlatformDraftAction(event) {
  const button = event.target.closest("[data-platform-action]");
  if (!button) return;
  const draft = prototypeModel.platformDrafts.find((item) => item.id === button.dataset.platformDraftId);
  if (!draft) return;
  const action = button.dataset.platformAction;
  if (action === "evaluate") evaluatePlatformDraft(draft);
  if (action === "approve") approvePlatformDraft(draft);
  if (action === "schedule") schedulePlatformDraft(draft);
  if (action === "add-media") await attachMediaToDraft(draft);
  if (action === "copy-media") await copyDraftMediaPaths(draft);
  if (action === "stage") {
    await inspectDraftMedia(draft);
    stagePlatformDraft(draft);
  }
  if (action === "proof") capturePlatformDraftProof(draft);
  if (action === "copy-proof") await copyDraftProofSummary(draft);
  if (action === "copy-url") await copyDraftStageUrl(draft);
  if (action === "copy-screenshot") await copyDraftScreenshotPath(draft);
  if (action === "posted") markPlatformDraftPosted(draft);
  if (action === "abandoned") markPlatformDraftAbandoned(draft);
  updatePostPackageFromDrafts(draft.postPackageId);
  await saveProductionState();
  await refreshProductionViews();
  reopenActiveDetail();
}

async function attachMediaToActiveDrafts() {
  if (!activePostPackageId) return;
  const files = await window.diamond?.pickMedia?.();
  if (!files?.length) return;
  const now = new Date().toISOString();
  prototypeModel.platformDrafts
    .filter((draft) => draft.postPackageId === activePostPackageId)
    .forEach((draft) => {
      draft.media = [...(draft.media || []), ...files];
      draft.updatedAt = now;
    });
  await Promise.all(prototypeModel.platformDrafts
    .filter((draft) => draft.postPackageId === activePostPackageId)
    .map((draft) => inspectDraftMedia(draft)));
  await saveProductionState();
  reopenActiveDetail();
}

async function attachMediaToDraft(draft) {
  const files = await window.diamond?.pickMedia?.();
  if (!files?.length) return;
  draft.media = [...new Set([...(draft.media || []), ...files])];
  draft.updatedAt = new Date().toISOString();
  await inspectDraftMedia(draft);
}

async function copyDraftMediaPaths(draft) {
  await window.diamond?.writeClipboard?.((draft.media || []).join("\n"));
  draft.stageNote = (draft.media || []).length
    ? `Copied ${draft.media.length} media path(s) for manual upload.`
    : "No media paths to copy.";
  draft.updatedAt = new Date().toISOString();
}

async function inspectDraftMedia(draft) {
  const media = draft.media || [];
  if (!media.length) {
    draft.mediaInspection = [];
    return [];
  }
  const inspected = await window.diamond?.inspectMedia?.(media);
  draft.mediaInspection = Array.isArray(inspected) ? inspected : media.map(mediaPathFallback);
  return draft.mediaInspection;
}

async function addPlatformToActivePackage() {
  if (!activePostPackageId) return;
  const postPackage = prototypeModel.postPackages.find((item) => item.id === activePostPackageId);
  if (!postPackage) return;
  const platform = normalizeId(promptForText("Platform", "linkedin"));
  if (!platform) return;
  if (prototypeModel.platformDrafts.some((draft) => draft.postPackageId === activePostPackageId && draft.platform === platform)) return;
  const now = new Date().toISOString();
  const draft = createPlatformDraft({
    id: `${postPackage.id}-${platform}`,
    postPackage,
    context: {
      ...postPackage.context,
      platform,
      socialAccountId: socialAccountIdForPlatform(platform),
    },
    platform,
    socialAccountId: socialAccountIdForPlatform(platform),
    text: platformCopy(postPackage.ideaText || "", platform),
    status: "draft",
    createdAt: now,
    updatedAt: now,
  });
  prototypeModel.platformDrafts.push(draft);
  updatePostPackageFromDrafts(postPackage.id);
  await saveProductionState();
  reopenActiveDetail();
}

function handlePlatformDraftTextInput(event) {
  const textarea = event.target.closest("[data-draft-text]");
  if (!textarea) return;
  const draft = prototypeModel.platformDrafts.find((item) => item.id === textarea.dataset.draftText);
  if (!draft) return;
  draft.text = textarea.value;
  draft.updatedAt = new Date().toISOString();
  const preview = textarea.closest("[data-platform-draft-id]");
  const counter = preview?.querySelector("header > span");
  if (counter && draft.charLimit) counter.textContent = `${draft.text.length}/${draft.charLimit}`;
  const socialText = preview?.querySelector(".social-preview > p");
  if (socialText) socialText.textContent = draft.text;
  saveProductionState();
}

function evaluatePlatformDraft(draft) {
  const policy = approvalPolicyFor(draft);
  const brandLibrary = brandLibraryFor(draft);
  const claimLibrary = claimLibraryFor(draft);
  const strategy = strategyFor(draft);
  const risk = evaluateDraftRisk({
    text: draft.text,
    policy,
    brandLibrary,
    claimLibrary,
  });
  const quality = evaluateDraftQuality({
    draft: {
      ...draft,
      approvalLevel: risk.level,
      riskFlags: risk.flags,
      language: draft.language || "en",
    },
    strategy,
    memory: state.postMemory || [],
    assets: state.assetLibrary || [],
  });
  draft.approvalLevel = risk.level;
  draft.riskFlags = risk.flags;
  draft.riskDetails = risk.details || [];
  draft.qualityScore = quality.score;
  draft.qualityGate = quality.level;
  draft.qualityDetails = quality.details || [];
  draft.repeatedMemoryId = quality.repeatedMemoryId || null;
  draft.status = risk.level === "blocked" || quality.level === "hold"
    ? "blocked"
    : risk.level === "review_required" || quality.level === "review" ? "needs_review" : "draft";
  draft.evaluatedAt = new Date().toISOString();
  draft.updatedAt = draft.evaluatedAt;
}

function approvePlatformDraft(draft) {
  if (!draft.approvalLevel) evaluatePlatformDraft(draft);
  if (draft.status === "blocked") {
    draft.stageNote = "Approval blocked until risk or quality issues are fixed.";
    draft.updatedAt = new Date().toISOString();
    return;
  }
  draft.status = "approved";
  draft.approvedAt = new Date().toISOString();
  draft.updatedAt = draft.approvedAt;
}

function schedulePlatformDraft(draft) {
  if (!["approved", "staged", "scheduled", "published"].includes(draft.status)) approvePlatformDraft(draft);
  if (draft.status === "blocked") return;
  const scheduledAt = draft.scheduledAt || nextScheduleTime();
  const schedule = {
    id: draft.scheduledPostId || `scheduled-${Date.now()}-${draft.platform}`,
    draftId: draft.id,
    postPackageId: draft.postPackageId,
    context: draft.context,
    status: "scheduled",
    scheduledAt,
    text: draft.text,
    media: draft.media || [],
    createdAt: draft.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.scheduledPosts ||= [];
  const index = state.scheduledPosts.findIndex((item) => item.id === schedule.id);
  if (index >= 0) state.scheduledPosts[index] = { ...state.scheduledPosts[index], ...schedule };
  else state.scheduledPosts.unshift(schedule);
  draft.status = "scheduled";
  draft.scheduledPostId = schedule.id;
  draft.scheduledAt = scheduledAt;
  draft.updatedAt = schedule.updatedAt;
}

function stagePlatformDraft(draft) {
  const preflight = platformDraftPreflight(draft);
  if (!preflight.ok) {
    draft.status = draft.status === "published" ? draft.status : "needs_review";
    draft.stageNote = `Staging blocked: ${preflight.issues.join(" ")}`;
    draft.stageResult = buildDraftStageResult(draft, { ok: false, reason: draft.stageNote });
    draft.updatedAt = new Date().toISOString();
    return false;
  }
  const account = accountForDraft(draft);
  const plan = platformStagingPlan(draft.platform, { media: draft.media || [] });
  draft.status = "staged";
  draft.stagedAt = new Date().toISOString();
  draft.stageUrl = resolveComposeUrl(account) || plan.composeUrl || "";
  draft.stageNote = plan.stageMode === "assisted"
    ? "Ready for assisted browser staging in Operator tools."
    : plan.manualFinish;
  draft.stageResult = buildDraftStageResult(draft, { ok: plan.stageMode === "assisted", manual: plan.stageMode === "manual", currentUrl: draft.stageUrl });
  draft.updatedAt = draft.stagedAt;
  return true;
}

function buildDraftStageResult(draft, result = {}) {
  const plan = platformStagingPlan(draft.platform, { media: draft.media || [] });
  const hasMedia = Boolean((draft.media || []).length);
  return {
    ok: Boolean(result.ok),
    openedUrl: result.currentUrl || draft.stageUrl || resolveComposeUrl(accountForDraft(draft)) || plan.composeUrl || "",
    textInserted: Boolean(result.fillResult?.ok || (result.ok && plan.supportsTextInsert)),
    textManual: Boolean(result.manual || !plan.supportsTextInsert),
    mediaAttached: Boolean(result.mediaResult?.ok && hasMedia),
    mediaManual: Boolean(hasMedia && !plan.supportsMediaPicker),
    nextAction: result.ok
      ? "Review composer, publish manually, then capture proof."
      : result.reason || plan.manualFinish,
  };
}

function markPlatformDraftPosted(draft) {
  const postedAt = new Date().toISOString();
  draft.status = "published";
  draft.publishedAt = postedAt;
  draft.updatedAt = postedAt;
  state.postRuns ||= [];
  const run = buildDraftRunRecord(draft, {
    id: draft.runId || `run-${Date.now()}-${draft.platform}`,
    status: "posted",
    note: draft.proofNote || "Marked posted after manual publish.",
    createdAt: postedAt,
    platformUrl: draft.stageUrl || "",
    screenshotPath: draft.screenshotPath || "",
    proofKind: draft.proofKind || "",
  });
  draft.runId = run.id;
  const runIndex = state.postRuns.findIndex((item) => item.id === run.id);
  if (runIndex >= 0) state.postRuns[runIndex] = { ...state.postRuns[runIndex], ...run };
  else state.postRuns.unshift(run);
  const schedule = state.scheduledPosts?.find((item) => item.id === draft.scheduledPostId || item.draftId === draft.id);
  if (schedule) {
    schedule.status = "posted";
    schedule.postedAt = postedAt;
    schedule.updatedAt = postedAt;
  }
}

function capturePlatformDraftProof(draft, proofKind = "") {
  const account = accountForDraft(draft);
  const capturedAt = new Date().toISOString();
  const kind = normalizeProofKind(proofKind || promptForText("Proof kind", defaultProofKind(draft)));
  if (account) {
    account.proofCount = Number(account.proofCount || 0) + 1;
    account.lastProofAt = capturedAt;
  }
  draft.proofCapturedAt = capturedAt;
  draft.proofKind = kind;
  draft.proofNote = `${titleCase(kind)} proof captured for ${platformLabel(draft.platform)}${account?.handle ? ` / ${account.handle}` : ""}.`;
  draft.updatedAt = capturedAt;
  state.postRuns ||= [];
  const run = buildDraftRunRecord(draft, {
    id: `proof-${Date.now()}-${draft.platform}`,
    status: "proof_captured",
    createdAt: capturedAt,
    platformUrl: draft.stageUrl || resolveComposeUrl(account) || resolveLoginUrl(account) || "",
    screenshotPath: draft.screenshotPath || "",
    note: draft.proofNote,
    proofKind: kind,
    proofCapturedAt: capturedAt,
  });
  draft.lastProofRunId = run.id;
  draft.lastRunId = run.id;
  state.postRuns.unshift(run);
}

async function copyDraftProofSummary(draft) {
  await window.diamond?.writeClipboard?.(buildDraftProofSummary(draft));
  draft.stageNote = "Copied proof summary.";
  draft.updatedAt = new Date().toISOString();
}

async function copyDraftStageUrl(draft) {
  const run = latestRunForDraft(draft);
  const value = draft.stageUrl || run?.platformUrl || "";
  await window.diamond?.writeClipboard?.(value);
  draft.stageNote = value ? "Copied staged URL." : "No staged URL to copy.";
  draft.updatedAt = new Date().toISOString();
}

async function copyDraftScreenshotPath(draft) {
  const run = latestRunForDraft(draft);
  const value = draft.screenshotPath || run?.screenshotPath || "";
  await window.diamond?.writeClipboard?.(value);
  draft.stageNote = value ? "Copied screenshot path." : "No screenshot path to copy.";
  draft.updatedAt = new Date().toISOString();
}

function buildDraftRunRecord(draft, input = {}) {
  const context = draft.context || {};
  const account = accountForDraft(draft);
  return {
    id: input.id || `run-${Date.now()}-${draft.platform || "platform"}`,
    companyId: draft.companyId || context.companyId || "",
    brandId: draft.brandId || context.brandId || "",
    campaignId: draft.campaignId || context.campaignId || "",
    platform: draft.platform || context.platform || "",
    socialAccountId: draft.socialAccountId || context.socialAccountId || account?.id || "",
    browserProfileId: context.browserProfileId || account?.browserProfileId || "",
    accountHandle: account?.handle || "",
    draftId: draft.id,
    postPackageId: draft.postPackageId,
    context: {
      ...context,
      companyId: draft.companyId || context.companyId || "",
      brandId: draft.brandId || context.brandId || "",
      campaignId: draft.campaignId || context.campaignId || "",
      platform: draft.platform || context.platform || "",
      socialAccountId: draft.socialAccountId || context.socialAccountId || account?.id || "",
      browserProfileId: context.browserProfileId || account?.browserProfileId || "",
    },
    status: input.status || "operator_recorded",
    proofKind: input.proofKind || "",
    proofCapturedAt: input.proofCapturedAt || draft.proofCapturedAt || "",
    note: input.note || "",
    text: draft.text,
    media: draft.media || [],
    platformUrl: input.platformUrl || draft.stageUrl || "",
    stageUrl: input.platformUrl || draft.stageUrl || "",
    screenshotPath: input.screenshotPath || draft.screenshotPath || "",
    metrics: input.metrics,
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

function latestRunForDraft(draft) {
  return (state.postRuns || []).find((run) => (
    run.id === draft.lastProofRunId
    || run.id === draft.lastRunId
    || run.id === draft.runId
    || run.draftId === draft.id
  )) || null;
}

function buildDraftProofSummary(draft) {
  const account = accountForDraft(draft);
  const run = latestRunForDraft(draft);
  const lines = [
    `${platformLabel(draft.platform)} ${titleCase(draft.status || "draft")} proof`,
    `Account: ${account?.handle || account?.id || "missing"}`,
    `Brand: ${brandName(draft.brandId || draft.context?.brandId)}`,
    `Campaign: ${campaignName(draft.campaignId || draft.context?.campaignId)}`,
    `Proof: ${draft.proofCapturedAt ? `${titleCase(draft.proofKind || "captured")} at ${formatDateTime(draft.proofCapturedAt)}` : "not captured"}`,
    `URL: ${draft.stageUrl || run?.platformUrl || "missing"}`,
    `Screenshot: ${draft.screenshotPath || run?.screenshotPath || "missing"}`,
    `Run: ${draft.lastProofRunId || draft.lastRunId || draft.runId || run?.id || "missing"}`,
  ];
  return lines.join(" | ");
}

function defaultProofKind(draft) {
  if (draft.status === "published") return "published";
  if (draft.screenshotPath) return "screenshot";
  if (draft.status === "staged") return "staged";
  return "account";
}

function normalizeProofKind(value) {
  const id = normalizeId(value || "account");
  if (["published", "published-post", "live-post", "live"].includes(id)) return "published_post";
  if (["screenshot", "screen", "capture"].includes(id)) return "screenshot";
  if (["media", "upload", "manual-upload"].includes(id)) return "manual_upload";
  if (["account", "session", "login"].includes(id)) return "account_session";
  return "staged_composer";
}

function proofNextAction(draft) {
  if (!draft.proofCapturedAt) return "Capture proof after staging or publishing.";
  if (draft.status !== "published") return "Mark posted after the post is live.";
  return "Run record is ready for analytics.";
}

function markPlatformDraftAbandoned(draft) {
  draft.status = "abandoned";
  draft.abandonedAt = new Date().toISOString();
  draft.updatedAt = draft.abandonedAt;
}

function updatePostPackageFromDrafts(postPackageId) {
  const postPackage = prototypeModel.postPackages.find((item) => item.id === postPackageId);
  if (!postPackage) return;
  const drafts = prototypeModel.platformDrafts.filter((draft) => draft.postPackageId === postPackageId);
  postPackage.status = packageStatusFromDrafts(drafts);
  postPackage.updatedAt = latestValue(drafts.map((draft) => draft.updatedAt)) || new Date().toISOString();
  postPackage.platformDraftIds = drafts.map((draft) => draft.id);
}

function packageStatusFromDrafts(drafts) {
  const statuses = drafts.map((draft) => draft.status);
  if (statuses.some((status) => status === "blocked")) return "blocked";
  if (statuses.some((status) => status === "failed")) return "failed";
  if (statuses.some((status) => status === "needs_review")) return "needs_review";
  if (statuses.some((status) => status === "staged")) return "staged";
  if (statuses.some((status) => status === "scheduled")) return "scheduled";
  if (statuses.length && statuses.every((status) => status === "published")) return "published";
  if (statuses.some((status) => status === "approved")) return "approved";
  if (statuses.length && statuses.every((status) => status === "abandoned")) return "abandoned";
  return "draft";
}

function reopenActiveDetail() {
  if (!activePostPackageId) return;
  const postPackage = prototypeModel.postPackages.find((item) => item.id === activePostPackageId);
  if (!postPackage) return;
  const drafts = prototypeModel.platformDrafts.filter((draft) => draft.postPackageId === activePostPackageId);
  openDetail(postPackage, drafts);
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

function accountForDraft(draft) {
  return (state.socialAccounts || []).find((account) => account.id === draft.socialAccountId)
    || (state.socialAccounts || []).find((account) => account.platform === draft.platform)
    || null;
}

function approvalPolicyFor(draft) {
  return (state.approvalPolicies || []).find((policy) => policy.id === draft.context?.approvalPolicyId)
    || (state.approvalPolicies || []).find((policy) => policy.companyId === draft.companyId)
    || {};
}

function platformDraftPreflight(draft) {
  const issues = [];
  const account = accountForDraft(draft);
  const text = String(draft.text || "").trim();
  const license = state.licenseCache || createTemporaryUnlimitedDiamondLicense({
    userId: "scott",
    brands: [draft.brandId || draft.context?.brandId].filter(Boolean),
    platforms: [draft.platform].filter(Boolean),
  });
  const licenseCheck = evaluateDiamondLicense(license, {
    requestedBrands: [draft.brandId || draft.context?.brandId].filter(Boolean),
    requestedPlatforms: [draft.platform].filter(Boolean),
  });
  if (!text) issues.push("Draft text is empty.");
  if (draft.charLimit && text.length > draft.charLimit) issues.push(`Text exceeds ${draft.charLimit} characters.`);
  if (!["approved", "scheduled", "staged", "published"].includes(draft.status)) issues.push("Draft must be approved before staging.");
  if (!account) issues.push("No social account is assigned.");
  if (account && account.sessionStatus !== "ready") issues.push(`${platformLabel(account.platform)} session is ${titleCase(account.sessionStatus || "unknown")}.`);
  if (account && !resolveComposeUrl(account)) issues.push("Compose URL is missing.");
  if (!licenseCheck.ok) issues.push(licenseCheck.reason || "License does not allow this brand/platform.");
  const plan = platformStagingPlan(draft.platform, { media: draft.media || [] });
  issues.push(...plan.blockers);
  issues.push(...mediaReadinessIssues(draft, plan));
  return {
    ok: issues.length === 0,
    issues,
    account,
    licenseCheck,
  };
}

function mediaStatus(draft) {
  const plan = platformStagingPlan(draft.platform, { media: draft.media || [] });
  const readiness = mediaReadiness(draft, plan);
  const count = (draft.media || []).length;
  if (count && readiness.missingCount) return `${count} media file${count === 1 ? "" : "s"}, ${readiness.missingCount} missing`;
  if (count) return `${count} media file${count === 1 ? "" : "s"} attached`;
  if (plan.mediaRequired) return "Media required or manual";
  return "No media attached";
}

function mediaReadinessIssues(draft, plan = platformStagingPlan(draft.platform, { media: draft.media || [] })) {
  const readiness = mediaReadiness(draft, plan);
  const issues = [];
  if (readiness.requiredMissing) issues.push(`${plan.label} requires media before staging.`);
  if (readiness.missingCount) issues.push(`${readiness.missingCount} attached media file${readiness.missingCount === 1 ? "" : "s"} could not be found.`);
  if (readiness.typeMismatch) issues.push(readiness.typeMismatch);
  return issues;
}

function mediaReadiness(draft, plan = platformStagingPlan(draft.platform, { media: draft.media || [] })) {
  const media = draft.media || [];
  const inspections = mediaInspectionMap(draft);
  const inspectedItems = media.map((filePath) => inspections.get(filePath) || mediaPathFallback(filePath));
  const missingCount = inspectedItems.filter((item) => item.exists === false).length;
  const kinds = new Set(inspectedItems.map((item) => item.kind));
  let typeMismatch = "";
  if (draft.platform === "youtube-shorts" && media.length && !kinds.has("video")) {
    typeMismatch = "YouTube Shorts needs video media.";
  }
  if (draft.platform === "tiktok" && media.length && !kinds.has("video")) {
    typeMismatch = "TikTok should use video media.";
  }
  return {
    requiredMissing: Boolean(plan.mediaRequired && !media.length),
    missingCount,
    typeMismatch,
  };
}

function mediaInspectionMap(draft) {
  return new Map((draft.mediaInspection || []).map((item) => [item.path, item]));
}

function mediaPathFallback(filePath) {
  const value = String(filePath || "");
  const name = value.split(/[\\/]/).filter(Boolean).pop() || value || "media";
  const extension = (name.split(".").pop() || "").toLowerCase();
  const kind = ["mp4", "mov", "webm"].includes(extension)
    ? "video"
    : ["png", "jpg", "jpeg", "webp", "gif"].includes(extension) ? "image" : "file";
  return { path: value, name, extension, kind, exists: undefined, size: 0 };
}

function proofStatus(draft, account) {
  if (draft.proofCapturedAt) return `Captured ${formatDateTime(draft.proofCapturedAt)}`;
  if (account?.lastProofAt) return `Account proof ${formatDateTime(account.lastProofAt)}`;
  return `${account?.proofCount || 0} account proofs`;
}

function brandLibraryFor(draft) {
  return (state.brandLibraries || []).find((library) => library.brandId === draft.brandId)
    || {};
}

function claimLibraryFor(draft) {
  return (state.claimLibraries || []).find((library) => library.brandId === draft.brandId)
    || {};
}

function strategyFor(draft) {
  return (state.contentStrategies || []).find((strategy) => strategy.campaignId === draft.campaignId)
    || {};
}

function nextScheduleTime() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return date.toISOString();
}

function latestValue(values = []) {
  return values
    .filter(Boolean)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] || "";
}

function promptForText(label, fallback = "") {
  return String(window.prompt(label, fallback) || "").trim();
}

function startGuideTour() {
  activeTourIndex = 0;
  showTourStep();
}

function moveTour(delta) {
  if (activeTourIndex === tourSteps.length - 1 && delta > 0) {
    closeGuideTour();
    return;
  }
  activeTourIndex = Math.max(0, Math.min(tourSteps.length - 1, activeTourIndex + delta));
  showTourStep();
}

async function showTourStep() {
  const step = tourSteps[activeTourIndex];
  if (!step) return;
  const layer = document.querySelector("#tour-layer");
  const popover = document.querySelector("#tour-popover");
  layer?.classList.remove("hidden");
  if (activeTourTarget) activeTourTarget.classList.remove("tour-highlight");
  activeTourTarget = document.querySelector(step.targetSelector);
  if (activeTourTarget) {
    activeTourTarget.classList.add("tour-highlight");
    activeTourTarget.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  }
  document.querySelector("#tour-progress").textContent = `Step ${activeTourIndex + 1} of ${tourSteps.length}`;
  document.querySelector("#tour-title").textContent = step.title;
  document.querySelector("#tour-body").textContent = step.voiceoverText;
  document.querySelector("#tour-voice").textContent = "Voiceover: " + step.voiceoverText;
  document.querySelector("#tour-prev").disabled = activeTourIndex === 0;
  document.querySelector("#tour-next").textContent = activeTourIndex === tourSteps.length - 1 ? "Done" : "Next";
  const audio = await audioForTourStep(step);
  document.querySelector("#tour-play-voiceover").disabled = !audio;
  document.querySelector("#tour-play-voiceover").textContent = audio ? "Play voiceover" : "No audio yet";
  positionTourPopover(popover, activeTourTarget);
}

function positionTourPopover(popover, target) {
  if (!popover) return;
  if (!target) {
    popover.style.left = "24px";
    popover.style.top = "24px";
    return;
  }
  const targetRect = target.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  const gap = 16;
  const left = Math.min(
    window.innerWidth - popoverRect.width - gap,
    Math.max(gap, targetRect.right + gap),
  );
  const preferredTop = targetRect.top;
  const top = Math.min(
    window.innerHeight - popoverRect.height - gap,
    Math.max(gap, preferredTop),
  );
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

function closeGuideTour() {
  document.querySelector("#tour-layer")?.classList.add("hidden");
  if (activeTourTarget) activeTourTarget.classList.remove("tour-highlight");
  activeTourTarget = null;
  if (activeTourAudio) {
    activeTourAudio.pause();
    activeTourAudio = null;
  }
}

async function playTourVoiceover() {
  const step = tourSteps[activeTourIndex];
  const audioFile = await audioForTourStep(step);
  if (!audioFile) return;
  if (activeTourAudio) activeTourAudio.pause();
  activeTourAudio = new Audio(audioFile.url);
  await activeTourAudio.play();
}

async function audioForTourStep(step) {
  const status = await window.diamond?.getVoiceoverStatus?.();
  const expected = `${String(step.order).padStart(2, "0")}-${step.id}.mp3`;
  return (status?.files || []).find((file) => file.name === expected) || null;
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
