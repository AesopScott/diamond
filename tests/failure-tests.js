import assert from "node:assert/strict";
import {
  canStageDraft,
  createPostDraft,
  createSeedWorkspace,
  createTenantContext,
  findDuplicateDraft,
  getSessionForContext,
  inferSessionStatusFromUrl,
  updateAccountSession,
  validateAssetForUse,
  validateMediaRequirement,
  validateRoutineSlot,
  validateSessionForStaging,
} from "../src/index.js";

const workspace = createSeedWorkspace();
const context = workspace.context;
const policy = workspace.approvalPolicies[0];
const brandLibrary = workspace.brandLibraries[0];
const claimLibrary = workspace.claimLibraries[0];

const safeDraft = createPostDraft({
  draftId: "safe-draft",
  context,
  text: "Check the match card and compare your read with the leaderboard.",
  approvalPolicy: policy,
});

const readySession = updateAccountSession(getSessionForContext({}, context), {
  status: "ready",
  currentUrl: "https://x.com/home",
  note: "Ready.",
});

assert.equal(
  validateSessionForStaging(readySession, createTenantContext({ ...context, socialAccountId: "wrong-account" })).ok,
  false,
  "wrong account sessions must fail closed",
);

assert.equal(
  validateSessionForStaging({ ...readySession, id: "browser-profiles/thecard-bet/x/the-card-main/other-profile" }, context).ok,
  false,
  "browser profile mismatches must fail closed",
);

["unknown", "login_required", "challenge", "error"].forEach((status) => {
  const session = updateAccountSession(readySession, { status });
  assert.equal(
    validateSessionForStaging(session, context).ok,
    false,
    `${status} sessions must not stage`,
  );
});

assert.equal(
  inferSessionStatusFromUrl("https://x.com/account/access", workspace.socialAccounts[0]).status,
  "login_required",
  "account access pages must be treated as login/access interruptions",
);
assert.equal(
  inferSessionStatusFromUrl("https://x.com/challenge", workspace.socialAccounts[0]).status,
  "challenge",
  "challenge pages must be treated as human-action interruptions",
);
assert.equal(
  inferSessionStatusFromUrl("https://example.com/home", workspace.socialAccounts[0]).status,
  "unknown",
  "wrong hosts must not be trusted as ready sessions",
);

const reviewDraft = createPostDraft({
  context,
  text: "Win the $1,000 prize pool by finishing first.",
  approvalPolicy: policy,
  claimLibrary,
});
assert.equal(canStageDraft(reviewDraft, { sessionCheck: validateSessionForStaging(readySession, context) }).ok, false);

const approvedReviewDraft = { ...reviewDraft, status: "approved" };
assert.equal(canStageDraft(approvedReviewDraft, { sessionCheck: validateSessionForStaging(readySession, context) }).ok, true);

const blockedDraft = createPostDraft({
  context,
  text: "This is a guaranteed win for every fan.",
  approvalPolicy: policy,
  brandLibrary,
  claimLibrary,
});
assert.equal(canStageDraft(blockedDraft, { sessionCheck: validateSessionForStaging(readySession, context) }).ok, false);

const draftOnly = {
  ...safeDraft,
  context: { ...safeDraft.context, postingMode: "draft_only" },
};
assert.equal(canStageDraft(draftOnly, { sessionCheck: validateSessionForStaging(readySession, context) }).ok, false);

assert.equal(validateMediaRequirement([], { required: true }).ok, false, "required media must fail when missing");
assert.equal(validateMediaRequirement(["C:/asset.png"], { required: true }).ok, true, "required media passes when present");
assert.equal(validateAssetForUse({ filePath: "C:/asset.png", doNotUse: true }).ok, false, "do-not-use assets must fail");
assert.equal(validateAssetForUse({ filePath: "C:/asset.png" }, { requireAltText: true }).ok, false, "required alt text must fail when missing");
assert.equal(validateAssetForUse({ filePath: "C:/asset.png", altText: "Leaderboard", safeZone: "center safe" }, { requireAltText: true, requireSafeZone: true }).ok, true);

const duplicateDraft = createPostDraft({
  draftId: "duplicate-draft",
  context,
  text: "Check the match card and compare your read with the leaderboard.",
  approvalPolicy: policy,
});
assert.equal(findDuplicateDraft(duplicateDraft, [safeDraft])?.id, safeDraft.id, "duplicate draft text must be detected");

const otherTenantDuplicate = createPostDraft({
  context: createTenantContext({ ...context, campaignId: "other-campaign" }),
  text: duplicateDraft.text,
  approvalPolicy: policy,
});
assert.equal(findDuplicateDraft(otherTenantDuplicate, [safeDraft]), null, "duplicates are scoped by tenant context");

const dueSlot = {
  companyId: context.companyId,
  brandId: context.brandId,
  campaignId: context.campaignId,
  platform: context.platform,
  socialAccountId: context.socialAccountId,
  topic: "World Cup free league push",
  status: "planned",
  plannedAt: "2026-05-11T12:00:00.000Z",
};
const strategy = { cta: "Join the free league.", pillars: ["Country pride"] };
assert.equal(validateRoutineSlot(dueSlot, { strategy, now: "2026-05-11T12:10:00.000Z" }).ok, true);
assert.equal(validateRoutineSlot({ ...dueSlot, topic: "" }, { strategy, now: "2026-05-11T12:10:00.000Z" }).ok, false);
assert.equal(validateRoutineSlot(dueSlot, { strategy: { ...strategy, cta: "" }, now: "2026-05-11T12:10:00.000Z" }).ok, false);
assert.equal(validateRoutineSlot({ ...dueSlot, plannedAt: "2026-05-11T13:00:00.000Z" }, { strategy, now: "2026-05-11T12:10:00.000Z" }).ok, false);
assert.equal(validateRoutineSlot({ ...dueSlot, status: "posted" }, { strategy, now: "2026-05-11T12:10:00.000Z" }).ok, false);

console.log("All Diamond failure tests passed.");
