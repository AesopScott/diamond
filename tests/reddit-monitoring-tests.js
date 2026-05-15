import assert from "node:assert/strict";
import {
  captureRedditMonitoringItem,
  createSeedWorkspace,
  redditMonitoringCanStage,
} from "../src/index.js";

const workspace = createSeedWorkspace();
const redditAccount = workspace.socialAccounts.find((account) => account.platform === "reddit");
const context = {
  ...workspace.context,
  platform: "reddit",
  socialAccountId: redditAccount.id,
};

const missing = captureRedditMonitoringItem({ context, sourceUrl: "https://www.reddit.com/r/worldcup/comments/1" });
assert.equal(missing.ok, false);
assert.match(missing.reason, /requires text/);

const captured = captureRedditMonitoringItem({
  context,
  socialAccountId: redditAccount.id,
  author: "u/worldcupfan",
  subreddit: "worldcup",
  threadTitle: "Is the free World Cup league legit?",
  sourceUrl: "https://www.reddit.com/r/worldcup/comments/abc123/is_the_free_world_cup_league_legit/",
  text: "Is this prize payout real or is this a scam?",
  createdAt: "2026-05-14T12:00:00.000Z",
});

assert.equal(captured.ok, true);
assert.equal(captured.reply.platform, "reddit");
assert.equal(captured.reply.context.platform, "reddit");
assert.equal(captured.reply.monitoringOnly, true);
assert.equal(captured.reply.subreddit, "r/worldcup");
assert.equal(captured.reply.status, "escalated");
assert.equal(captured.classification.category, "money");
assert.equal(captured.responseDraft.platform, "reddit");
assert.equal(captured.responseDraft.monitoringOnly, true);
assert.equal(captured.responseDraft.status, "escalation_required");
assert.match(captured.reply.route.notes, /monitoring capture/);

const productCapture = captureRedditMonitoringItem({
  context,
  sourceUrl: "https://www.reddit.com/r/soccer/comments/def456/",
  text: "The leaderboard and prediction feature sound interesting.",
});
assert.equal(productCapture.classification.category, "product");
assert.equal(productCapture.responseDraft.status, "needs_approval");

const stageCheck = redditMonitoringCanStage();
assert.equal(stageCheck.ok, false);
assert.match(stageCheck.reason, /monitoring-only/);

console.log("All Diamond Reddit monitoring tests passed.");
