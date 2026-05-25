import {
  buildSocialAccountCreationPlan,
  buildSocialAccountSetupKit,
  buildDiamondLicenseModel,
  buildPostBoardView,
  buildPlatformProofDashboard,
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
  evaluateExpertChecklist,
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
  inferSessionStatusFromUrl,
  summarizePostMetrics,
  summarizeFirestoreSyncBundle,
  buildFirestoreSyncBundle,
  buildTourVoiceoverScript,
  browserProfilePath,
  createElevenLabsSpeechRequest,
  autoPublishDecisionMarkdown,
  expertChecklistMarkdown,
  evaluateAutoPublishReadiness,
  formatSocialAccountCreationPlan,
  getDiamondGuideSections,
  getDiamondFirstRunSteps,
  getDiamondTourSteps,
  captureRedditMonitoringItem,
  createPlatformProofRecord,
  buildPlatformProofQueue,
  ensurePlatformProofRecords,
  evaluatePlatformProof,
  markPlatformLoginProof,
  markPlatformProof,
  markPlatformProofFromStage,
  platformProofId,
  platformProofQueueMarkdown,
  platformProofTypeFromKind,
  platformStagingPlan,
  stagingProofSessionProgress,
} from "../index.js";
import {
  TOGGLEABLE_PLATFORMS,
  computeCompanyCascade,
  computeBrandCascade,
  applyDraftScope,
  removePlatformDraft,
} from "./posts-scope-helpers.js";

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
  "Copy Expert Checklist": "Copiar lista experta",
  "Copy Auto-Publish Decision": "Copiar decision auto-publicar",
  "Copy User Guide": "Copiar guia",
  "Copy Tour Script": "Copiar guion",
  "Generate Voiceovers": "Generar voces",
  "Start Walkthrough": "Iniciar guia",
  "Proof": "Prueba",
  "Proof Queue": "Cola de pruebas",
  "Proof Status": "Estado de prueba",
  "Proof Kind": "Tipo de prueba",
  "Stage Mode": "Modo de preparacion",
  "Text Insert": "Insercion de texto",
  "Proof Target": "Objetivo de prueba",
  "Staged Url": "URL preparada",
  "Screenshot": "Captura",
  "Run Id": "ID de ejecucion",
  "Expert Checklist": "Lista experta",
  "Auto-Publish Gate": "Control auto-publicar",
  "Account Proofs": "Pruebas de cuenta",
  "Copy Proof Queue": "Copiar cola de pruebas",
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

const DEFAULT_GUIDANCE_MODULES = Object.freeze([
  { key: "brandVoice", title: "Voice", source: "brandLibrary", valueType: "text", placeholder: "Describe how the brand should sound" },
  { key: "approvedPhrases", title: "Approved phrases", source: "brandLibrary", valueType: "list", placeholder: "One approved phrase per line" },
  { key: "bannedPhrases", title: "Banned phrases", source: "brandLibrary", valueType: "list", placeholder: "One banned phrase per line" },
  { key: "prizeLanguage", title: "Prize language", source: "claimLibrary", valueType: "list", placeholder: "One approved prize phrase per line" },
  { key: "freeToPlayLanguage", title: "Free-to-play language", source: "claimLibrary", valueType: "list", placeholder: "One approved free-play phrase per line" },
  { key: "requiresReviewClaims", title: "Requires review", source: "claimLibrary", valueType: "list", placeholder: "One review trigger per line" },
  { key: "blockedClaims", title: "Blocked claims", source: "claimLibrary", valueType: "list", placeholder: "One blocked claim per line" },
]);

const DEFAULT_CAMPAIGN_GUIDANCE_MODULES = Object.freeze([
  { key: "strategyCta", strategyField: "cta", title: "Primary CTA", valueType: "text", placeholder: "The main action this campaign should drive" },
  { key: "strategyOffer", strategyField: "offer", title: "Offer", valueType: "text", placeholder: "The promise, prize, hook, or value offered" },
  { key: "strategyGoals", strategyField: "goals", title: "Goals", valueType: "list", placeholder: "One campaign goal per line" },
  { key: "strategyAudience", strategyField: "audience", title: "Audience", valueType: "list", placeholder: "One audience segment per line" },
  { key: "strategyPillars", strategyField: "pillars", title: "Pillars", valueType: "list", placeholder: "One campaign content pillar per line" },
  { key: "referenceAccounts", strategyField: "referenceAccounts", title: "Reference accounts", valueType: "list", placeholder: "One reference account per line" },
]);

const state = await loadProductionState();
state.themeId = normalizeThemeId(state.themeId);
state.customThemeSwatches = normalizeCustomThemeSwatches(state.customThemeSwatches, themeSwatchesFor(state.themeId));
state.operatorLanguage = normalizeOperatorLanguage(state.operatorLanguage);
state.beginnerMode = normalizeBeginnerMode(state.beginnerMode);
const APP_SESSION_ID = `diamond-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const guideSections = getDiamondGuideSections();
const firstRunSteps = getDiamondFirstRunSteps();
const tourSteps = getDiamondTourSteps();
const operatorManual = await loadOperatorManual();
let prototypeModel = buildProductionPostModel(state);
const DRAFT_BOARD_COLUMNS = [
  { id: "draft",        label: "Draft" },
  { id: "needs_review", label: "Needs Review" },
  { id: "scheduled",    label: "Scheduled" },
  { id: "staged",       label: "Staged" },
  { id: "published",    label: "Published" },
  { id: "failed",       label: "Failed" },
];
let activeBoardPlatformFilter = new Set(); // empty = all platforms
let activeBoardCompanyFilter  = new Set(); // empty = all companies
let board = buildPlatformDraftBoardView(prototypeModel, activeBoardPlatformFilter, activeBoardCompanyFilter);
let activePostPackageId = null;
let activePlatformTab = null; // currently visible platform tab inside the detail view
let selectedAccountId = state.context?.socialAccountId || null;
let activePrototypeView = "posts-view";
let latestFirebaseStatus = null;
let latestLicenseSync = null;
let latestSyncExportPath = state.lastSyncExportPath || "";
let latestOperatorMessage = "";
let latestGuideMessage = "";
let manualSearchTerm = "";
let activeTourIndex = 0;
let activeTourSteps = tourSteps;
let activeTourTarget = null;
let activeTourAudio = null;
let accountCreatorOpen = false;
let accountLoginResizeObserver = null;
let accountBrowserLoadedAccountIds = new Set();
let accountSessionInspectionInFlight = new Set();
let calendarFilters = { platform: "all", window: "week", campaign: "all" };
const ACCOUNT_LOGIN_ACTION_COOLDOWNS = {
  "open-login": 30000,
  "reload-login-panel": 30000,
  "load-public-profile": 30000,
  "load-compose-page": 30000,
  "check-login-panel": 60000,
  "fit-login-panel": 5000,
};
const SUPPORTED_SOCIAL_PLATFORMS = ["x", "instagram", "tiktok", "linkedin", "youtube-shorts", "youtube-longform", "facebook", "pinterest", "reddit"];
// ─── Platform-draft board view ────────────────────────────────────────────────

function draftColumnForStatus(status) {
  const s = status || "draft";
  if (s === "approved")  return "needs_review";
  if (s === "blocked")   return "needs_review";
  if (s === "abandoned") return "failed";
  return DRAFT_BOARD_COLUMNS.some((c) => c.id === s) ? s : "draft";
}

function buildPlatformDraftBoardView(model, platformFilter = new Set(), companyFilter = new Set()) {
  const packageMap = new Map((model.postPackages || []).map((p) => [p.id, p]));
  const drafts = (model.platformDrafts || []).filter((d) => {
    if (platformFilter.size > 0 && !platformFilter.has(d.platform)) return false;
    if (companyFilter.size > 0) {
      const pkg = packageMap.get(d.postPackageId);
      const draftCompanyId = d.companyId || pkg?.companyId || pkg?.context?.companyId;
      if (!companyFilter.has(draftCompanyId)) return false;
    }
    return true;
  });
  const columns = DRAFT_BOARD_COLUMNS.map((col) => ({ ...col, posts: [] }));
  const columnMap = new Map(columns.map((col) => [col.id, col]));
  drafts.forEach((draft) => {
    const pkg = packageMap.get(draft.postPackageId);
    if (!pkg) return;
    const idea = pkg.ideaText || pkg.title || "";
    const body = draft.llmRevisedText || draft.text || "";
    const snippetSource = body || idea;
    const excerpt = snippetSource.length > 80
      ? `${snippetSource.slice(0, 77)}…`
      : snippetSource || "(no content)";
    const colId = draftColumnForStatus(draft.status);
    const col = columnMap.get(colId) || columnMap.get("draft");
    col.posts.push({
      id:            draft.id,
      postPackageId: draft.postPackageId,
      platform:      draft.platform,
      title:         idea,
      excerpt,
      status:        draft.status || "draft",
      updatedAt:     draft.updatedAt || pkg.updatedAt,
      createdAt:     draft.createdAt || pkg.createdAt,
      tags:          pkg.tags || [],
    });
  });
  columns.forEach((col) => {
    col.posts.sort((a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );
    col.count = col.posts.length;
  });
  return columns;
}

applyDiamondTheme(state.themeId);
applyOperatorLanguage();
applyBeginnerMode();
renderBoard(board);
renderCalendar();
renderAccounts();
renderCompanies();
renderBrands();
renderCampaigns();
renderTemplates();
renderSettings();
renderAnalytics();
renderOperatorDrawer();
wirePrototypeControls();

async function loadProductionState() {
  const saved = await window.diamond?.getState?.();
  if (saved && typeof saved === "object") return hydrateSavedWorkspace(saved);
  return createSeedWorkspace();
}

async function loadOperatorManual() {
  const result = await window.diamond?.getOperatorManual?.();
  return result?.ok ? result : {
    ok: false,
    path: "docs/DIAMOND_OPERATOR_MANUAL.md",
    text: "",
    reason: result?.reason || "Operator manual is unavailable.",
  };
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
    brandGuidanceModules: saved.brandGuidanceModules?.length ? saved.brandGuidanceModules : defaults.brandGuidanceModules || [],
    campaignGuidanceModules: saved.campaignGuidanceModules?.length ? saved.campaignGuidanceModules : defaults.campaignGuidanceModules || [],
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
  workspace.beginnerMode = normalizeBeginnerMode(saved.beginnerMode ?? defaults.beginnerMode);
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
  board = buildPlatformDraftBoardView(prototypeModel, activeBoardPlatformFilter, activeBoardCompanyFilter);
  await window.diamond?.saveState?.(state);
}

async function refreshProductionBoard() {
  prototypeModel = buildProductionPostModel(state);
  board = buildPlatformDraftBoardView(prototypeModel, activeBoardPlatformFilter, activeBoardCompanyFilter);
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
      tiktok: "needs_login",
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
  workspace.beginnerMode = true;
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
  renderBoardFilters();
  const target = document.querySelector("#posts-board");
  target.innerHTML = columns.map((column) => `
    <article class="post-column" aria-labelledby="column-${escapeHtml(column.id)}" data-board-status="${escapeHtml(column.id)}">
      <header>
        <h2 id="column-${escapeHtml(column.id)}">${escapeHtml(t(column.label))}</h2>
        <span class="count">${column.count}</span>
      </header>
      <div class="post-list" data-drop-status="${escapeHtml(column.id)}">
        ${column.posts.length ? column.posts.map(renderCard).join("") : `<div class="empty-column">${escapeHtml(t("No Posts"))}</div>`}
      </div>
    </article>
  `).join("");
}

function renderBoardFilters() {
  const toolbar = document.querySelector(".prototype-toolbar");
  if (!toolbar) return;

  // Derive companies and platforms present in current drafts
  const pkgMap = new Map((prototypeModel.postPackages || []).map((p) => [p.id, p]));

  // Read companyId from the draft directly first (createPlatformDraft sets it),
  // then fall back to the linked package, then to context sub-object.
  const draftCompanyIds = (prototypeModel.platformDrafts || []).map((d) => {
    const pkg = pkgMap.get(d.postPackageId);
    return d.companyId || pkg?.companyId || pkg?.context?.companyId;
  }).filter(Boolean);

  // If no draft carries a companyId, use all configured companies as the list.
  const companyIds = [...new Set(
    draftCompanyIds.length
      ? draftCompanyIds
      : (state.companies || []).map((c) => c.id).filter(Boolean)
  )];

  const platforms = [...new Set(
    (prototypeModel.platformDrafts || []).map((d) => d.platform).filter(Boolean)
  )].sort();

  const parts = [];

  // Company row — shown whenever at least one company exists
  if (companyIds.length >= 1) {
    parts.push(`<span class="filter-group-label">Companies</span>`);
    parts.push(
      `<button type="button" class="filter-pill${activeBoardCompanyFilter.size === 0 ? " active" : ""}" data-company-filter="all">All</button>`
    );
    for (const id of companyIds) {
      const co = (state.companies || []).find((c) => c.id === id);
      const name = co?.name || id;
      const isActive = activeBoardCompanyFilter.has(id);
      parts.push(
        `<button type="button" class="filter-pill${isActive ? " active" : ""}" data-company-filter="${escapeHtml(id)}">${escapeHtml(name)}</button>`
      );
    }
    parts.push(`<div class="filter-break"></div>`);
  }

  // Platform row
  parts.push(`<span class="filter-group-label">Platforms</span>`);
  parts.push(
    `<button type="button" class="filter-pill${activeBoardPlatformFilter.size === 0 ? " active" : ""}" data-platform-filter="all">All</button>`
  );
  for (const p of platforms) {
    const isActive = activeBoardPlatformFilter.has(p);
    parts.push(
      `<button type="button" class="filter-pill${isActive ? " active" : ""}" data-platform-filter="${escapeHtml(p)}">${escapeHtml(platformLabel(p))}</button>`
    );
  }

  toolbar.innerHTML = parts.join("");
}

function renderCard(card) {
  const pkgId = card.postPackageId || card.id;
  return `
    <article class="post-card"
      data-package-id="${escapeHtml(pkgId)}"
      data-draft-platform="${escapeHtml(card.platform || "")}"
      draggable="true" tabindex="0" role="button"
      aria-label="Open ${escapeHtml(card.title || card.excerpt || "post")}">
      <header class="post-card-header">
        ${card.platform ? `<span class="card-platform-badge platform-${escapeHtml(card.platform)}">${escapeHtml(platformLabel(card.platform))}</span>` : ""}
        <button class="post-card-delete" type="button"
          data-board-action="delete"
          data-package-id="${escapeHtml(pkgId)}"
          title="Delete post" aria-label="Delete post">×</button>
      </header>
      <strong>${escapeHtml(card.excerpt || card.title)}</strong>
      <time datetime="${escapeHtml(card.updatedAt || card.createdAt || "")}">${formatDate(card.updatedAt || card.createdAt)}</time>
      ${card.tags?.length ? `<div class="tag-row">${card.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
    </article>
  `;
}

function boardMoveStatuses(currentStatus) {
  const statuses = ["draft", "needs_review", "scheduled", "staged", "published", "failed"];
  return statuses.filter((status) => status !== (currentStatus || "draft"));
}

