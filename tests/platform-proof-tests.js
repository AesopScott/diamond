import assert from "node:assert/strict";
import {
  createPlatformProofRecord,
  createSeedWorkspace,
  buildPlatformProofQueue,
  ensurePlatformProofRecords,
  evaluatePlatformProof,
  getPlatformBrowserAdapter,
  markPlatformLoginProof,
  markPlatformProof,
  markPlatformProofFromStage,
  platformProofId,
  platformProofQueueMarkdown,
  recordPlatformStagingProofSession,
  stagingProofSessionProgress,
} from "../src/index.js";

const workspace = createSeedWorkspace();
const withProofs = ensurePlatformProofRecords(workspace);
assert.equal(withProofs.platformProofs.length, workspace.socialAccounts.length);
const initialQueue = buildPlatformProofQueue(workspace);
assert.equal(initialQueue.length, workspace.socialAccounts.length);
assert.ok(initialQueue.find((item) => item.platform === "x").nextActions.some((action) => action.includes("text insertion")));
assert.ok(initialQueue.find((item) => item.platform === "instagram").nextActions.some((action) => action.includes("media upload")));
assert.equal(initialQueue.find((item) => item.platform === "reddit").status, "monitoring_only");

const xAccount = workspace.socialAccounts.find((account) => account.platform === "x");
const xProof = createPlatformProofRecord({
  companyId: xAccount.companyId,
  brandId: xAccount.brandId,
  platform: xAccount.platform,
  socialAccountId: xAccount.id,
});
assert.equal(xProof.id, platformProofId(xProof));
assert.equal(evaluatePlatformProof(xProof, getPlatformBrowserAdapter("x")).ok, false);

let proven = markPlatformProof(xProof, "text");
proven = markPlatformProof(proven, "text");
proven = markPlatformProof(proven, "text");
proven = markPlatformProof(proven, "media");
proven = recordPlatformStagingProofSession(proven, { appSessionId: "session-proof-1", draftId: "proof-1", ok: true });
proven = recordPlatformStagingProofSession(proven, { appSessionId: "session-proof-2", draftId: "proof-2", ok: true });
proven = recordPlatformStagingProofSession(proven, { appSessionId: "session-proof-3", draftId: "proof-3", ok: true });
const xEvaluation = evaluatePlatformProof(proven, getPlatformBrowserAdapter("x"));
assert.equal(xEvaluation.status, "assisted_proven");
assert.equal(xEvaluation.ok, true);
assert.match(xEvaluation.summary, /X staging proof 3\/3/);

const instagramProof = createPlatformProofRecord({
  companyId: "thecard-bet",
  brandId: "the-card",
  platform: "instagram",
  socialAccountId: "the-card-instagram",
});
assert.equal(evaluatePlatformProof(instagramProof, getPlatformBrowserAdapter("instagram")).status, "manual_needs_proof");
let manual = markPlatformProof(instagramProof, "manual");
manual = markPlatformProof(manual, "manual");
manual = markPlatformProof(manual, "manual");
assert.equal(evaluatePlatformProof(manual, getPlatformBrowserAdapter("instagram")).status, "manual_proven");

const redditProof = createPlatformProofRecord({
  companyId: "thecard-bet",
  brandId: "the-card",
  platform: "reddit",
  socialAccountId: "the-card-reddit",
});
assert.equal(evaluatePlatformProof(redditProof, getPlatformBrowserAdapter("reddit")).status, "monitoring_only");

const loginProof = markPlatformLoginProof(instagramProof, "Logged in manually.");
assert.equal(loginProof.loginProofCount, 1);
assert.ok(loginProof.lastLoginProofAt);
assert.match(evaluatePlatformProof(loginProof, getPlatformBrowserAdapter("instagram")).loginSummary, /Login proof 1\/1/);

const stageProof = markPlatformProofFromStage(xProof, {
  fillResult: { ok: true },
  mediaResult: { ok: true },
  hasMedia: true,
  appSessionId: "session-1",
  draftId: "draft-1",
  stageUrl: "https://x.com/compose/post",
  screenshotPath: "C:/Diamond/proof/session-1.png",
});
assert.equal(stageProof.changed, true);
assert.equal(stageProof.proof.textProofCount, 1);
assert.equal(stageProof.proof.mediaProofCount, 1);
assert.equal(stageProof.proof.stagingProofSessions.length, 1);
assert.equal(stagingProofSessionProgress(stageProof.proof).count, 1);

const manualStageProof = markPlatformProofFromStage(instagramProof, {
  fillResult: { ok: false, manual: true },
  mediaResult: { ok: false, manual: true },
  hasMedia: true,
});
assert.equal(manualStageProof.changed, true);
assert.equal(manualStageProof.proof.manualProofCount, 1);
assert.equal(manualStageProof.proof.mediaProofCount, 0);

let repeated = recordPlatformStagingProofSession(xProof, {
  appSessionId: "session-a",
  draftId: "draft-a",
  stageUrl: "https://x.com/compose/post",
  screenshotPath: "C:/Diamond/proof/a.png",
  ok: true,
});
repeated = recordPlatformStagingProofSession(repeated, {
  appSessionId: "session-b",
  draftId: "draft-b",
  stageUrl: "https://x.com/compose/post",
  screenshotPath: "C:/Diamond/proof/b.png",
  ok: true,
});
repeated = recordPlatformStagingProofSession(repeated, {
  appSessionId: "session-c",
  draftId: "draft-c",
  stageUrl: "https://x.com/compose/post",
  screenshotPath: "C:/Diamond/proof/c.png",
  ok: true,
});
const repeatedProgress = stagingProofSessionProgress(repeated);
assert.equal(repeatedProgress.count, 3);
assert.equal(repeatedProgress.complete, true);
assert.equal(repeatedProgress.label, "X staging proof 3/3");

const readyQueue = buildPlatformProofQueue({
  ...workspace,
  platformProofs: [
    markPlatformLoginProof(proven),
    {
      ...instagramProof,
      loginProofCount: 1,
      manualProofCount: 3,
      mediaProofCount: 1,
    },
    redditProof,
  ],
});
assert.equal(readyQueue.find((item) => item.platform === "x").status, "ready");
assert.equal(readyQueue.find((item) => item.platform === "instagram").status, "ready");
assert.match(platformProofQueueMarkdown(initialQueue), /Diamond Platform Proof Queue/);
assert.match(platformProofQueueMarkdown(initialQueue), /Instagram: Needs Proof/);

console.log("All Diamond platform proof tests passed.");
