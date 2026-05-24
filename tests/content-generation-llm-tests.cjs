"use strict";

const assert = require("node:assert/strict");
const {
  generatePostDrafts,
  buildWriterPrompt,
  parseReviewerContent,
} = require("../src/content-generation-llm.cjs");

const payload = {
  idea: "Join the free World Cup league.",
  style: "Default",
  language: "en",
  platforms: [
    { platform: "x", charLimit: 280 },
    { platform: "linkedin", charLimit: null },
  ],
  brand: {
    voice: "Confident and friendly",
    approvedPhrases: ["free to play"],
    bannedPhrases: ["guaranteed win"],
  },
  campaign: {
    goals: ["signups"],
    pillars: ["prize clarity"],
    cta: "Sign up at thecard.bet",
    offer: "$1,000 prize",
  },
  claims: { blockedClaims: ["risk free"], requiresReviewClaims: ["best odds"] },
};

(async () => {
  // 1. No writer key → renderer template fallback (drafts null).
  const noWriter = await generatePostDrafts(payload, { env: {} });
  assert.equal(noWriter.ok, true);
  assert.equal(noWriter.drafts, null);
  assert.equal(noWriter.degraded, "no-writer-key");

  // 2. Writer present, no reviewer key → keep unreviewed writer text.
  const writerOnly = await generatePostDrafts(payload, {
    env: { ANTHROPIC_API_KEY: "k" },
    writer: async ({ platform }) => `WRITER:${platform}`,
  });
  assert.equal(writerOnly.ok, true);
  assert.equal(writerOnly.degraded, "no-reviewer-key");
  assert.equal(writerOnly.drafts.length, 2);
  assert.equal(writerOnly.drafts[0].text, "WRITER:x");
  assert.equal(writerOnly.drafts[0].changeNote, "reviewer unavailable");

  // 3. Writer + reviewer → adjusted text + change note.
  const full = await generatePostDrafts(payload, {
    env: { ANTHROPIC_API_KEY: "k", OPENAI_API_KEY: "k2" },
    writer: async ({ platform }) => `WRITER:${platform}`,
    reviewer: async ({ draft }) => ({ text: `REVIEWED:${draft}`, changeNote: "tightened" }),
  });
  assert.equal(full.ok, true);
  assert.equal(full.degraded, null);
  assert.equal(full.drafts[0].text, "REVIEWED:WRITER:x");
  assert.equal(full.drafts[0].changeNote, "tightened");

  // 4. Reviewer throws (e.g. bad model id) → soft-degrade to unreviewed writer text.
  const reviewerError = await generatePostDrafts(payload, {
    env: { ANTHROPIC_API_KEY: "k", OPENAI_API_KEY: "k2" },
    writer: async ({ platform }) => `WRITER:${platform}`,
    reviewer: async () => { throw new Error("404 unknown model"); },
  });
  assert.equal(reviewerError.ok, true);
  assert.equal(reviewerError.degraded, "no-reviewer-key");
  assert.equal(reviewerError.drafts[0].text, "WRITER:x");
  assert.equal(reviewerError.drafts[0].changeNote, "reviewer unavailable");

  // 5. Writer throws → ok:false with error (renderer flags + retries).
  const writerError = await generatePostDrafts(payload, {
    env: { ANTHROPIC_API_KEY: "k" },
    writer: async () => { throw new Error("500 boom"); },
  });
  assert.equal(writerError.ok, false);
  assert.equal(writerError.drafts, null);
  assert.match(writerError.error, /Writer failed for x/);

  // 6. Writer prompt carries brand voice, banned phrase, campaign CTA, and char limit.
  const prompt = buildWriterPrompt({ payload, platform: "x", charLimit: 280 });
  assert.match(prompt, /Confident and friendly/);
  assert.match(prompt, /guaranteed win/);
  assert.match(prompt, /Sign up at thecard\.bet/);
  assert.match(prompt, /280 characters/);

  // 7. Reviewer JSON parsing + non-JSON fallback.
  assert.deepEqual(
    parseReviewerContent('{"text":"hi","changes":"trimmed"}', "orig"),
    { text: "hi", changeNote: "trimmed" },
  );
  const loose = parseReviewerContent("just text", "orig");
  assert.equal(loose.text, "just text");
  assert.equal(loose.changeNote, "reviewer adjusted (note unavailable)");

  console.log("All Diamond content-generation-llm tests passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
