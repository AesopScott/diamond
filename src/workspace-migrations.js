const LEGACY_CARD_COMPANY_ID = "aesop-academy";
const CARD_COMPANY_ID = "thecard-bet";
const CARD_COMPANY_NAME = "thecard.bet";
const CARD_BROWSER_PROFILE_ID = "thecard-bet-x-main";

export function migrateWorkspaceState(workspace) {
  if (!workspace || typeof workspace !== "object") return workspace;
  return migrateCardCompany(workspace);
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