function wirePrototypeControls() {
  document.querySelector("#prototype-nav").addEventListener("click", handlePrototypeNav);
  document.querySelector(".prototype-logo")?.addEventListener("click", () => {
    showPrototypeView("posts-view");
    document.querySelectorAll("#prototype-nav a").forEach((item) => item.classList.toggle("active", item.dataset.view === "posts-view"));
  });
  document.querySelector("#operator-toggle")?.addEventListener("click", toggleOperatorDrawer);
  document.querySelector("#operator-close")?.addEventListener("click", closeOperatorDrawer);
  document.querySelector("#create-post").addEventListener("click", () => openCreateDetail());
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
  document.querySelector("#add-template-record")?.addEventListener("click", addTemplateRecord);
  document.querySelector("#back-to-board").addEventListener("click", () => renderBoard(board));
  document.querySelector(".prototype-toolbar")?.addEventListener("click", (event) => {
    const pill = event.target.closest("[data-platform-filter], [data-company-filter]");
    if (!pill) return;
    if (pill.dataset.platformFilter !== undefined) {
      const val = pill.dataset.platformFilter;
      if (val === "all") {
        activeBoardPlatformFilter = new Set();
      } else {
        const next = new Set(activeBoardPlatformFilter);
        if (next.has(val)) { next.delete(val); } else { next.add(val); }
        activeBoardPlatformFilter = next;
      }
    } else if (pill.dataset.companyFilter !== undefined) {
      const val = pill.dataset.companyFilter;
      if (val === "all") {
        activeBoardCompanyFilter = new Set();
      } else {
        const next = new Set(activeBoardCompanyFilter);
        if (next.has(val)) { next.delete(val); } else { next.add(val); }
        activeBoardCompanyFilter = next;
      }
    }
    board = buildPlatformDraftBoardView(prototypeModel, activeBoardPlatformFilter, activeBoardCompanyFilter);
    renderBoard(board);
  });
  document.querySelector("#posts-board").addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-board-action]");
    if (actionButton) {
      handleBoardAction(actionButton);
      return;
    }
    const card = event.target.closest(".post-card[data-package-id]");
    if (!card) return;
    if (card.dataset.draftPlatform) activePlatformTab = card.dataset.draftPlatform;
    openPackageDetail(card.dataset.packageId);
  });
  document.querySelector("#posts-board").addEventListener("keydown", (event) => {
    const card = event.target.closest(".post-card[data-package-id]");
    if (!card || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    if (card.dataset.draftPlatform) activePlatformTab = card.dataset.draftPlatform;
    openPackageDetail(card.dataset.packageId);
  });
  document.querySelector("#posts-board").addEventListener("dragstart", handleBoardDragStart);
  document.querySelector("#posts-board").addEventListener("dragover", handleBoardDragOver);
  document.querySelector("#posts-board").addEventListener("dragleave", handleBoardDragLeave);
  document.querySelector("#posts-board").addEventListener("drop", handleBoardDrop);
  document.querySelector("#posts-board").addEventListener("dragend", clearBoardDragState);
  document.querySelector("#idea-text").addEventListener("input", handleIdeaInput);
  document.querySelector("#post-tags").addEventListener("input", handleTagsInput);
  document.querySelector("#detail-add-all-platforms")?.addEventListener("click", addAllReadyPlatformsToActivePackage);
  document.querySelector("#platform-buttons")?.addEventListener("click", handlePlatformToggle);
  document.querySelector("#detail-company")?.addEventListener("change", handleDetailCompanyChange);
  document.querySelector("#detail-brand")?.addEventListener("change", handleDetailBrandChange);
  document.querySelector("#detail-campaign")?.addEventListener("change", handleDetailCampaignChange);
  document.querySelector("#detail-generate")?.addEventListener("click", requestPlatformGeneration);
  document.querySelector("#campaign-generate")?.addEventListener("click", requestCampaignGeneration);
  document.querySelector("#detail-evaluate-all")?.addEventListener("click", evaluateAllDrafts);
  document.querySelector("#eval-auto-generate")?.addEventListener("click", requestEvaluationAutomation);
  document.querySelector("#generation-style")?.addEventListener("change", handleGenerationStyleChange);
  document.querySelector("#post-detail")?.addEventListener("click", (event) => {
    const jump = event.target.closest("[data-workflow-jump]");
    if (!jump) return;
    document.querySelector(`#${jump.dataset.workflowJump}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#platform-previews").addEventListener("click", handlePlatformDraftAction);
  document.querySelector("#platform-previews").addEventListener("input", handlePlatformDraftTextInput);
  document.querySelector("#calendar-board")?.addEventListener("click", handleCalendarAction);
  document.querySelector("#calendar-filters")?.addEventListener("change", handleCalendarFilterChange);
  document.querySelector("#accounts-grid")?.addEventListener("click", async (event) => {
    const card = event.target.closest("[data-account-id]");
    if (!card) return;
    if (card.dataset.accountId.startsWith("__new_platform__:")) {
      const account = await createSocialAccountForScope(card.dataset.accountId.split(":")[1] || "x");
      renderAccounts(account?.id);
      renderOperatorDrawer();
      return;
    }
    const account = (state.socialAccounts || []).find((item) => item.id === card.dataset.accountId);
    if (account) {
      setActiveAccount(account);
      await saveProductionState();
    }
    renderAccounts(card.dataset.accountId);
    renderOperatorDrawer();
  });
  document.querySelector("#account-scope-strip")?.addEventListener("change", handleAccountScopeChange);
  document.querySelector("#account-detail")?.addEventListener("click", handleAccountDetailClick);
  document.querySelector("#account-detail")?.addEventListener("change", handleAccountDetailChange);
  document.querySelector("#account-detail")?.addEventListener("submit", handleAccountDetailSubmit);
  document.querySelector("#company-workspace")?.addEventListener("click", handleCompanyWorkspaceClick);
  document.querySelector("#company-workspace")?.addEventListener("change", handleCompanyWorkspaceChange);
  document.querySelector("#brand-workspace")?.addEventListener("click", handleBrandWorkspaceClick);
  document.querySelector("#brand-workspace")?.addEventListener("change", handleBrandWorkspaceChange);
  document.querySelector("#campaign-workspace")?.addEventListener("click", handleCampaignWorkspaceClick);
  document.querySelector("#campaign-workspace")?.addEventListener("change", handleCampaignWorkspaceChange);
  document.querySelector("#templates-workspace")?.addEventListener("change", handleTemplateScopeChange);
  document.querySelector("#template-shortcuts")?.addEventListener("click", handleTemplateShortcut);
  document.querySelector("#brand-shortcuts")?.addEventListener("click", handleBrandShortcut);
  document.querySelector("#settings-workspace")?.addEventListener("click", handleSettingsAction);
  document.querySelector("#settings-workspace")?.addEventListener("change", handleSettingsChange);
  document.querySelector("#settings-workspace")?.addEventListener("input", handleSettingsInput);
  document.querySelector("#settings-shortcuts")?.addEventListener("click", handleSettingsShortcut);
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
  activePrototypeView = viewId;
  document.querySelectorAll(".prototype-view").forEach((view) => {
    view.classList.toggle("hidden", view.id !== viewId);
  });
  if (viewId !== "accounts-view") destroyAccountLoginWebview();
  if (viewId === "posts-view") renderBoard(board);
  if (viewId === "analytics-view") renderAnalytics();
  if (viewId === "calendar-view") renderCalendar();
  if (viewId === "templates-view") renderTemplates();
  if (viewId === "accounts-view") renderAccounts();
  if (viewId === "companies-view") renderCompanies();
  if (viewId === "brands-view") renderBrands();
  if (viewId === "campaigns-view") renderCampaigns();
  if (viewId === "settings-view") renderSettings();
}

function destroyAccountLoginWebview() {
  if (accountLoginResizeObserver) {
    accountLoginResizeObserver.disconnect();
    accountLoginResizeObserver = null;
  }
  const webview = document.querySelector("#account-login-webview");
  if (!webview) return;
  webview.remove();
}

async function refreshProductionViews() {
  board = buildPlatformDraftBoardView(prototypeModel, activeBoardPlatformFilter, activeBoardCompanyFilter);
  renderAccounts(selectedAccountId);
  renderCompanies();
  renderBrands();
  renderCampaigns();
  renderCalendar();
  renderSettings();
  renderAnalytics();
  renderOperatorDrawer();
  await window.diamond?.saveState?.(state);
}

async function handleBoardAction(button) {
  const packageId = button.dataset.packageId;
  if (!packageId) return;
  if (button.dataset.boardAction === "move") {
    await movePostPackageToStatus(packageId, button.dataset.nextStatus || "draft");
  }
  if (button.dataset.boardAction === "delete") {
    await deletePostPackage(packageId);
  }
}

function handleBoardDragStart(event) {
  const card = event.target.closest(".post-card[data-package-id]");
  if (!card) return;
  event.dataTransfer?.setData("text/plain", card.dataset.packageId);
  event.dataTransfer?.setData("application/x-diamond-package-id", card.dataset.packageId);
  event.dataTransfer?.setData("application/x-diamond-draft-platform", card.dataset.draftPlatform || "");
  event.dataTransfer.effectAllowed = "move";
  card.classList.add("dragging");
}

function handleBoardDragOver(event) {
  const column = event.target.closest("[data-drop-status]");
  if (!column) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  column.closest(".post-column")?.classList.add("drag-over");
}

function handleBoardDragLeave(event) {
  const column = event.target.closest(".post-column");
  if (!column || column.contains(event.relatedTarget)) return;
  column.classList.remove("drag-over");
}

async function handleBoardDrop(event) {
  const column = event.target.closest("[data-drop-status]");
  if (!column) return;
  event.preventDefault();
  document.querySelectorAll(".post-column.drag-over").forEach((item) => item.classList.remove("drag-over"));
  document.querySelectorAll(".post-card.dragging").forEach((item) => item.classList.remove("dragging"));
  const packageId = event.dataTransfer?.getData("application/x-diamond-package-id") || event.dataTransfer?.getData("text/plain");
  if (!packageId) return;
  const platform = event.dataTransfer?.getData("application/x-diamond-draft-platform");
  const nextStatus = column.dataset.dropStatus || "draft";
  if (platform) {
    await movePlatformDraftToStatus(packageId, platform, nextStatus);
  } else {
    await movePostPackageToStatus(packageId, nextStatus);
  }
}

function clearBoardDragState() {
  document.querySelectorAll(".post-column.drag-over").forEach((item) => item.classList.remove("drag-over"));
  document.querySelectorAll(".post-card.dragging").forEach((item) => item.classList.remove("dragging"));
}

async function movePostPackageToStatus(packageId, nextStatus) {
  const normalized = normalizeId(nextStatus || "draft", "status").replace(/-/g, "_");
  const packageRecord = (state.postPackages || []).find((item) => item.id === packageId)
    || prototypeModel.postPackages.find((item) => item.id === packageId);
  if (!packageRecord) return;
  const now = new Date().toISOString();
  packageRecord.status = normalized;
  packageRecord.updatedAt = now;
  state.postPackages ||= [];
  const statePackageIndex = state.postPackages.findIndex((item) => item.id === packageId);
  if (statePackageIndex >= 0) {
    state.postPackages[statePackageIndex] = {
      ...state.postPackages[statePackageIndex],
      status: normalized,
      updatedAt: now,
    };
  } else {
    state.postPackages.push(packageRecord);
  }
  (state.platformDrafts || []).filter((draft) => draft.postPackageId === packageId).forEach((draft) => {
    draft.status = normalized;
    draft.updatedAt = now;
  });
  (state.drafts || []).filter((draft) => packageRecord.sourceDraftIds?.includes(draft.id)).forEach((draft) => {
    draft.status = normalized === "published" ? "posted" : normalized;
    draft.updatedAt = now;
  });
  (state.scheduledPosts || []).filter((schedule) => schedule.postPackageId === packageId || packageRecord.sourceDraftIds?.includes(schedule.draftId) || packageRecord.platformDraftIds?.includes(schedule.draftId)).forEach((schedule) => {
    schedule.status = normalized === "published" ? "posted" : normalized;
    schedule.updatedAt = now;
  });
  (state.postRuns || []).filter((run) => run.postPackageId === packageId || packageRecord.sourceDraftIds?.includes(run.draftId) || packageRecord.platformDraftIds?.includes(run.draftId)).forEach((run) => {
    run.status = normalized === "published" ? "posted" : normalized;
    run.updatedAt = now;
  });
  prototypeModel = buildProductionPostModel(state);
  board = buildPlatformDraftBoardView(prototypeModel, activeBoardPlatformFilter, activeBoardCompanyFilter);
  await saveProductionState();
  renderBoard(board);
  renderCalendar();
  renderAnalytics();
}

async function movePlatformDraftToStatus(packageId, platform, nextStatus) {
  const normalized = normalizeId(nextStatus || "draft", "status").replace(/-/g, "_");
  const draft = prototypeModel.platformDrafts.find(
    (d) => d.postPackageId === packageId && d.platform === platform
  );
  if (!draft) return;
  const now = new Date().toISOString();
  draft.status = normalized;
  draft.updatedAt = now;
  const stateDraft = (state.platformDrafts || []).find((d) => d.id === draft.id);
  if (stateDraft) {
    stateDraft.status = normalized;
    stateDraft.updatedAt = now;
  }
  updatePostPackageFromDrafts(packageId);
  board = buildPlatformDraftBoardView(prototypeModel, activeBoardPlatformFilter, activeBoardCompanyFilter);
  await saveProductionState();
  renderBoard(board);
}

async function deletePostPackage(packageId) {
  const confirmed = await showConfirmModal("Delete this post package from Diamond? This removes its drafts, schedules, and run records from the local board.");
  if (!confirmed) return;
  const packageRecord = (state.postPackages || []).find((item) => item.id === packageId)
    || prototypeModel.postPackages.find((item) => item.id === packageId);
  const sourceDraftIds = packageRecord?.sourceDraftIds || [];
  const platformDraftIds = packageRecord?.platformDraftIds || [];
  state.postPackages = (state.postPackages || []).filter((item) => item.id !== packageId);
  state.platformDrafts = (state.platformDrafts || []).filter((item) => item.postPackageId !== packageId);
  state.drafts = (state.drafts || []).filter((item) => !sourceDraftIds.includes(item.id));
  state.scheduledPosts = (state.scheduledPosts || []).filter((item) => item.postPackageId !== packageId && !sourceDraftIds.includes(item.draftId) && !platformDraftIds.includes(item.draftId));
  state.postRuns = (state.postRuns || []).filter((item) => item.postPackageId !== packageId && !sourceDraftIds.includes(item.draftId) && !platformDraftIds.includes(item.draftId));
  prototypeModel = buildProductionPostModel(state);
  board = buildPlatformDraftBoardView(prototypeModel, activeBoardPlatformFilter, activeBoardCompanyFilter);
  await saveProductionState();
  renderBoard(board);
  renderCalendar();
  renderAnalytics();
}

function renderCalendar() {
  const target = document.querySelector("#calendar-board");
  if (!target) return;
  renderCalendarFilters();
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

function renderCalendarFilters() {
  const target = document.querySelector("#calendar-filters");
  if (!target) return;
  const platformSelect = target.querySelector('[data-calendar-filter="platform"]');
  const campaignSelect = target.querySelector('[data-calendar-filter="campaign"]');
  if (platformSelect) {
    platformSelect.innerHTML = calendarPlatformOptions(calendarFilters.platform);
    platformSelect.value = calendarFilters.platform;
  }
  if (campaignSelect) {
    campaignSelect.innerHTML = calendarCampaignOptions(calendarFilters.campaign);
    campaignSelect.value = calendarFilters.campaign;
  }
  const windowSelect = target.querySelector('[data-calendar-filter="window"]');
  if (windowSelect) windowSelect.value = calendarFilters.window;
}

function calendarPlatformOptions(selectedPlatform = "all") {
  const platforms = [...new Set((state.scheduledPosts || []).map((schedule) => schedule.context?.platform).filter(Boolean))].sort();
  return [
    `<option value="all" ${selectedPlatform === "all" ? "selected" : ""}>All platforms</option>`,
    ...platforms.map((platform) => `<option value="${escapeHtml(platform)}" ${platform === selectedPlatform ? "selected" : ""}>${escapeHtml(platformLabel(platform))}</option>`),
  ].join("");
}

function calendarCampaignOptions(selectedCampaign = "all") {
  const context = state.context || {};
  const campaigns = (state.campaigns || [])
    .filter((campaign) => (!context.companyId || campaign.companyId === context.companyId) && (!context.brandId || campaign.brandId === context.brandId))
    .sort((left, right) => (left.name || left.id).localeCompare(right.name || right.id));
  return [
    `<option value="all" ${selectedCampaign === "all" ? "selected" : ""}>All campaigns</option>`,
    ...campaigns.map((campaign) => `<option value="${escapeHtml(campaign.id)}" ${campaign.id === selectedCampaign ? "selected" : ""}>${escapeHtml(campaign.name || campaign.id)}</option>`),
  ].join("");
}

function handleCalendarFilterChange(event) {
  const field = event.target.closest("[data-calendar-filter]");
  if (!field) return;
  calendarFilters = {
    ...calendarFilters,
    [field.dataset.calendarFilter]: field.value || "all",
  };
  renderCalendar();
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
      && (calendarFilters.campaign === "all" || scheduleContext.campaignId === calendarFilters.campaign)
      && (calendarFilters.platform === "all" || scheduleContext.platform === calendarFilters.platform)
      && scheduleMatchesCalendarWindow(schedule, calendarFilters.window);
  });
}

function scheduleMatchesCalendarWindow(schedule, windowId = "week") {
  if (windowId === "all") return true;
  const scheduledAt = new Date(schedule.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) return true;
  const now = new Date();
  if (windowId === "today") return isSameLocalDay(scheduledAt, now);
  if (windowId === "upcoming") return scheduledAt.getTime() >= now.getTime();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);
  weekEnd.setHours(23, 59, 59, 999);
  return scheduledAt.getTime() <= weekEnd.getTime();
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

async function renderAccounts(selectedAccountId) {
  const target = document.querySelector("#accounts-grid");
  const detail = document.querySelector("#account-detail");
  const scope = document.querySelector("#account-scope-strip");
  if (!target || !detail) return;
  const companyId = state.context?.companyId || (state.companies || [])[0]?.id || "";
  const brandId = state.context?.brandId || (state.brands || []).find((brand) => brand.companyId === companyId)?.id || "";
  const accounts = accountsForScope(companyId, brandId);
  const selected = accounts.find((account) => account.id === selectedAccountId)
    || accounts.find((account) => account.id === state.context?.socialAccountId)
    || accounts[0];
  if (selected) selectedAccountId = selected.id;
  const version = await window.diamond?.getVersion?.() || "unknown";
  if (scope) scope.innerHTML = renderAccountScope(companyId, brandId, accounts, version);
  target.innerHTML = `
    ${accounts.map((account) => renderAccountCard(account, selected?.id)).join("") || `<div class="empty-column">No accounts for this company and brand yet.</div>`}
  `;
  detail.innerHTML = accountCreatorOpen
    ? renderAccountCreator(selected)
    : selected ? renderAccountDetail(selected) : `<div class="empty-column">No social accounts configured.</div>`;
  if (!accountCreatorOpen && selected && activePrototypeView === "accounts-view") initializeAccountLoginWebview(selected);
  refreshAccountsFromPersistedSessions(accounts, selected?.id);
}

function accountsForScope(companyId, brandId) {
  return (state.socialAccounts || []).filter((account) => {
    return !companyId || account.companyId === companyId;
  });
}

function renderAccountPlatformStatusBoard(companyId, brandId, accounts = [], selectedAccountId = "") {
  const scopedLabel = `${companyName(companyId)} / ${brandName(brandId)}`;
  return `
    <section class="account-platform-status-board" aria-label="Platform login status">
      <header>
        <div>
          <span class="eyebrow">Platform status</span>
          <strong>${escapeHtml(scopedLabel)}</strong>
        </div>
        <small>Click a platform to select it. Diamond will not load a login page until you ask it to.</small>
      </header>
      ${SUPPORTED_SOCIAL_PLATFORMS.map((platform) => {
        const account = accounts.find((item) => item.platform === platform);
        const status = account?.sessionStatus || "not_added";
        const selectableId = account?.id || `__new_platform__:${platform}`;
        const statusText = account ? statusLabel(status) : "Not added";
        const handleText = account?.handle || (account ? account.id : "Create account record");
        return `
          <button class="account-platform-status ${account?.id === selectedAccountId ? "active" : ""} ${escapeHtml(status)}" type="button" data-account-id="${escapeHtml(selectableId)}" aria-label="${escapeHtml(`${platformLabel(platform)} ${statusText}`)}">
            <span class="status-dot" aria-hidden="true"></span>
            <span>
              <strong>${escapeHtml(platformLabel(platform))}</strong>
              <small>${escapeHtml(handleText)}</small>
            </span>
            <em>${escapeHtml(statusText)}</em>
          </button>
        `;
      }).join("")}
    </section>
  `;
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
      <em class="session-pill ${escapeHtml(status)}">${escapeHtml(statusLabel(status))}</em>
    </button>
  `;
}

function accountBrowserPartition(account) {
  if (account.browserPartitionId) return `persist:${account.browserPartitionId.replace(/[^a-z0-9-]+/gi, "-")}`;
  const browserProfileId = normalizeBrowserProfileId(account.browserProfileId || `${account.companyId}-${account.brandId}-${account.platform}-${account.id}`);
  const profilePath = browserProfilePath({
    ...state.context,
    companyId: account.companyId,
    brandId: account.brandId,
    platform: account.platform,
    socialAccountId: account.id,
    browserProfileId,
    campaignId: state.context?.campaignId || "default-campaign",
    approvalPolicyId: state.context?.approvalPolicyId || "default-risk-review",
    postingMode: state.context?.postingMode || "stage_for_review",
  });
  return `persist:${(browserProfileId || profilePath).replace(/[^a-z0-9-]+/gi, "-")}`;
}

async function refreshAccountsFromPersistedSessions(accounts = [], selectedAccountId = "") {
  if (!window.diamond?.inspectAccountSession) return;
  const pending = accounts.filter((account) => account?.id && !accountSessionInspectionInFlight.has(account.id));
  if (!pending.length) return;
  pending.forEach((account) => accountSessionInspectionInFlight.add(account.id));
  let changed = false;
  try {
    const results = await Promise.all(pending.map(async (account) => {
      const result = await window.diamond.inspectAccountSession({
        account: sessionProbeAccountPayload(account),
        partition: accountBrowserPartition(account),
      });
      return { account, result };
    }));
    results.forEach(({ account, result }) => {
      if (result?.status !== "ready" || account.sessionStatus === "ready") return;
      account.sessionStatus = "ready";
      account.sessionNote = result.note || "Logged-in session found in Diamond's browser profile.";
      account.lastSessionCheckAt = new Date().toISOString();
      account.lastLoginProofAt ||= account.lastSessionCheckAt;
      account.lastProofAt ||= account.lastLoginProofAt;
      updateAccountStatusDom(account);
      changed = true;
    });
    if (changed) {
      await saveProductionState();
      renderAccounts(selectedAccountId);
      renderOperatorDrawer();
    }
  } finally {
    pending.forEach((account) => accountSessionInspectionInFlight.delete(account.id));
  }
}

function sessionProbeAccountPayload(account) {
  return {
    id: account.id || "",
    platform: account.platform || "",
    accountUrl: account.accountUrl || "",
    currentUrl: account.currentUrl || "",
    loginPanelUrl: account.loginPanelUrl || "",
    browserProfileId: account.browserProfileId || "",
    browserPartitionId: account.browserPartitionId || "",
  };
}

function renderAccountScope(companyId, brandId, accounts = [], version = "unknown") {
  return `
    <label>
      <span class="eyebrow">Company</span>
      <select data-account-scope-field="companyId">${companyOptions(companyId)}</select>
    </label>
    <article>
      <span class="eyebrow">Connected accounts</span>
      <strong>${accounts.length}</strong>
    </article>
    <article>
      <span class="eyebrow">Rule</span>
      <strong>Accounts are company-scoped</strong>
    </article>
    <article>
      <span class="eyebrow">Diamond version</span>
      <strong>${escapeHtml(version)}</strong>
    </article>
  `;
}

function renderAccountDetail(account) {
  const company = (state.companies || []).find((item) => item.id === account.companyId);
  const brand = (state.brands || []).find((item) => item.id === account.brandId);
  const campaign = (state.campaigns || []).find((item) => item.id === state.context?.campaignId);
  const strategy = (state.contentStrategies || []).find((item) => item.campaignId === campaign?.id);
  const kit = buildSocialAccountSetupKit({ company, brand, campaign, account, strategy });
  const creationPlan = buildSocialAccountCreationPlan({ company, brand, campaign, account, strategy });
  const proof = getPlatformProofForAccount(account);
  const loginUrl = resolveLoginUrl(account);
  const publicUrl = account.accountUrl || normalizeAccountUrl(account.handle, account.platform);
  const partition = accountBrowserPartition(account);
  const lastLoginProof = account.lastLoginProofAt || proof?.lastLoginProofAt || proof?.lastProofAt;
  return `
    <article class="account-detail-card account-login-panel">
      <header>
        <div>
          <span class="eyebrow">Platform login</span>
          <h2>${escapeHtml(platformLabel(account.platform))}</h2>
          <p>${escapeHtml(account.handle || "Add the username for this account")}</p>
        </div>
        <em class="session-pill ${escapeHtml(account.sessionStatus || "unknown")}">${escapeHtml(statusLabel(account.sessionStatus || "unknown"))}</em>
      </header>
      <p class="account-login-note">Use this pane to log into the official platform page and visually confirm the account is signed in. Diamond does not save social-media passwords or bypass verification.</p>
      ${activePrototypeView === "accounts-view" ? renderAccountLoginBrowser(account, partition, loginUrl) : ""}
      ${renderAccountDashlanePanel(account)}
      <section class="account-session-panel" aria-label="Login status">
        <div>
          <span class="eyebrow">Login status</span>
          <strong>${escapeHtml(statusLabel(account.sessionStatus || "unknown"))}</strong>
        </div>
        <div>
          <span class="eyebrow">Last proof</span>
          <strong>${lastLoginProof ? escapeHtml(formatDateTime(lastLoginProof)) : "No login proof yet"}</strong>
        </div>
        <div>
          <span class="eyebrow">Public page</span>
          <strong>${publicUrl ? `<a href="${escapeHtml(publicUrl)}">${escapeHtml(account.handle || platformLabel(account.platform))}</a>` : "Not set"}</strong>
        </div>
      </section>
      <details class="account-advanced-panel">
        <summary>Advanced connection details</summary>
      <dl class="account-meta">
        <div><dt>Company</dt><dd><select data-account-field="companyId">${companyOptions(account.companyId)}</select></dd></div>
        <div><dt>Brand</dt><dd><select data-account-field="brandId">${brandOptions(account.companyId, account.brandId)}</select></dd></div>
        <div><dt>Platform</dt><dd><select data-account-field="platform">${platformOptions(account.platform)}</select></dd></div>
        <div><dt>Browser profile</dt><dd><input data-account-field="browserProfileId" type="text" value="${escapeHtml(account.browserProfileId || "")}"></dd></div>
        <div><dt>Persistent session</dt><dd>${escapeHtml(account.browserPartitionId || "Auto-detected on restart")}</dd></div>
        <div><dt>Public account</dt><dd><input data-account-field="accountUrl" type="url" value="${escapeHtml(account.accountUrl || "")}"></dd></div>
        <div><dt>Login URL</dt><dd><input data-account-field="loginUrl" type="url" value="${escapeHtml(loginUrl || "")}"></dd></div>
        <div><dt>Compose URL</dt><dd><input data-account-field="composeUrl" type="url" value="${escapeHtml(resolveComposeUrl(account) || "")}"></dd></div>
        <div><dt>Expected host</dt><dd><input data-account-field="expectedHost" type="text" value="${escapeHtml(account.expectedHost || "")}"></dd></div>
        <div><dt>Mode</dt><dd>${account.monitoringOnly ? "Monitoring only" : "Posting enabled"}</dd></div>
      </dl>
      <section class="account-actions account-advanced-actions" aria-label="Advanced account actions">
        <button type="button" data-account-action="save" data-account-id="${escapeHtml(account.id)}">Save all</button>
        <button type="button" data-account-action="set-active" data-account-id="${escapeHtml(account.id)}">Set active</button>
      </section>
      ${renderAccountCreationPanel(account, creationPlan)}
      <section class="setup-kit" aria-labelledby="setup-kit-heading">
        <h3 id="setup-kit-heading">Setup kit</h3>
        <p>${escapeHtml(kit.summary)}</p>
        <ul>
          ${kit.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
      </details>
    </article>
  `;
}

function renderAccountDashlanePanel(account) {
  const status = account.dashlaneStatus || "Not checked";
  const matches = Array.isArray(account.dashlaneMatches) ? account.dashlaneMatches : [];
  const selectedId = account.dashlaneCredentialId || matches[0]?.id || "";
  return `
    <section class="account-dashlane-panel" aria-label="Dashlane account recovery">
      <header>
        <div>
          <span class="eyebrow">Dashlane</span>
          <h3>Account info</h3>
        </div>
        <span>${escapeHtml(status)}</span>
      </header>
      <p>Find the matching Dashlane item for this platform. Diamond copies fields only when you click and never saves the password.</p>
      <div class="account-dashlane-actions">
        <button type="button" data-account-action="dashlane-find" data-account-id="${escapeHtml(account.id)}">Find in Dashlane</button>
        <button type="button" data-account-action="dashlane-copy-login" data-account-id="${escapeHtml(account.id)}" ${selectedId ? "" : "disabled"}>Copy username</button>
        <button type="button" data-account-action="dashlane-copy-password" data-account-id="${escapeHtml(account.id)}" ${selectedId ? "" : "disabled"}>Copy password</button>
        <button type="button" data-account-action="dashlane-copy-otp" data-account-id="${escapeHtml(account.id)}" ${selectedId ? "" : "disabled"}>Copy 2FA code</button>
      </div>
      ${matches.length ? `
        <label class="account-dashlane-match">
          <span>Matched login</span>
          <select data-account-field="dashlaneCredentialId">
            ${matches.map((match) => `
              <option value="${escapeHtml(match.id || "")}" ${match.id === selectedId ? "selected" : ""}>
                ${escapeHtml([match.title, match.login, match.url].filter(Boolean).join(" / ") || "Dashlane item")}
              </option>
            `).join("")}
          </select>
        </label>
      ` : ""}
    </section>
  `;
}

function initializeAccountLoginWebview(account) {
  const webview = document.querySelector("#account-login-webview");
  if (!webview) return;
  applyAccountBrowserUserAgent(webview, account);
  wireAccountLoginWebviewEvents(webview, account);
  if (accountLoginResizeObserver) accountLoginResizeObserver.disconnect();
  const shell = document.querySelector(".account-login-webview-shell");
  if (shell && typeof ResizeObserver !== "undefined") {
    accountLoginResizeObserver = new ResizeObserver(() => requestAnimationFrame(refreshAccountLoginWebviewBounds));
    accountLoginResizeObserver.observe(shell);
  }
  window.addEventListener("resize", () => requestAnimationFrame(refreshAccountLoginWebviewBounds));
  requestAnimationFrame(sizeAccountLoginWebview);
  updateAccountLoginBrowserStatus(accountInitialBrowserStatus(account));
  scheduleAccountLoginResizePasses();
}

function accountInitialBrowserStatus(account) {
  if (accountAutoRestoreUrl(account)) return `Restoring ${platformLabel(account.platform)} with the saved browser session.`;
  if (accountBrowserLoadedAccountIds.has(account?.id) && (account.loginPanelUrl || account.currentUrl)) return `Loading ${safeUrlLabel(account.loginPanelUrl || account.currentUrl)}...`;
  return account.sessionNote || `Ready. Click Load login, Load composer, Load profile, or Go to open ${platformLabel(account.platform)}.`;
}

function wireAccountLoginWebviewEvents(webview, account) {
  if (!webview || webview.dataset.wired === "true") return;
  webview.dataset.wired = "true";
  webview.dataset.accountId = account?.id || "";
  webview.addEventListener?.("dom-ready", () => {
    updateAccountLoginBrowserStatus("Login pane loaded.");
    refreshAccountStatusFromBrowser(account);
    setTimeout(() => refreshAccountStatusFromBrowser(account), 1200);
    sizeAccountLoginWebview();
  });
  webview.addEventListener?.("did-navigate", (event) => {
    updateAccountLoginBrowserStatus();
    refreshAccountStatusFromBrowser(account, event?.url);
  });
  webview.addEventListener?.("did-navigate-in-page", (event) => {
    updateAccountLoginBrowserStatus();
    refreshAccountStatusFromBrowser(account, event?.url);
  });
  webview.addEventListener?.("did-fail-load", (event) => {
    updateAccountLoginBrowserStatus(event?.errorDescription || "The platform blocked or failed to load in the pane.");
  });
}

async function refreshAccountStatusFromBrowser(account, url = "") {
  if (!account) return;
  const currentUrl = url || accountLoginWebviewUrl();
  if (!currentUrl || currentUrl === "about:blank") return;
  const inferred = await inferAccountBrowserSessionStatus(account, currentUrl);
  const nextStatus = accountStatusFromSessionStatus(inferred.status);
  const changed = account.currentUrl !== currentUrl
    || account.loginPanelUrl !== currentUrl
    || account.sessionStatus !== nextStatus
    || account.sessionNote !== inferred.note;
  account.currentUrl = currentUrl;
  account.loginPanelUrl = currentUrl;
  account.sessionStatus = nextStatus;
  account.sessionNote = inferred.note;
  account.lastSessionCheckAt = new Date().toISOString();
  if (nextStatus === "ready" && !account.lastLoginProofAt) account.lastLoginProofAt = account.lastSessionCheckAt;
  if (!changed) return;
  updateAccountStatusDom(account);
  await saveProductionState();
}

async function inferAccountBrowserSessionStatus(account, currentUrl) {
  const inferred = inferSessionStatusFromUrl(currentUrl, account);
  const snapshot = await accountBrowserPageSnapshot();
  const liveStatus = inferAccountStatusFromPageSnapshot(account, currentUrl, snapshot);
  return liveStatus || inferred;
}

async function accountBrowserPageSnapshot() {
  const webview = document.querySelector("#account-login-webview");
  if (!webview || typeof webview.executeJavaScript !== "function") return null;
  try {
    return await webview.executeJavaScript(`(() => ({
      href: location.href,
      title: document.title || "",
      text: (document.body?.innerText || "").slice(0, 5000)
    }))()`);
  } catch {
    return null;
  }
}

function inferAccountStatusFromPageSnapshot(account, currentUrl, snapshot) {
  if (!snapshot) return null;
  const text = normalizePageProofText([snapshot.title, snapshot.text].join(" "));
  const url = String(snapshot.href || currentUrl || "");
  if (!text) return null;
  if (pageSnapshotShowsLogin(account, url, text)) {
    return { status: "login_required", note: "The platform is showing a login page." };
  }
  if (pageSnapshotShowsLoggedInPlatform(account, text)) {
    return { status: "ready", note: "Logged-in platform UI is visible in the account browser." };
  }
  return null;
}

function pageSnapshotShowsLogin(account, url, text) {
  const platform = account?.platform || "";
  if (platform === "linkedin") return /sign in|join linkedin|email or phone|forgot password/.test(text) && !/my network|messaging|notifications/.test(text);
  if (platform === "facebook") return /log in to facebook|forgot password|create new account/.test(text) && !/what's on your mind|news feed|friends|messenger/.test(text);
  return /log in|sign in|forgot password/.test(text) && /login|signin|account\/access/i.test(url);
}

function pageSnapshotShowsLoggedInPlatform(account, text) {
  const platform = account?.platform || "";
  if (platform === "linkedin") return /home/.test(text) && /my network/.test(text) && /messaging/.test(text) && /notifications/.test(text);
  if (platform === "facebook") return /what's on your mind|news feed|friends|messenger|notifications/.test(text) && !/log in to facebook/.test(text);
  if (platform === "x") return /home/.test(text) && (/post/.test(text) || /messages/.test(text) || /notifications/.test(text));
  if (platform === "tiktok") return /for you|following|profile|upload/.test(text) && !/log in to tiktok/.test(text);
  if (platform?.startsWith("youtube-")) return /youtube studio|create|upload|dashboard/.test(text) && !/sign in/.test(text);
  if (platform === "instagram") return /home|search|explore|reels|messages|notifications/.test(text) && !/log in|sign up/.test(text);
  return null;
}

function normalizePageProofText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function accountStatusFromSessionStatus(status) {
  if (status === "ready") return "ready";
  if (status === "login_required") return "needs_login";
  return status || "unknown";
}

function updateAccountStatusDom(account) {
  const label = statusLabel(account.sessionStatus || "unknown");
  document.querySelectorAll("[data-account-id]").forEach((node) => {
    if (node.dataset.accountId !== account.id) return;
    node.querySelectorAll?.(".session-pill").forEach((pill) => {
      pill.className = `session-pill ${account.sessionStatus || "unknown"}`;
      pill.textContent = label;
    });
  });
  const detailPill = document.querySelector(".account-login-panel > header .session-pill");
  if (detailPill) {
    detailPill.className = `session-pill ${account.sessionStatus || "unknown"}`;
    detailPill.textContent = label;
  }
  document.querySelectorAll(".account-session-panel strong").forEach((node, index) => {
    if (index === 0) node.textContent = label;
  });
}

function sizeAccountLoginWebview() {
  const webview = document.querySelector("#account-login-webview");
  const shell = document.querySelector(".account-login-webview-shell");
  if (!webview || !shell) return null;
  const rect = shell.getBoundingClientRect();
  const browser = document.querySelector(".account-login-browser");
  const browserRect = browser?.getBoundingClientRect();
  const fallbackHeight = browserRect ? browserRect.height - shell.offsetTop : window.innerHeight - shell.getBoundingClientRect().top;
  const account = accountForBrowserWebview(webview);
  const mobileMode = accountPrefersMobileBrowser(account);
  const width = mobileMode ? Math.min(430, Math.max(360, Math.floor(rect.width || 430))) : Math.max(360, Math.floor(rect.width || browserRect?.width || window.innerWidth - 240));
  const height = Math.max(560, Math.floor(rect.height || fallbackHeight || window.innerHeight - 170));
  shell.classList.toggle("mobile-browser-shell", mobileMode);
  webview.style.width = `${width}px`;
  webview.style.height = `${height}px`;
  webview.style.minWidth = `${width}px`;
  webview.style.minHeight = `${height}px`;
  webview.style.maxWidth = `${width}px`;
  webview.style.maxHeight = `${height}px`;
  webview.style.display = "flex";
  webview.style.flex = "1";
  webview.style.position = "relative";
  webview.setAttribute("width", String(width));
  webview.setAttribute("height", String(height));
  if (!webview.dataset.boundsSignature) {
    const currentUrl = webview.getAttribute("src") || webview.src || "about:blank";
    const partition = webview.getAttribute("partition") || "persist:diamond-account-login";
    webview.dataset.boundsSignature = `${width}x${height}:${partition}:${currentUrl}`;
  }
  return { width, height };
}

function scheduleAccountLoginResizePasses() {
  [0, 80, 180, 350, 700, 1200].forEach((delay) => {
    setTimeout(() => requestAnimationFrame(sizeAccountLoginWebview), delay);
  });
}

function refreshAccountLoginWebviewBounds(options = {}) {
  const webview = document.querySelector("#account-login-webview");
  const shell = document.querySelector(".account-login-webview-shell");
  if (!webview || !shell) return;
  const dimensions = sizeAccountLoginWebview();
  if (!dimensions) return;
  webview.dataset.boundsSignature = `${dimensions.width}x${dimensions.height}:${webview.getAttribute("partition") || "persist:diamond-account-login"}`;
}

function forceRefreshAccountLoginWebviewBounds() {
  sizeAccountLoginWebview();
  updateAccountLoginBrowserStatus("Browser surface fitted without reloading the page.");
}

function accountAutoRestoreUrl(account) {
  if (account?.sessionStatus !== "ready") return "";
  return [
    account.currentUrl,
    account.accountUrl,
    normalizeAccountUrl(account.handle, account.platform),
  ].find((url) => accountUrlCanAutoRestore(account, url)) || "";
}

function accountUrlCanAutoRestore(account, url) {
  if (!url || url === "about:blank") return false;
  if (/\/404(?:\?|\/|$)|not[-_]?found/i.test(String(url))) return false;
  if (account?.platform === "tiktok" && /\/live(?:\?|\/|$)/i.test(String(url))) return false;
  return true;
}

function accountVisibleBrowserUrl(account) {
  const autoRestoreUrl = accountAutoRestoreUrl(account);
  if (autoRestoreUrl) return autoRestoreUrl;
  if (!accountBrowserLoadedAccountIds.has(account?.id)) return "";
  return [
    account.loginPanelUrl,
    account.currentUrl,
  ].find(Boolean) || "";
}

function renderAccountLoginBrowser(account, partition, loginUrl) {
  const loadedUrl = accountVisibleBrowserUrl(account) || "about:blank";
  const hasLoadedPage = loadedUrl !== "about:blank";
  const userAgent = accountBrowserUserAgent(account);
  const suggestedUrl = hasLoadedPage ? loadedUrl : [
    account.loginPanelUrl,
    account.currentUrl,
    loginUrl,
    normalizeAccountUrl(account.handle, account.platform),
  ].find(Boolean) || "about:blank";
  const handle = account.handle || account.id || "No handle set";
  const readyMessage = hasLoadedPage
    ? `Restoring ${platformLabel(account.platform)} with the saved browser session.`
    : `Ready. Click Load login, Load composer, Load profile, or Go to open ${platformLabel(account.platform)}.`;
  const statusMessage = hasLoadedPage ? readyMessage : account.sessionNote || readyMessage;
  return `
    <section class="account-login-browser" aria-labelledby="account-login-browser-heading">
      <header>
        <div>
          <span class="eyebrow">Logging into</span>
          <h3 id="account-login-browser-heading">${escapeHtml(companyName(account.companyId))} / ${escapeHtml(brandName(account.brandId))}</h3>
          <p>${escapeHtml(platformLabel(account.platform))} account: ${escapeHtml(handle)}. Use this pane to confirm the company and brand account is actually logged in.</p>
          <p class="account-login-safety-note">For brand-new social accounts, finish first login in normal Chrome when possible. Diamond rate-limits login controls so platforms do not see rapid repeated login checks.</p>
        </div>
        <span id="account-login-browser-status">${escapeHtml(statusMessage)}</span>
      </header>
      <section class="account-login-context" aria-label="Selected account context">
        <label><span>Company</span><select data-login-scope-field="companyId">${companyOptions(account.companyId)}</select></label>
        <label><span>Brand</span><select data-login-scope-field="brandId">${brandOptions(account.companyId, account.brandId)}</select></label>
        <label><span>Account</span><select data-login-scope-field="accountId">${accountOptions(account.companyId, account.brandId, account.id)}</select></label>
        <div><span>Platform</span><strong>${escapeHtml(platformLabel(account.platform))}</strong></div>
      </section>
      <form class="account-login-address" data-account-login-address-form data-account-id="${escapeHtml(account.id)}" aria-label="Account browser address bar">
        <label for="account-login-address-input">Address</label>
        <input id="account-login-address-input" data-account-login-address-input type="text" value="${escapeHtml(suggestedUrl)}" autocomplete="off" spellcheck="false">
        <button type="submit">Go</button>
      </form>
      <div class="account-login-browser-toolbar">
        <button type="button" data-account-action="open-login" data-account-id="${escapeHtml(account.id)}">Load login</button>
        ${account.platform === "tiktok" ? `<button type="button" data-account-action="open-qr-login" data-account-id="${escapeHtml(account.id)}">QR login</button>` : ""}
        <button type="button" data-account-action="reload-login-panel" data-account-id="${escapeHtml(account.id)}">Reload pane</button>
        <button type="button" data-account-action="load-compose-page" data-account-id="${escapeHtml(account.id)}">Load composer</button>
        <button type="button" data-account-action="load-public-profile" data-account-id="${escapeHtml(account.id)}">Load profile</button>
        <button type="button" data-account-action="check-login-panel" data-account-id="${escapeHtml(account.id)}">Check login</button>
        <button type="button" data-account-action="mark-logged-in" data-account-id="${escapeHtml(account.id)}">Mark logged in</button>
        <button type="button" data-account-action="clear-session" data-account-id="${escapeHtml(account.id)}">Log out session</button>
        <button type="button" data-account-action="needs-login" data-account-id="${escapeHtml(account.id)}">Needs login</button>
        <button type="button" data-account-action="fit-login-panel" data-account-id="${escapeHtml(account.id)}">Fit browser</button>
        <button type="button" data-account-action="close-login-panel" data-account-id="${escapeHtml(account.id)}">Close pane</button>
      </div>
      ${renderAccountDashlaneInline(account)}
      <div class="account-login-webview-shell">
        ${hasLoadedPage ? "" : `<div class="account-login-placeholder"><strong>${escapeHtml(platformLabel(account.platform))} is selected.</strong><span>Use the buttons above to load the login, composer, profile, or address bar page.</span></div>`}
        <webview
          id="account-login-webview"
          title="${escapeHtml(platformLabel(account.platform))} login preview"
          partition="${escapeHtml(partition)}"
          data-account-id="${escapeHtml(account.id || "")}"
          data-platform="${escapeHtml(account.platform || "")}"
          ${userAgent ? `useragent="${escapeHtml(userAgent)}"` : ""}
          src="${escapeHtml(loadedUrl)}"
          allowpopups
        ></webview>
      </div>
    </section>
  `;
}

function accountBrowserUserAgent(account) {
  if (!accountPrefersMobileBrowser(account)) return "";
  return "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
}

function accountPrefersMobileBrowser(account) {
  return account?.platform === "tiktok" && account?.tiktokLoginMode === "mobile-web";
}

function accountForBrowserWebview(webview) {
  const accountId = webview?.dataset?.accountId || "";
  return (state.socialAccounts || []).find((account) => account.id === accountId) || null;
}

function applyAccountBrowserUserAgent(webview, account) {
  const userAgent = accountBrowserUserAgent(account);
  if (!webview) return;
  if (userAgent) webview.setAttribute("useragent", userAgent);
  else webview.removeAttribute("useragent");
}

function renderAccountDashlaneInline(account) {
  const matches = Array.isArray(account.dashlaneMatches) ? account.dashlaneMatches : [];
  const selectedId = account.dashlaneCredentialId || matches[0]?.id || "";
  return `
    <section class="account-dashlane-inline" aria-label="Dashlane account info">
      <div>
        <strong>Dashlane</strong>
        <span>${escapeHtml(account.dashlaneStatus || "Find saved credentials for this account.")}</span>
      </div>
      ${matches.length ? `
        <select data-account-field="dashlaneCredentialId" aria-label="Matched Dashlane login">
          ${matches.map((match) => `
            <option value="${escapeHtml(match.id || "")}" ${match.id === selectedId ? "selected" : ""}>
              ${escapeHtml([match.title, match.login, match.url].filter(Boolean).join(" / ") || "Dashlane item")}
            </option>
          `).join("")}
        </select>
      ` : ""}
      <button type="button" data-account-action="dashlane-find" data-account-id="${escapeHtml(account.id)}">Find in Dashlane</button>
      <button type="button" data-account-action="dashlane-copy-login" data-account-id="${escapeHtml(account.id)}" ${selectedId ? "" : "disabled"}>Copy username</button>
      <button type="button" data-account-action="dashlane-copy-password" data-account-id="${escapeHtml(account.id)}" ${selectedId ? "" : "disabled"}>Copy password</button>
      <button type="button" data-account-action="dashlane-copy-otp" data-account-id="${escapeHtml(account.id)}" ${selectedId ? "" : "disabled"}>Copy 2FA</button>
    </section>
  `;
}

function accountOptions(companyId, brandId, selectedId) {
  const accounts = accountsForScope(companyId, brandId);
  const options = SUPPORTED_SOCIAL_PLATFORMS.map((platform) => {
    const account = accounts.find((item) => item.platform === platform);
    const value = account?.id || `__new_platform__:${platform}`;
    const selected = account?.id === selectedId ? "selected" : "";
    const suffix = account ? account.handle || "configured" : "not added yet";
    return `<option value="${escapeHtml(value)}" ${selected}>${escapeHtml(`${platformLabel(platform)} / ${suffix}`)}</option>`;
  }).join("");
  return `${options}<option value="__new_account__">+ Add custom account...</option>`;
}

function renderAccountCreationPanel(account, plan) {
  const opened = account.signupOpenedAt ? `Signup opened ${formatDateTime(account.signupOpenedAt)}` : "Signup not opened yet";
  const created = account.creationStatus === "created_manually" ? "Account marked created" : "Account not marked created";
  return `
    <section class="account-creation-panel" aria-labelledby="account-creation-heading">
      <header>
        <div>
          <h3 id="account-creation-heading">Account creation</h3>
          <p>Diamond prepares the setup. You complete signup, passwords, CAPTCHA, email, phone, and 2FA on the official platform page.</p>
        </div>
        <span>${escapeHtml(plan.platformName)}</span>
      </header>
      <dl class="account-creation-summary">
        <div><dt>Desired handle</dt><dd>${escapeHtml(plan.desiredHandle || account.handle || "Set handle above")}</dd></div>
        <div><dt>Display name</dt><dd>${escapeHtml(plan.displayName || "Set brand name")}</dd></div>
        <div><dt>Signup</dt><dd>${escapeHtml(opened)}</dd></div>
        <div><dt>Status</dt><dd>${escapeHtml(created)}</dd></div>
      </dl>
      <section class="account-creation-actions" aria-label="Account creation actions">
        <button type="button" data-account-action="open-signup" data-account-id="${escapeHtml(account.id)}">Open official signup</button>
        <button type="button" data-account-action="copy-creation-plan" data-account-id="${escapeHtml(account.id)}">Copy setup plan</button>
        <button type="button" data-account-action="account-created" data-account-id="${escapeHtml(account.id)}">Mark created</button>
      </section>
      <ol class="account-creation-checklist">
        ${(plan.checklist || []).map((item) => `
          <li class="account-creation-check ${item.humanRequired ? "human-required" : ""}">
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.detail)}</span>
          </li>
        `).join("")}
      </ol>
      <p class="account-creation-note">Diamond does not store passwords and cannot bypass verification checks.</p>
    </section>
  `;
}

function renderAccountCreator(selectedAccount = {}) {
  const companyId = selectedAccount.companyId || state.context?.companyId || (state.companies || [])[0]?.id || "";
  const brandId = selectedAccount.brandId || state.context?.brandId || (state.brands || []).find((brand) => brand.companyId === companyId)?.id || "";
  const platform = selectedAccount.platform || state.context?.platform || "x";
  const company = (state.companies || []).find((item) => item.id === companyId);
  const brand = (state.brands || []).find((item) => item.id === brandId);
  const plan = buildSocialAccountCreationPlan({ company, brand, platform });
  return `
    <article class="account-detail-card account-creator-card">
      <header>
        <div>
          <span class="eyebrow">New account</span>
          <h2>Add platform account</h2>
          <p>Create the Diamond record first, then use the account creation panel to open official signup.</p>
        </div>
      </header>
      <dl class="account-meta">
        <div><dt>Company</dt><dd><select data-new-account-field="companyId">${companyOptions(companyId)}</select></dd></div>
        <div><dt>Brand</dt><dd><select data-new-account-field="brandId">${brandOptions(companyId, brandId)}</select></dd></div>
        <div><dt>Platform</dt><dd><select data-new-account-field="platform">${platformOptions(platform)}</select></dd></div>
        <div><dt>Handle or page</dt><dd><input data-new-account-field="handle" type="text" value="${escapeHtml(plan.desiredHandle || "")}" placeholder="@parentalcareguide"></dd></div>
      </dl>
      <section class="account-creation-panel">
        <header>
          <div>
            <h3>What Diamond will create</h3>
            <p>This adds a brand-scoped account record, browser profile, login URL, compose URL, and official signup plan.</p>
          </div>
          <span>${escapeHtml(platformLabel(platform))}</span>
        </header>
        <dl class="account-creation-summary">
          <div><dt>Display name</dt><dd>${escapeHtml(plan.displayName)}</dd></div>
          <div><dt>Desired handle</dt><dd>${escapeHtml(plan.desiredHandle || "Set a handle")}</dd></div>
          <div><dt>Signup</dt><dd>${escapeHtml(plan.signupUrl || "Not configured")}</dd></div>
          <div><dt>Profile</dt><dd>${escapeHtml(plan.browserProfileId || "Auto-generated")}</dd></div>
        </dl>
      </section>
      <section class="account-actions" aria-label="New account actions">
        <button type="button" data-account-create-action="create">Create account record</button>
        <button type="button" data-account-create-action="cancel">Cancel</button>
      </section>
    </article>
  `;
}

async function handleAccountScopeChange(event) {
  const field = event.target.closest("[data-account-scope-field]");
  if (!field) return;
  if (field.dataset.accountScopeField === "companyId") {
    const companyId = normalizeId(field.value, "companyId");
    const brandId = (state.brands || []).find((brand) => brand.companyId === companyId)?.id || "";
    state.context = {
      ...state.context,
      companyId,
      brandId,
    };
  }
  if (field.dataset.accountScopeField === "brandId") {
    state.context = {
      ...state.context,
      brandId: normalizeId(field.value, "brandId"),
    };
  }
  const scopedAccounts = accountsForScope(state.context?.companyId, state.context?.brandId);
  const selected = scopedAccounts[0] || null;
  selectedAccountId = selected?.id || null;
  if (selected) {
    state.context = {
      ...state.context,
      platform: selected.platform,
      socialAccountId: selected.id,
      browserProfileId: selected.browserProfileId,
    };
  } else {
    state.context = {
      ...state.context,
      socialAccountId: "",
      browserProfileId: "",
    };
  }
  accountCreatorOpen = false;
  await saveProductionState();
  renderAccounts(selectedAccountId);
  renderOperatorDrawer();
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
  const options = (state.brands || [])
    .filter((brand) => !companyId || brand.companyId === companyId)
    .map((brand) => `
      <option value="${escapeHtml(brand.id)}" ${brand.id === selectedId ? "selected" : ""}>${escapeHtml(brand.name || brand.id)}</option>
    `).join("");
  return options || `<option value="">No brands yet</option>`;
}

function campaignOptions(companyId, brandId, selectedId) {
  const options = (state.campaigns || [])
    .filter((campaign) => (!companyId || campaign.companyId === companyId) && (!brandId || campaign.brandId === brandId))
    .map((campaign) => `
      <option value="${escapeHtml(campaign.id)}" ${campaign.id === selectedId ? "selected" : ""}>${escapeHtml(campaign.name || campaign.id)}</option>
    `).join("");
  return options || `<option value="">No campaigns yet</option>`;
}

function platformOptions(selectedPlatform) {
  return SUPPORTED_SOCIAL_PLATFORMS.map((platform) => `
    <option value="${escapeHtml(platform)}" ${platform === selectedPlatform ? "selected" : ""}>${escapeHtml(platformLabel(platform))}</option>
  `).join("");
}

function renderCompanies() {
  const target = document.querySelector("#company-workspace");
  if (!target) return;
  const company = (state.companies || []).find((item) => item.id === state.context?.companyId) || (state.companies || [])[0] || {};
  const brands = (state.brands || []).filter((brand) => brand.companyId === company.id);
  const campaigns = (state.campaigns || []).filter((campaign) => campaign.companyId === company.id);
  target.innerHTML = `
    <aside class="brand-overview" aria-label="Company overview">
      <article class="brand-identity-card">
        <span class="eyebrow">Company</span>
        <h2>${escapeHtml(company.name || company.id || "Company")}</h2>
        <dl class="brand-facts">
          <div><dt>Company</dt><dd><select data-company-field="contextCompanyId">${companyOptions(company.id)}</select></dd></div>
          <div><dt>Company name</dt><dd><input data-company-field="companyName" type="text" value="${escapeHtml(company.name || "")}"></dd></div>
        </dl>
        <section class="account-actions" aria-label="Company actions">
          <button type="button" data-company-action="save">Save company</button>
          <button type="button" class="danger-action" data-company-action="delete">Delete company</button>
        </section>
      </article>
    </aside>
    <section class="brand-panels" aria-label="Company relationships">
      <article class="brand-panel">
        <header><h3>Brands owned by this company</h3><span class="count">${brands.length}</span></header>
        ${renderSimpleList(brands.map((brand) => brand.name || brand.id), "No brands assigned yet.")}
      </article>
      <article class="brand-panel">
        <header><h3>Campaigns under this company</h3><span class="count">${campaigns.length}</span></header>
        ${renderSimpleList(campaigns.map((campaign) => `${campaign.name || campaign.id} / ${brandName(campaign.brandId)}`), "No campaigns assigned yet.")}
      </article>
    </section>
  `;
}

function renderBrands() {
  const target = document.querySelector("#brand-workspace");
  if (!target) return;
  const company = (state.companies || []).find((item) => item.id === state.context?.companyId) || (state.companies || [])[0] || {};
  const brand = (state.brands || []).find((item) => item.id === state.context?.brandId && item.companyId === company.id)
    || (state.brands || []).find((item) => item.companyId === company.id)
    || {};
  const library = (state.brandLibraries || []).find((item) => item.brandId === brand.id) || {};
  const claims = (state.claimLibraries || []).find((item) => item.brandId === brand.id) || {};
  const modules = guidanceModulesForBrand(brand.id, library, claims);
  const campaigns = (state.campaigns || []).filter((item) => item.companyId === company.id && item.brandId === brand.id);
  target.innerHTML = `
    <aside class="brand-overview" aria-label="Brand overview">
      <article id="brand-identity" class="brand-identity-card">
        <span class="eyebrow">Brand</span>
        <h2>${escapeHtml(brand.name || brand.id || "Brand")}</h2>
        <dl class="brand-facts">
          <div><dt>Company</dt><dd><select data-brand-field="contextCompanyId">${companyOptions(company.id)}</select></dd></div>
          <div><dt>Brand</dt><dd><select data-brand-field="contextBrandId">${brandOptions(company.id, brand.id)}</select></dd></div>
          <div><dt>Brand name</dt><dd><input data-brand-field="brandName" type="text" value="${escapeHtml(brand.name || "")}"></dd></div>
          <div><dt>Languages</dt><dd><input data-brand-field="brandLanguages" type="text" value="${escapeHtml((brand.languages || []).join(", ") || "en")}"></dd></div>
        </dl>
        <section class="account-actions" aria-label="Brand actions">
          <button type="button" data-brand-action="save">Save brand</button>
          <button type="button" class="danger-action" data-brand-action="delete">Delete brand</button>
        </section>
      </article>
      <article class="strategy-card">
        <h3>Campaigns assigned to this brand</h3>
        ${renderSimpleList(campaigns.map((campaign) => campaign.name || campaign.id), "No campaigns assigned. Use the Campaigns tab to create one.")}
      </article>
    </aside>
    <section class="brand-panels" aria-label="Brand operating rules">
      ${renderGuidanceModuleBar(modules)}
      ${modules.filter((module) => module.enabled !== false).map(renderGuidanceModulePanel).join("") || `<div class="empty-column">No guidance modules enabled for this brand.</div>`}
    </section>
  `;
}

function guidanceModulesForBrand(brandId, library = {}, claims = {}) {
  state.brandGuidanceModules ||= [];
  const existing = state.brandGuidanceModules.filter((module) => module.brandId === brandId);
  if (!brandId) return [];
  if (!existing.length) {
    const now = new Date().toISOString();
    const seeded = DEFAULT_GUIDANCE_MODULES.map((definition, index) => {
      const value = definition.key === "brandVoice"
        ? library.voice || ""
        : definition.source === "brandLibrary" ? library[definition.key] || [] : claims[definition.key] || [];
      return {
        id: normalizeId(`${brandId}-${definition.key}`, "guidanceModuleId"),
        brandId,
        key: definition.key,
        title: definition.title,
        source: definition.source,
        valueType: definition.valueType,
        enabled: true,
        content: Array.isArray(value) ? value.join("\n") : String(value || ""),
        placeholder: definition.placeholder,
        sortOrder: index + 1,
        createdAt: now,
        updatedAt: now,
      };
    });
    state.brandGuidanceModules.push(...seeded);
    return seeded;
  }
  return existing.sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0));
}

