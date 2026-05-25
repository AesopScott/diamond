const LEGACY_CARD_COMPANY_ID = "aesop-academy";
const CARD_COMPANY_ID = "thecard-bet";
const CARD_COMPANY_NAME = "thecard.bet";
const CARD_BROWSER_PROFILE_ID = "thecard-bet-x-main";

export function migrateWorkspaceState(workspace) {
  if (!workspace || typeof workspace !== "object") return workspace;
  let ws = migrateCardCompany(workspace);
  ws = migrateClearBrandDerivedHandles(ws);
  return ws;
}

/**
 * Clear social account handles that were auto-derived from brand/company names.
 * Brand names are used as advertised product identities, not platform login names.
 * A handle is brand-derived when it contains spaces (no real handle has spaces)
 * or matches a known non-handle pattern. Once cleared, users set the real handle
 * via the @Username field in the account header.
 * Migration flag: _handlesClearedV1 prevents re-running.
 */
function migrateClearBrandDerivedHandles(workspace) {
  if (workspace._handlesClearedV1) return workspace;
  const next = structuredClone(workspace);
  // All handles before v0.1.68 were auto-derived from brand/company names
  // (e.g. "AA Mappings" → "@AAMappings"). Since the @Username field was only
  // added in v0.1.70, no user has ever set a real handle — clear all of them
  // unconditionally so the user can enter their actual platform usernames.
  (next.socialAccounts || []).forEach((account) => {
    account.handle = "";
  });
  next._handlesClearedV1 = true;
  return next;
}

function migrateCardCompany(workspace) {
  const next = structuredClone(workspace);
  const hasLegacyCompany = next.companies?.some((company) => company.id === LEGACY_CARD_COMPANY_ID || company.name === "Aesop Academy");
  if (!hasLegacyCompany) return next;

  replaceCompanyRows(next.companies);
  replaceCompanyScopedRows(next.brands);
  replaceCompanyScopedRows(next.campaigns);
  replaceCompanyScopedRows(next.approvalPolicies);
  replaceCompanyScopedRows(next.brandLibraries);
  replaceCompanyScopedRows(next.claimLibraries);
  replaceCompanyScopedRows(next.contentStrategies);
  replaceCompanyScopedRows(next.editorialSlots);
  replaceCompanyScopedRows(next.assetLibrary);
  replaceCompanyScopedRows(next.socialTemplates);
  replaceSocialAccounts(next.socialAccounts);
  replaceContext(next.context);
  replaceDrafts(next.drafts);
  next.sessions = {};
  return next;
}

function replaceCompanyRows(rows = []) {
  rows.forEach((row) => {
    if (row.id === LEGACY_CARD_COMPANY_ID || row.name === "Aesop Academy") {
      row.id = CARD_COMPANY_ID;
      row.name = CARD_COMPANY_NAME;
    }
  });
}

function replaceCompanyScopedRows(rows = []) {
  rows.forEach((row) => {
    if (row.companyId === LEGACY_CARD_COMPANY_ID) row.companyId = CARD_COMPANY_ID;
  });
}

function replaceSocialAccounts(rows = []) {
  rows.forEach((row) => {
    if (row.companyId === LEGACY_CARD_COMPANY_ID) {
      row.companyId = CARD_COMPANY_ID;
      row.browserProfileId = CARD_BROWSER_PROFILE_ID;
    }
  });
}

function replaceContext(context) {
  if (!context || context.companyId !== LEGACY_CARD_COMPANY_ID) return;
  context.companyId = CARD_COMPANY_ID;
  context.browserProfileId = CARD_BROWSER_PROFILE_ID;
}

function replaceDrafts(rows = []) {
  rows.forEach((row) => {
    replaceContext(row.context);
    if (typeof row.firestorePath === "string") {
      row.firestorePath = row.firestorePath.replace("companies/aesop-academy/", "companies/thecard-bet/");
    }
  });
}
