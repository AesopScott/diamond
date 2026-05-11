import assert from "node:assert/strict";
import {
  createPostDraft,
  createSeedWorkspace,
  evaluateDraftQuality,
  createPostMemoryRecord,
  canStageDraft,
} from "../src/index.js";

const workspace = createSeedWorkspace();
const context = workspace.context;
const strategy = workspace.contentStrategies[0];
const brandLibrary = workspace.brandLibraries[0];
const claimLibrary = workspace.claimLibraries[0];
const policy = workspace.approvalPolicies[0];
const slot = workspace.editorialSlots[0];
const asset = workspace.assetLibrary[0];

function draft(text, extra = {}) {
  return createPostDraft({
    context,
    text,
    language: "en",
    approvalPolicy: policy,
    brandLibrary,
    claimLibrary,
    ...extra,
  });
}

const strongDraft = draft("Join the free World Cup league at thecard.bet. Track country pride, watch the leaderboard move, and make every matchday matter.", {
  media: [asset.filePath],
});
const strongQuality = evaluateDraftQuality({
  draft: strongDraft,
  strategy,
  memory: [],
  assets: [asset],
  slot,
});
assert.equal(strongQuality.level, "strong");
assert.ok(strongQuality.score >= 80);

const duplicateMemory = [createPostMemoryRecord({ draft: strongDraft, status: "posted" })];
const duplicateQuality = evaluateDraftQuality({
  draft: draft(strongDraft.text, { media: [asset.filePath] }),
  strategy,
  memory: duplicateMemory,
  assets: [asset],
  slot,
});
assert.equal(duplicateQuality.level, "hold");
assert.match(duplicateQuality.details.join(" "), /Novelty/);

const missingCtaQuality = evaluateDraftQuality({
  draft: draft("World Cup fans can climb the board with country pride and matchday predictions.", { media: [asset.filePath] }),
  strategy,
  memory: [],
  assets: [asset],
  slot,
});
assert.equal(missingCtaQuality.level, "review");
assert.match(missingCtaQuality.details.join(" "), /CTA/);

const spanishMismatch = draft("Join the free World Cup league at thecard.bet. Track the board and represent your country.", {
  language: "es",
  media: [asset.filePath],
});
const spanishQuality = evaluateDraftQuality({
  draft: spanishMismatch,
  strategy,
  memory: [],
  assets: [asset],
  slot: { ...slot, language: "es" },
});
assert.match(spanishQuality.details.join(" "), /Language/);

const missingAssetQuality = evaluateDraftQuality({
  draft: draft("Join the free World Cup league at thecard.bet. Track country pride and leaderboard movement for every matchday."),
  strategy,
  memory: [],
  assets: [],
  slot,
});
assert.equal(missingAssetQuality.level, "review");
assert.match(missingAssetQuality.details.join(" "), /missing country leaderboard image/);

strongDraft.qualityGate = "hold";
assert.equal(canStageDraft(strongDraft).ok, false);

console.log("All Diamond quality tests passed.");