function renderGuidanceModuleBar(modules = [], scope = "brand") {
  const actionPrefix = scope === "campaign" ? "campaign" : "brand";
  return `
    <nav class="guidance-module-bar" aria-label="${scope === "campaign" ? "Campaign" : "Brand"} guidance modules">
      ${modules.map((module) => `
        <button
          type="button"
          class="${module.enabled === false ? "" : "active"}"
          data-${actionPrefix}-action="toggle-guidance-module"
          data-guidance-module-id="${escapeHtml(module.id)}"
          aria-pressed="${module.enabled === false ? "false" : "true"}"
        >${escapeHtml(module.title || "Guidance module")}</button>
      `).join("")}
      <button type="button" class="add-guidance-module" data-${actionPrefix}-action="add-guidance-module">+ Add guidance module</button>
    </nav>
  `;
}

function renderSimpleList(items = [], emptyText = "Nothing assigned yet.") {
  const values = (items || []).filter(Boolean);
  if (!values.length) return `<p>${escapeHtml(emptyText)}</p>`;
  return `<ul>${values.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderGuidanceModulePanel(module, scope = "brand") {
  const list = listValueFromText(module.content);
  const rows = module.valueType === "text" ? 4 : 5;
  const actionPrefix = scope === "campaign" ? "campaign" : "brand";
  const contentAttribute = scope === "campaign" ? "data-campaign-guidance-module-content" : "data-guidance-module-content";
  return `
    <article id="${scope === "campaign" ? "campaign" : "brand"}-guidance-${escapeHtml(module.id)}" class="brand-panel editable-brand-panel guidance-module-panel">
      <header>
        <h3>${escapeHtml(module.title || "Guidance module")}</h3>
        <span class="count">${module.valueType === "text" ? (module.content ? 1 : 0) : list.length}</span>
      </header>
      <textarea ${contentAttribute}="${escapeHtml(module.id)}" rows="${rows}" placeholder="${escapeHtml(module.placeholder || "One guidance item per line")}">${escapeHtml(module.content || "")}</textarea>
      <footer>
        <span>${escapeHtml(module.valueType === "text" ? "Text guidance" : "List guidance")}</span>
        <button type="button" class="danger-action" data-${actionPrefix}-action="delete-guidance-module" data-guidance-module-id="${escapeHtml(module.id)}">Delete module</button>
      </footer>
    </article>
  `;
}

function renderEditableBrandPanel(title, field, items = [], placeholder = "") {
  const list = (items || []).filter(Boolean);
  const rows = field === "brandVoice" ? 4 : 5;
  const panelId = `brand-panel-${field}`;
  return `
    <article id="${escapeHtml(panelId)}" class="brand-panel editable-brand-panel">
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

function handleCompanyWorkspaceChange(event) {
  const field = event.target.closest("[data-company-field]");
  if (!field || field.dataset.companyField !== "contextCompanyId") return;
  const companyId = normalizeId(field.value, "companyId");
  const firstBrand = (state.brands || []).find((brand) => brand.companyId === companyId);
  state.context = {
    ...state.context,
    companyId,
    brandId: firstBrand?.id || "",
    campaignId: "",
  };
  renderCompanies();
}

async function handleCompanyWorkspaceClick(event) {
  const button = event.target.closest("[data-company-action]");
  if (!button) return;
  if (button.dataset.companyAction === "delete") {
    await deleteSelectedCompany();
    return;
  }
  if (button.dataset.companyAction !== "save") return;
  const workspace = document.querySelector("#company-workspace");
  const companyId = normalizeId(workspace?.querySelector('[data-company-field="contextCompanyId"]')?.value || state.context?.companyId, "companyId");
  const company = (state.companies || []).find((item) => item.id === companyId);
  if (company) {
    company.name = workspace?.querySelector('[data-company-field="companyName"]')?.value || company.name;
  }
  state.context = {
    ...state.context,
    companyId,
    brandId: (state.brands || []).find((brand) => brand.companyId === companyId)?.id || "",
    campaignId: "",
  };
  await saveProductionState();
  renderCompanies();
  renderBrands();
  renderCampaigns();
  renderTemplates();
}

async function deleteSelectedCompany() {
  const workspace = document.querySelector("#company-workspace");
  const companyId = normalizeId(workspace?.querySelector('[data-company-field="contextCompanyId"]')?.value || state.context?.companyId, "companyId");
  if (!companyId || !(state.companies || []).some((company) => company.id === companyId)) return;
  const company = (state.companies || []).find((item) => item.id === companyId);
  const ok = await showConfirmModal(`Delete ${company?.name || companyId}? This also removes its brands, campaigns, accounts, templates, and campaign strategy.`);
  if (!ok) return;
  const brandIds = new Set((state.brands || []).filter((brand) => brand.companyId === companyId).map((brand) => brand.id));
  const campaignIds = new Set((state.campaigns || []).filter((campaign) => campaign.companyId === companyId || brandIds.has(campaign.brandId)).map((campaign) => campaign.id));
  removeCompanyScopedRecords(companyId, brandIds, campaignIds);
  state.companies = (state.companies || []).filter((item) => item.id !== companyId);
  selectFirstAvailableScope();
  selectedAccountId = (state.socialAccounts || []).some((account) => account.id === selectedAccountId) ? selectedAccountId : "";
  accountCreatorOpen = false;
  await saveProductionState();
  renderCompanies();
  renderBrands();
  renderCampaigns();
  renderAccounts(selectedAccountId);
  renderTemplates();
  renderOperatorDrawer();
}

async function addCompanyRecord() {
  const name = await showInputModal("Company name");
  if (!name) return;
  const uniqueName = uniqueRecordName(name.trim(), state.companies);
  const company = createCompanyRecord({ name: uniqueName });
  state.companies ||= [];
  state.companies.push(company);
  state.context = {
    ...state.context,
    companyId: company.id,
    brandId: "",
    campaignId: "",
  };
  await saveProductionState();
  renderCompanies();
  renderBrands();
  renderCampaigns();
  renderAccounts(selectedAccountId);
  renderTemplates();
}

async function addBrandRecord() {
  const companyId = state.context?.companyId || (state.companies || [])[0]?.id;
  if (!companyId) return;
  const name = await showInputModal("Brand name");
  if (!name) return;
  const uniqueName = uniqueRecordName(name.trim(), state.brands?.filter((brand) => brand.companyId === companyId));
  const brand = createBrandRecord({ name: uniqueName, companyId });
  state.brands ||= [];
  state.brands.push(brand);
  state.context = {
    ...state.context,
    companyId,
    brandId: brand.id,
    campaignId: "",
  };
  await ensureBrandSupportRecords(brand);
  await saveProductionState();
  renderCompanies();
  renderBrands();
  renderCampaigns();
  renderAccounts(selectedAccountId);
  renderTemplates();
}

async function addCampaignRecord() {
  const workspace = document.querySelector("#campaign-workspace");
  const workspaceBrandId = normalizeId(workspace?.querySelector('[data-campaign-field="contextBrandId"]')?.value, "brandId");
  const brandId = workspaceBrandId || state.context?.brandId || (state.brands || [])[0]?.id;
  const brand = (state.brands || []).find((b) => b.id === brandId);
  const companyId = brand?.companyId || state.context?.companyId || (state.companies || [])[0]?.id;
  if (!companyId) {
    setOperatorMessage("Add campaign refused: create a company first.");
    return;
  }
  if (!brandId) {
    setOperatorMessage("Add campaign refused: create a brand first.");
    return;
  }
  const name = await showInputModal("Campaign name");
  if (!name) return;
  const uniqueName = uniqueRecordName(name.trim(), state.campaigns?.filter((campaign) => campaign.companyId === companyId && campaign.brandId === brandId));
  const campaign = createCampaignRecord({ name: uniqueName, companyId, brandId });
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
  renderCompanies();
  renderCampaigns();
  renderTemplates();
}

async function addTemplateRecord() {
  const companyId = state.context?.companyId || (state.companies || [])[0]?.id;
  const brandId = state.context?.brandId || (state.brands || []).find((brand) => brand.companyId === companyId)?.id;
  const campaignId = state.context?.campaignId || (state.campaigns || []).find((campaign) => campaign.companyId === companyId && campaign.brandId === brandId)?.id || "";
  if (!companyId || !brandId) return;
  const platform = state.context?.platform || "x";
  const type = "campaign";
  const id = normalizeId(`${brandId}-${campaignId || "general"}-${type}-${platform}-${Date.now()}`, "template");
  state.socialTemplates ||= [];
  state.socialTemplates.unshift({
    id,
    companyId,
    brandId,
    campaignId,
    platform,
    language: currentOperatorLanguage(),
    type,
    safeZone: "Center 80%; keep text away from crop edges.",
    notes: "New campaign explainer template.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await saveProductionState();
  renderTemplates();
  document.getElementById("template-creative-column")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function uniqueRecordName(baseName, records = []) {
  const existing = new Set((records || []).map((record) => String(record.name || "").toLowerCase()));
  if (!existing.has(baseName.toLowerCase())) return baseName;
  let index = 2;
  while (existing.has(`${baseName} ${index}`.toLowerCase())) index += 1;
  return `${baseName} ${index}`;
}

async function addSocialAccount() {
  accountCreatorOpen = true;
  renderAccounts(selectedAccountId);
}

function sharedBrowserPartitionForPlatform(companyId, brandId, platform) {
  if (!String(platform || "").startsWith("youtube-")) return "";
  const existing = accountsForScope(companyId, brandId).find((account) => String(account.platform || "").startsWith("youtube-") && account.browserPartitionId);
  return existing?.browserPartitionId || normalizeBrowserProfileId(`${companyId}-${brandId}-youtube`);
}

async function createSocialAccountForScope(platform) {
  const companyId = state.context?.companyId || (state.companies || [])[0]?.id || "";
  const brandId = state.context?.brandId || (state.brands || []).find((brand) => brand.companyId === companyId)?.id || "";
  const existing = accountsForScope(companyId, brandId).find((account) => account.platform === platform);
  if (existing) {
    selectedAccountId = existing.id;
    setActiveAccount(existing);
    await saveProductionState();
    return existing;
  }
  const company = (state.companies || []).find((item) => item.id === companyId);
  const brand = (state.brands || []).find((item) => item.id === brandId);
  const sharedBrowserPartitionId = sharedBrowserPartitionForPlatform(companyId, brandId, platform);
  const plan = buildSocialAccountCreationPlan({
    company,
    brand,
    platform,
    desiredHandle: brand?.name || company?.name || platform,
  });
  const handle = plan.desiredHandle || brand?.name || company?.name || platform;
  const id = normalizeId(`${brandId}-${platform}-${handle || Date.now()}`, "socialAccountId");
  const account = {
    id,
    companyId,
    brandId,
    platform,
    handle,
    accountUrl: plan.accountUrl || normalizeAccountUrl(handle, platform),
    loginUrl: plan.loginUrl || normalizeLoginUrl("", platform),
    composeUrl: plan.composeUrl || normalizeComposeUrl("", platform),
    expectedHost: plan.expectedHost || normalizeHost(plan.accountUrl || normalizeAccountUrl(handle, platform)),
    signupUrl: plan.signupUrl,
    sessionStatus: "unknown",
    browserProfileId: plan.browserProfileId || normalizeBrowserProfileId(`${companyId}-${brandId}-${platform}-${id}`),
    browserPartitionId: sharedBrowserPartitionId || plan.browserProfileId || normalizeBrowserProfileId(`${companyId}-${brandId}-${platform}-${id}`),
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
  accountCreatorOpen = false;
  await saveProductionState();
  return account;
}

async function createSocialAccountFromForm() {
  const detail = document.querySelector("#account-detail");
  if (!detail) return;
  const valueFor = (field) => detail.querySelector(`[data-new-account-field="${field}"]`)?.value || "";
  const companyId = normalizeId(valueFor("companyId") || state.context?.companyId || (state.companies || [])[0]?.id, "companyId");
  const brandId = normalizeId(valueFor("brandId") || state.context?.brandId || (state.brands || []).find((brand) => brand.companyId === companyId)?.id, "brandId");
  const platform = normalizeId(valueFor("platform") || "x", "platform");
  if (!companyId || !brandId || !platform) return;
  const company = (state.companies || []).find((item) => item.id === companyId);
  const brand = (state.brands || []).find((item) => item.id === brandId);
  const sharedBrowserPartitionId = sharedBrowserPartitionForPlatform(companyId, brandId, platform);
  const plan = buildSocialAccountCreationPlan({
    company,
    brand,
    platform,
    desiredHandle: valueFor("handle") || brand?.name || company?.name || "",
  });
  const handle = plan.desiredHandle || valueFor("handle") || platform;
  const id = normalizeId(`${brandId}-${platform}-${handle || Date.now()}`, "socialAccountId");
  const account = {
    id,
    companyId,
    brandId,
    platform,
    handle,
    accountUrl: plan.accountUrl || normalizeAccountUrl(handle, platform),
    loginUrl: plan.loginUrl || normalizeLoginUrl("", platform),
    composeUrl: plan.composeUrl || normalizeComposeUrl("", platform),
    expectedHost: plan.expectedHost || normalizeHost(plan.accountUrl || normalizeAccountUrl(handle, platform)),
    signupUrl: plan.signupUrl,
    sessionStatus: "unknown",
    browserProfileId: plan.browserProfileId || normalizeBrowserProfileId(`${companyId}-${brandId}-${platform}-${id}`),
    browserPartitionId: sharedBrowserPartitionId || plan.browserProfileId || normalizeBrowserProfileId(`${companyId}-${brandId}-${platform}-${id}`),
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
  accountCreatorOpen = false;
  await saveProductionState();
  renderAccounts(account.id);
  renderOperatorDrawer();
}

async function handleAccountDetailClick(event) {
  const createButton = event.target.closest("[data-account-create-action]");
  if (createButton) {
    if (createButton.dataset.accountCreateAction === "cancel") {
      accountCreatorOpen = false;
      renderAccounts(selectedAccountId);
      return;
    }
    if (createButton.dataset.accountCreateAction === "create") {
      await createSocialAccountFromForm();
      return;
    }
  }
  const button = event.target.closest("[data-account-action]");
  if (!button) return;
  const account = (state.socialAccounts || []).find((item) => item.id === button.dataset.accountId);
  if (!account) return;
  if (button.dataset.accountAction === "save-login") saveAccountForm(account);
  if (button.dataset.accountAction === "open-login") {
    if (!guardAccountLoginAction(account, "open-login")) return;
    if (account.platform === "tiktok") account.tiktokLoginMode = "desktop";
    await openAccountLogin(account);
  }
  if (button.dataset.accountAction === "open-qr-login") {
    if (!guardAccountLoginAction(account, "open-login")) return;
    account.tiktokLoginMode = "qr";
    await openAccountLogin(account);
  }
  if (button.dataset.accountAction === "open-web-login") {
    if (!guardAccountLoginAction(account, "open-login")) return;
    account.tiktokLoginMode = "desktop";
    await openAccountLogin(account);
  }
  if (button.dataset.accountAction === "reload-login-panel") {
    if (!guardAccountLoginAction(account, "reload-login-panel")) return;
    reloadAccountLoginPanel(account);
  }
  if (button.dataset.accountAction === "fit-login-panel") {
    if (!guardAccountLoginAction(account, "fit-login-panel")) return;
    forceRefreshAccountLoginWebviewBounds();
    return;
  }
  if (button.dataset.accountAction === "close-login-panel") {
    closeAccountLoginPanel();
    return;
  }
  if (button.dataset.accountAction === "load-public-profile") {
    if (!guardAccountLoginAction(account, "load-public-profile")) return;
    loadAccountPublicProfile(account);
  }
  if (button.dataset.accountAction === "load-compose-page") {
    if (!guardAccountLoginAction(account, "load-compose-page")) return;
    loadAccountComposePage(account);
  }
  if (button.dataset.accountAction === "check-login-panel") {
    if (!guardAccountLoginAction(account, "check-login-panel")) return;
    await checkAccountLoginPanel(account);
  }
  if (button.dataset.accountAction === "dashlane-find") await findDashlaneAccount(account);
  if (button.dataset.accountAction === "dashlane-copy-login") await copyDashlaneAccountField(account, "login");
  if (button.dataset.accountAction === "dashlane-copy-password") await copyDashlaneAccountField(account, "password");
  if (button.dataset.accountAction === "dashlane-copy-otp") await copyDashlaneAccountField(account, "otp");
  if (button.dataset.accountAction === "copy-login-username") await copyAccountLoginUsername(account);
  if (button.dataset.accountAction === "copy-login-password") await copyAccountLoginPassword();
  if (button.dataset.accountAction === "mark-logged-in") markAccountLoggedIn(account);
  if (button.dataset.accountAction === "clear-session") await clearAccountBrowserSession(account);
  if (button.dataset.accountAction === "save") saveAccountForm(account);
  if (button.dataset.accountAction === "set-active") setActiveAccount(account);
  if (button.dataset.accountAction === "ready") account.sessionStatus = "ready";
  if (button.dataset.accountAction === "needs-login") account.sessionStatus = "needs_login";
  if (button.dataset.accountAction === "open-signup") await openAccountSignup(account);
  if (button.dataset.accountAction === "copy-creation-plan") await copyAccountCreationPlan(account);
  if (button.dataset.accountAction === "account-created") {
    account.creationStatus = "created_manually";
    account.sessionStatus = account.sessionStatus === "ready" ? "ready" : "needs_login";
  }
  account.updatedAt = new Date().toISOString();
  await saveProductionState();
  renderAccounts(account.id);
  renderOperatorDrawer();
}

async function clearAccountBrowserSession(account) {
  saveAccountForm(account);
  updateAccountLoginBrowserStatus(`Logging out ${platformLabel(account.platform)} in Diamond...`);
  const result = await window.diamond?.clearAccountSession?.({
    account: sessionProbeAccountPayload(account),
    partition: accountBrowserPartition(account),
  });
  account.sessionStatus = "needs_login";
  account.sessionNote = result?.ok
    ? result.note || "Browser session cleared. Load login to sign in again."
    : result?.note || "Could not clear browser session.";
  account.lastSessionCheckAt = new Date().toISOString();
  account.currentUrl = "";
  account.loginPanelUrl = normalizeLoginUrl("", account.platform) || "about:blank";
  account.lastLoginProofAt = "";
  account.lastProofAt = "";
  account.proofCount = 0;
  accountBrowserLoadedAccountIds.add(account.id);
  loadAccountLoginPanelUrl(account.loginPanelUrl, account);
  updateAccountStatusDom(account);
}

async function findDashlaneAccount(account) {
  account.dashlaneStatus = "Searching...";
  renderAccounts(account.id);
  const result = await window.diamond?.dashlaneSearch?.(dashlanePayloadForAccount(account));
  if (!result?.ok) {
    account.dashlaneStatus = result?.reason || "Dashlane search failed.";
    account.dashlaneMatches = [];
    account.dashlaneCredentialId = "";
    await saveProductionState();
    renderAccounts(account.id);
    return;
  }
  account.dashlaneMatches = (result.entries || []).filter((entry) => entry.id || entry.title || entry.login || entry.url);
  account.dashlaneCredentialId = account.dashlaneMatches[0]?.id || "";
  account.dashlaneStatus = account.dashlaneMatches.length
    ? `${account.dashlaneMatches.length} match${account.dashlaneMatches.length === 1 ? "" : "es"} found`
    : "No matching Dashlane item found.";
  await saveProductionState();
  renderAccounts(account.id);
}

async function copyDashlaneAccountField(account, field) {
  saveAccountForm(account);
  const result = await window.diamond?.dashlaneCopyField?.({
    ...dashlanePayloadForAccount(account),
    dashlaneId: account.dashlaneCredentialId || "",
    field,
  });
  account.dashlaneStatus = result?.ok
    ? `${field === "otp" ? "2FA code" : titleCase(field)} copied from Dashlane.`
    : result?.reason || "Dashlane copy failed.";
  await saveProductionState();
  renderAccounts(account.id);
}

function dashlanePayloadForAccount(account) {
  return {
    platform: account.platform || "",
    handle: account.handle || "",
    accountUrl: account.accountUrl || "",
    loginUrl: resolveLoginUrl(account) || "",
    expectedHost: account.expectedHost || "",
  };
}

async function handleAccountDetailChange(event) {
  const field = event.target.closest("[data-login-scope-field]");
  if (!field) return;
  if (field.dataset.loginScopeField === "companyId") {
    const companyId = normalizeId(field.value, "companyId");
    const brandId = (state.brands || []).find((brand) => brand.companyId === companyId)?.id || "";
    const account = accountsForScope(companyId, brandId)[0] || null;
    state.context = {
      ...state.context,
      companyId,
      brandId,
      platform: account?.platform || state.context?.platform || "x",
      socialAccountId: account?.id || "",
      browserProfileId: account?.browserProfileId || "",
    };
    selectedAccountId = account?.id || null;
  }
  if (field.dataset.loginScopeField === "brandId") {
    const brandId = normalizeId(field.value, "brandId");
    const brand = (state.brands || []).find((item) => item.id === brandId) || {};
    const account = accountsForScope(brand.companyId || state.context?.companyId, brandId)[0] || null;
    state.context = {
      ...state.context,
      companyId: brand.companyId || state.context?.companyId || "",
      brandId,
      platform: account?.platform || state.context?.platform || "x",
      socialAccountId: account?.id || "",
      browserProfileId: account?.browserProfileId || "",
    };
    selectedAccountId = account?.id || null;
  }
  if (field.dataset.loginScopeField === "accountId") {
    if (field.value === "__new_account__") {
      accountCreatorOpen = true;
      await saveProductionState();
      renderAccounts(selectedAccountId);
      renderOperatorDrawer();
      return;
    }
    if (field.value.startsWith("__new_platform__:")) {
      const platform = normalizeId(field.value.split(":")[1] || "x", "platform");
      const account = await createSocialAccountForScope(platform);
      renderAccounts(account.id);
      renderOperatorDrawer();
      return;
    }
    const account = (state.socialAccounts || []).find((item) => item.id === field.value);
    if (account) setActiveAccount(account);
  }
  accountCreatorOpen = false;
  await saveProductionState();
  renderAccounts(selectedAccountId);
  renderOperatorDrawer();
}

async function handleAccountDetailSubmit(event) {
  const form = event.target.closest("[data-account-login-address-form]");
  if (!form) return;
  event.preventDefault();
  const account = (state.socialAccounts || []).find((item) => item.id === form.dataset.accountId);
  if (!account) return;
  const input = form.querySelector("[data-account-login-address-input]");
  const nextUrl = normalizeAccountBrowserAddress(input?.value || "");
  if (!nextUrl) {
    updateAccountLoginBrowserStatus("Enter a web address first.");
    return;
  }
  account.currentUrl = nextUrl;
  account.loginPanelUrl = nextUrl;
  account.lastManualNavigationAt = new Date().toISOString();
  accountBrowserLoadedAccountIds.add(account.id);
  loadAccountLoginPanelUrl(nextUrl, account);
  await saveProductionState();
}

function closeAccountLoginPanel() {
  destroyAccountLoginWebview();
  document.querySelector(".account-login-browser")?.remove();
}

function guardAccountLoginAction(account, action) {
  const cooldownMs = accountLoginActionCooldownMs(account, action);
  if (!cooldownMs) return true;
  const lastAt = account.loginActionCooldowns?.[action] || "";
  const elapsedMs = lastAt ? Date.now() - new Date(lastAt).getTime() : cooldownMs;
  if (Number.isFinite(elapsedMs) && elapsedMs < cooldownMs) {
    const seconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
    updateAccountLoginBrowserStatus(`Slow down: wait ${seconds}s before running that login action again.`);
    return false;
  }
  account.loginActionCooldowns = {
    ...(account.loginActionCooldowns || {}),
    [action]: new Date().toISOString(),
  };
  return true;
}

function accountLoginActionCooldownMs(account, action) {
  if (account?.platform === "tiktok" && action === "open-login") return 1000;
  return ACCOUNT_LOGIN_ACTION_COOLDOWNS[action] || 0;
}

async function openAccountLogin(account) {
  saveAccountForm(account);
  setActiveAccount(account);
  account.sessionStatus = "needs_login";
  account.loginOpenedAt = new Date().toISOString();
  const loginUrl = accountLoginUrlForBrowser(account);
  account.currentUrl = "";
  account.loginPanelUrl = loginUrl || "about:blank";
  accountBrowserLoadedAccountIds.add(account.id);
  loadAccountLoginPanelUrl(account.loginPanelUrl, account);
  account.sessionNote = loginUrl ? "Loaded official login page in the pane." : "No login URL is configured.";
}

function accountLoginUrlForBrowser(account) {
  if (account?.platform === "tiktok") {
    if (account.tiktokLoginMode === "qr") return "https://www.tiktok.com/login/qrcode";
    return "https://www.tiktok.com/login";
  }
  return resolveLoginUrl(account);
}

function reloadAccountLoginPanel(account) {
  if (account) account.sessionNote = "Reloaded login pane once. Wait before reloading again.";
  sizeAccountLoginWebview();
  const webview = document.querySelector("#account-login-webview");
  if (typeof webview?.reload === "function") webview.reload();
}

function loadAccountPublicProfile(account) {
  const publicUrl = account.accountUrl || normalizeAccountUrl(account.handle, account.platform);
  if (!publicUrl) return;
  account.loginPanelUrl = publicUrl;
  accountBrowserLoadedAccountIds.add(account.id);
  loadAccountLoginPanelUrl(publicUrl, account);
  account.sessionNote = "Loaded public profile page in the pane.";
}

function loadAccountComposePage(account) {
  const composeUrl = resolveComposeUrl(account);
  if (!composeUrl) {
    updateAccountLoginBrowserStatus("No composer URL is configured for this platform.");
    return;
  }
  account.loginPanelUrl = composeUrl;
  accountBrowserLoadedAccountIds.add(account.id);
  loadAccountLoginPanelUrl(composeUrl, account);
  account.sessionNote = account.platform?.startsWith("youtube-")
    ? "Loaded YouTube Studio. Use Create > Upload videos for Shorts or long-form uploads."
    : "Loaded platform composer page in the pane.";
}

function loadAccountLoginPanelUrl(url, account = null) {
  const webview = document.querySelector("#account-login-webview");
  if (!webview || !url) return;
  if (account) {
    webview.dataset.accountId = account.id || "";
    webview.dataset.platform = account.platform || "";
    applyAccountBrowserUserAgent(webview, account);
  }
  const input = document.querySelector("[data-account-login-address-input]");
  if (input) input.value = url;
  webview.setAttribute("src", url);
  webview.src = url;
  requestAnimationFrame(sizeAccountLoginWebview);
  const status = document.querySelector("#account-login-browser-status");
  if (status) status.textContent = `Loading ${safeUrlLabel(url)}...`;
}

function accountLoginWebviewUrl() {
  const webview = document.querySelector("#account-login-webview");
  if (!webview) return "";
  if (typeof webview.getURL === "function") return webview.getURL();
  return webview.getAttribute("src") || webview.src || "";
}

async function checkAccountLoginPanel(account) {
  const currentUrl = accountLoginWebviewUrl();
  const inferred = await inferAccountBrowserSessionStatus(account, currentUrl);
  account.currentUrl = currentUrl;
  account.loginPanelUrl = currentUrl || account.loginPanelUrl;
  account.sessionStatus = accountStatusFromSessionStatus(inferred.status);
  account.sessionNote = inferred.note;
  account.lastSessionCheckAt = new Date().toISOString();
  if (inferred.status === "ready") markAccountLoggedIn(account);
  updateAccountLoginBrowserStatus(`${titleCase(account.sessionStatus)} - ${account.sessionNote}`);
}

function updateAccountLoginBrowserStatus(message) {
  const status = document.querySelector("#account-login-browser-status");
  if (!status) return;
  if (message) {
    status.textContent = message;
    return;
  }
  const currentUrl = accountLoginWebviewUrl();
  status.textContent = currentUrl ? `Viewing ${safeUrlLabel(currentUrl)}` : "Login pane is ready.";
}

function safeUrlLabel(url = "") {
  try {
    const parsed = new URL(url);
    return parsed.hostname || url;
  } catch {
    return url || "page";
  }
}

function normalizeAccountBrowserAddress(value = "") {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(about|data|file):/i.test(trimmed)) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

async function copyAccountLoginUsername(account) {
  saveAccountForm(account);
  await window.diamond?.writeClipboard?.(account.handle || "");
  account.loginNote = account.handle ? "Copied username for manual login." : "No username saved yet.";
}

async function copyAccountLoginPassword() {
  const detail = document.querySelector("#account-detail");
  const password = detail?.querySelector('[data-account-field="temporaryPassword"]')?.value || "";
  if (password) await window.diamond?.writeClipboard?.(password);
}

function markAccountLoggedIn(account) {
  const proof = getPlatformProofForAccount(account);
  const next = markPlatformLoginProof(proof, `Login proof recorded manually for ${platformLabel(account.platform)}.`);
  state.platformProofs = (state.platformProofs || []).map((item) => item.id === next.id ? next : item);
  account.sessionStatus = "ready";
  account.proofCount = Number(account.proofCount || 0) + 1;
  account.lastLoginProofAt = next.lastLoginProofAt || new Date().toISOString();
  account.lastProofAt = next.lastProofAt || account.lastLoginProofAt;
}

async function openAccountSignup(account) {
  const plan = buildCreationPlanForAccount(account);
  if (!plan.signupUrl) return;
  account.signupUrl = plan.signupUrl;
  account.signupOpenedAt = new Date().toISOString();
  await window.diamond?.openExternal?.(plan.signupUrl);
}

async function copyAccountCreationPlan(account) {
  const plan = buildCreationPlanForAccount(account);
  await window.diamond?.writeClipboard?.(formatSocialAccountCreationPlan(plan));
  account.creationStatus = account.creationStatus || "plan_copied";
  account.creationNote = "Copied social account creation plan.";
}

function buildCreationPlanForAccount(account) {
  const company = (state.companies || []).find((item) => item.id === account.companyId);
  const brand = (state.brands || []).find((item) => item.id === account.brandId);
  const campaign = (state.campaigns || []).find((item) => item.id === state.context?.campaignId);
  const strategy = (state.contentStrategies || []).find((item) => item.campaignId === campaign?.id);
  return buildSocialAccountCreationPlan({ company, brand, campaign, account, strategy });
}

function saveAccountForm(account) {
  const detail = document.querySelector("#account-detail");
  if (!detail) return;
  const valueFor = (field) => detail.querySelector(`[data-account-field="${field}"]`)?.value || "";
  account.companyId = normalizeId(valueFor("companyId") || account.companyId, "companyId");
  account.brandId = normalizeId(valueFor("brandId") || account.brandId, "brandId");
  account.platform = normalizeId(valueFor("platform") || account.platform, "platform");
  account.handle = valueFor("handle") || account.handle || "";
  account.accountUrl = normalizeAccountUrl(valueFor("accountUrl") || account.accountUrl || account.handle, account.platform);
  account.loginUrl = normalizeLoginUrl(valueFor("loginUrl"), account.platform);
  account.composeUrl = normalizeComposeUrl(valueFor("composeUrl"), account.platform);
  account.expectedHost = normalizeHost(valueFor("expectedHost") || account.accountUrl);
  account.browserProfileId = normalizeBrowserProfileId(valueFor("browserProfileId") || `${account.companyId}-${account.brandId}-${account.platform}-${account.id}`);
  account.dashlaneCredentialId = valueFor("dashlaneCredentialId") || account.dashlaneCredentialId || "";
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

function handleBrandWorkspaceChange(event) {
  const field = event.target.closest("[data-brand-field]");
  if (!field) return;
  if (field.dataset.brandField === "contextCompanyId") {
    const companyId = normalizeId(field.value, "companyId");
    const firstBrand = (state.brands || []).find((brand) => brand.companyId === companyId);
    state.context = {
      ...state.context,
      companyId,
      brandId: firstBrand?.id || "",
      campaignId: "",
    };
    renderBrands();
  } else if (field.dataset.brandField === "contextBrandId") {
    const brandId = normalizeId(field.value, "brandId");
    const brand = (state.brands || []).find((b) => b.id === brandId);
    state.context = {
      ...state.context,
      companyId: brand?.companyId || state.context?.companyId || "",
      brandId,
      campaignId: "",
    };
    renderBrands();
  }
}

async function handleBrandWorkspaceClick(event) {
  const button = event.target.closest("[data-brand-action]");
  if (!button) return;
  if (button.dataset.brandAction === "add-guidance-module") {
    await addGuidanceModule();
    return;
  }
  if (button.dataset.brandAction === "toggle-guidance-module") {
    await toggleGuidanceModule(button.dataset.guidanceModuleId);
    return;
  }
  if (button.dataset.brandAction === "delete-guidance-module") {
    await deleteGuidanceModule(button.dataset.guidanceModuleId);
    return;
  }
  if (button.dataset.brandAction === "delete") {
    await deleteSelectedBrand();
    return;
  }
  if (button.dataset.brandAction !== "save") return;
  const scope = saveBrandWorkspace();
  state.context = { ...state.context, companyId: scope.companyId, brandId: scope.brandId };
  await saveProductionState();
  renderBrands();
  renderAccounts(selectedAccountId);
  renderCampaigns();
  renderTemplates();
  renderOperatorDrawer();
}

async function addGuidanceModule() {
  saveBrandWorkspace();
  const brandId = state.context?.brandId || (state.brands || [])[0]?.id || "";
  if (!brandId) return;
  const title = await promptForText("Guidance module name", "New guidance module");
  if (!title) return;
  const now = new Date().toISOString();
  const modules = guidanceModulesForBrand(brandId);
  const id = normalizeId(`${brandId}-${title}-${Date.now()}`, "guidanceModuleId");
  state.brandGuidanceModules.push({
    id,
    brandId,
    key: normalizeId(title, "guidanceModule"),
    title,
    source: "custom",
    valueType: "list",
    enabled: true,
    content: "",
    placeholder: "One guidance item per line",
    sortOrder: modules.length + 1,
    createdAt: now,
    updatedAt: now,
  });
  syncGuidanceModulesToLegacyLibraries(brandId);
  await saveProductionState();
  renderBrands();
}

async function toggleGuidanceModule(moduleId) {
  saveBrandWorkspace();
  const module = (state.brandGuidanceModules || []).find((item) => item.id === moduleId);
  if (!module) return;
  module.enabled = module.enabled === false;
  module.updatedAt = new Date().toISOString();
  syncGuidanceModulesToLegacyLibraries(module.brandId);
  await saveProductionState();
  renderBrands();
}

async function deleteGuidanceModule(moduleId) {
  saveBrandWorkspace();
  const module = (state.brandGuidanceModules || []).find((item) => item.id === moduleId);
  if (!module) return;
  const ok = await showConfirmModal(`Delete guidance module "${module.title || module.id}"?`);
  if (!ok) return;
  state.brandGuidanceModules = (state.brandGuidanceModules || []).filter((item) => item.id !== moduleId);
  syncGuidanceModulesToLegacyLibraries(module.brandId);
  await saveProductionState();
  renderBrands();
}

async function deleteSelectedBrand() {
  const workspace = document.querySelector("#brand-workspace");
  const companyId = normalizeId(workspace?.querySelector('[data-brand-field="contextCompanyId"]')?.value || state.context?.companyId, "companyId");
  const brandId = normalizeId(workspace?.querySelector('[data-brand-field="contextBrandId"]')?.value || state.context?.brandId, "brandId");
  if (!brandId || !(state.brands || []).some((brand) => brand.id === brandId)) return;
  const brand = (state.brands || []).find((item) => item.id === brandId);
  const ok = await showConfirmModal(`Delete ${brand?.name || brandId}? This also removes its campaigns, accounts, templates, and brand rules.`);
  if (!ok) return;
  const campaignIds = new Set((state.campaigns || []).filter((campaign) => campaign.brandId === brandId).map((campaign) => campaign.id));
  removeBrandScopedRecords(companyId, brandId, campaignIds);
  state.brands = (state.brands || []).filter((item) => item.id !== brandId);
  const nextBrand = (state.brands || []).find((item) => item.companyId === companyId) || (state.brands || [])[0] || {};
  const nextCampaign = (state.campaigns || []).find((item) => item.companyId === (nextBrand.companyId || companyId) && item.brandId === nextBrand.id) || {};
  state.context = {
    ...state.context,
    companyId: nextBrand.companyId || companyId,
    brandId: nextBrand.id || "",
    campaignId: nextCampaign.id || "",
  };
  selectedAccountId = (state.socialAccounts || []).some((account) => account.id === selectedAccountId) ? selectedAccountId : "";
  accountCreatorOpen = false;
  await saveProductionState();
  renderCompanies();
  renderBrands();
  renderCampaigns();
  renderAccounts(selectedAccountId);
  renderTemplates();
  renderOperatorDrawer();
}

function saveBrandWorkspace() {
  const workspace = document.querySelector("#brand-workspace");
  const valueFor = (field) => workspace?.querySelector(`[data-brand-field="${field}"]`)?.value || "";
  const listValueFor = (field) => listValueForBrandField(workspace, field);
  const companyId = normalizeId(valueFor("contextCompanyId") || state.context?.companyId, "companyId");
  const brandId = normalizeId(valueFor("contextBrandId") || state.context?.brandId, "brandId");
  const company = (state.companies || []).find((item) => item.id === companyId);
  const brand = (state.brands || []).find((item) => item.id === brandId);
  if (brand) {
    brand.name = valueFor("brandName") || brand.name;
    brand.languages = valueFor("brandLanguages").split(",").map((item) => item.trim()).filter(Boolean);
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
  (state.brandGuidanceModules || [])
    .filter((module) => module.brandId === brandId)
    .forEach((module) => {
      const field = workspace?.querySelector(`[data-guidance-module-content="${module.id}"]`);
      if (!field) return;
      module.content = field.value || "";
      module.updatedAt = new Date().toISOString();
    });
  syncGuidanceModulesToLegacyLibraries(brandId);
  return { companyId, brandId };
}

function syncGuidanceModulesToLegacyLibraries(brandId) {
  const modules = (state.brandGuidanceModules || []).filter((module) => module.brandId === brandId && module.enabled !== false);
  const library = (state.brandLibraries || []).find((item) => item.brandId === brandId);
  const claims = (state.claimLibraries || []).find((item) => item.brandId === brandId);
  const moduleByKey = (key) => modules.find((module) => module.key === key);
  if (library) {
    library.voice = moduleByKey("brandVoice")?.content || library.voice || "";
    library.approvedPhrases = listValueFromText(moduleByKey("approvedPhrases")?.content);
    library.bannedPhrases = listValueFromText(moduleByKey("bannedPhrases")?.content);
    library.guidanceModules = modules.map(guidanceModuleSnapshot);
    library.updatedAt = new Date().toISOString();
  }
  if (claims) {
    claims.prizeLanguage = listValueFromText(moduleByKey("prizeLanguage")?.content);
    claims.freeToPlayLanguage = listValueFromText(moduleByKey("freeToPlayLanguage")?.content);
    claims.requiresReviewClaims = listValueFromText(moduleByKey("requiresReviewClaims")?.content);
    claims.blockedClaims = listValueFromText(moduleByKey("blockedClaims")?.content);
    claims.guidanceModules = modules.map(guidanceModuleSnapshot);
    claims.updatedAt = new Date().toISOString();
  }
}

function listValueFromText(value = "") {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function guidanceModuleSnapshot(module) {
  return {
    id: module.id,
    key: module.key,
    title: module.title,
    content: module.content,
    valueType: module.valueType || "list",
  };
}

function guidanceModulesForCampaign(campaignId, strategy = {}) {
  state.campaignGuidanceModules ||= [];
  const existing = state.campaignGuidanceModules.filter((module) => module.campaignId === campaignId);
  if (!campaignId) return [];
  if (!existing.length) {
    const now = new Date().toISOString();
    const seeded = DEFAULT_CAMPAIGN_GUIDANCE_MODULES.map((definition, index) => {
      const value = strategy[definition.strategyField] || "";
      return {
        id: normalizeId(`${campaignId}-${definition.key}`, "guidanceModuleId"),
        companyId: strategy.companyId || "",
        brandId: strategy.brandId || "",
        campaignId,
        key: definition.key,
        strategyField: definition.strategyField,
        title: definition.title,
        source: "contentStrategy",
        valueType: definition.valueType,
        enabled: true,
        content: Array.isArray(value) ? value.join("\n") : String(value || ""),
        placeholder: definition.placeholder,
        sortOrder: index + 1,
        createdAt: now,
        updatedAt: now,
      };
    });
    state.campaignGuidanceModules.push(...seeded);
    return seeded;
  }
  return existing.sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0));
}

function renderCampaigns() {
  const target = document.querySelector("#campaign-workspace");
  if (!target) return;
  const brand = (state.brands || []).find((item) => item.id === state.context?.brandId)
    || (state.brands || [])[0]
    || {};
  const company = (state.companies || []).find((item) => item.id === brand.companyId)
    || (state.companies || []).find((item) => item.id === state.context?.companyId)
    || {};
  const campaign = (state.campaigns || []).find((item) => item.id === state.context?.campaignId && item.companyId === company.id && item.brandId === brand.id)
    || (state.campaigns || []).find((item) => item.companyId === company.id && item.brandId === brand.id)
    || {};
  const strategy = (state.contentStrategies || []).find((item) => item.campaignId === campaign.id) || {};
  const modules = guidanceModulesForCampaign(campaign.id, strategy);
  target.innerHTML = `
    <aside class="brand-overview" aria-label="Campaign overview">
      <article class="brand-identity-card">
        <span class="eyebrow">Campaign</span>
        <h2>${escapeHtml(campaign.name || campaign.id || "Campaign")}</h2>
        <dl class="brand-facts">
          <div><dt>Brand</dt><dd><select data-campaign-field="contextBrandId">${brandOptions("", brand.id)}</select></dd></div>
          <div><dt>Campaign</dt><dd><select data-campaign-field="contextCampaignId">${campaignOptions(company.id, brand.id, campaign.id)}</select></dd></div>
          <div><dt>Campaign name</dt><dd><input data-campaign-field="campaignName" type="text" value="${escapeHtml(campaign.name || "")}"></dd></div>
          <div><dt>Status</dt><dd><input data-campaign-field="campaignStatus" type="text" value="${escapeHtml(campaign.status || "planning")}"></dd></div>
          <div><dt>Post tags</dt><dd><input data-campaign-field="campaignPostTags" type="text" placeholder="comma-separated, locked on posts" value="${escapeHtml((campaign.postTags || []).join(", "))}"></dd></div>
        </dl>
        <section class="account-actions" aria-label="Campaign actions">
          <button type="button" data-campaign-action="save">Save campaign</button>
          <button type="button" class="danger-action" data-campaign-action="delete">Delete campaign</button>
        </section>
      </article>
    </aside>
    <section class="brand-panels" aria-label="Campaign strategy">
      ${renderGuidanceModuleBar(modules, "campaign")}
      ${modules.filter((module) => module.enabled !== false).map((module) => renderGuidanceModulePanel(module, "campaign")).join("") || `<div class="empty-column">No guidance modules enabled for this campaign.</div>`}
    </section>
  `;
}

function renderEditableCampaignTextPanel(title, field, value = "", placeholder = "") {
  return `
    <article class="brand-panel editable-brand-panel">
      <header>
        <h3>${escapeHtml(title)}</h3>
      </header>
      <textarea data-campaign-field="${escapeHtml(field)}" rows="4" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value || "")}</textarea>
    </article>
  `;
}

function renderEditableCampaignPanel(title, field, items = [], placeholder = "") {
  const list = (items || []).filter(Boolean);
  return `
    <article class="brand-panel editable-brand-panel">
      <header>
        <h3>${escapeHtml(title)}</h3>
        <span class="count">${list.length}</span>
      </header>
      <textarea data-campaign-field="${escapeHtml(field)}" rows="5" placeholder="${escapeHtml(placeholder)}">${escapeHtml(list.join("\n"))}</textarea>
    </article>
  `;
}

async function handleCampaignWorkspaceChange(event) {
  const field = event.target.closest("[data-campaign-field]");
  if (!field || !["contextBrandId", "contextCampaignId"].includes(field.dataset.campaignField)) return;
  if (field.dataset.campaignField === "contextBrandId") {
    const brandId = normalizeId(field.value, "brandId");
    const brand = (state.brands || []).find((item) => item.id === brandId) || {};
    const campaignId = (state.campaigns || []).find((campaign) => campaign.companyId === brand.companyId && campaign.brandId === brandId)?.id || "";
    state.context = { ...state.context, companyId: brand.companyId || state.context?.companyId || "", brandId, campaignId };
  }
  if (field.dataset.campaignField === "contextCampaignId") {
    state.context = { ...state.context, campaignId: normalizeId(field.value, "campaignId") };
  }
  await saveProductionState();
  renderCampaigns();
}

async function handleCampaignWorkspaceClick(event) {
  const button = event.target.closest("[data-campaign-action]");
  if (!button) return;
  if (button.dataset.campaignAction === "add-guidance-module") {
    await addCampaignGuidanceModule();
    return;
  }
  if (button.dataset.campaignAction === "toggle-guidance-module") {
    await toggleCampaignGuidanceModule(button.dataset.guidanceModuleId);
    return;
  }
  if (button.dataset.campaignAction === "delete-guidance-module") {
    await deleteCampaignGuidanceModule(button.dataset.guidanceModuleId);
    return;
  }
  if (button.dataset.campaignAction === "delete") {
    await deleteSelectedCampaign();
    return;
  }
  if (button.dataset.campaignAction !== "save") return;
  const scope = saveCampaignWorkspace();
  state.context = { ...state.context, ...scope };
  await saveProductionState();
  renderCampaigns();
  renderTemplates();
  renderOperatorDrawer();
}

async function addCampaignGuidanceModule() {
  saveCampaignWorkspace();
  const campaignId = state.context?.campaignId || (state.campaigns || [])[0]?.id || "";
  if (!campaignId) return;
  const campaign = (state.campaigns || []).find((item) => item.id === campaignId) || {};
  const title = await promptForText("Guidance module name", "New campaign guidance");
  if (!title) return;
  const now = new Date().toISOString();
  const modules = guidanceModulesForCampaign(campaignId);
  const id = normalizeId(`${campaignId}-${title}-${Date.now()}`, "guidanceModuleId");
  state.campaignGuidanceModules.push({
    id,
    companyId: campaign.companyId || state.context?.companyId || "",
    brandId: campaign.brandId || state.context?.brandId || "",
    campaignId,
    key: normalizeId(title, "guidanceModule"),
    title,
    source: "custom",
    valueType: "list",
    enabled: true,
    content: "",
    placeholder: "One guidance item per line",
    sortOrder: modules.length + 1,
    createdAt: now,
    updatedAt: now,
  });
  syncCampaignGuidanceModulesToStrategy(campaignId);
  await saveProductionState();
  renderCampaigns();
}

async function toggleCampaignGuidanceModule(moduleId) {
  saveCampaignWorkspace();
  const module = (state.campaignGuidanceModules || []).find((item) => item.id === moduleId);
  if (!module) return;
  module.enabled = module.enabled === false;
  module.updatedAt = new Date().toISOString();
  syncCampaignGuidanceModulesToStrategy(module.campaignId);
  await saveProductionState();
  renderCampaigns();
}

async function deleteCampaignGuidanceModule(moduleId) {
  saveCampaignWorkspace();
  const module = (state.campaignGuidanceModules || []).find((item) => item.id === moduleId);
  if (!module) return;
  const ok = await showConfirmModal(`Delete guidance module "${module.title || module.id}"?`);
  if (!ok) return;
  state.campaignGuidanceModules = (state.campaignGuidanceModules || []).filter((item) => item.id !== moduleId);
  syncCampaignGuidanceModulesToStrategy(module.campaignId);
  await saveProductionState();
  renderCampaigns();
}

async function deleteSelectedCampaign() {
  const workspace = document.querySelector("#campaign-workspace");
  const brandId = normalizeId(workspace?.querySelector('[data-campaign-field="contextBrandId"]')?.value || state.context?.brandId, "brandId");
  const brand = (state.brands || []).find((item) => item.id === brandId) || {};
  const companyId = brand.companyId || state.context?.companyId || "";
  const campaignId = normalizeId(workspace?.querySelector('[data-campaign-field="contextCampaignId"]')?.value || state.context?.campaignId, "campaignId");
  if (!campaignId || !(state.campaigns || []).some((campaign) => campaign.id === campaignId)) return;
  const campaign = (state.campaigns || []).find((item) => item.id === campaignId);
  const ok = await showConfirmModal(`Delete ${campaign?.name || campaignId}? This removes its strategy and campaign-specific drafts/templates.`);
  if (!ok) return;
  removeCampaignScopedRecords(campaignId);
  state.campaigns = (state.campaigns || []).filter((item) => item.id !== campaignId);
  const nextCampaign = (state.campaigns || []).find((item) => item.companyId === companyId && item.brandId === brandId) || {};
  state.context = {
    ...state.context,
    companyId,
    brandId,
    campaignId: nextCampaign.id || "",
  };
  await saveProductionState();
  renderCompanies();
  renderCampaigns();
  renderTemplates();
  renderOperatorDrawer();
}

function saveCampaignWorkspace() {
  const workspace = document.querySelector("#campaign-workspace");
  const valueFor = (field) => workspace?.querySelector(`[data-campaign-field="${field}"]`)?.value || "";
  const brandId = normalizeId(valueFor("contextBrandId") || state.context?.brandId, "brandId");
  const brand = (state.brands || []).find((item) => item.id === brandId) || {};
  const companyId = brand.companyId || state.context?.companyId || "";
  const campaignId = normalizeId(valueFor("contextCampaignId") || state.context?.campaignId, "campaignId");
  const campaign = (state.campaigns || []).find((item) => item.id === campaignId);
  if (campaign) {
    campaign.companyId = companyId;
    campaign.brandId = brandId;
    campaign.name = valueFor("campaignName") || campaign.name;
    campaign.status = normalizeId(valueFor("campaignStatus") || campaign.status, "campaignStatus");
    campaign.postTags = valueFor("campaignPostTags").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  }
  let strategy = (state.contentStrategies || []).find((item) => item.campaignId === campaignId);
  if (!strategy && campaign) {
    ensureStrategyRecord(campaign);
    strategy = (state.contentStrategies || []).find((item) => item.campaignId === campaignId);
  }
  if (strategy) {
    strategy.companyId = companyId;
    strategy.brandId = brandId;
    strategy.updatedAt = new Date().toISOString();
  }
  (state.campaignGuidanceModules || [])
    .filter((module) => module.campaignId === campaignId)
    .forEach((module) => {
      module.companyId = companyId;
      module.brandId = brandId;
      const field = workspace?.querySelector(`[data-campaign-guidance-module-content="${module.id}"]`);
      if (!field) return;
      module.content = field.value || "";
      module.updatedAt = new Date().toISOString();
    });
  syncCampaignGuidanceModulesToStrategy(campaignId);
  return { companyId, brandId, campaignId };
}

function syncCampaignGuidanceModulesToStrategy(campaignId) {
  const modules = (state.campaignGuidanceModules || []).filter((module) => module.campaignId === campaignId && module.enabled !== false);
  const strategy = (state.contentStrategies || []).find((item) => item.campaignId === campaignId);
  if (!strategy) return;
  const moduleByStrategyField = (field) => modules.find((module) => module.strategyField === field);
  strategy.cta = moduleByStrategyField("cta")?.content || strategy.cta || "";
  strategy.offer = moduleByStrategyField("offer")?.content || strategy.offer || "";
  strategy.goals = listValueFromText(moduleByStrategyField("goals")?.content);
  strategy.audience = listValueFromText(moduleByStrategyField("audience")?.content);
  strategy.pillars = listValueFromText(moduleByStrategyField("pillars")?.content);
  strategy.referenceAccounts = listValueFromText(moduleByStrategyField("referenceAccounts")?.content);
  strategy.guidanceModules = modules.map(guidanceModuleSnapshot);
  strategy.updatedAt = new Date().toISOString();
}

function listValueForBrandField(workspace, field) {
  return (workspace?.querySelector(`[data-brand-field="${field}"]`)?.value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function removeCompanyScopedRecords(companyId, brandIds = new Set(), campaignIds = new Set()) {
  removeBrandCollectionRecords(brandIds);
  removeCampaignCollectionRecords(campaignIds);
  state.brands = (state.brands || []).filter((brand) => brand.companyId !== companyId);
  state.campaigns = (state.campaigns || []).filter((campaign) => campaign.companyId !== companyId && !campaignIds.has(campaign.id));
  state.socialAccounts = (state.socialAccounts || []).filter((account) => account.companyId !== companyId);
  state.socialTemplates = (state.socialTemplates || []).filter((template) => template.companyId !== companyId);
  state.creativeAssets = (state.creativeAssets || []).filter((asset) => asset.companyId !== companyId);
  state.creativeNeeds = (state.creativeNeeds || []).filter((need) => need.context?.companyId !== companyId);
  state.approvalPolicies = (state.approvalPolicies || []).filter((policy) => policy.companyId !== companyId);
}

function removeBrandScopedRecords(companyId, brandId, campaignIds = new Set()) {
  removeBrandCollectionRecords(new Set([brandId]));
  removeCampaignCollectionRecords(campaignIds);
  state.campaigns = (state.campaigns || []).filter((campaign) => campaign.brandId !== brandId);
  state.socialAccounts = (state.socialAccounts || []).filter((account) => account.brandId !== brandId);
  state.socialTemplates = (state.socialTemplates || []).filter((template) => template.brandId !== brandId);
  state.creativeAssets = (state.creativeAssets || []).filter((asset) => asset.brandId !== brandId);
  state.creativeNeeds = (state.creativeNeeds || []).filter((need) => need.context?.brandId !== brandId);
  state.approvalPolicies = (state.approvalPolicies || []).filter((policy) => policy.brandId !== brandId);
  state.context = { ...state.context, companyId, brandId: "", campaignId: "" };
}

function removeCampaignScopedRecords(campaignId) {
  removeCampaignCollectionRecords(new Set([campaignId]));
}

function removeBrandCollectionRecords(brandIds = new Set()) {
  state.brandLibraries = (state.brandLibraries || []).filter((library) => !brandIds.has(library.brandId));
  state.claimLibraries = (state.claimLibraries || []).filter((library) => !brandIds.has(library.brandId));
  state.brandGuidanceModules = (state.brandGuidanceModules || []).filter((module) => !brandIds.has(module.brandId));
}

function removeCampaignCollectionRecords(campaignIds = new Set()) {
  state.contentStrategies = (state.contentStrategies || []).filter((strategy) => !campaignIds.has(strategy.campaignId));
  state.campaignGuidanceModules = (state.campaignGuidanceModules || []).filter((module) => !campaignIds.has(module.campaignId));
  state.socialTemplates = (state.socialTemplates || []).filter((template) => !campaignIds.has(template.campaignId));
  state.creativeAssets = (state.creativeAssets || []).filter((asset) => !campaignIds.has(asset.campaignId));
  state.creativeNeeds = (state.creativeNeeds || []).filter((need) => !campaignIds.has(need.context?.campaignId));
  state.postPackages = (state.postPackages || []).filter((postPackage) => !campaignIds.has(postPackage.context?.campaignId));
  state.platformDrafts = (state.platformDrafts || []).filter((draft) => !campaignIds.has(draft.context?.campaignId) && !campaignIds.has(draft.campaignId));
  state.drafts = (state.drafts || []).filter((draft) => !campaignIds.has(draft.context?.campaignId) && !campaignIds.has(draft.campaignId));
  state.scheduledPosts = (state.scheduledPosts || []).filter((post) => !campaignIds.has(post.context?.campaignId));
}

function selectFirstAvailableScope() {
  const company = (state.companies || [])[0] || {};
  const brand = (state.brands || []).find((item) => item.companyId === company.id) || {};
  const campaign = (state.campaigns || []).find((item) => item.companyId === company.id && item.brandId === brand.id) || {};
  state.context = {
    ...state.context,
    companyId: company.id || "",
    brandId: brand.id || "",
    campaignId: campaign.id || "",
  };
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
  const library = (state.brandLibraries || []).find((item) => item.brandId === brand.id) || {};
  const claims = (state.claimLibraries || []).find((item) => item.brandId === brand.id) || {};
  guidanceModulesForBrand(brand.id, library, claims);
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
  const companyId = state.context?.companyId || (state.companies || [])[0]?.id || "";
  const brandId = state.context?.brandId || (state.brands || []).find((brand) => brand.companyId === companyId)?.id || "";
  const templates = templatesForScope(companyId, brandId);
  const templateGroups = groupSocialTemplates(templates);
  const assets = assetsForScope(companyId, brandId);
  const slots = creativeNeedsForScope(companyId, brandId);
  target.innerHTML = `
    <aside class="template-summary" aria-label="Template summary">
      <article>
        <span class="eyebrow">Company</span>
        <select data-template-scope-field="companyId">${companyOptions(companyId)}</select>
      </article>
      <article>
        <span class="eyebrow">Brand</span>
        <select data-template-scope-field="brandId">${brandOptions(companyId, brandId)}</select>
      </article>
      <article>
        <span class="eyebrow">Templates</span>
        <strong>${templateGroups.length}</strong>
      </article>
      <article>
        <span class="eyebrow">Assets</span>
        <strong>${assets.length}</strong>
      </article>
    </aside>
    <section class="template-columns" aria-label="Reusable template columns">
      <article id="template-creative-column" class="template-column">
        <header>
          <h2>Creative templates</h2>
          <span class="count">${templateGroups.length}</span>
        </header>
        <div class="template-list">
          ${templateGroups.map(renderTemplateCard).join("") || `<div class="empty-column">No templates</div>`}
        </div>
      </article>
      <article id="template-asset-column" class="template-column">
        <header>
          <h2>Asset library</h2>
          <span class="count">${assets.length}</span>
        </header>
        <div class="template-list">
          ${assets.map(renderAssetCard).join("") || `<div class="empty-column">No assets</div>`}
        </div>
      </article>
      <article id="template-needs-column" class="template-column">
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

function handleTemplateShortcut(event) {
  const button = event.target.closest("[data-template-shortcut]");
  if (!button) return;
  document.getElementById(button.dataset.templateShortcut || "")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleBrandShortcut(event) {
  const button = event.target.closest("[data-brand-shortcut]");
  if (!button) return;
  document.getElementById(button.dataset.brandShortcut || "")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function handleTemplateScopeChange(event) {
  const field = event.target.closest("[data-template-scope-field]");
  if (!field) return;
  if (field.dataset.templateScopeField === "companyId") {
    const companyId = normalizeId(field.value, "companyId");
    const brandId = (state.brands || []).find((brand) => brand.companyId === companyId)?.id || "";
    state.context = {
      ...state.context,
      companyId,
      brandId,
    };
  }
  if (field.dataset.templateScopeField === "brandId") {
    state.context = {
      ...state.context,
      brandId: normalizeId(field.value, "brandId"),
    };
  }
  await saveProductionState();
  renderTemplates();
}

function templatesForScope(companyId, brandId) {
  return (state.socialTemplates || []).filter((template) => {
    return (!companyId || template.companyId === companyId)
      && (!brandId || template.brandId === brandId);
  });
}

function assetsForScope(companyId, brandId) {
  return (state.assetLibrary || []).filter((asset) => {
    return (!companyId || asset.companyId === companyId)
      && (!brandId || asset.brandId === brandId);
  });
}

function creativeNeedsForScope(companyId, brandId) {
  return (state.editorialSlots || []).filter((slot) => {
    const context = slot.context || slot;
    return (!companyId || context.companyId === companyId)
      && (!brandId || context.brandId === brandId);
  });
}

function groupSocialTemplates(templates = []) {
  const groups = new Map();
  templates.forEach((template) => {
    const key = [
      template.companyId || "company",
      template.brandId || "brand",
      template.campaignId || "campaign",
      template.type || "template",
    ].join("::");
    const existing = groups.get(key) || {
      ...template,
      platforms: [],
      variants: [],
    };
    existing.platforms.push(template.platform || "x");
    existing.variants.push(template);
    groups.set(key, existing);
  });
  return [...groups.values()].sort((left, right) => templateTitle(left).localeCompare(templateTitle(right)));
}

function renderTemplateCard(templateGroup) {
  const info = templateInfo(templateGroup.type);
  const variants = [...(templateGroup.variants || [])].sort((left, right) => platformLabel(left.platform).localeCompare(platformLabel(right.platform)));
  return `
    <details class="template-card">
      <summary>
        <strong>${escapeHtml(templateTitle(templateGroup))}</strong>
        <span>${variants.length} platforms</span>
      </summary>
      <div class="template-card-body">
        <p>${escapeHtml(info.description)}</p>
        <section class="template-purpose-grid" aria-label="Template purpose">
          <article>
            <span class="eyebrow">Creates</span>
            <strong>${escapeHtml(info.creates)}</strong>
          </article>
          <article>
            <span class="eyebrow">Good for</span>
            <strong>${escapeHtml(info.goodFor)}</strong>
          </article>
          <article>
            <span class="eyebrow">Needs</span>
            <strong>${escapeHtml(info.needs)}</strong>
          </article>
          <article>
            <span class="eyebrow">Output</span>
            <strong>${escapeHtml(info.output)}</strong>
          </article>
        </section>
        <dl class="template-meta">
          <div><dt>Campaign</dt><dd>${escapeHtml(campaignName(templateGroup.campaignId))}</dd></div>
          <div><dt>Safe zone rule</dt><dd>${escapeHtml(templateGroup.safeZone || variants[0]?.safeZone || "Not set")}</dd></div>
        </dl>
        <section class="template-platforms" aria-label="Platform variants">
          <h3>Platform variants</h3>
          <p>Open the platform you plan to use. Each variant keeps the same creative idea but carries its own platform target and crop guidance.</p>
          <div class="template-platform-list">
            ${variants.map(renderTemplatePlatformVariant).join("")}
          </div>
        </section>
      </div>
    </details>
  `;
}

function renderTemplatePlatformVariant(template) {
  return `
    <details class="template-platform-variant">
      <summary>
        <strong>${escapeHtml(platformLabel(template.platform))}</strong>
        <span>${escapeHtml(template.id || "template")}</span>
      </summary>
      <dl>
        <div><dt>Use this for</dt><dd>${escapeHtml(template.notes || templateInfo(template.type).goodFor)}</dd></div>
        <div><dt>Safe zone</dt><dd>${escapeHtml(template.safeZone || "Not set")}</dd></div>
        <div><dt>Template ID</dt><dd>${escapeHtml(template.id || "Not set")}</dd></div>
      </dl>
    </details>
  `;
}

function templateTitle(template = {}) {
  const labels = {
    leaderboard: "Leaderboard Graphic",
    prize: "Prize Payout Graphic",
    country: "Country Pride Graphic",
    founder: "Founder / Investor Graphic",
    campaign: "Campaign Explainer Graphic",
  };
  return labels[template.type] || `${titleCase(template.type || "Creative")} Template`;
}

function templateInfo(type = "") {
  const info = {
    leaderboard: {
      description: "Creates a social image that makes the leaderboard feel active and competitive.",
      creates: "Leaderboard card",
      goodFor: "Showing top players, country movement, and proof that the game is alive.",
      needs: "Leaderboard rows, countries, scores, CTA",
      output: "1200x675 social image",
    },
    prize: {
      description: "Creates a prize graphic that makes payouts easy to understand at a glance.",
      creates: "Prize payout card",
      goodFor: "Announcing the prize pool, payout places, and why users should join.",
      needs: "Prize amounts, placement labels, CTA",
      output: "1200x675 social image",
    },
    country: {
      description: "Creates a country-pride campaign graphic for World Cup audience targeting.",
      creates: "Country campaign card",
      goodFor: "Calling out fans by country and pushing them toward the leaderboard.",
      needs: "Country name, flag/icon, headline, CTA",
      output: "1200x675 social image",
    },
    founder: {
      description: "Creates a founder or investor outreach graphic connected to the campaign.",
      creates: "Founder/investor card",
      goodFor: "Investor updates, partner outreach, and founder-led campaign posts.",
      needs: "Founder name, proof points, investor CTA",
      output: "1200x675 social image",
    },
    campaign: {
      description: "Creates a simple explainer graphic that tells users how the campaign works.",
      creates: "Campaign explainer card",
      goodFor: "Explaining the three-step user flow: join, pick, climb.",
      needs: "Steps, campaign headline, CTA",
      output: "1200x675 social image",
    },
  };
  return info[type] || {
    description: "Reusable creative template for campaign social media.",
    creates: "Social creative",
    goodFor: "Repeated campaign posts with consistent structure.",
    needs: "Campaign copy, CTA, asset rules",
    output: "Platform-ready creative",
  };
}

function renderAssetCard(asset) {
  return `
    <details class="template-card asset-card">
      <summary>
        <strong>${escapeHtml(t(titleCase(asset.type || "asset")))}</strong>
        <span>${escapeHtml(asset.language || "en")}</span>
      </summary>
      <div class="template-card-body">
        <p>${escapeHtml(asset.altText || asset.notes || "Creative asset.")}</p>
        <dl>
          <div><dt>File</dt><dd>${escapeHtml(asset.filePath || "Not linked")}</dd></div>
          <div><dt>Safe zone</dt><dd>${escapeHtml(asset.safeZone || "Not set")}</dd></div>
        </dl>
      </div>
    </details>
  `;
}

function renderCreativeNeedCard(slot) {
  return `
    <details class="template-card">
      <summary>
        <strong>${escapeHtml(platformLabel(slot.platform))}</strong>
        <span>${escapeHtml(titleCase(slot.status || "planned"))}</span>
      </summary>
      <div class="template-card-body">
        <p>${escapeHtml(slot.assetNeed || slot.topic || "Creative needed.")}</p>
        <dl>
          <div><dt>Topic</dt><dd>${escapeHtml(slot.topic || "No topic")}</dd></div>
          <div><dt>Language</dt><dd>${escapeHtml(slot.language || "en")}</dd></div>
        </dl>
      </div>
    </details>
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
  const automationLicenseCheck = evaluateDiamondLicense(license, {
    requestedBrands: [state.context?.brandId].filter(Boolean),
    requestedPlatforms: [state.context?.platform].filter(Boolean),
    requestedAutomationPlatforms: [state.context?.platform].filter(Boolean),
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
  const expertReview = evaluateExpertChecklist(state);
  const autoPublishReadiness = evaluateAutoPublishReadiness({
    workspace: state,
    context: state.context,
    licenseCheck: automationLicenseCheck,
  });
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
      <button type="button" data-settings-action="copy-expert-checklist">${escapeHtml(t("Copy Expert Checklist"))}</button>
      <button type="button" data-settings-action="copy-auto-publish-decision">${escapeHtml(t("Copy Auto-Publish Decision"))}</button>
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
      ${renderExpertChecklistPanel(expertReview)}
      ${renderAutoPublishGatePanel(autoPublishReadiness)}
    </section>
    <section id="settings-legal" class="legal-settings" aria-label="Legal drafts">
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

function handleSettingsShortcut(event) {
  const button = event.target.closest("[data-settings-shortcut]");
  if (!button) return;
  const target = document.getElementById(button.dataset.settingsShortcut || "");
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function handleSettingsAction(event) {
  const button = event.target.closest("[data-settings-action]");
  if (!button) return;
  if (button.dataset.settingsAction === "select-theme") {
    await updateThemeSetting(button.dataset.themeId || state.themeId);
    return;
  }
  if (button.dataset.settingsAction === "go-first-run-step") {
    goToFirstRunStep(button.dataset.firstRunStep || "");
    return;
  }
  if (button.dataset.settingsAction === "go-first-run-next") {
    goToFirstRunNextStep();
    return;
  }
  await runSettingsAction(button.dataset.settingsAction);
}

async function handleSettingsChange(event) {
  const field = event.target.closest("[data-settings-field]");
  if (!field) return;
  if (field.dataset.settingsField === "themeId") {
    await updateThemeSetting(field.value);
  }
  if (field.dataset.settingsField === "customThemeSwatch") {
    await updateCustomThemeSwatch(field.dataset.swatchIndex, field.value);
  }
  if (field.dataset.settingsField === "operatorLanguage") {
    state.operatorLanguage = normalizeOperatorLanguage(field.value);
    applyOperatorLanguage();
    await saveProductionState();
    renderBoard(buildPlatformDraftBoardView(buildProductionPostModel(state), activeBoardPlatformFilter, activeBoardCompanyFilter));
    renderCalendar();
    renderAnalytics();
    renderTemplates();
    renderAccounts(selectedAccountId);
    renderSettings();
    renderOperatorDrawer();
    reopenActiveDetail();
  }
  if (field.dataset.settingsField === "beginnerMode") {
    state.beginnerMode = field.checked;
    applyBeginnerMode();
    await saveProductionState();
    renderBoard(buildPlatformDraftBoardView(buildProductionPostModel(state), activeBoardPlatformFilter, activeBoardCompanyFilter));
    renderCalendar();
    renderSettings();
    reopenActiveDetail();
  }
}

async function updateThemeSetting(themeId) {
  state.themeId = normalizeThemeId(themeId);
  if (state.themeId === "custom") {
    state.customThemeSwatches = normalizeCustomThemeSwatches(state.customThemeSwatches, themeSwatchesFor("graphite-red"));
  }
  applyDiamondTheme(state.themeId);
  await saveProductionState();
  renderSettings();
}

function handleSettingsInput(event) {
  const colorField = event.target.closest('[data-settings-field="customThemeSwatch"]');
  if (colorField) {
    updateCustomThemeSwatch(colorField.dataset.swatchIndex, colorField.value, { save: false });
    return;
  }
  const field = event.target.closest("[data-manual-search]");
  if (!field) return;
  manualSearchTerm = field.value || "";
  renderUserManualResults();
}

async function updateCustomThemeSwatch(index, color, options = {}) {
  const swatches = normalizeCustomThemeSwatches(state.customThemeSwatches, themeSwatchesFor(state.themeId));
  const swatchIndex = Number(index);
  if (!Number.isInteger(swatchIndex) || swatchIndex < 0 || swatchIndex > 3) return;
  swatches[swatchIndex] = normalizeHexColor(color, swatches[swatchIndex]);
  state.customThemeSwatches = swatches;
  state.themeId = "custom";
  applyDiamondTheme(state.themeId);
  if (options.save !== false) {
    await saveProductionState();
    renderSettings();
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
  if (action === "copy-expert-checklist") {
    await window.diamond?.writeClipboard?.(expertChecklistMarkdown(evaluateExpertChecklist(state)));
    latestGuideMessage = "Copied the expert checklist review.";
    renderSettings();
  }
  if (action === "copy-auto-publish-decision") {
    const license = state.licenseCache || createTemporaryUnlimitedDiamondLicense({
      userId: "scott",
      brands: [state.context?.brandId].filter(Boolean),
      platforms: (state.socialAccounts || []).map((account) => account.platform),
    });
    const automationLicenseCheck = evaluateDiamondLicense(license, {
      requestedBrands: [state.context?.brandId].filter(Boolean),
      requestedPlatforms: [state.context?.platform].filter(Boolean),
      requestedAutomationPlatforms: [state.context?.platform].filter(Boolean),
    });
    await window.diamond?.writeClipboard?.(autoPublishDecisionMarkdown(evaluateAutoPublishReadiness({
      workspace: state,
      context: state.context,
      licenseCheck: automationLicenseCheck,
    })));
    latestGuideMessage = "Copied the auto-publish decision.";
    renderSettings();
  }
  if (action === "copy-guide") {
    await window.diamond?.writeClipboard?.(buildGuideMarkdown());
    latestGuideMessage = "Copied the Diamond user guide.";
    renderSettings();
  }
  if (action === "copy-operator-manual") {
    await window.diamond?.writeClipboard?.(operatorManual.text || buildGuideMarkdown());
    latestGuideMessage = operatorManual.ok ? "Copied the full Diamond operator manual." : "Copied the in-app guide because the manual file was unavailable.";
    renderSettings();
  }
  if (action === "open-operator-manual") {
    const result = await window.diamond?.openOperatorManual?.();
    latestGuideMessage = result ? `Manual open result: ${result}` : "Opened the full Diamond operator manual.";
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
  if (action === "start-first-run") {
    startFirstRunTour();
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
  state.customThemeSwatches = readCustomThemeSwatchesFromSettings();
  state.operatorLanguage = normalizeOperatorLanguage(getSettingsFieldValue("operatorLanguage") || state.operatorLanguage);
  state.beginnerMode = getSettingsChecked("beginnerMode", state.beginnerMode);
  applyDiamondTheme(state.themeId);
  applyOperatorLanguage();
  applyBeginnerMode();
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

function getSettingsChecked(field, fallback = false) {
  const input = document.querySelector(`[data-settings-field="${field}"]`);
  return input ? Boolean(input.checked) : Boolean(fallback);
}

function renderLicenseSettingsPanel(license, licenseCheck, model) {
  return `
    <article id="settings-license" class="settings-panel editable-settings">
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
  const customSwatches = normalizeCustomThemeSwatches(state.customThemeSwatches, theme.swatches);
  return `
    <article class="settings-panel editable-settings">
      <header>
        <h2>Theme</h2>
        <span class="count">${selectedTheme === "custom" ? "Custom" : "CSS module"}</span>
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
        <div><dt>Swatches</dt><dd>${renderCustomThemeSwatches(customSwatches)}</dd></div>
        <div><dt>Palette source</dt><dd>Professional mockups set</dd></div>
      </dl>
      <div class="theme-choice-grid" aria-label="Theme choices">
        ${themes.map((item) => `
          <button type="button" class="theme-choice ${item.id === selectedTheme ? "active" : ""}" data-settings-action="select-theme" data-theme-id="${escapeHtml(item.id)}" aria-pressed="${item.id === selectedTheme ? "true" : "false"}">
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.description)}</span>
            <span class="theme-swatch-row">${item.swatches.map((color) => `<span class="theme-swatch" style="--theme-swatch:${escapeHtml(color)}" title="${escapeHtml(color)}"></span>`).join("")}</span>
          </button>
        `).join("")}
      </div>
    </article>
  `;
}

function renderCustomThemeSwatches(swatches = []) {
  const labels = ["Sidebar", "Panel", "Action", "Signal"];
  return `
    <span class="theme-swatch-row editable-theme-swatches">
      ${normalizeCustomThemeSwatches(swatches).map((color, index) => `
        <label class="theme-color-picker" title="${escapeHtml(`${labels[index]}: ${color}`)}">
          <span class="theme-swatch" style="--theme-swatch:${escapeHtml(color)}"></span>
          <input data-settings-field="customThemeSwatch" data-swatch-index="${index}" type="color" value="${escapeHtml(color)}" aria-label="${escapeHtml(labels[index])} color">
        </label>
      `).join("")}
    </span>
  `;
}

function renderLanguageSettingsPanel() {
  const language = currentOperatorLanguage();
  const beginnerMode = normalizeBeginnerMode(state.beginnerMode);
  return `
    <article class="settings-panel editable-settings">
      <header>
        <h2>${escapeHtml(t("Operator"))}</h2>
        <span class="count">${escapeHtml(beginnerMode ? "Beginner on" : language === "es" ? "Espanol" : "English")}</span>
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
        <div class="settings-toggle-row">
          <dt>Beginner mode</dt>
          <dd>
            <label class="settings-toggle">
              <input data-settings-field="beginnerMode" type="checkbox" ${beginnerMode ? "checked" : ""}>
              <span>Show extra workflow explanations while learning Diamond.</span>
            </label>
          </dd>
        </div>
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
          <button type="button" data-settings-action="start-first-run">Start first-run flow</button>
          <button type="button" data-settings-action="start-tour">Start walkthrough</button>
          <button type="button" data-settings-action="copy-guide">Copy guide</button>
          <button type="button" data-settings-action="copy-operator-manual">Copy full manual</button>
          <button type="button" data-settings-action="open-operator-manual">Open manual file</button>
          <button type="button" data-settings-action="copy-tour-script">Copy script</button>
          <button type="button" data-settings-action="copy-elevenlabs-request">Copy ElevenLabs request</button>
        </div>
      </header>
      ${latestGuideMessage ? `<div class="guide-message">${escapeHtml(latestGuideMessage)}</div>` : ""}
      ${renderFirstRunPanel()}
      ${renderOperatorManualBrowser()}
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

function renderFirstRunPanel() {
  const progress = firstRunProgress();
  const completeCount = progress.filter((item) => item.complete).length;
  const nextStep = progress.find((item) => !item.complete);
  return `
    <section class="first-run-panel" aria-labelledby="first-run-heading">
      <header>
        <div>
          <span class="eyebrow">First run</span>
          <h3 id="first-run-heading">Post safely for the first time</h3>
          <p>Use this checklist the first few times you operate Diamond. It keeps company setup, account setup, staging, proof, and posted status in the right order.</p>
        </div>
        <div class="first-run-actions">
          <span>${completeCount}/${progress.length} done</span>
          <button type="button" data-settings-action="go-first-run-next" ${nextStep ? "" : "disabled"}>${nextStep ? "Go to next step" : "First run complete"}</button>
          <button type="button" data-settings-action="start-first-run">Start guided flow</button>
        </div>
      </header>
      <div class="first-run-next ${nextStep ? "current" : "complete"}">
        <strong>${escapeHtml(nextStep ? `Next: ${nextStep.title}` : "Complete")}</strong>
        <span>${escapeHtml(nextStep ? nextStep.detail : "The first-run path has enough evidence to call it complete. Keep using proof and metrics as you post more.")}</span>
      </div>
      <ol>
        ${progress.map((step) => `
          <li class="${step.complete ? "complete" : step.current ? "current" : "pending"}">
            <strong>${escapeHtml(step.title)}</strong>
            <span>${escapeHtml(step.complete ? step.doneDetail : step.detail)}</span>
            <em>${escapeHtml(step.complete ? "Done" : step.current ? "Next" : "Open")}</em>
            <button type="button" data-settings-action="go-first-run-step" data-first-run-step="${escapeHtml(step.id)}">${escapeHtml(step.buttonLabel || "Go")}</button>
          </li>
        `).join("")}
      </ol>
    </section>
  `;
}

function goToFirstRunStep(stepId) {
  const step = firstRunProgress().find((item) => item.id === stepId);
  if (!step) return;
  if (step.viewId) {
    navigatePrototypeView(step.viewId);
  }
  if (step.openFirstPackage) {
    const postPackage = prototypeModel.postPackages?.[0];
    if (postPackage) openPackageDetail(postPackage.id);
    else openCreateDetail();
  }
  if (step.openOperator) {
    const drawer = document.querySelector("#operator-drawer");
    if (drawer?.classList.contains("hidden")) toggleOperatorDrawer();
  }
  if (step.focusSelector) {
    window.requestAnimationFrame(() => {
      document.querySelector(step.focusSelector)?.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
    });
  }
}

function goToFirstRunNextStep() {
  const nextStep = firstRunProgress().find((item) => !item.complete);
  if (nextStep) goToFirstRunStep(nextStep.id);
}

function navigatePrototypeView(viewId) {
  showPrototypeView(viewId);
  document.querySelectorAll("#prototype-nav a").forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
}

function firstRunProgress() {
  const activeCompany = (state.companies || []).find((company) => company.id === state.context?.companyId);
  const activeBrand = (state.brands || []).find((brand) => brand.id === state.context?.brandId);
  const activeCampaign = (state.campaigns || []).find((campaign) => campaign.id === state.context?.campaignId);
  const activeStrategy = (state.contentStrategies || []).find((strategy) => (
    strategy.companyId === state.context?.companyId
    && strategy.brandId === state.context?.brandId
    && strategy.campaignId === state.context?.campaignId
  )) || {};
  const activeAccount = (state.socialAccounts || []).find((account) => account.id === state.context?.socialAccountId)
    || (state.socialAccounts || []).find((account) => account.platform === state.context?.platform);
  const platformDrafts = prototypeModel.platformDrafts || [];
  const evaluatedDraft = platformDrafts.find((draft) => draft.evaluatedAt || Number.isFinite(Number(draft.qualityScore)) || (draft.riskDetails || []).length);
  const approvedDraft = platformDrafts.find((draft) => ["approved", "scheduled", "staged", "published", "posted"].includes(draft.status) || draft.approvedAt);
  const stagedDraft = platformDrafts.find((draft) => ["staged", "published", "posted"].includes(draft.status) || draft.stagedAt || draft.stageUrl || draft.stageResult?.openedUrl);
  const proofedDraft = platformDrafts.find((draft) => draft.proofCapturedAt || draft.proofKind || draft.lastProofRunId);
  const postedDraft = platformDrafts.find((draft) => ["published", "posted"].includes(draft.status) || draft.publishedAt);
  const postedRun = (state.postRuns || []).find((run) => run.status === "posted");
  const metricsRun = (state.postRuns || []).find((run) => run.metrics);
  const checks = {
    "first-run-company": {
      complete: Boolean(activeCompany && activeBrand && activeCampaign && activeStrategy.goals && activeStrategy.audience && (activeStrategy.pillars || []).length),
      detail: "Open Brands and confirm the active company, brand, campaign, goals, audience, pillars, and voice.",
      doneDetail: `Active scope is set to ${activeCompany?.name || "company"} / ${activeBrand?.name || "brand"} / ${activeCampaign?.name || "campaign"}.`,
      buttonLabel: "Go to Brands",
      viewId: "brands-view",
      focusSelector: "#brand-workspace",
    },
    "first-run-account": {
      complete: Boolean(activeAccount && activeAccount.sessionStatus === "ready"),
      detail: "Open Accounts, choose the social account, log in manually if needed, and mark the session ready.",
      doneDetail: `${platformLabel(activeAccount?.platform)} account ${activeAccount?.handle || activeAccount?.id || ""} is marked ready.`,
      buttonLabel: "Go to Accounts",
      viewId: "accounts-view",
      focusSelector: "#account-detail",
    },
    "first-run-create": {
      complete: Boolean((prototypeModel.postPackages || []).length),
      detail: "Create or open a post package so Diamond has one source idea to work from.",
      doneDetail: `${prototypeModel.postPackages.length} post package${prototypeModel.postPackages.length === 1 ? "" : "s"} exist in the workspace.`,
      buttonLabel: "Go to Posts",
      viewId: "posts-view",
      focusSelector: "#posts-board",
    },
    "first-run-draft": {
      complete: Boolean(platformDrafts.length),
      detail: "Open a post package and confirm at least one platform draft exists.",
      doneDetail: `${platformDrafts.length} platform draft${platformDrafts.length === 1 ? "" : "s"} are available for review.`,
      buttonLabel: "Open Draft",
      viewId: "posts-view",
      openFirstPackage: true,
      focusSelector: "#platform-previews",
    },
    "first-run-evaluate": {
      complete: Boolean(evaluatedDraft && approvedDraft),
      detail: evaluatedDraft ? "The draft has been evaluated. Approve it when it is clean enough to stage." : "Click Evaluate, read the result, edit if needed, then click Approve.",
      doneDetail: `A ${platformLabel(approvedDraft?.platform)} draft has been evaluated and approved or moved beyond approval.`,
      buttonLabel: "Open Actions",
      viewId: "posts-view",
      openFirstPackage: true,
      focusSelector: ".platform-action-row",
    },
    "first-run-stage": {
      complete: Boolean(stagedDraft),
      detail: "Stage an approved draft in the visible browser. Remember: staging prepares the composer, it does not publish.",
      doneDetail: `A ${platformLabel(stagedDraft?.platform)} draft has been staged or opened for manual finish.`,
      buttonLabel: "Open Operator",
      viewId: "posts-view",
      openFirstPackage: true,
      openOperator: true,
      focusSelector: "#operator-drawer",
    },
    "first-run-proof": {
      complete: Boolean(proofedDraft),
      detail: "Capture proof with a screenshot, URL, or run record after staging or posting.",
      doneDetail: `Proof exists for a ${platformLabel(proofedDraft?.platform)} draft.`,
      buttonLabel: "Open Proof",
      viewId: "posts-view",
      openFirstPackage: true,
      openOperator: true,
      focusSelector: ".draft-proof-panel",
    },
    "first-run-posted": {
      complete: Boolean(postedDraft || postedRun),
      detail: "After the post is live, click Mark Posted. Add metrics later when results are available.",
      doneDetail: metricsRun ? "A post is marked posted and at least one metrics record exists." : "A post is marked posted. Metrics can be added later.",
      buttonLabel: "Go to Analytics",
      viewId: "analytics-view",
      focusSelector: "#analytics-workspace",
    },
  };
  let foundCurrent = false;
  return firstRunSteps.map((step) => {
    const check = checks[step.id] || {
      complete: false,
      detail: step.checklistText,
      doneDetail: step.checklistText,
    };
    const current = !check.complete && !foundCurrent;
    if (current) foundCurrent = true;
    return {
      ...step,
      ...check,
      current,
    };
  });
}

function renderOperatorManualBrowser() {
  const entries = operatorManualEntries(operatorManual.text);
  return `
    <section class="manual-browser" aria-label="Full Diamond operator manual">
      <header>
        <div>
          <h3>Full operator manual</h3>
          <p>${escapeHtml(operatorManual.ok ? `${entries.length} searchable sections from ${operatorManual.path}` : operatorManual.reason)}</p>
        </div>
        <input data-manual-search type="search" value="${escapeHtml(manualSearchTerm)}" placeholder="Search manual: proof, X, schedule, blocked...">
      </header>
      <div id="manual-results" class="manual-results">
        ${renderManualResults(entries, manualSearchTerm)}
      </div>
    </section>
  `;
}

function renderUserManualResults() {
  const target = document.querySelector("#manual-results");
  if (!target) return;
  target.innerHTML = renderManualResults(operatorManualEntries(operatorManual.text), manualSearchTerm);
}

function renderManualResults(entries, query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const matches = normalizedQuery
    ? entries.filter((entry) => `${entry.title} ${entry.body}`.toLowerCase().includes(normalizedQuery))
    : entries.slice(0, 12);
  return matches.slice(0, 16).map((entry) => `
    <article class="manual-result">
      <h4>${escapeHtml(entry.title)}</h4>
      <p>${escapeHtml(excerptManualEntry(entry, normalizedQuery))}</p>
    </article>
  `).join("") || `<div class="manual-empty">No manual sections matched that search.</div>`;
}

function operatorManualEntries(text = "") {
  const lines = String(text || "").split(/\r?\n/);
  const entries = [];
  let current = null;
  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      if (current) entries.push(current);
      current = { title: heading[1].trim(), body: "" };
    } else if (current) {
      current.body += `${line}\n`;
    }
  }
  if (current) entries.push(current);
  return entries.map((entry) => ({
    title: entry.title,
    body: entry.body.replace(/\n{3,}/g, "\n\n").trim(),
  }));
}

function excerptManualEntry(entry, query = "") {
  const body = entry.body.replace(/\s+/g, " ").trim();
  if (!query) return body.slice(0, 260);
  const index = body.toLowerCase().indexOf(query);
  if (index < 0) return body.slice(0, 260);
  return body.slice(Math.max(0, index - 90), index + 220);
}

function buildGuideMarkdown() {
  return [
    "# Diamond User Guide",
    "",
    "## First-Run Flow",
    "",
    ...firstRunSteps.flatMap((step) => [
      `### ${step.title}`,
      step.checklistText,
      "",
    ]),
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
  return [
    ...PROFESSIONAL_THEMES,
    customThemeDefinition(),
  ];
}

function customThemeDefinition() {
  return {
    id: "custom",
    label: "Custom",
    description: "Your four-dot palette for this workspace.",
    swatches: normalizeCustomThemeSwatches(state.customThemeSwatches, PROFESSIONAL_THEMES[0].swatches),
  };
}

function themeSwatchesFor(themeId) {
  const requestedTheme = (themeId === "custom" ? customThemeDefinition() : PROFESSIONAL_THEMES.find((item) => item.id === themeId)) || PROFESSIONAL_THEMES[0];
  return requestedTheme.swatches;
}

function normalizeThemeId(themeId) {
  const legacyThemeMap = {
    broadcast: "graphite-red",
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
  applyCustomThemeVariables(theme);
}

function normalizeCustomThemeSwatches(swatches = [], fallback = PROFESSIONAL_THEMES[0].swatches) {
  const source = Array.isArray(swatches) && swatches.length ? swatches : fallback;
  return [0, 1, 2, 3].map((index) => normalizeHexColor(source[index], fallback[index] || PROFESSIONAL_THEMES[0].swatches[index]));
}

function normalizeHexColor(value, fallback = "#11161d") {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : fallback;
}

function applyCustomThemeVariables(themeId) {
  const body = document.body;
  if (!body) return;
  const customProperties = ["--sidebar", "--surface", "--surface-2", "--card", "--accent", "--metric", "--nav-active", "--line", "--line-strong", "--platform", "--platform-text", "--accent-text"];
  if (themeId !== "custom") {
    customProperties.forEach((property) => body.style.removeProperty(property));
    return;
  }
  const [sidebar, panel, action, signal] = normalizeCustomThemeSwatches(state.customThemeSwatches);
  body.style.setProperty("--sidebar", sidebar);
  body.style.setProperty("--surface", panel);
  body.style.setProperty("--surface-2", mixHexColors(panel, "#ffffff", 0.06));
  body.style.setProperty("--card", mixHexColors(panel, "#000000", 0.28));
  body.style.setProperty("--accent", action);
  body.style.setProperty("--metric", signal);
  body.style.setProperty("--nav-active", mixHexColors(sidebar, action, 0.18));
  body.style.setProperty("--line", mixHexColors(panel, "#ffffff", 0.16));
  body.style.setProperty("--line-strong", mixHexColors(panel, signal, 0.42));
  body.style.setProperty("--platform", mixHexColors(panel, action, 0.18));
  body.style.setProperty("--platform-text", mixHexColors("#ffffff", action, 0.35));
  body.style.setProperty("--accent-text", readableTextColor(action));
}

function mixHexColors(left, right, rightWeight = 0.5) {
  const leftRgb = hexToRgb(normalizeHexColor(left));
  const rightRgb = hexToRgb(normalizeHexColor(right));
  const weight = Math.min(1, Math.max(0, rightWeight));
  const mixed = leftRgb.map((channel, index) => Math.round(channel * (1 - weight) + rightRgb[index] * weight));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(color) {
  const hex = normalizeHexColor(color).slice(1);
  return [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16));
}

function readableTextColor(background) {
  const [red, green, blue] = hexToRgb(background).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return luminance > 0.42 ? "#080808" : "#ffffff";
}

function readCustomThemeSwatchesFromSettings() {
  const fields = [...document.querySelectorAll('[data-settings-field="customThemeSwatch"]')];
  if (!fields.length) return normalizeCustomThemeSwatches(state.customThemeSwatches, themeSwatchesFor(state.themeId));
  return normalizeCustomThemeSwatches(fields.map((field) => field.value), state.customThemeSwatches);
}

function normalizeOperatorLanguage(language) {
  return language === "es" ? "es" : "en";
}

function normalizeBeginnerMode(value) {
  return value !== false;
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
  setStaticText('a[data-view="companies-view"]', "Companies");
  setStaticText('a[data-view="brands-view"]', "Brands");
  setStaticText('a[data-view="campaigns-view"]', "Campaigns");
  setStaticText('a[data-view="settings-view"]', "Settings");
  setStaticText("#operator-toggle", "Operator");
  setStaticText("#posts-view h1", "Posts");
  setStaticText("#analytics-heading", "Analytics");
  setStaticText("#templates-heading", "Templates");
  setStaticText("#calendar-heading", "Calendar");
  setStaticText("#accounts-heading", "Accounts");
  setStaticText("#companies-heading", "Companies");
  setStaticText("#brands-heading", "Brands");
  setStaticText("#campaigns-heading", "Campaigns");
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

function applyBeginnerMode() {
  document.body?.classList.toggle("beginner-mode", normalizeBeginnerMode(state.beginnerMode));
}

function setStaticText(selector, label) {
  const node = document.querySelector(selector);
  if (node) node.textContent = t(label);
}

function renderAccessibilitySettingsPanel() {
  const accessibility = state.accessibility || {};
  return `
    <article id="settings-accessibility" class="settings-panel editable-settings">
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
  const proofQueue = buildPlatformProofQueue(state);
  const proofDashboard = buildPlatformProofDashboard(state);
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

    ${renderPlatformProofDashboardPanel(proofDashboard)}
    ${renderPlatformProofQueuePanel(proofQueue)}

    <section class="operator-panel">
      <header>
        <h3>${escapeHtml(t("Browser Staging"))}</h3>
        <span class="count">${account?.platform === "reddit" ? "5" : "4"}</span>
      </header>
      <div class="operator-action-grid">
        ${renderOperatorAction("Open Account", resolveLoginUrl(account) || "Login URL missing", "open-account", !resolveLoginUrl(account))}
        ${renderOperatorAction("Check Session", `Current state: ${statusLabel(account?.sessionStatus || "unknown")}`, "check-session", !account)}
        ${renderOperatorAction("Record Login Proof", "Marks this account login as proven.", "record-login-proof", !account)}
        ${renderOperatorAction("Stage In Browser", resolveComposeUrl(account) || "Compose URL missing", "stage-browser", !account)}
        ${renderOperatorAction("Capture Proof", `${account?.proofCount || 0} proof captures saved`, "capture-proof", !account)}
        ${renderOperatorAction("Record Media Proof", "Counts a verified media upload proof.", "record-media-proof", !account)}
        ${renderOperatorAction("Record Manual Proof", "Counts a manual staging proof for non-X platforms.", "record-manual-proof", !account)}
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
        ${renderOperatorAction("Copy Proof Queue", "Copies platform proof gaps and next actions.", "copy-proof-queue")}
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

function renderPlatformProofDashboardPanel(dashboard) {
  const totals = dashboard.totals || {};
  const cards = [
    ["Ready", `${totals.ready || 0}`],
    ["Needs proof", `${totals.needsProof || 0}`],
    ["Monitoring", `${totals.monitoringOnly || 0}`],
    ["Login gaps", `${totals.loginOpen || 0}`],
    ["Staging gaps", `${totals.stagingOpen || 0}`],
    ["Media gaps", `${totals.mediaOpen || 0}`],
  ];
  return `
    <section class="operator-panel platform-proof-dashboard-panel">
      <header>
        <h3>Platform Proof Dashboard</h3>
        <span class="count">${escapeHtml(String(dashboard.readinessPercent || 0))}%</span>
      </header>
      <div class="platform-proof-dashboard">
        ${cards.map(([label, value]) => `
          <div>
            <dt>${escapeHtml(label)}</dt>
            <dd>${escapeHtml(value)}</dd>
          </div>
        `).join("")}
      </div>
      <div class="platform-proof-next ${dashboard.complete ? "ready" : "needs_proof"}">
        <strong>${escapeHtml(dashboard.complete ? "All platform proof gates are complete" : `Next proof target: ${dashboard.nextPlatform || "No platform"}`)}</strong>
        <span>${escapeHtml(dashboard.complete ? "Keep recording proof as platforms change." : (dashboard.nextActions || [])[0] || "Record the next platform proof requirement.")}</span>
        ${dashboard.complete ? "" : `<button type="button" data-operator-action="focus-proof-account" data-proof-account-id="${escapeHtml(dashboard.queue?.find((item) => item.status === "needs_proof")?.accountId || "")}">Open proof target</button>`}
      </div>
    </section>
  `;
}

function renderPlatformProofQueuePanel(queue = []) {
  return `
    <section class="operator-panel platform-proof-queue-panel">
      <header>
        <h3>${escapeHtml(t("Proof Queue"))}</h3>
        <span class="count">${queue.filter((item) => item.status === "ready" || item.status === "monitoring_only").length}/${queue.length}</span>
      </header>
      <div class="platform-proof-queue">
        ${queue.map((item) => `
          <article class="platform-proof-queue-item ${escapeHtml(item.status)}">
            <header>
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(statusLabel(item.status))}</span>
            </header>
            <p>${escapeHtml(item.accountHandle || item.accountId || "No account")}</p>
            <ul>
              ${(item.nextActions || []).slice(0, 4).map((action) => `<li>${escapeHtml(action)}</li>`).join("") || `<li>${escapeHtml(item.status === "monitoring_only" ? "Monitoring only. No publishing proof required." : "Proof requirements are complete.")}</li>`}
              ${item.mediaProofGuide && item.status !== "monitoring_only" ? `<li>${escapeHtml(item.mediaProofGuide)}</li>` : ""}
            </ul>
            <button type="button" data-operator-action="focus-proof-account" data-proof-account-id="${escapeHtml(item.accountId || "")}">${escapeHtml(item.status === "ready" || item.status === "monitoring_only" ? "Review account" : "Work proof")}</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

async function handleOperatorAction(event) {
  const button = event.target.closest("[data-operator-action]");
  if (!button || button.disabled) return;
  await runOperatorAction(button.dataset.operatorAction, button.dataset);
}

async function runOperatorAction(action, dataset = {}) {
  const account = activeSocialAccount();
  const draft = activeOperatorDraft(account);
  if (action === "focus-proof-account") {
    return focusProofAccount(dataset.proofAccountId || "");
  }
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
  if (action === "record-login-proof") {
    return recordOperatorProofRequirement(account, "login");
  }
  if (action === "stage-browser") {
    return stageOperatorDraft(account, draft);
  }
  if (action === "capture-proof") {
    return captureOperatorProof(account, draft);
  }
  if (action === "record-media-proof") {
    return recordOperatorProofRequirement(account, "media");
  }
  if (action === "record-manual-proof") {
    return recordOperatorProofRequirement(account, "manual");
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
  if (action === "copy-proof-queue") {
    await window.diamond?.writeClipboard?.(platformProofQueueMarkdown(buildPlatformProofQueue(state)));
    return setOperatorMessage("Copied the platform proof queue.");
  }
}

async function recordOperatorProofRequirement(account, type) {
  if (!account) return setOperatorMessage("Proof update blocked: no active account.");
  const proof = getPlatformProofForAccount(account);
  const notes = `${titleCase(type)} proof recorded manually from Operator.`;
  const next = type === "login"
    ? markPlatformLoginProof(proof, notes)
    : markPlatformProof(proof, type, notes);
  state.platformProofs = (state.platformProofs || []).map((item) => item.id === next.id ? next : item);
  account.proofCount = Number(account.proofCount || 0) + 1;
  account.lastProofAt = next.lastProofAt || next.lastLoginProofAt || new Date().toISOString();
  await saveProductionState();
  await refreshProductionViews();
  renderOperatorDrawer();
  return setOperatorMessage(`${platformLabel(account.platform)} ${type} proof recorded.`);
}

async function focusProofAccount(accountId) {
  const account = (state.socialAccounts || []).find((item) => item.id === accountId);
  if (!account) return setOperatorMessage("Proof target blocked: account was not found.");
  setActiveAccount(account);
  const draft = activeOperatorDraft(account);
  if (draft?.postPackageId) {
    openPackageDetail(draft.postPackageId);
  } else {
    navigatePrototypeView("posts-view");
  }
  renderAccounts(account.id);
  renderOperatorDrawer();
  window.requestAnimationFrame(() => {
    document.querySelector(".proof-session-panel")?.scrollIntoView({ block: "start", inline: "nearest", behavior: "smooth" });
  });
  return setOperatorMessage(`Active proof target set to ${platformLabel(account.platform)} ${account.handle || account.id}.`);
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
      allowCandidateAdapters: true,
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
  await capturePlatformDraftProof(draft, "staged_composer");
  await saveProductionState();
  await refreshProductionViews();
  return setOperatorMessage(`${platformLabel(account.platform)} proof recorded. Total proofs: ${account.proofCount}.`);
}

async function captureRedditFromOperator(account) {
  if (!account) return setOperatorMessage("Reddit capture blocked: no active account.");
  if (account.platform !== "reddit") return setOperatorMessage("Reddit capture blocked: active account is not Reddit.");
  const sourceUrl = await promptForText("Reddit thread/comment URL", account.accountUrl || "https://www.reddit.com/r/");
  const text = await promptForText("Reddit text to classify", "");
  const author = await promptForText("Reddit author", "Reddit user");
  const threadTitle = await promptForText("Reddit thread title", "");
  const result = captureRedditMonitoringItem({
    context: {
      ...(state.context || {}),
      platform: "reddit",
      socialAccountId: account.id,
    },
    socialAccountId: account.id,
    sourceUrl,
    text,
    author,
    subreddit: sourceUrl,
    threadTitle,
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
  if (context.socialAccountId) {
    const byId = (state.socialAccounts || []).find((account) => account.id === context.socialAccountId);
    if (byId) return byId;
  }
  if (context.platform) {
    // Require companyId/brandId match to prevent cross-tenant selection.
    return (state.socialAccounts || []).find((account) =>
      account.platform === context.platform &&
      (!context.companyId || account.companyId === context.companyId) &&
      (!context.brandId || account.brandId === context.brandId)
    );
  }
  // Fail-closed: no first-account fallback. An ambiguous/cleared context must not
  // silently select a wrong-tenant account.
  return undefined;
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
    <article id="settings-${escapeHtml(normalizeId(title, "settings"))}" class="settings-panel">
      <header>
        <h2>${escapeHtml(t(title))}</h2>
      </header>
      <dl>
        ${rows.map(([label, value]) => `<div><dt>${escapeHtml(t(label))}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
      </dl>
    </article>
  `;
}

function renderExpertChecklistPanel(review) {
  return `
    <article class="settings-panel expert-checklist-panel">
      <header>
        <h2>${escapeHtml(t("Expert Checklist"))}</h2>
        <span class="session-pill ${escapeHtml(review.status)}">${escapeHtml(statusLabel(review.status))}</span>
      </header>
      <dl class="expert-checklist-counts">
        <div><dt>${escapeHtml(t("Ready"))}</dt><dd>${escapeHtml(String(review.counts.ready))}</dd></div>
        <div><dt>${escapeHtml(t("Needs Review"))}</dt><dd>${escapeHtml(String(review.counts.needs_review))}</dd></div>
        <div><dt>${escapeHtml(t("Blocked"))}</dt><dd>${escapeHtml(String(review.counts.blocked))}</dd></div>
      </dl>
      <div class="expert-checklist-list">
        ${(review.items || []).map((item) => `
          <section class="expert-checklist-item ${escapeHtml(item.status)}">
            <header>
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(statusLabel(item.status))}</span>
            </header>
            <p>${escapeHtml(item.summary)}</p>
          </section>
        `).join("")}
      </div>
    </article>
  `;
}

function renderAutoPublishGatePanel(readiness) {
  return `
    <article class="settings-panel auto-publish-gate-panel">
      <header>
        <h2>${escapeHtml(t("Auto-Publish Gate"))}</h2>
        <span class="session-pill ${escapeHtml(readiness.status)}">${escapeHtml(statusLabel(readiness.status))}</span>
      </header>
      <p class="settings-note">${escapeHtml(readiness.summary)}</p>
      <div class="auto-publish-checks">
        ${(readiness.checks || []).map((check) => `
          <section class="auto-publish-check ${check.ok ? "ready" : "blocked"}">
            <header>
              <strong>${escapeHtml(check.label)}</strong>
              <span>${escapeHtml(check.ok ? t("Ready") : t("Blocked"))}</span>
            </header>
            <p>${escapeHtml(check.reason)}</p>
          </section>
        `).join("")}
      </div>
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

async function openCreateDetail() {
  const context = state.context;
  const now = new Date().toISOString();
  const guidance = guidanceForContext(context);
  const accounts = await readyAccountsForPostContext(context);
  const primaryAccount = accounts[0] || (state.socialAccounts || []).find((account) => account.id === context.socialAccountId) || {};
  const packageContext = {
    ...context,
    platform: primaryAccount.platform || context.platform || "x",
    socialAccountId: primaryAccount.id || context.socialAccountId || "",
    browserProfileId: primaryAccount.browserProfileId || context.browserProfileId || "",
  };
  const postPackage = createPostPackage({
    id: `package-${Date.now()}`,
    context: packageContext,
    ideaText: "Write the core post idea here, then generate platform versions.",
    brandGuidanceModules: guidance.modules,
    brandGuidanceSummary: guidance.summary,
    campaignGuidanceModules: guidance.campaignModules,
    campaignGuidanceSummary: guidance.campaignSummary,
    tags: [],
    source: "diamond-shell",
    createdAt: now,
    updatedAt: now,
  });
  const drafts = createPlatformDraftsForAccounts(postPackage, accounts, guidance, now);
  upsertPostPackage(postPackage, drafts);
  await saveProductionState();
  openDetail(postPackage, drafts);
}

async function readyAccountsForPostContext(context = {}) {
  const accounts = (state.socialAccounts || [])
    .filter((account) => {
      return (!context.companyId || account.companyId === context.companyId)
        && (!context.brandId || account.brandId === context.brandId);
    })
    .sort((left, right) => SUPPORTED_SOCIAL_PLATFORMS.indexOf(left.platform) - SUPPORTED_SOCIAL_PLATFORMS.indexOf(right.platform));
  await inspectAccountsForPostCreation(accounts);
  const ready = accounts.filter((account) => account.sessionStatus === "ready");
  return ready.length ? ready : accounts.filter((account) => account.id === context.socialAccountId);
}

async function inspectAccountsForPostCreation(accounts = []) {
  if (!window.diamond?.inspectAccountSession) return;
  const results = await Promise.all(accounts.map(async (account) => {
    const result = await window.diamond.inspectAccountSession({
      account: sessionProbeAccountPayload(account),
      partition: accountBrowserPartition(account),
    });
    return { account, result };
  }));
  let changed = false;
  results.forEach(({ account, result }) => {
    if (result?.status !== "ready" || account.sessionStatus === "ready") return;
    account.sessionStatus = "ready";
    account.sessionNote = result.note || "Logged-in session found in Diamond's browser profile.";
    account.lastSessionCheckAt = new Date().toISOString();
    changed = true;
  });
  if (changed) await saveProductionState();
}

function createPlatformDraftsForAccounts(postPackage, accounts = [], guidance = {}, now = new Date().toISOString()) {
  const uniqueAccounts = accounts.filter((account, index, list) => {
    return account?.platform && index === list.findIndex((item) => item.platform === account.platform);
  });
  return uniqueAccounts.map((account) => {
    const context = {
      ...postPackage.context,
      platform: account.platform,
      socialAccountId: account.id,
      browserProfileId: account.browserProfileId || postPackage.context.browserProfileId || "",
    };
    return createPlatformDraft({
      id: `${postPackage.id}-${account.platform}`,
      postPackage,
      context,
      platform: account.platform,
      socialAccountId: account.id,
      text: platformCopy(postPackage.ideaText, account.platform),
      brandGuidanceModules: guidance.modules,
      brandGuidanceSummary: guidance.summary,
      campaignGuidanceModules: guidance.campaignModules,
      campaignGuidanceSummary: guidance.campaignSummary,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  });
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
  renderLockedCampaignTags(postPackage);
  const autoTagNames = [
    postPackage.brandId ? (state.brands || []).find((b) => b.id === postPackage.brandId)?.name : null,
    postPackage.campaignId ? (state.campaigns || []).find((c) => c.id === postPackage.campaignId)?.name : null,
  ].filter(Boolean);
  const existingTags = postPackage.tags || [];
  const existingLower = new Set(existingTags.map((t) => t.toLowerCase()));
  const newAutoTags = autoTagNames.filter((t) => !existingLower.has(t.toLowerCase()));
  document.querySelector("#post-tags").value = [...newAutoTags, ...existingTags].join(", ");
  const styleSelect = document.querySelector("#generation-style");
  // Map "Default" (and absent) to "" so the "Select Voice" placeholder shows.
  const savedStyle = postPackage.generationStyle;
  if (styleSelect) styleSelect.value = (savedStyle && savedStyle !== "Default") ? savedStyle : "";
  // Seed Company/Brand/Campaign scope selects from the post package context.
  const detailCompany = document.querySelector("#detail-company");
  const detailBrand = document.querySelector("#detail-brand");
  const detailCampaign = document.querySelector("#detail-campaign");
  const pkgCompanyId = postPackage.companyId || postPackage.context?.companyId || "";
  const pkgBrandId = postPackage.brandId || postPackage.context?.brandId || "";
  const pkgCampaignId = postPackage.campaignId || postPackage.context?.campaignId || "";
  if (detailCompany) detailCompany.innerHTML = companyOptions(pkgCompanyId);
  if (detailBrand) detailBrand.innerHTML = brandOptions(pkgCompanyId, pkgBrandId);
  if (detailCampaign) detailCampaign.innerHTML = campaignOptions(pkgCompanyId, pkgBrandId, pkgCampaignId);
  // Backfill textSource for legacy drafts: a draft is "auto" only if its text still
  // matches the template value, otherwise it is operator-owned ("manual") and preserved.
  drafts.forEach((draft) => {
    if (!draft.textSource) {
      draft.textSource = String(draft.text || "").trim() === platformCopy(postPackage.ideaText, draft.platform).trim()
        ? "auto"
        : "manual";
    }
  });
  renderPlatformButtons(drafts, postPackage);
  renderPlatformPreviews(drafts);
  // Swap layout: hide the idea panel when any draft already has content so the
  // platform copy becomes the primary view rather than the brief textarea.
  const hasDraftContent = drafts.some((draft) => String(draft.text || "").trim().length > 0);
  document.querySelector("#post-detail").classList.toggle("has-drafts", hasDraftContent);
}

function renderPlatformButtons(drafts, postPackage) {
  const target = document.querySelector("#platform-buttons");
  const activePlatforms = new Set(drafts.map((draft) => draft.platform));
  const companyId = postPackage?.companyId || "";
  const connectedPlatforms = companyId
    ? new Set((state.socialAccounts || []).filter((a) => a.companyId === companyId).map((a) => a.platform))
    : null;
  const toggleable = connectedPlatforms
    ? TOGGLEABLE_PLATFORMS.filter((p) => connectedPlatforms.has(p))
    : TOGGLEABLE_PLATFORMS;
  target.innerHTML = toggleable.map((platform) => {
    const isActive = activePlatforms.has(platform);
    const tip = isActive ? `Remove ${platformLabel(platform)}` : `Add ${platformLabel(platform)}`;
    return `<button type="button" class="platform-button${isActive ? " active" : ""}" data-platform-toggle="${escapeHtml(platform)}" title="${escapeHtml(tip)}">${escapeHtml(platformLabel(platform))}</button>`;
  }).join("");
  const hasActivePlatforms = activePlatforms.size > 0;
  const generateButton = document.querySelector("#detail-generate");
  if (generateButton) {
    generateButton.hidden = !hasActivePlatforms;
    generateButton.disabled = !hasActivePlatforms;
  }
  const campaignButton = document.querySelector("#campaign-generate");
  if (campaignButton) {
    const hasCampaign = Boolean(postPackage?.campaignId);
    campaignButton.disabled = !(hasActivePlatforms && hasCampaign);
  }
  // Enable evaluation buttons when platforms are active and at least one has content.
  const hasContent = drafts.some((d) => String(d.text || "").trim().length > 0);
  const evaluateAllButton = document.querySelector("#detail-evaluate-all");
  if (evaluateAllButton) {
    evaluateAllButton.hidden = !hasActivePlatforms;
    evaluateAllButton.disabled = !hasContent;
  }
  const evalAutoButton = document.querySelector("#eval-auto-generate");
  if (evalAutoButton) {
    evalAutoButton.disabled = !(hasActivePlatforms && hasContent);
  }
}

function renderPlatformPreviews(drafts) {
  const target = document.querySelector("#platform-previews");
  if (!drafts.length) {
    target.innerHTML = "";
    activePlatformTab = null;
    return;
  }
  // Preserve the active tab across re-renders; fall back to the first platform.
  if (!activePlatformTab || !drafts.find((d) => d.platform === activePlatformTab)) {
    activePlatformTab = drafts[0].platform;
  }
  const tabStrip = `
    <div class="platform-tab-strip" role="tablist" aria-label="Platform drafts">
      ${drafts.map((draft) => {
        const isActive = draft.platform === activePlatformTab;
        const status = draft.status || "draft";
        return `<button
          class="platform-tab${isActive ? " active" : ""}"
          role="tab"
          aria-selected="${isActive}"
          data-platform-tab="${escapeHtml(draft.platform)}"
        >${escapeHtml(platformLabel(draft.platform))}<em class="tab-status ${escapeHtml(status)}">${escapeHtml(statusLabel(status))}</em></button>`;
      }).join("")}
    </div>`;
  const panels = drafts.map((draft) => {
    const hidden = draft.platform !== activePlatformTab;
    return renderPlatformPreview(draft, hidden);
  }).join("");
  target.innerHTML = tabStrip + panels;
}

function renderPlatformPreview(draft, hidden = false) {
  const preflight = platformDraftPreflight(draft);
  const plan = platformStagingPlan(draft.platform, { media: draft.media || [] });
  const charCount = draft.charLimit ? `<span class="char-count">${draft.text.length}/${draft.charLimit}</span>` : "";
  const status = draft.status || "draft";
  // "Needs Review" is actionable — render as a button so the user can approve inline.
  const statusBadge = status === "needs_review"
    ? `<button class="session-pill needs_review status-action-btn" data-platform-action="approve" data-platform-draft-id="${escapeHtml(draft.id)}" title="Approve this draft">Needs Review ✓</button>`
    : `<em class="session-pill ${escapeHtml(status)}">${escapeHtml(statusLabel(status))}</em>`;
  return `
    <article class="platform-preview${hidden ? " hidden" : ""}" data-preview-platform="${escapeHtml(draft.platform)}" data-platform-draft-id="${escapeHtml(draft.id)}" data-platform-panel="${escapeHtml(draft.platform)}">
      <header>
        <div>
          ${statusBadge}
          <button class="media-button draft-evaluate-btn" type="button" data-platform-action="evaluate" data-platform-draft-id="${escapeHtml(draft.id)}">Evaluate</button>
        </div>
      </header>
      <textarea rows="${draft.platform === "x" ? 4 : 7}" data-draft-text="${escapeHtml(draft.id)}">${escapeHtml(draft.text)}</textarea>
      ${charCount}
      ${renderDraftEvaluation(draft)}
      <div class="draft-media-row">
        <button type="button" class="media-button" data-platform-action="add-media" data-platform-draft-id="${escapeHtml(draft.id)}">+ Media</button>
        <button type="button" class="media-button" data-platform-action="copy-media" data-platform-draft-id="${escapeHtml(draft.id)}">Copy paths</button>
        <span>${escapeHtml(mediaStatus(draft))}</span>
      </div>
      ${renderDraftMediaList(draft)}
      ${renderContextHelpCard(draft, preflight, plan)}
      ${renderWorkflowChecklist(draft, preflight, plan)}
      ${renderDraftReliability(draft, preflight)}
      ${renderStagingPlan(draft, plan)}
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

function renderPlatformActionRow(draft, preflight, plan) {
  const actions = platformActionHelpItems(draft, preflight, plan);
  return `
    ${renderBeginnerActionGuide(draft, preflight, plan, actions)}
    <div class="platform-action-row" aria-label="${escapeHtml(platformLabel(draft.platform))} actions">
      ${actions.map((item, index) => `
        <button type="button"
          data-platform-action="${escapeHtml(item.action)}"
          data-platform-draft-id="${escapeHtml(draft.id)}"
          title="${escapeHtml(item.help)}"
          aria-label="${escapeHtml(`${item.label}: ${item.help}`)}">
          <span class="action-number">${index + 1}</span>
          <span class="action-copy">
            <strong>${escapeHtml(t(item.label))}</strong>
            <small>${escapeHtml(item.shortHelp)}</small>
          </span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderBeginnerActionGuide(draft, preflight, plan, actions) {
  if (!normalizeBeginnerMode(state.beginnerMode)) return "";
  const next = nextWorkflowStep(workflowChecklistForDraft(draft, preflight, plan));
  const nextAction = beginnerActionForStep(next?.label);
  const matchingAction = actions.find((item) => item.action === nextAction);
  return `
    <section class="beginner-action-guide" aria-label="${escapeHtml(platformLabel(draft.platform))} beginner help">
      <header>
        <strong>Beginner Mode</strong>
        <span>${escapeHtml(matchingAction ? `Use ${matchingAction.label}` : "Read first")}</span>
      </header>
      <p>${escapeHtml(beginnerGuideText(draft, plan, matchingAction, next))}</p>
      <ul>
        <li>Start with the highlighted next step above, then use the matching button below.</li>
        <li>Staging prepares a post; it does not publish it for you.</li>
        <li>Only click Mark Posted after you personally see the post live on the social platform.</li>
      </ul>
    </section>
  `;
}

function beginnerActionForStep(stepLabel = "") {
  return {
    "Evaluate": "evaluate",
    "Approve": "approve",
    "Add media if needed": "add-media",
    "Stage in browser": "stage",
    "Publish manually": "stage",
    "Capture proof": "proof",
    "Mark posted": "posted",
  }[stepLabel] || "";
}

function beginnerGuideText(draft, plan, action, next) {
  if (!next) return "This draft is finished. You can come back later to add metrics, screenshots, notes, or performance numbers.";
  if (next.label === "Confirm target") return "Before using the action buttons, make sure this draft belongs to the correct company, brand, campaign, platform, and social account.";
  if (next.label === "Add media if needed") return `${plan.label} needs media before staging. Use + Media above the button row, then confirm the file appears under the draft.`;
  if (next.label === "Publish manually") return `Diamond has prepared the ${platformLabel(draft.platform)} composer. Review it inside the browser and press the platform's own post button yourself.`;
  if (action) return `${action.label} is the next button to use. ${action.help}`;
  return "Follow the checklist above from top to bottom. Diamond will keep the safest next step visible.";
}

function platformActionHelpItems(draft, preflight, plan) {
  const platform = platformLabel(draft.platform);
  return [
    {
      action: "evaluate",
      label: "Evaluate",
      shortHelp: "Check risk",
      help: "Checks the draft for brand fit, claims, duplicate ideas, quality, and risk before approval.",
    },
    {
      action: "approve",
      label: "Approve",
      shortHelp: "Allow staging",
      help: "Marks the draft ready to stage if the evaluation is not blocked.",
    },
    {
      action: "schedule",
      label: "Schedule",
      shortHelp: "Put on calendar",
      help: "Adds this draft to Diamond's schedule so it can be staged or posted at the planned time.",
    },
    {
      action: "stage",
      label: "Stage",
      shortHelp: "Open composer",
      help: `Opens the ${platform} composer and prepares the post. You still publish manually inside the social site.`,
    },
    {
      action: "proof",
      label: "Capture Proof",
      shortHelp: "Save evidence",
      help: "Records proof after staging or manual posting, usually a screenshot, URL, or run record.",
    },
    {
      action: "copy-proof",
      label: "Copy Proof",
      shortHelp: "Copy summary",
      help: "Copies the proof summary so you can paste it into notes, support, or a review thread.",
    },
    {
      action: "copy-url",
      label: "Copy Url",
      shortHelp: "Copy link",
      help: "Copies the staged or published platform URL when Diamond has one.",
    },
    {
      action: "copy-screenshot",
      label: "Copy Screenshot",
      shortHelp: "Copy path",
      help: "Copies the screenshot path when a proof screenshot has been captured.",
    },
    {
      action: "posted",
      label: "Mark Posted",
      shortHelp: "Finish record",
      help: "Use this only after the post is live. It moves the draft into posted status for queues and metrics.",
    },
    {
      action: "abandoned",
      label: "Abandon",
      shortHelp: "Stop draft",
      help: "Stops this draft from moving forward when you decide not to publish it.",
    },
  ];
}

function renderContextHelpCard(draft, preflight, plan) {
  const help = workflowHelpForDraft(draft, preflight, plan);
  return `
    <section class="context-help-card ${escapeHtml(help.tone)}" aria-label="${escapeHtml(platformLabel(draft.platform))} next step help">
      <header>
        <strong>${escapeHtml(help.title)}</strong>
        <span>${escapeHtml(help.badge)}</span>
      </header>
      <p>${escapeHtml(help.body)}</p>
      <ol>
        ${help.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
      </ol>
    </section>
  `;
}

function workflowHelpForDraft(draft, preflight, plan) {
  if (draft.status === "published") {
    return {
      tone: "ready",
      badge: "Done",
      title: "This post is marked posted",
      body: "Only change this if the post was marked posted by mistake or needs metrics added later.",
      steps: ["Check Analytics later.", "Add URL, screenshot, impressions, clicks, signups, or notes when available."],
    };
  }
  if (draft.status === "blocked") {
    return {
      tone: "blocked",
      badge: "Stop",
      title: "Do not stage this draft yet",
      body: "Diamond found a blocker. Fix the text or abandon the draft before trying to publish.",
      steps: ["Read the evaluation and risk notes.", "Edit the draft.", "Click Evaluate again.", "Approve only after the blocker is gone."],
    };
  }
  if (draft.status === "needs_review" || !preflight.ok) {
    return {
      tone: "blocked",
      badge: "Review",
      title: "This draft needs attention first",
      body: "Something is not ready: approval, session, license, media, or another preflight check.",
      steps: ["Read the red or yellow warning.", "Fix the missing item.", "Click Evaluate.", "Click Approve only when the draft is safe."],
    };
  }
  if (plan.mediaRequired && !(draft.media || []).length) {
    return {
      tone: "blocked",
      badge: "Media",
      title: `${plan.label} needs media`,
      body: "This platform normally needs an image or video before it can be published.",
      steps: ["Click + Media.", "Choose the correct image or video.", "Confirm the media file appears under the draft.", "Then stage the draft."],
    };
  }
  if (!["approved", "staged", "scheduled"].includes(draft.status)) {
    return {
      tone: "attention",
      badge: "Start",
      title: "Start by evaluating this draft",
      body: "Evaluation checks whether the text is safe, on-brand, and ready for a human approval decision.",
      steps: ["Read the draft text.", "Click Evaluate.", "Edit anything that looks wrong.", "Click Approve when it is ready."],
    };
  }
  if (draft.status === "approved" || draft.status === "scheduled") {
    return {
      tone: "ready",
      badge: "Stage",
      title: "This draft is ready to stage",
      body: "Staging prepares the post in the platform browser. It does not mean Diamond has published it.",
      steps: ["Click Stage.", "Review the browser composer yourself.", plan.supportsTextInsert ? "Confirm the text inserted correctly." : "Paste the copied text manually if needed.", "Publish manually only if it looks right."],
    };
  }
  if (draft.status === "staged" && !draft.proofCapturedAt) {
    return {
      tone: "attention",
      badge: "Proof",
      title: "Capture proof before marking posted",
      body: "Proof is the record that shows what happened in the social platform workflow.",
      steps: ["Review the staged composer or live post.", "Publish manually if you have not already.", "Click Capture Proof.", "Then click Mark Posted."],
    };
  }
  if (draft.status === "staged") {
    return {
      tone: "ready",
      badge: "Finish",
      title: "Finish the post record",
      body: "Diamond has proof. If the post is live, mark it posted so the calendar, queue, and analytics stay accurate.",
      steps: ["Confirm the post is live on the platform.", "Click Mark Posted.", "Add metrics later when you have them."],
    };
  }
  return {
    tone: "attention",
    badge: "Next",
    title: "Use the safe workflow",
    body: "Read, evaluate, approve, stage, publish manually, capture proof, then mark posted.",
    steps: ["Evaluate.", "Approve.", "Stage.", "Capture proof.", "Mark posted."],
  };
}

function renderWorkflowChecklist(draft, preflight, plan) {
  const checklist = workflowChecklistForDraft(draft, preflight, plan);
  const completeCount = checklist.filter((item) => item.complete).length;
  const nextStep = nextWorkflowStep(checklist);
  return `
    <section class="workflow-checklist-card" aria-label="${escapeHtml(platformLabel(draft.platform))} workflow checklist">
      <header>
        <strong>Workflow checklist</strong>
        <span>${completeCount}/${checklist.length} done</span>
      </header>
      ${nextStep ? `<p class="workflow-next-step"><strong>Next:</strong> ${escapeHtml(nextStep.label)}. ${escapeHtml(nextStep.detail)}</p>` : `<p class="workflow-next-step complete"><strong>Complete:</strong> This draft has reached the posted state.</p>`}
      <ol>
        ${checklist.map((item, index) => {
          let badgeHtml;
          if (item.complete) {
            badgeHtml = `<em class="workflow-badge done">Done</em>`;
          } else if (item.action) {
            const isCurrent = item === nextStep;
            badgeHtml = `<button type="button"
              class="workflow-action-btn${isCurrent ? " workflow-action-btn--next" : ""}"
              data-platform-action="${escapeHtml(item.action)}"
              data-platform-draft-id="${escapeHtml(draft.id)}"
              title="${escapeHtml(item.detail)}">${escapeHtml(item.label)}</button>`;
          } else {
            badgeHtml = `<em class="workflow-badge open">Open</em>`;
          }
          return `
          <li class="workflow-checklist-item ${item.complete ? "complete" : "pending"} ${item === nextStep ? "current" : ""}">
            <span class="workflow-step-number">${index + 1}</span>
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <small>${escapeHtml(item.complete ? item.doneDetail : item.detail)}</small>
            </div>
            ${badgeHtml}
          </li>`;
        }).join("")}
      </ol>
    </section>
  `;
}

function workflowChecklistForDraft(draft, preflight, plan) {
  const status = draft.status || "draft";
  const account = preflight.account || accountForDraft(draft);
  const targetComplete = Boolean(
    (draft.companyId || draft.context?.companyId)
    && (draft.brandId || draft.context?.brandId)
    && draft.platform
    && account
  );
  const evaluated = Boolean(
    draft.evaluatedAt
    || Number.isFinite(Number(draft.qualityScore))
    || (draft.riskDetails || []).length
    || ["approved", "scheduled", "staged", "published", "posted", "blocked", "needs_review"].includes(status)
  );
  const approved = ["approved", "scheduled", "staged", "published", "posted"].includes(status) || Boolean(draft.approvedAt);
  const mediaReady = !plan.mediaRequired || Boolean((draft.media || []).length);
  const staged = ["staged", "published", "posted", "needs_manual_finish"].includes(status)
    || Boolean(draft.stagedAt || draft.stageUrl || draft.stageResult?.openedUrl);
  const published = ["published", "posted"].includes(status) || Boolean(draft.publishedAt);
  const proofed = Boolean(draft.proofCapturedAt || draft.proofKind || draft.lastProofRunId);
  return [
    {
      label: "Confirm target",
      complete: targetComplete,
      detail: "Pick the company, brand, platform, and social account before doing anything else.",
      doneDetail: "Company, brand, platform, and social account are attached.",
    },
    {
      label: "Evaluate",
      action: "evaluate",
      complete: evaluated,
      detail: "Run Evaluate — Diamond checks the text, brand fit, claims, and risk.",
      doneDetail: "This draft has an evaluation record.",
    },
    {
      label: "Approve",
      action: "approve",
      complete: approved,
      detail: "Approve only after the evaluation is clean enough to continue.",
      doneDetail: "This draft is approved for staging or has moved beyond approval.",
    },
    {
      label: "Add media if needed",
      action: "add-media",
      complete: mediaReady,
      detail: plan.mediaRequired ? `${plan.label} needs media before staging.` : "Media is optional for this platform.",
      doneDetail: plan.mediaRequired ? "Required media is attached." : "No required media is missing.",
    },
    {
      label: "Stage in browser",
      action: "stage",
      complete: staged,
      detail: "Stage opens the platform composer and prepares the post.",
      doneDetail: "The platform composer has been staged or opened for manual finish.",
    },
    {
      label: "Publish manually",
      complete: published,
      detail: "Review the platform composer yourself, then publish inside the social site.",
      doneDetail: "This draft is marked as published.",
    },
    {
      label: "Capture proof",
      action: "proof",
      complete: proofed,
      detail: "Capture a screenshot or URL proof so the run has a record.",
      doneDetail: "Proof has been captured for this draft.",
    },
    {
      label: "Mark posted",
      action: "posted",
      complete: published,
      detail: "After the post is live, click Mark Posted so queues and metrics stay correct.",
      doneDetail: "Diamond has moved this draft into the posted state.",
    },
  ];
}

function nextWorkflowStep(checklist) {
  return checklist.find((item) => !item.complete) || null;
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
    ["Candidate Text", plan.candidateTextInsert ? "Available" : "None"],
    ["Media", titleCase(plan.mediaState)],
    ["Candidate Media", plan.candidateMediaPicker ? "Available" : "None"],
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
  const llm = draft.llmEvaluation;
  const details = [
    draft.approvalLevel ? `Approval: ${titleCase(draft.approvalLevel)}` : "",
    Number.isFinite(Number(draft.qualityScore)) ? `Quality score: ${draft.qualityScore}/100` : "",
    draft.scheduledAt ? `Scheduled: ${formatDateTime(draft.scheduledAt)}` : "",
    draft.publishedAt ? `Posted: ${formatDateTime(draft.publishedAt)}` : "",
    draft.stageNote || "",
  ].filter(Boolean);
  const hasBase = details.length || draft.riskFlags?.length || draft.qualityDetails?.length;
  const hasLlm = Boolean(llm?.summary);
  if (!hasBase && !hasLlm) return "";
  const revisedText = draft.llmRevisedText;
  return `
    <div class="platform-evaluation">
      ${hasLlm ? `
        <div class="llm-evaluation">
          <strong>AI Evaluation</strong>
          <p>${escapeHtml(llm.summary)}</p>
          ${llm.issues?.length ? `<ul class="eval-list eval-issues">${llm.issues.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : ""}
          ${llm.suggestions?.length ? `<ul class="eval-list eval-suggestions">${llm.suggestions.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>` : ""}
        </div>
      ` : ""}
      ${details.map((detail) => `<span>${escapeHtml(detail)}</span>`).join("")}
      ${draft.riskFlags?.length ? `<span>Risk flags: ${escapeHtml(draft.riskFlags.join(", "))}</span>` : ""}
      ${draft.qualityDetails?.length ? `<p>${escapeHtml(draft.qualityDetails.slice(0, 2).join(" "))}</p>` : ""}
      ${revisedText ? `
        <div class="revised-draft">
          <div class="revised-draft-header">
            <strong>Suggested Revision</strong>
            <span class="revised-draft-label">Recommendations applied automatically</span>
          </div>
          <textarea class="revised-textarea" rows="5">${escapeHtml(revisedText)}</textarea>
          <button class="media-button use-revised-btn" type="button"
            data-platform-action="use-revised"
            data-platform-draft-id="${escapeHtml(draft.id)}">Use this version</button>
        </div>
      ` : ""}
    </div>
  `;
}

async function handlePlatformDraftAction(event) {
  // Tab switching — no async work, just re-render with the new active tab.
  const tab = event.target.closest("[data-platform-tab]");
  if (tab) {
    activePlatformTab = tab.dataset.platformTab;
    const drafts = prototypeModel.platformDrafts.filter((d) => d.postPackageId === activePostPackageId);
    renderPlatformPreviews(drafts);
    return;
  }
  const button = event.target.closest("[data-platform-action]");
  if (!button) return;
  const draft = prototypeModel.platformDrafts.find((item) => item.id === button.dataset.platformDraftId);
  if (!draft) return;
  const action = button.dataset.platformAction;
  if (action === "evaluate") {
    button.disabled = true;
    button.textContent = "Evaluating…";
    try {
      await llmEvaluatePlatformDraft(draft);
    } finally {
      button.disabled = false;
      button.textContent = "Evaluate";
    }
  }
  if (action === "use-revised") {
    // Read from the textarea in case the user edited the suggestion.
    const panel = button.closest("[data-platform-panel]");
    const revisedTextarea = panel?.querySelector(".revised-textarea");
    const revisedText = revisedTextarea ? revisedTextarea.value : draft.llmRevisedText;
    if (revisedText) {
      draft.text = revisedText;
      draft.textSource = "llm-revised";
      draft.updatedAt = new Date().toISOString();
      // Clear the suggestion panel — it's now the active draft text.
      delete draft.llmRevisedText;
      delete draft.llmRevisedAt;
    }
  }
  if (action === "approve") approvePlatformDraft(draft);
  if (action === "schedule") schedulePlatformDraft(draft);
  if (action === "add-media") await attachMediaToDraft(draft);
  if (action === "copy-media") await copyDraftMediaPaths(draft);
  if (action === "stage") {
    await inspectDraftMedia(draft);
    stagePlatformDraft(draft);
  }
  if (action === "proof") await capturePlatformDraftProof(draft);
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

async function handlePlatformToggle(event) {
  const chip = event.target.closest("[data-platform-toggle]");
  if (!chip || !activePostPackageId) return;
  const postPackage = prototypeModel.postPackages.find((item) => item.id === activePostPackageId);
  if (!postPackage) return;
  const platform = chip.dataset.platformToggle;
  const existingDraft = prototypeModel.platformDrafts.find(
    (draft) => draft.postPackageId === activePostPackageId && draft.platform === platform
  );
  if (existingDraft) {
    if (existingDraft.textSource !== "auto") {
      const ok = await showConfirmModal(`Remove ${platformLabel(platform)}? Your edited draft text will be lost.`);
      if (!ok) return;
    }
    prototypeModel.platformDrafts = removePlatformDraft(prototypeModel.platformDrafts, activePostPackageId, platform);
  } else {
    const draftId = `${postPackage.id}-${platform}`;
    // Guard against duplicate IDs from rapid double-click before reopenActiveDetail completes.
    if (prototypeModel.platformDrafts.some((d) => d.id === draftId)) return;
    const now = new Date().toISOString();
    const context = { ...postPackage.context, platform, socialAccountId: socialAccountIdForPlatform(platform) };
    const guidance = guidanceForContext(context);
    const draft = createPlatformDraft({
      id: draftId,
      postPackage,
      context,
      platform,
      socialAccountId: socialAccountIdForPlatform(platform),
      text: platformCopy(postPackage.ideaText || "", platform),
      brandGuidanceModules: guidance.modules,
      brandGuidanceSummary: guidance.summary,
      campaignGuidanceModules: guidance.campaignModules,
      campaignGuidanceSummary: guidance.campaignSummary,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
    prototypeModel.platformDrafts.push(draft);
  }
  updatePostPackageFromDrafts(postPackage.id);
  await saveProductionState();
  reopenActiveDetail();
}

function propagateScopeChangeToDrafts(postPackage) {
  const scope = postPackage.context || {};
  prototypeModel.platformDrafts = prototypeModel.platformDrafts.map((draft) => {
    if (draft.postPackageId !== postPackage.id) return draft;
    return applyDraftScope(draft, scope);
  });
}

async function handleDetailCompanyChange() {
  if (!activePostPackageId) return;
  const postPackage = prototypeModel.postPackages.find((item) => item.id === activePostPackageId);
  if (!postPackage) return;
  const rawCompanyId = document.querySelector("#detail-company")?.value || "";
  const { companyId, brandId, campaignId } = computeCompanyCascade(rawCompanyId, state.brands || [], state.campaigns || []);
  postPackage.context = { ...postPackage.context, companyId, brandId, campaignId };
  postPackage.companyId = companyId;
  postPackage.brandId = brandId;
  postPackage.campaignId = campaignId;
  const detailBrand = document.querySelector("#detail-brand");
  const detailCampaign = document.querySelector("#detail-campaign");
  if (detailBrand) detailBrand.innerHTML = brandOptions(companyId, brandId);
  if (detailCampaign) detailCampaign.innerHTML = campaignOptions(companyId, brandId, campaignId);
  propagateScopeChangeToDrafts(postPackage);
  state.context = { ...state.context, companyId, brandId, campaignId };
  await saveProductionState();
  reopenActiveDetail();
}

async function handleDetailBrandChange() {
  if (!activePostPackageId) return;
  const postPackage = prototypeModel.postPackages.find((item) => item.id === activePostPackageId);
  if (!postPackage) return;
  const rawCompanyId = document.querySelector("#detail-company")?.value || postPackage.context?.companyId || "";
  const rawBrandId = document.querySelector("#detail-brand")?.value || "";
  const { companyId, brandId, campaignId } = computeBrandCascade(rawCompanyId, rawBrandId, state.campaigns || []);
  postPackage.context = { ...postPackage.context, companyId, brandId, campaignId };
  postPackage.companyId = companyId;
  postPackage.brandId = brandId;
  postPackage.campaignId = campaignId;
  const detailCampaign = document.querySelector("#detail-campaign");
  if (detailCampaign) detailCampaign.innerHTML = campaignOptions(companyId, brandId, campaignId);
  propagateScopeChangeToDrafts(postPackage);
  state.context = { ...state.context, companyId, brandId, campaignId };
  await saveProductionState();
  reopenActiveDetail();
}

async function handleDetailCampaignChange() {
  if (!activePostPackageId) return;
  const postPackage = prototypeModel.postPackages.find((item) => item.id === activePostPackageId);
  if (!postPackage) return;
  const companyId = document.querySelector("#detail-company")?.value || postPackage.context?.companyId || "";
  const brandId = document.querySelector("#detail-brand")?.value || postPackage.context?.brandId || "";
  const campaignId = document.querySelector("#detail-campaign")?.value || "";
  postPackage.context = { ...postPackage.context, companyId, brandId, campaignId };
  postPackage.companyId = companyId;
  postPackage.brandId = brandId;
  postPackage.campaignId = campaignId;
  propagateScopeChangeToDrafts(postPackage);
  state.context = { ...state.context, companyId, brandId, campaignId };
  await saveProductionState();
  reopenActiveDetail();
}

async function addPlatformToActivePackage() {
  if (!activePostPackageId) return;
  const postPackage = prototypeModel.postPackages.find((item) => item.id === activePostPackageId);
  if (!postPackage) return;
  const platform = normalizeId(await promptForText("Platform", "linkedin"));
  if (!platform) return;
  if (prototypeModel.platformDrafts.some((draft) => draft.postPackageId === activePostPackageId && draft.platform === platform)) return;
  const now = new Date().toISOString();
  const context = {
    ...postPackage.context,
    platform,
    socialAccountId: socialAccountIdForPlatform(platform),
  };
  const guidance = guidanceForContext(context);
  const draft = createPlatformDraft({
    id: `${postPackage.id}-${platform}`,
    postPackage,
    context,
    platform,
    socialAccountId: socialAccountIdForPlatform(platform),
    text: platformCopy(postPackage.ideaText || "", platform),
    brandGuidanceModules: guidance.modules,
    brandGuidanceSummary: guidance.summary,
    campaignGuidanceModules: guidance.campaignModules,
    campaignGuidanceSummary: guidance.campaignSummary,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  });
  prototypeModel.platformDrafts.push(draft);
  updatePostPackageFromDrafts(postPackage.id);
  await saveProductionState();
  reopenActiveDetail();
}

async function addAllReadyPlatformsToActivePackage() {
  if (!activePostPackageId) return;
  const postPackage = prototypeModel.postPackages.find((item) => item.id === activePostPackageId);
  if (!postPackage) return;
  const readyAccounts = await readyAccountsForPostContext(postPackage.context);
  const existingPlatforms = new Set(
    prototypeModel.platformDrafts
      .filter((draft) => draft.postPackageId === activePostPackageId)
      .map((draft) => draft.platform)
  );
  const readyPlatforms = new Set(readyAccounts.map((a) => a.platform));
  // Toggle: if all ready platforms are already active → remove them all.
  // If any ready platform is missing → add all of them.
  const allActive = readyPlatforms.size > 0 && [...readyPlatforms].every((p) => existingPlatforms.has(p));
  if (allActive) {
    readyPlatforms.forEach((platform) => {
      prototypeModel.platformDrafts = removePlatformDraft(
        prototypeModel.platformDrafts, activePostPackageId, platform
      );
    });
  } else {
    const toAdd = readyAccounts.filter((account) => !existingPlatforms.has(account.platform));
    if (toAdd.length) {
      const guidance = guidanceForContext(postPackage.context);
      const newDrafts = createPlatformDraftsForAccounts(postPackage, toAdd, guidance);
      prototypeModel.platformDrafts.push(...newDrafts);
    }
  }
  updatePostPackageFromDrafts(postPackage.id);
  await saveProductionState();
  reopenActiveDetail();
}

async function requestPlatformGeneration() {
  if (!activePostPackageId) return;
  const postPackage = prototypeModel.postPackages.find((item) => item.id === activePostPackageId);
  if (!postPackage) return;
  const drafts = prototypeModel.platformDrafts.filter((draft) => draft.postPackageId === activePostPackageId);
  if (!drafts.length) return;
  const generateButton = document.querySelector("#detail-generate");
  if (generateButton) {
    generateButton.disabled = true;
    generateButton.textContent = "Generating…";
  }
  drafts.forEach((draft) => { draft.generationStatus = "generating"; });
  const payload = buildGenerationPayload(postPackage, drafts);
  let result;
  try {
    result = await window.diamond?.generatePostDrafts(payload);
  } catch (error) {
    result = { ok: false, error: error && error.message ? error.message : String(error) };
  }
  try {
    applyGenerationResult(drafts, result, postPackage);
    updatePostPackageFromDrafts(activePostPackageId);
    await saveProductionState();
    board = buildPlatformDraftBoardView(prototypeModel, activeBoardPlatformFilter, activeBoardCompanyFilter);
    renderBoard(board);
    reopenActiveDetail();
  } finally {
    if (generateButton) {
      generateButton.disabled = false;
      generateButton.textContent = "+ Create Content";
    }
  }
}

async function requestCampaignGeneration() {
  if (!activePostPackageId) return;
  const postPackage = prototypeModel.postPackages.find((item) => item.id === activePostPackageId);
  if (!postPackage) return;
  const drafts = prototypeModel.platformDrafts.filter((draft) => draft.postPackageId === activePostPackageId);
  if (!drafts.length) return;
  const campaignButton = document.querySelector("#campaign-generate");
  if (campaignButton) {
    campaignButton.disabled = true;
    campaignButton.textContent = "Generating…";
  }
  drafts.forEach((draft) => { draft.generationStatus = "generating"; });
  // Derive a meaningful idea string from campaign strategy so the LLM writer has
  // a concrete prompt even when the idea field is intentionally blank.
  const strategy = strategyFor(drafts[0] || { campaignId: postPackage.campaignId });
  const campaignIdea = [
    strategy.offer,
    (strategy.goals || []).join(", "),
    strategy.cta,
  ].filter(Boolean).join(" | ")
    || "Create platform-appropriate content for this campaign based on the campaign strategy.";
  const payload = { ...buildGenerationPayload(postPackage, drafts), idea: campaignIdea, mode: "campaign" };
  let result;
  try {
    result = await window.diamond?.generatePostDrafts(payload);
  } catch (error) {
    result = { ok: false, error: error && error.message ? error.message : String(error) };
  }
  try {
    // Pass campaignIdea as fallbackIdea so template-fallback drafts (no LLM key) get meaningful
    // placeholder text instead of the empty ideaText field.
    applyGenerationResult(drafts, result, postPackage, campaignIdea);
    // Campaign automation output always requires review — covers both LLM and template-fallback paths.
    const now = new Date().toISOString();
    drafts.forEach((draft) => {
      if ((draft.textSource === "llm" || draft.textSource === "template-fallback") && draft.status !== "blocked") {
        draft.status = "needs_review";
        draft.updatedAt = now;
      }
    });
    updatePostPackageFromDrafts(activePostPackageId);
    // Rebuild board variable so clicking Back shows updated cards — no renderBoard call here
    // because the user is still in detail view; Back button will call renderBoard(board).
    board = buildPlatformDraftBoardView(prototypeModel, activeBoardPlatformFilter, activeBoardCompanyFilter);
    await saveProductionState();
    reopenActiveDetail();
  } finally {
    if (campaignButton) {
      campaignButton.disabled = false;
      campaignButton.textContent = "+ Campaign Content";
    }
  }
}

function applyGenerationResult(drafts, result, postPackage, fallbackIdea = null) {
  const now = new Date().toISOString();
  // Missing writer key (drafts === null) or an error → renderer template fallback so the page stays usable.
  if (!result || result.ok === false || result.drafts === null) {
    // Prefer an explicit fallbackIdea (e.g. campaign summary) over the post ideaText so callers
    // can supply meaningful placeholder copy even when the idea field is intentionally empty.
    const ideaForFallback = fallbackIdea || postPackage.ideaText || "";
    drafts.forEach((draft) => {
      if (draft.textSource !== "manual") {
        draft.text = platformCopy(ideaForFallback, draft.platform);
        draft.textSource = "template-fallback";
      }
      draft.generationStatus = result && result.ok === false ? "error" : "fallback";
      draft.generationError = result && result.error ? result.error : null;
      draft.changeNote = null;
      draft.updatedAt = now;
      evaluatePlatformDraft(draft);
    });
    return;
  }
  const byPlatform = new Map((result.drafts || []).map((item) => [item.platform, item]));
  drafts.forEach((draft) => {
    const generated = byPlatform.get(draft.platform);
    if (!generated) return;
    draft.text = generated.text || draft.text;
    draft.textSource = "llm";
    draft.changeNote = generated.changeNote || null;
    draft.generationStatus = "ok";
    draft.generationError = null;
    draft.updatedAt = now;
    evaluatePlatformDraft(draft); // Stage 3: deterministic claim/banned-phrase enforcement.
    // LLM-generated content always needs human review; upgrade clean drafts to needs_review
    // without downgrading anything the evaluator already flagged as blocked.
    if (draft.status === "draft") draft.status = "needs_review";
  });
}

function buildGenerationPayload(postPackage, drafts) {
  const sample = drafts[0] || {
    brandId: postPackage.brandId,
    campaignId: postPackage.campaignId,
    context: postPackage.context,
  };
  const brand = brandLibraryFor(sample);
  const claims = claimLibraryFor(sample);
  const strategy = strategyFor(sample);
  const guidance = guidanceForContext(postPackage.context || {});
  return {
    idea: postPackage.ideaText || "",
    style: postPackage.generationStyle || "Default",
    language: postPackage.context?.language || "en",
    platforms: drafts.map((draft) => ({ platform: draft.platform, charLimit: draft.charLimit || null })),
    brand: {
      voice: brand.brandVoice || "",
      approvedPhrases: brand.approvedPhrases || [],
      bannedPhrases: brand.bannedPhrases || [],
    },
    campaign: {
      goals: strategy.goals || [],
      audience: strategy.audience || [],
      pillars: strategy.pillars || [],
      offer: strategy.offer || "",
      cta: strategy.cta || "",
      guidanceSummary: [guidance.summary, guidance.campaignSummary].filter(Boolean).join("\n\n"),
    },
    claims: {
      blockedClaims: claims.blockedClaims || [],
      requiresReviewClaims: claims.requiresReviewClaims || [],
    },
  };
}

function markGeneratedDraftsStale() {
  if (!activePostPackageId) return;
  prototypeModel.platformDrafts
    .filter((draft) => draft.postPackageId === activePostPackageId && draft.textSource === "llm")
    .forEach((draft) => { draft.generationStatus = "needs-attention"; });
}

function handleGenerationStyleChange(event) {
  if (!activePostPackageId) return;
  const postPackage = prototypeModel.postPackages.find((item) => item.id === activePostPackageId);
  if (!postPackage) return;
  postPackage.generationStyle = event.target.value || "Default";
  postPackage.updatedAt = new Date().toISOString();
  // Previously generated drafts are stale — they were produced with the old style.
  markGeneratedDraftsStale();
  saveProductionState();
}

function handlePlatformDraftTextInput(event) {
  const textarea = event.target.closest("[data-draft-text]");
  if (!textarea) return;
  const draft = prototypeModel.platformDrafts.find((item) => item.id === textarea.dataset.draftText);
  if (!draft) return;
  draft.text = textarea.value;
  draft.textSource = "manual";
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
  const guidance = guidanceForContext(draft.context || draft);
  draft.brandGuidanceModules = guidance.modules;
  draft.brandGuidanceSummary = guidance.summary;
  const risk = evaluateDraftRisk({
    text: draft.text,
    policy,
    brandLibrary: brandLibraryWithGuidance(brandLibrary, guidance.modules),
    claimLibrary: claimLibraryWithGuidance(claimLibrary, guidance.modules),
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

// LLM-powered evaluation — calls OpenAI, overlays result onto the draft.
// Falls back gracefully when no API key is configured (deterministic result kept).
async function llmEvaluatePlatformDraft(draft, { skipRewrite = false } = {}) {
  // Clear any stale results from a previous run so old data never bleeds into a fresh evaluation.
  delete draft.llmEvaluation;
  delete draft.llmRevisedText;
  delete draft.llmRevisedAt;

  // Deterministic checks run first so there's immediate feedback while the API call is in flight.
  evaluatePlatformDraft(draft);

  const brand = brandLibraryFor(draft);
  const claims = claimLibraryFor(draft);
  const strategy = strategyFor(draft);
  const payload = {
    platform: draft.platform,
    text: draft.text || "",
    charLimit: draft.charLimit || null,
    brand: {
      voice: brand.brandVoice || "",
      bannedPhrases: brand.bannedPhrases || [],
    },
    campaign: {
      goals: strategy.goals || [],
      audience: strategy.audience || [],
      pillars: strategy.pillars || [],
      offer: strategy.offer || "",
      cta: strategy.cta || "",
    },
    claims: {
      blockedClaims: claims.blockedClaims || [],
    },
  };

  let result;
  try {
    result = await window.diamond?.evaluateDraft?.(payload);
  } catch (err) {
    draft.llmEvaluation = {
      score: draft.qualityScore || 50,
      status: draft.status,
      summary: `Evaluation error: ${err && err.message ? err.message : String(err)}`,
      issues: [],
      suggestions: [],
      evaluatedAt: new Date().toISOString(),
    };
    draft.updatedAt = new Date().toISOString();
    return;
  }

  if (!result || !result.ok || !result.evaluation) {
    // Degraded (no key) or unexpected shape — store a note so it's visible, keep deterministic status.
    draft.llmEvaluation = {
      score: draft.qualityScore || 50,
      status: draft.status,
      summary: result?.error ? `Evaluation failed: ${result.error}` : "AI evaluation unavailable — deterministic result shown.",
      issues: [],
      suggestions: [],
      evaluatedAt: new Date().toISOString(),
    };
    draft.updatedAt = new Date().toISOString();
    return;
  }

  const { score, status, summary, issues, suggestions } = result.evaluation;
  draft.llmEvaluation = { score, status, summary, issues, suggestions, evaluatedAt: new Date().toISOString() };
  draft.qualityScore = score;
  // Take the more cautious status: blocked always wins, then needs_review, then LLM result.
  if (draft.status !== "blocked") {
    draft.status = status === "blocked" ? "blocked"
      : (status === "needs_review" || draft.status === "needs_review") ? "needs_review"
      : status;
  }
  draft.evaluatedAt = new Date().toISOString();
  draft.updatedAt = draft.evaluatedAt;

  // Auto-rewrite: apply the evaluation's recommendations to produce a suggested revision.
  // Skipped when the draft is blocked or the caller opted out (evaluate-only mode).
  if (!skipRewrite && (issues?.length || suggestions?.length) && draft.status !== "blocked") {
    const rewritePayload = {
      platform: draft.platform,
      text: draft.text || "",
      charLimit: draft.charLimit || null,
      issues: issues || [],
      suggestions: suggestions || [],
      brand: { voice: payload.brand.voice || "" },
    };
    try {
      const rewriteResult = await window.diamond?.rewriteDraft?.(rewritePayload);
      if (rewriteResult?.ok && rewriteResult?.revisedText) {
        draft.llmRevisedText = rewriteResult.revisedText;
        draft.llmRevisedAt = new Date().toISOString();
      }
    } catch {
      // Rewrite failure is non-fatal — evaluation result is still shown.
    }
  }
}

// Evaluate All — LLM evaluation on every active draft, no auto-rewrite.
async function evaluateAllDrafts() {
  if (!activePostPackageId) return;
  const drafts = prototypeModel.platformDrafts.filter(
    (draft) => draft.postPackageId === activePostPackageId && String(draft.text || "").trim().length > 0
  );
  if (!drafts.length) return;
  const btn = document.querySelector("#detail-evaluate-all");
  if (btn) { btn.disabled = true; btn.textContent = "Evaluating…"; }
  try {
    for (const draft of drafts) {
      await llmEvaluatePlatformDraft(draft, { skipRewrite: true });
    }
    updatePostPackageFromDrafts(activePostPackageId);
    await saveProductionState();
    await refreshProductionViews();
    reopenActiveDetail();
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Evaluate All"; }
  }
}

// Evaluation Automation — LLM evaluation + auto-rewrite on every active draft.
async function requestEvaluationAutomation() {
  if (!activePostPackageId) return;
  const drafts = prototypeModel.platformDrafts.filter(
    (draft) => draft.postPackageId === activePostPackageId && String(draft.text || "").trim().length > 0
  );
  if (!drafts.length) return;
  const btn = document.querySelector("#eval-auto-generate");
  if (btn) { btn.disabled = true; btn.textContent = "Evaluating…"; }
  try {
    for (const draft of drafts) {
      await llmEvaluatePlatformDraft(draft);
    }
    updatePostPackageFromDrafts(activePostPackageId);
    await saveProductionState();
    await refreshProductionViews();
    reopenActiveDetail();
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Evaluation Automation"; }
  }
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

async function capturePlatformDraftProof(draft, proofKind = "") {
  const account = accountForDraft(draft);
  const capturedAt = new Date().toISOString();
  const kind = normalizeProofKind(proofKind || await promptForText("Proof kind", defaultProofKind(draft)));
  if (account) {
    account.proofCount = Number(account.proofCount || 0) + 1;
    account.lastProofAt = capturedAt;
  }
  draft.proofCapturedAt = capturedAt;
  draft.proofKind = kind;
  draft.proofNote = `${titleCase(kind)} proof captured for ${platformLabel(draft.platform)}${account?.handle ? ` / ${account.handle}` : ""}.`;
  draft.updatedAt = capturedAt;
  recordPlatformProofKind(account, draft, kind);
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

function recordPlatformProofKind(account, draft, kind) {
  if (!account) return null;
  const proof = getPlatformProofForAccount(account);
  const proofType = platformProofTypeFromKind(kind, draft.platform || account.platform);
  const notes = `${titleCase(kind)} proof captured for ${platformLabel(draft.platform || account.platform)}.`;
  let next = proof;
  if (proofType === "login") next = markPlatformLoginProof(proof, notes);
  if (["text", "media", "manual"].includes(proofType)) next = markPlatformProof(proof, proofType, notes);
  if (proofType === "monitoring") return proof;
  state.platformProofs = (state.platformProofs || []).map((item) => item.id === next.id ? next : item);
  return next;
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
  markGeneratedDraftsStale();
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
    // Only overwrite auto-sourced drafts; preserve generated/manual copy.
    const draft = activePostPackageId
      ? prototypeModel.platformDrafts.find((d) => d.postPackageId === activePostPackageId && d.platform === platform)
      : null;
    if (draft && draft.textSource !== "auto") return;
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

function renderLockedCampaignTags(postPackage) {
  const container = document.querySelector("#campaign-tags-locked");
  if (!container) return;
  const campaign = (state.campaigns || []).find((c) => c.id === postPackage?.campaignId);
  const tags = campaign?.postTags || [];
  if (!tags.length) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }
  container.hidden = false;
  container.innerHTML = tags.map((tag) => `<span class="locked-tag" title="Campaign tag — cannot be removed">${escapeHtml(tag)}</span>`).join("");
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
      // Only auto-sourced drafts mirror the idea text. Generated ("llm"),
      // template-fallback, and manually edited drafts keep their own copy.
      if (draft.textSource === "auto") draft.text = platformCopy(idea, draft.platform);
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
  const context = state.context || {};
  // Require companyId/brandId match to prevent cross-tenant selection.
  const account = (state.socialAccounts || []).find((acct) =>
    acct.platform === platform &&
    (!context.companyId || acct.companyId === context.companyId) &&
    (!context.brandId || acct.brandId === context.brandId)
  );
  return account?.id || context.socialAccountId;
}

function accountForDraft(draft) {
  return (state.socialAccounts || []).find((account) => account.id === draft.socialAccountId)
    // Require companyId/brandId match in the platform fallback to prevent cross-tenant selection.
    || (state.socialAccounts || []).find((account) =>
        account.platform === draft.platform &&
        (!draft.companyId || account.companyId === draft.companyId) &&
        (!draft.brandId || account.brandId === draft.brandId)
      )
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
  if (account && ((draft.companyId && account.companyId !== draft.companyId) || (draft.brandId && account.brandId !== draft.brandId))) {
    issues.push("Assigned account does not match this post's company/brand.");
  }
  if (draft.generationStatus === "needs-attention") {
    issues.push("Draft needs attention after a scope change — regenerate before staging.");
  }
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
  if ((draft.platform === "youtube-shorts" || draft.platform === "youtube-longform") && media.length && !kinds.has("video")) {
    typeMismatch = `${platformLabel(draft.platform)} needs video media.`;
  }
  if (draft.platform === "tiktok" && media.length && !kinds.has("video")) {
    typeMismatch = "TikTok should use video media.";
  }
  if (draft.platform === "pinterest" && media.length && !kinds.has("image") && !kinds.has("video")) {
    typeMismatch = "Pinterest should use image or video media.";
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

function guidanceForContext(context = {}) {
  const brandId = context.brandId || state.context?.brandId || "";
  const campaignId = context.campaignId || state.context?.campaignId || "";
  const strategy = (state.contentStrategies || []).find((item) => item.campaignId === campaignId) || {};
  guidanceModulesForCampaign(campaignId, strategy);
  const modules = (state.brandGuidanceModules || [])
    .filter((module) => module.brandId === brandId && module.enabled !== false)
    .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
    .map(guidanceModuleSnapshot);
  const campaignModules = (state.campaignGuidanceModules || [])
    .filter((module) => module.campaignId === campaignId && module.enabled !== false)
    .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
    .map(guidanceModuleSnapshot);
  return {
    modules,
    summary: modules.map((module) => `${module.title}: ${module.content}`).filter(Boolean).join("\n\n"),
    campaignModules,
    campaignSummary: campaignModules.map((module) => `${module.title}: ${module.content}`).filter(Boolean).join("\n\n"),
  };
}

function brandLibraryWithGuidance(library = {}, modules = []) {
  const moduleByKey = (key) => modules.find((module) => module.key === key);
  return {
    ...library,
    voice: moduleByKey("brandVoice")?.content || library.voice || "",
    approvedPhrases: listValueFromText(moduleByKey("approvedPhrases")?.content || "").length
      ? listValueFromText(moduleByKey("approvedPhrases")?.content)
      : library.approvedPhrases,
    bannedPhrases: listValueFromText(moduleByKey("bannedPhrases")?.content || "").length
      ? listValueFromText(moduleByKey("bannedPhrases")?.content)
      : library.bannedPhrases,
    guidanceModules: modules,
  };
}

function claimLibraryWithGuidance(library = {}, modules = []) {
  const moduleByKey = (key) => modules.find((module) => module.key === key);
  const listFor = (key, fallback) => {
    const values = listValueFromText(moduleByKey(key)?.content || "");
    return values.length ? values : fallback;
  };
  return {
    ...library,
    prizeLanguage: listFor("prizeLanguage", library.prizeLanguage),
    freeToPlayLanguage: listFor("freeToPlayLanguage", library.freeToPlayLanguage),
    requiresReviewClaims: listFor("requiresReviewClaims", library.requiresReviewClaims),
    blockedClaims: listFor("blockedClaims", library.blockedClaims),
    guidanceModules: modules,
  };
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

function showInputModal(label, fallback = "") {
  return new Promise((resolve) => {
    const dialog = document.querySelector("#input-modal");
    const labelEl = document.querySelector("#input-modal-label");
    const field = document.querySelector("#input-modal-field");
    const cancelBtn = document.querySelector("#input-modal-cancel");
    labelEl.textContent = label;
    field.value = fallback;
    const onClose = () => {
      cancelBtn.removeEventListener("click", onCancel);
      resolve(dialog.returnValue === "ok" ? field.value.trim() || null : null);
    };
    const onCancel = () => {
      dialog.removeEventListener("close", onClose);
      dialog.close("");
      resolve(null);
    };
    dialog.addEventListener("close", onClose, { once: true });
    cancelBtn.addEventListener("click", onCancel, { once: true });
    dialog.showModal();
    field.focus();
    field.select();
  });
}

function showConfirmModal(message) {
  return new Promise((resolve) => {
    const dialog = document.querySelector("#confirm-modal");
    const messageEl = document.querySelector("#confirm-modal-message");
    const cancelBtn = document.querySelector("#confirm-modal-cancel");
    messageEl.textContent = message;
    const onClose = () => {
      cancelBtn.removeEventListener("click", onCancel);
      resolve(dialog.returnValue === "ok");
    };
    const onCancel = () => {
      dialog.removeEventListener("close", onClose);
      dialog.close("");
      resolve(false);
    };
    dialog.addEventListener("close", onClose, { once: true });
    cancelBtn.addEventListener("click", onCancel, { once: true });
    dialog.showModal();
  });
}

async function promptForText(label, fallback = "") {
  return (await showInputModal(label, fallback)) || "";
}

function startGuideTour() {
  activeTourSteps = tourSteps;
  activeTourIndex = 0;
  showTourStep();
}

function startFirstRunTour() {
  activeTourSteps = firstRunSteps;
  activeTourIndex = 0;
  showTourStep();
}

function moveTour(delta) {
  if (activeTourIndex === activeTourSteps.length - 1 && delta > 0) {
    closeGuideTour();
    return;
  }
  activeTourIndex = Math.max(0, Math.min(activeTourSteps.length - 1, activeTourIndex + delta));
  showTourStep();
}

async function showTourStep() {
  const step = activeTourSteps[activeTourIndex];
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
  document.querySelector("#tour-progress").textContent = `Step ${activeTourIndex + 1} of ${activeTourSteps.length}`;
  document.querySelector("#tour-title").textContent = step.title;
  document.querySelector("#tour-body").textContent = step.voiceoverText;
  document.querySelector("#tour-voice").textContent = "Voiceover: " + step.voiceoverText;
  document.querySelector("#tour-prev").disabled = activeTourIndex === 0;
  document.querySelector("#tour-next").textContent = activeTourIndex === activeTourSteps.length - 1 ? "Done" : "Next";
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
  activeTourSteps = tourSteps;
}

async function playTourVoiceover() {
  const step = activeTourSteps[activeTourIndex];
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
    "youtube-shorts": "YS",
    "youtube-longform": "YT",
    pinterest: "P",
    reddit: "r/",
  }[platform] || "+";
}

function platformLabel(platform) {
  return {
    linkedin: "LinkedIn",
    x: "X",
    instagram: "Instagram",
    tiktok: "TikTok",
    facebook: "Facebook",
    "youtube-shorts": "YouTube Shorts",
    "youtube-longform": "YouTube Long Form",
    pinterest: "Pinterest",
    reddit: "Reddit",
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
