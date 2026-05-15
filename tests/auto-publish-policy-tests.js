import assert from "node:assert/strict";
import {
  autoPublishDecisionMarkdown,
  canAutoPublishDraft,
  createPostDraft,
  createSeedWorkspace,
  evaluateAutoPublishReadiness,
} from "../src/index.js";

const workspace = createSeedWorkspace();
const draft = {
  ...createPostDraft({
    context: workspace.context,
    text: "Join the free World Cup league and compare your picks on the leaderboard.",
    approvalPolicy: workspace.approvalPolicies[0],
  }),
  status: "approved",
  qualityGate: "pass",
};

const locked = evaluateAutoPublishReadiness({ workspace, context: workspace.context });
assert.equal(locked.ok, false);
assert.equal(locked.status, "locked");
assert.match(locked.summary, /Auto-publish locked/);
assert.ok(locked.blockers.some((blocker) => blocker.includes("locked")));

const lockedDraft = canAutoPublishDraft(draft, { workspace, context: workspace.context });
assert.equal(lockedDraft.ok, false);
assert.match(lockedDraft.reason, /Auto-publish locked/);

const readyWorkspace = {
  ...workspace,
  autoPublishPolicy: {
    enabled: true,
    status: "enabled",
  },
  workflowSignoff: {
    status: "accepted",
    acceptedBy: "scott",
  },
  platformProofs: [
    {
      id: "proof-thecard-bet-the-card-x-the-card-main",
      companyId: workspace.context.companyId,
      brandId: workspace.context.brandId,
      platform: workspace.context.platform,
      socialAccountId: workspace.context.socialAccountId,
      textProofCount: 3,
      mediaProofCount: 1,
      manualProofCount: 0,
      loginProofCount: 1,
      stagingProofSessions: [
        { appSessionId: "session-1", draftId: "draft-1", ok: true },
        { appSessionId: "session-2", draftId: "draft-2", ok: true },
        { appSessionId: "session-3", draftId: "draft-3", ok: true },
      ],
    },
  ],
};
const ready = evaluateAutoPublishReadiness({
  workspace: readyWorkspace,
  context: workspace.context,
  licenseCheck: { ok: true },
});
assert.equal(ready.ok, true);
assert.equal(ready.status, "ready");

const allowedDraft = canAutoPublishDraft(draft, {
  workspace: readyWorkspace,
  context: workspace.context,
  licenseCheck: { ok: true },
});
assert.equal(allowedDraft.ok, true);

const reviewDraft = { ...draft, approvalLevel: "review_required" };
const blockedApproval = canAutoPublishDraft(reviewDraft, {
  workspace: readyWorkspace,
  context: workspace.context,
  licenseCheck: { ok: true },
});
assert.equal(blockedApproval.ok, false);
assert.match(blockedApproval.reason, /Approval level/);

const markdown = autoPublishDecisionMarkdown(ready);
assert.match(markdown, /Diamond Auto-Publish Decision/);
assert.match(markdown, /Status: Ready/);
assert.match(markdown, /Policy enabled: Ready/);

console.log("All Diamond auto-publish policy tests passed.");
