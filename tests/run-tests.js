import assert from "node:assert/strict";
import {
  approvalLevelForText,
  browserProfilePath,
  canStageDraft,
  contextsMatch,
  createPostDraft,
  createSeedWorkspace,
  createTenantContext,
  defaultLoginUrlForPlatform,
  getSessionForContext,
  inferSessionStatusFromUrl,
  normalizeAccountUrl,
  normalizeBrowserProfileId,
  normalizeHost,
  normalizeLoginUrl,
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
assert.match(safeDraft.firestorePath, /^companies\/aesop-academy\/brands\/the-card\/postdrafts\//);

const prizeDraft = createPostDraft({
  context: workspace.context,
  text: "Win the $1,000 prize pool by finishing first.",
  approvalPolicy: workspace.approvalPolicies[0],
});

assert.equal(prizeDraft.approvalLevel, "review_required");
assert.equal(canStageDraft(prizeDraft).ok, false);

const otherContext = createTenantContext({
  ...workspace.context,
  companyId: "Other Company",
  browserProfileId: "other-x-main",
});

assert.equal(contextsMatch(workspace.context, workspace.context), true);
assert.equal(contextsMatch(workspace.context, otherContext), false);
assert.equal(
  browserProfilePath(workspace.context),
  "browser-profiles/aesop-academy/x/the-card-main/aesop-the-card-x-main",
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

assert.equal(inferSessionStatusFromUrl("https://x.com/login", workspace.socialAccounts[0]).status, "login_required");
assert.equal(inferSessionStatusFromUrl("https://x.com/home", workspace.socialAccounts[0]).status, "ready");
assert.equal(normalizeAccountUrl("@TheCard", "x"), "https://x.com/TheCard");
assert.equal(normalizeAccountUrl("thecard", "x"), "https://x.com/thecard");
assert.equal(defaultLoginUrlForPlatform("x"), "https://x.com/i/flow/login");
assert.equal(normalizeLoginUrl("", "x"), "https://x.com/i/flow/login");
assert.equal(resolveLoginUrl(workspace.socialAccounts[0]), "https://x.com/i/flow/login");
assert.equal(normalizeHost("https://www.x.com/thecard"), "x.com");
assert.equal(normalizeBrowserProfileId("Aesop / The Card / X"), "aesop-the-card-x");

console.log("All Diamond tests passed.");
