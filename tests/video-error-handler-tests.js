import assert from "assert";
import {
  surfaceVideoErrorInDraft,
  buildVideoErrorNotificationPayload,
} from "../src/video-error-handler.js";

console.log("Testing Video Error Handler Units 9-10...");

const mockPostDraft = {
  id: "draft-1",
  text: "Test post",
  videoGenerationError: null,
  videoGenerationRetryable: false,
  videoGenerationAttempts: 0,
};

const mockPostPackage = {
  id: "pkg-1",
  title: "Test Post",
  campaignId: "campaign-1",
};

// Test surfaceVideoErrorInDraft with no error
const noError = surfaceVideoErrorInDraft(mockPostDraft);
assert.strictEqual(noError, null, "Should return null when no error");

// Test with transient error (retryable)
const draftWithRetryableError = {
  ...mockPostDraft,
  videoGenerationError: {
    code: "timeout",
    message: "Video generation timeout",
    timestamp: new Date().toISOString(),
  },
  videoGenerationRetryable: true,
  videoGenerationAttempts: 1,
};

const retryableError = surfaceVideoErrorInDraft(draftWithRetryableError);
assert(retryableError, "Should return error info");
assert.strictEqual(retryableError.severity, "warning", "Retryable error should be warning");
assert.strictEqual(retryableError.code, "timeout", "Should preserve error code");
assert.strictEqual(retryableError.canRetry, true, "Should allow retry when < 3 attempts");

// Test with permanent error (not retryable)
const draftWithPermanentError = {
  ...mockPostDraft,
  videoGenerationError: {
    code: "invalid_prompt",
    message: "Prompt contains invalid content",
    timestamp: new Date().toISOString(),
  },
  videoGenerationRetryable: false,
  videoGenerationAttempts: 1,
};

const permanentError = surfaceVideoErrorInDraft(draftWithPermanentError);
assert(permanentError, "Should return error info");
assert.strictEqual(permanentError.severity, "error", "Permanent error should be error severity");
assert.strictEqual(permanentError.canRetry, false, "Should not allow retry for permanent errors");

// Test with 3 failed attempts
const draftWithMaxAttempts = {
  ...mockPostDraft,
  videoGenerationError: {
    code: "api_error",
    message: "HeyGen API error",
    timestamp: new Date().toISOString(),
  },
  videoGenerationRetryable: true,
  videoGenerationAttempts: 3,
};

const maxAttemptsError = surfaceVideoErrorInDraft(draftWithMaxAttempts);
assert.strictEqual(
  maxAttemptsError.canRetry,
  false,
  "Should not allow retry when max attempts reached"
);

// Test buildVideoErrorNotificationPayload with no error
const noNotification = buildVideoErrorNotificationPayload(mockPostPackage, mockPostDraft);
assert.strictEqual(noNotification, null, "Should not create notification without error");

// Test with error but not max attempts
const draftWithError = {
  ...mockPostDraft,
  videoGenerationError: {
    code: "timeout",
    message: "Timeout",
    timestamp: new Date().toISOString(),
  },
  videoGenerationAttempts: 1,
};

const earlyNotification = buildVideoErrorNotificationPayload(mockPostPackage, draftWithError);
assert.strictEqual(
  earlyNotification,
  null,
  "Should not notify before max attempts reached"
);

// Test with error at max attempts
const draftWithMaxError = {
  ...mockPostDraft,
  videoGenerationError: {
    code: "api_error",
    message: "API returned 500",
    timestamp: new Date().toISOString(),
  },
  videoGenerationAttempts: 3,
};

const maxNotification = buildVideoErrorNotificationPayload(mockPostPackage, draftWithMaxError);
assert(maxNotification, "Should create notification when max attempts reached");
assert.strictEqual(
  maxNotification.type,
  "video_generation_failed",
  "Should set correct type"
);
assert.strictEqual(
  maxNotification.postTitle,
  "Test Post",
  "Should include post title"
);
assert.strictEqual(
  maxNotification.attempts,
  3,
  "Should include attempt count"
);
assert.strictEqual(
  maxNotification.maxAttempts,
  3,
  "Should include max attempts"
);

console.log("✓ All Diamond video error handler tests passed.");
