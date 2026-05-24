import assert from "node:assert/strict";
import {
  approvalLevelForText,
  browserProfilePath,
  canStageDraft,
  contextsMatch,
  defaultComposeUrlForPlatform,
  createPostDraft,
  createSeedWorkspace,
  createTenantContext,
  defaultLoginUrlForPlatform,
  getSessionForContext,
  inferSessionStatusFromUrl,
  migrateWorkspaceState,
  normalizeAccountUrl,
  normalizeBrowserProfileId,
  normalizeComposeUrl,
  normalizeHost,
  normalizeLoginUrl,
  resolveComposeUrl,
  resolveLoginUrl,
  updateAccountSession,
  validateSessionForStaging,
} from "../src/index.js";

const workspace = createSeedWorkspace();

const safeDraft = createPostDraft({
  context: workspace.context,
  text: "Today is a good day to check the match card and compare your read with the leaderboard.",
  approvalPolicy: workspace.approvalPolicies[0],
});

assert.equal(safeDraft.approvalLevel, "auto_allowed");
assert.equal(canStageDraft(safeDraft).ok, true);
assert.match(safeDraft.firestorePath, /^companies\/thecard-bet\/brands\/the-card\/postdrafts\//);

const prizeDraft = createPostDraft({
  context: workspace.context,
  text: "Win the $1,000 prize pool by finishing first.",
  approvalPolicy: workspace.approvalPolicies[0],
});

assert.equal(prizeDraft.approvalLevel, "review_required");
assert.equal(canStageDraft(prizeDraft).ok, false);

const brandBlockedDraft = createPostDraft({
  context: workspace.context,
  text: "This is a guaranteed win for every fan.",
  approvalPolicy: workspace.approvalPolicies[0],
  brandLibrary: workspace.brandLibraries[0],
  claimLibrary: workspace.claimLibraries[0],
});
assert.equal(brandBlockedDraft.approvalLevel, "blocked");
assert.ok(brandBlockedDraft.riskFlags.includes("banned_phrase"));
assert.ok(brandBlockedDraft.riskDetails.some((detail) => detail.includes("Banned phrase")));

const libraryReview = approvalLevelForText("The winner gets the $1,000 total payouts.", {
  ...workspace.approvalPolicies[0],
  brandLibrary: workspace.brandLibraries[0],
  claimLibrary: workspace.claimLibraries[0],
});
assert.equal(libraryReview.level, "review_required");
assert.ok(libraryReview.details.some((detail) => detail.includes("Prize language")));

const otherContext = createTenantContext({
  ...workspace.context,
  companyId: "Other Company",
  browserProfileId: "other-x-main",
});

assert.equal(contextsMatch(workspace.context, workspace.context), true);
assert.equal(contextsMatch(workspace.context, otherContext), false);
assert.equal(
  browserProfilePath(workspace.context),
  "browser-profiles/thecard-bet/x/the-card-main/thecard-bet-x-main",
);

const risk = approvalLevelForText("Is this gambling or regulated by the CFTC?", workspace.approvalPolicies[0]);
assert.equal(risk.level, "review_required");
assert.deepEqual(risk.flags.sort(), ["gambling", "regulatory"].sort());

const unknownSession = getSessionForContext({}, workspace.context);
assert.equal(validateSessionForStaging(unknownSession, workspace.context).ok, false);

const readySession = updateAccountSession(unknownSession, {
  status: "ready",
  currentUrl: "https://x.com/home",
  note: "Ready for staging.",
});
assert.equal(validateSessionForStaging(readySession, workspace.context).ok, true);
assert.equal(canStageDraft(safeDraft, { sessionCheck: validateSessionForStaging(readySession, workspace.context) }).ok, true);
assert.equal(validateSessionForStaging(readySession, otherContext).ok, false);

const stagedReviewDraft = {
  ...prizeDraft,
  status: "staged",
  context: {
    ...prizeDraft.context,
    postingMode: "stage_for_review",
  },
};
assert.equal(canStageDraft(stagedReviewDraft, { sessionCheck: validateSessionForStaging(readySession, workspace.context) }).ok, true);

assert.equal(inferSessionStatusFromUrl("https://x.com/login", workspace.socialAccounts[0]).status, "login_required");
assert.equal(inferSessionStatusFromUrl("https://x.com/home", workspace.socialAccounts[0]).status, "ready");
assert.equal(inferSessionStatusFromUrl("https://www.tiktok.com/404?fromUrl=/bad", { expectedHost: "tiktok.com" }).status, "error");
assert.equal(normalizeAccountUrl("@TheCard", "x"), "https://x.com/TheCard");
assert.equal(normalizeAccountUrl("thecard", "x"), "https://x.com/thecard");
assert.equal(defaultLoginUrlForPlatform("x"), "https://x.com/i/flow/login");
assert.equal(normalizeLoginUrl("", "x"), "https://x.com/i/flow/login");
assert.equal(resolveLoginUrl(workspace.socialAccounts[0]), "https://x.com/i/flow/login");
assert.equal(normalizeLoginUrl("https://www.tiktok.com/login", "tiktok"), "https://www.tiktok.com/login");
assert.equal(normalizeLoginUrl("https://m.tiktok.com/login", "tiktok"), "https://www.tiktok.com/login");
assert.equal(normalizeLoginUrl("https://www.tiktok.com/login/phone-or-email/email", "tiktok"), "https://www.tiktok.com/login");
assert.equal(inferSessionStatusFromUrl("https://m.tiktok.com/foryou", { expectedHost: "tiktok.com" }).status, "ready");
assert.equal(defaultComposeUrlForPlatform("x"), "https://x.com/compose/post");
assert.equal(normalizeComposeUrl("", "x"), "https://x.com/compose/post");
assert.equal(resolveComposeUrl(workspace.socialAccounts[0]), "https://x.com/compose/post");
assert.equal(normalizeHost("https://www.x.com/thecard"), "x.com");
assert.equal(normalizeBrowserProfileId("Aesop / The Card / X"), "aesop-the-card-x");

const legacyWorkspace = {
  companies: [{ id: "aesop-academy", name: "Aesop Academy", defaultApprovalPolicyId: "default-risk-review" }],
  brands: [{ id: "the-card", companyId: "aesop-academy", name: "The Card" }],
  socialAccounts: [{ id: "the-card-main", companyId: "aesop-academy", browserProfileId: "aesop-the-card-x-main" }],
  campaigns: [{ id: "world-cup-2026", companyId: "aesop-academy" }],
  approvalPolicies: [{ id: "default-risk-review", companyId: "aesop-academy" }],
  context: { ...workspace.context, companyId: "aesop-academy", browserProfileId: "aesop-the-card-x-main" },
  drafts: [{ context: { ...workspace.context, companyId: "aesop-academy", browserProfileId: "aesop-the-card-x-main" }, firestorePath: "companies/aesop-academy/brands/the-card/postDrafts/x-1" }],
  sessions: { old: { status: "ready" } },
};
const migratedWorkspace = migrateWorkspaceState(legacyWorkspace);
assert.equal(migratedWorkspace.companies[0].id, "thecard-bet");
assert.equal(migratedWorkspace.companies[0].name, "thecard.bet");
assert.equal(migratedWorkspace.socialAccounts[0].browserProfileId, "thecard-bet-x-main");
assert.equal(migratedWorkspace.context.companyId, "thecard-bet");
assert.equal(migratedWorkspace.drafts[0].firestorePath, "companies/thecard-bet/brands/the-card/postDrafts/x-1");
assert.deepEqual(migratedWorkspace.sessions, {});

console.log("All Diamond tests passed.");
