import assert from "node:assert/strict";
import {
  canStageDraft,
  createDefaultCadencePolicy,
  createPostDraft,
  createSeedWorkspace,
  validateCadenceForStaging,
} from "../src/index.js";

const workspace = createSeedWorkspace();
const context = workspace.context;
const policy = createDefaultCadencePolicy({
  companyId: context.companyId,
  brandId: context.brandId,
  campaignId: context.campaignId,
  maxPostsPerDay: 2,
  quietHoursStart: 23,
  quietHoursEnd: 6,
  cooldownMinutes: 45,
  duplicateLookbackDays: 14,
  routineDueWindowMinutes: 30,
  doNotEngageTerms: ["lawsuit"],
  escalationTerms: ["attorney"],
});
assert.equal(policy.routineDueWindowMinutes, 30);
assert.equal(createDefaultCadencePolicy({}).routineDueWindowMinutes, 15);
const draft = createPostDraft({
  context,
  text: "Join the free World Cup league at thecard.bet.",
  approvalPolicy: workspace.approvalPolicies[0],
  brandLibrary: workspace.brandLibraries[0],
  claimLibrary: workspace.claimLibraries[0],
});

const quiet = validateCadenceForStaging({
  policy,
  context,
  draft,
  now: "2026-05-11T23:30:00",
});
assert.equal(quiet.ok, false);
assert.match(quiet.summary, /Quiet hours/);

const dailyCap = validateCadenceForStaging({
  policy,
  context,
  draft,
  now: "2026-05-11T12:00:00",
  runs: [
    { context, status: "posted", postedAt: "2026-05-11T09:00:00" },
    { context, status: "posted", postedAt: "2026-05-11T10:00:00" },
  ],
});
assert.equal(dailyCap.ok, false);
assert.match(dailyCap.summary, /Daily post limit/);

const cooldown = validateCadenceForStaging({
  policy,
  context,
  draft,
  now: "2026-05-11T12:30:00",
  runs: [{ context, status: "posted", postedAt: "2026-05-11T12:00:00" }],
});
assert.equal(cooldown.ok, false);
assert.match(cooldown.summary, /Cooldown/);

const blockedTerm = validateCadenceForStaging({
  policy,
  context,
  draft: { ...draft, text: "This lawsuit question should not be handled in a post." },
  now: "2026-05-11T12:00:00",
});
assert.equal(blockedTerm.ok, false);
assert.match(blockedTerm.summary, /Do-not-engage/);

const escalationTerm = validateCadenceForStaging({
  policy,
  context,
  draft: { ...draft, text: "An attorney asked about the campaign." },
  now: "2026-05-11T12:00:00",
});
assert.equal(escalationTerm.ok, false);
assert.match(escalationTerm.summary, /Escalation/);

const duplicate = validateCadenceForStaging({
  policy,
  context,
  draft,
  now: "2026-05-11T12:00:00",
  memory: [{ id: "memory-1", sourceId: "old-draft", context, text: draft.text, createdAt: "2026-05-10T12:00:00" }],
});
assert.equal(duplicate.ok, false);
assert.match(duplicate.summary, /Recent duplicate/);

const clear = validateCadenceForStaging({
  policy,
  context,
  draft,
  now: "2026-05-11T12:00:00",
});
assert.equal(clear.ok, true);
assert.equal(canStageDraft(draft, { cadenceCheck: clear }).ok, true);
assert.equal(canStageDraft(draft, { cadenceCheck: quiet }).ok, false);

console.log("All Diamond cadence tests passed.");
