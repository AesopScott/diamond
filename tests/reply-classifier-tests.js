import assert from "node:assert/strict";
import {
  classifySocialReply,
  createResponseDraftForReply,
  createSocialReply,
  createSeedWorkspace,
} from "../src/index.js";

const workspace = createSeedWorkspace();
const context = workspace.context;

const support = classifySocialReply({ text: "I cannot login and my email verification is not working." });
assert.equal(support.category, "support");
assert.equal(support.priority, "medium");
assert.equal(support.suggestedAction, "draft_response");
assert.equal(support.requiresApproval, true);

const legal = classifySocialReply({ text: "My attorney says this needs a gambling license." });
assert.equal(legal.category, "legal");
assert.equal(legal.priority, "high");
assert.equal(legal.suggestedAction, "escalate");
assert.equal(legal.shouldEscalate, true);

const reply = createSocialReply({
  context,
  author: "@fan",
  sourceUrl: "https://x.com/fan/status/1",
  text: "The leaderboard feature looks broken.",
});
assert.equal(reply.classification.category, "bug");
assert.equal(reply.status, "captured");

const response = createResponseDraftForReply({ reply });
assert.equal(response.replyId, reply.id);
assert.equal(response.status, "needs_approval");
assert.equal(response.requiresApproval, true);
assert.match(response.text, /bug/i);

const escalatedReply = createSocialReply({
  context,
  text: "This prize payout is a scam.",
});
const escalatedResponse = createResponseDraftForReply({ reply: escalatedReply });
assert.equal(escalatedReply.status, "escalated");
assert.equal(escalatedResponse.status, "escalation_required");

console.log("All Diamond reply classifier tests passed.");
