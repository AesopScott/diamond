import assert from "node:assert/strict";
import {
  createPlatformProofRecord,
  createSeedWorkspace,
  ensurePlatformProofRecords,
  evaluatePlatformProof,
  getPlatformBrowserAdapter,
  markPlatformProof,
  platformProofId,
} from "../src/index.js";

const workspace = createSeedWorkspace();
const withProofs = ensurePlatformProofRecords(workspace);
assert.equal(withProofs.platformProofs.length, workspace.socialAccounts.length);

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
const xEvaluation = evaluatePlatformProof(proven, getPlatformBrowserAdapter("x"));
assert.equal(xEvaluation.status, "assisted_proven");
assert.equal(xEvaluation.ok, true);

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

console.log("All Diamond platform proof tests passed.");

