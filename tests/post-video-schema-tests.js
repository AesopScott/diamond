import assert from "assert";
import { createPostDraft, createSeedWorkspace } from "../src/index.js";

console.log("Testing Post Video Schema Unit 3...");

const workspace = createSeedWorkspace();
const draft = createPostDraft({
  context: workspace.context,
  text: "Test video generation for social media",
  language: "en",
});

// Test that all 12 video fields exist
const expectedVideoFields = [
  "videoGenerationRequested",
  "videoGenerationOverride",
  "generatedVideoUrl",
  "generatedVideoPrompt",
  "videoGenerationStatus",
  "videoGenerationError",
  "videoGenerationRetryable",
  "videoGenerationAttempts",
  "operatorNotificationStatus",
  "manualQualityValidation",
  "videoDurationSeconds",
  "videoGenerationCost",
];

expectedVideoFields.forEach((field) => {
  assert(
    field in draft,
    `Draft must have video field: ${field}`
  );
});

// Test specific field values
assert.strictEqual(
  draft.videoGenerationRequested,
  false,
  "videoGenerationRequested should default to false"
);

assert.strictEqual(
  draft.videoGenerationOverride,
  null,
  "videoGenerationOverride should default to null"
);

assert.strictEqual(
  draft.generatedVideoUrl,
  null,
  "generatedVideoUrl should default to null"
);

assert.strictEqual(
  draft.generatedVideoPrompt,
  null,
  "generatedVideoPrompt should default to null"
);

assert.strictEqual(
  draft.videoGenerationStatus,
  null,
  "videoGenerationStatus should default to null"
);

assert.strictEqual(
  draft.videoGenerationError,
  null,
  "videoGenerationError should default to null"
);

assert.strictEqual(
  draft.videoGenerationRetryable,
  false,
  "videoGenerationRetryable should default to false"
);

assert.strictEqual(
  draft.videoGenerationAttempts,
  0,
  "videoGenerationAttempts should default to 0"
);

assert.strictEqual(
  draft.operatorNotificationStatus,
  null,
  "operatorNotificationStatus should default to null"
);

assert.strictEqual(
  draft.manualQualityValidation,
  null,
  "manualQualityValidation should default to null"
);

assert.strictEqual(
  draft.videoDurationSeconds,
  0,
  "videoDurationSeconds should default to 0"
);

assert.strictEqual(
  draft.videoGenerationCost,
  null,
  "videoGenerationCost should default to null"
);

// Verify we have exactly 12 new video fields (and the original fields)
const originalFieldCount = Object.keys(draft).length - expectedVideoFields.length;
assert(
  originalFieldCount > 0,
  "Draft should have both video fields and original fields"
);

console.log("✓ All Diamond post video schema tests passed.");
