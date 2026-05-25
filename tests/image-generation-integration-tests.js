// Tests for image-generation-integration.js
// Proof Unit 3 (campaign UI settings) and Proof Unit 4 (post dialog image flow)

import assert from "node:assert/strict";
import {
  resolveImageGenerationEnabled,
  buildImagePrompt,
  integrateImageGenerationIntoPostCreation,
} from "../src/image-generation-integration.js";

// ---------------------------------------------------------------------------
// resolveImageGenerationEnabled
// ---------------------------------------------------------------------------

function testResolvesInheritWhenDraftOverrideIsNull() {
  // Campaign enabled, draft inherits (null) → enabled
  const campaign = { imageGenerationEnabled: true };
  const draft = { imageGenerationEnabled: null };
  assert.equal(resolveImageGenerationEnabled(draft, campaign), true, "should inherit campaign enabled");
}

function testResolvesInheritWhenDraftOverrideIsUndefined() {
  const campaign = { imageGenerationEnabled: true };
  const draft = {};
  assert.equal(resolveImageGenerationEnabled(draft, campaign), true, "undefined override inherits campaign");
}

function testDraftOverrideTrueWhenCampaignEnabled() {
  const campaign = { imageGenerationEnabled: true };
  const draft = { imageGenerationEnabled: true };
  assert.equal(resolveImageGenerationEnabled(draft, campaign), true, "explicit true wins");
}

function testDraftOverrideFalseDisablesWhenCampaignEnabled() {
  const campaign = { imageGenerationEnabled: true };
  const draft = { imageGenerationEnabled: false };
  assert.equal(resolveImageGenerationEnabled(draft, campaign), false, "per-post false overrides campaign true");
}

function testReturnsFalseWhenCampaignDisabled() {
  const campaign = { imageGenerationEnabled: false };
  const draft = { imageGenerationEnabled: true };
  // Campaign gate must be on first
  assert.equal(resolveImageGenerationEnabled(draft, campaign), false, "campaign gate wins even if draft says true");
}

function testReturnsFalseWithNoCampaign() {
  assert.equal(resolveImageGenerationEnabled({}, null), false, "no campaign → disabled");
  assert.equal(resolveImageGenerationEnabled({}, undefined), false, "undefined campaign → disabled");
}

// ---------------------------------------------------------------------------
// buildImagePrompt
// ---------------------------------------------------------------------------

function testBuildsPromptWithGuidanceAndText() {
  const draft = { text: "Check out our summer sale!" };
  const campaign = { imagePromptGuidance: "Bright summer beach aesthetic, warm tones" };
  const result = buildImagePrompt(draft, campaign);
  assert.ok(result.includes("Bright summer beach aesthetic"), "includes guidance");
  assert.ok(result.includes("Check out our summer sale!"), "includes post text");
}

function testBuildsPromptWithGuidanceOnly() {
  const draft = { text: "" };
  const campaign = { imagePromptGuidance: "Minimalist dark background, gold accents" };
  const result = buildImagePrompt(draft, campaign);
  assert.equal(result, "Minimalist dark background, gold accents", "guidance-only prompt");
}

function testBuildsPromptWithTextOnly() {
  const draft = { text: "Join our Discord community!" };
  const campaign = { imagePromptGuidance: "" };
  const result = buildImagePrompt(draft, campaign);
  assert.equal(result, "Join our Discord community!", "text-only prompt");
}

function testReturnsEmptyWhenNeitherPresent() {
  const result = buildImagePrompt({ text: "" }, { imagePromptGuidance: "" });
  assert.equal(result, "", "empty prompt when no guidance and no text");
}

// ---------------------------------------------------------------------------
// integrateImageGenerationIntoPostCreation
// ---------------------------------------------------------------------------

async function testReturnsNotOkWhenCampaignDisabled() {
  const campaign = { imageGenerationEnabled: false };
  const draft = { platform: "x", text: "Test post" };
  const result = await integrateImageGenerationIntoPostCreation({}, draft, campaign, {});
  assert.equal(result.ok, false);
  assert.ok(result.reason.includes("disabled for campaign"), `reason: ${result.reason}`);
}

async function testReturnsNotOkWhenPostDisabledOverride() {
  const campaign = { imageGenerationEnabled: true };
  const draft = { platform: "x", text: "Test post", imageGenerationEnabled: false };
  const result = await integrateImageGenerationIntoPostCreation({}, draft, campaign, {});
  assert.equal(result.ok, false);
  assert.ok(result.reason.includes("disabled for this post"), `reason: ${result.reason}`);
}

