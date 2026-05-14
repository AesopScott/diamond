import assert from "node:assert/strict";
import {
  buildPostBoardView,
  createPlatformDraft,
  createPostDraft,
  createPostPackage,
  createSeedWorkspace,
  derivePostPackagesFromWorkspace,
  normalizePackageStatus,
} from "../src/index.js";

const workspace = createSeedWorkspace();
const context = workspace.context;

const postPackage = createPostPackage({
  id: "world-cup-idea",
  context,
  ideaText: "Invite fans to join the free World Cup leaderboard before opening match day.",
  tags: ["World Cup", "Launch", "world cup"],
  now: "2026-05-14T12:00:00.000Z",
});
assert.equal(postPackage.id, "world-cup-idea");
assert.equal(postPackage.status, "draft");
assert.deepEqual(postPackage.tags, ["world cup", "launch"]);
assert.match(postPackage.firestorePath, /postpackages\/world-cup-idea$/);

const xDraft = createPlatformDraft({
  id: "world-cup-idea-x",
  postPackage,
  text: "Join the free World Cup leaderboard.",
  platform: "x",
  socialAccountId: context.socialAccountId,
  now: "2026-05-14T12:00:00.000Z",
});
assert.equal(xDraft.postPackageId, postPackage.id);
assert.equal(xDraft.charLimit, 280);
assert.equal(xDraft.context.platform, "x");
assert.match(xDraft.firestorePath, /platformdrafts\/world-cup-idea-x$/);

assert.equal(normalizePackageStatus("posted"), "published");
assert.equal(normalizePackageStatus("review_required"), "needs_review");
assert.equal(normalizePackageStatus("needs_manual_finish"), "failed");

const legacyDraft = createPostDraft({
  context,
  text: "Join the free World Cup league and compare your picks against the leaderboard.",
  approvalPolicy: workspace.approvalPolicies[0],
  draftId: "legacy-draft-1",
});
legacyDraft.updatedAt = "2026-05-14T12:00:00.000Z";
workspace.drafts = [legacyDraft];
workspace.scheduledPosts = [{
  id: "schedule-1",
  draftId: legacyDraft.id,
  context,
  status: "scheduled",
  scheduledAt: "2026-05-15T18:00:00.000Z",
  text: legacyDraft.text,
  media: [],
  createdAt: "2026-05-14T13:00:00.000Z",
}];
workspace.postRuns = [{
  id: "run-1",
  draftId: legacyDraft.id,
  context,
  status: "posted",
  text: legacyDraft.text,
  media: [],
  createdAt: "2026-05-16T18:00:00.000Z",
}];

const derived = derivePostPackagesFromWorkspace(workspace);
assert.equal(derived.postPackages.length, 1);
assert.equal(derived.platformDrafts.length, 1);
assert.equal(derived.postPackages[0].status, "published");
assert.equal(derived.platformDrafts[0].status, "published");
assert.deepEqual(derived.postPackages[0].platformDraftIds, [derived.platformDrafts[0].id]);

const board = buildPostBoardView({ workspace });
const publishedColumn = board.find((column) => column.id === "published");
assert.equal(publishedColumn.count, 1);
assert.equal(publishedColumn.posts[0].platforms[0], "x");

console.log("All Diamond post package tests passed.");
