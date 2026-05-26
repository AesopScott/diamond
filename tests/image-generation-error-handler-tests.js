import assert from "node:assert/strict";
import {
  IMAGE_GENERATION_ERROR_TYPES,
  formatErrorForUI,
  formatErrorForEmail,
  logImageGenerationError,
  shouldRetryImageGeneration,
  calculateBackoffDelay,
} from "../src/index.js";

// Test 1: Error type constants exist
assert.ok(IMAGE_GENERATION_ERROR_TYPES.REPLICATE_API_ERROR);
assert.ok(IMAGE_GENERATION_ERROR_TYPES.RATE_LIMIT);
assert.ok(IMAGE_GENERATION_ERROR_TYPES.TIMEOUT);
assert.ok(IMAGE_GENERATION_ERROR_TYPES.INVALID_PROMPT);
assert.ok(IMAGE_GENERATION_ERROR_TYPES.PLATFORM_UPLOAD_FAILED);

// Test 2: Rate limit errors format correctly for UI
const rateLimitError = {
  code: IMAGE_GENERATION_ERROR_TYPES.RATE_LIMIT,
  message: "Rate limited",
  retryAfter: 60,
};
const rateLimitUI = formatErrorForUI(rateLimitError);
assert.match(rateLimitUI.title, /rate/i);
assert.equal(rateLimitUI.retriable, true);
assert.ok(rateLimitUI.retryAfter);

// Test 3: Invalid prompt errors are non-retriable
const invalidPromptError = {
  code: IMAGE_GENERATION_ERROR_TYPES.INVALID_PROMPT,
  message: "Blocked content detected",
};
const invalidUI = formatErrorForUI(invalidPromptError);
assert.equal(invalidUI.retriable, false);
assert.match(invalidUI.actionLabel, /edit/i);

// Test 4: Timeout errors are retriable
const timeoutError = {
  code: IMAGE_GENERATION_ERROR_TYPES.TIMEOUT,
  message: "Generation took too long",
};
const timeoutUI = formatErrorForUI(timeoutError);
assert.equal(timeoutUI.retriable, true);
assert.ok(timeoutUI.message);

// Test 5: Platform upload failures format correctly
const uploadError = {
  code: IMAGE_GENERATION_ERROR_TYPES.PLATFORM_UPLOAD_FAILED,
  platform: "instagram",
  message: "API error",
  retriable: true,
};
const uploadUI = formatErrorForUI(uploadError);
assert.match(uploadUI.title, /upload/i);
assert.equal(uploadUI.platform, "instagram");

// Test 6: Email formatting includes campaign and platform context
const emailMessage = formatErrorForEmail(
  {
    code: IMAGE_GENERATION_ERROR_TYPES.REPLICATE_API_ERROR,
    message: "API timeout",
  },
  {
    campaignName: "Summer Promo",
    platform: "instagram",
    postId: "post-123",
    operatorEmail: "operator@example.com",
  }
);
assert.equal(emailMessage.to, "operator@example.com");
assert.match(emailMessage.subject, /Image generation failed/i);
assert.ok(emailMessage.context.actionItems);

// Test 7: Logging captures error context
const logEntry = logImageGenerationError(
  {
    code: IMAGE_GENERATION_ERROR_TYPES.RATE_LIMIT,
    message: "Rate limited",
    retriable: true,
  },
  {
    campaignId: "camp-123",
    postId: "post-456",
    platform: "x",
  }
);
assert.equal(logEntry.type, IMAGE_GENERATION_ERROR_TYPES.RATE_LIMIT);
assert.equal(logEntry.details.campaignId, "camp-123");
assert.equal(logEntry.details.platform, "x");

// Test 8: Retry decision logic
assert.equal(shouldRetryImageGeneration(null), false);
assert.equal(
  shouldRetryImageGeneration({ retriable: false }),
  false
);
assert.equal(
  shouldRetryImageGeneration({
    code: IMAGE_GENERATION_ERROR_TYPES.INVALID_PROMPT,
  }),
  false
);
assert.equal(
  shouldRetryImageGeneration({
    code: IMAGE_GENERATION_ERROR_TYPES.RATE_LIMIT,
    retriable: true,
  }),
  true
);

// Test 9: Exponential backoff calculation
assert.equal(calculateBackoffDelay(1), 1000); // 2^0 * 1000 = 1000
assert.equal(calculateBackoffDelay(2), 2000); // 2^1 * 1000 = 2000
assert.equal(calculateBackoffDelay(3), 4000); // 2^2 * 1000 = 4000
assert.equal(calculateBackoffDelay(4), 8000); // 2^3 * 1000 = 8000
assert.ok(calculateBackoffDelay(10) <= 60000); // Capped at 60s

console.log("All image generation error handler tests passed.");