async function testReturnsNotOkWhenPlatformDisabled() {
  const campaign = {
    imageGenerationEnabled: true,
    imageGenerationPlatforms: { x: { enabled: false } },
  };
  const draft = { platform: "x", text: "Test post", imageGenerationEnabled: null };
  const result = await integrateImageGenerationIntoPostCreation({}, draft, campaign, {});
  assert.equal(result.ok, false);
  assert.ok(result.reason.includes("disabled for platform"), `reason: ${result.reason}`);
}

async function testReturnsNotOkWhenNoPrompt() {
  const campaign = {
    imageGenerationEnabled: true,
    imageGenerationPlatforms: { x: { enabled: true } },
    imagePromptGuidance: "",
  };
  const draft = { platform: "x", text: "", imageGenerationEnabled: true };
  const result = await integrateImageGenerationIntoPostCreation({}, draft, campaign, {});
  assert.equal(result.ok, false);
  assert.ok(result.reason.includes("No image prompt"), `reason: ${result.reason}`);
}

async function testReturnsNotOkWhenNoApiKey() {
  const campaign = {
    imageGenerationEnabled: true,
    imageGenerationPlatforms: { x: { enabled: true } },
    imagePromptGuidance: "Vibrant colors",
  };
  const draft = { platform: "x", text: "Test post", imageGenerationEnabled: true };
  const result = await integrateImageGenerationIntoPostCreation({}, draft, campaign, { replicateApiKey: undefined });
  assert.equal(result.ok, false);
  assert.ok(result.reason.includes("REPLICATE_API_KEY"), `reason: ${result.reason}`);
}

async function testSkipGenerationModeReturnsOk() {
  const campaign = {
    imageGenerationEnabled: true,
    imageGenerationPlatforms: { x: { enabled: true } },
    imagePromptGuidance: "Bold red design",
  };
  const draft = { platform: "x", text: "Test", imageGenerationEnabled: true };
  const result = await integrateImageGenerationIntoPostCreation({}, draft, campaign, {
    replicateApiKey: "test-key",
    skipGeneration: true,
  });
  assert.equal(result.ok, true, "skip mode returns ok");
  assert.ok(result.reason.includes("skipped"), `reason: ${result.reason}`);
}

async function testDraftUpdatedWithImageUrlOnSuccess() {
  const campaign = {
    imageGenerationEnabled: true,
    imageGenerationPlatforms: { x: { enabled: true } },
    imagePromptGuidance: "Clean professional look",
  };
  const draft = { platform: "x", text: "Check this out", imageGenerationEnabled: null };
  const result = await integrateImageGenerationIntoPostCreation({}, draft, campaign, {
    replicateApiKey: "test-key",
    skipGeneration: true,
  });
  assert.ok(result.updatedDraft, "updatedDraft present");
}

// ---------------------------------------------------------------------------
// Run all tests
// ---------------------------------------------------------------------------

const tests = [
  ["resolveImageGenerationEnabled — inherits when null", testResolvesInheritWhenDraftOverrideIsNull],
  ["resolveImageGenerationEnabled — inherits when undefined", testResolvesInheritWhenDraftOverrideIsUndefined],
  ["resolveImageGenerationEnabled — explicit true", testDraftOverrideTrueWhenCampaignEnabled],
  ["resolveImageGenerationEnabled — explicit false overrides campaign", testDraftOverrideFalseDisablesWhenCampaignEnabled],
  ["resolveImageGenerationEnabled — campaign gate wins", testReturnsFalseWhenCampaignDisabled],
  ["resolveImageGenerationEnabled — no campaign → false", testReturnsFalseWithNoCampaign],
  ["buildImagePrompt — guidance + text", testBuildsPromptWithGuidanceAndText],
  ["buildImagePrompt — guidance only", testBuildsPromptWithGuidanceOnly],
  ["buildImagePrompt — text only", testBuildsPromptWithTextOnly],
  ["buildImagePrompt — empty → empty string", testReturnsEmptyWhenNeitherPresent],
  ["integrate — campaign disabled", testReturnsNotOkWhenCampaignDisabled],
  ["integrate — post override disabled", testReturnsNotOkWhenPostDisabledOverride],
  ["integrate — platform disabled", testReturnsNotOkWhenPlatformDisabled],
  ["integrate — no prompt", testReturnsNotOkWhenNoPrompt],
  ["integrate — no api key", testReturnsNotOkWhenNoApiKey],
  ["integrate — skip mode ok", testSkipGenerationModeReturnsOk],
  ["integrate — draft updated on success", testDraftUpdatedWithImageUrlOnSuccess],
];

let passed = 0;
let failed = 0;

for (const [name, fn] of tests) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log(`\nImage generation integration tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
