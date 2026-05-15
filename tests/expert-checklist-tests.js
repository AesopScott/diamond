import assert from "node:assert/strict";
import {
  createSeedWorkspace,
  evaluateExpertChecklist,
  expertChecklistMarkdown,
  getDiamondExpertChecklist,
} from "../src/index.js";

const checklist = getDiamondExpertChecklist();
assert.equal(checklist.length, 12);
assert.ok(checklist.every((item) => item.id && item.label && item.checks.length));

const emptyReview = evaluateExpertChecklist({});
assert.equal(emptyReview.status, "needs_review");
assert.equal(emptyReview.counts.ready, 0);
assert.equal(emptyReview.counts.needs_review, 12);
assert.ok(emptyReview.items.some((item) => item.id === "multitenancy" && item.status === "needs_review"));

const workspace = createSeedWorkspace();
const seededReview = evaluateExpertChecklist({
  ...workspace,
  editorialSlots: [{ id: "slot-1", topic: "World Cup leaderboard" }],
  mediaLibrary: [{ id: "media-1", altText: "Leaderboard card" }],
  platformDrafts: [{ id: "draft-1", status: "approved" }],
  postRuns: [{ id: "run-1", postUrl: "https://x.com/thecard/status/1", impressions: 100 }],
  socialReplies: [{ id: "reply-1", category: "product" }],
  socialResponseDrafts: [{ id: "response-1", status: "needs_approval" }],
});

assert.equal(seededReview.status, "ready");
assert.equal(seededReview.counts.ready, 12);
assert.equal(seededReview.counts.needs_review, 0);
assert.ok(seededReview.items.find((item) => item.id === "platform_safety").summary.includes("boundaries"));

const markdown = expertChecklistMarkdown(seededReview);
assert.match(markdown, /Diamond Expert Checklist Review/);
assert.match(markdown, /Strategy: Ready/);
assert.match(markdown, /Platform Safety: Ready/);

console.log("All Diamond expert checklist tests passed.");
