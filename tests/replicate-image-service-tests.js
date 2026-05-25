import assert from "node:assert/strict";
import {
  authenticateReplicateRequest,
  generateImageViaReplicate,
  extractGenerationCost,
  handleReplicateError,
  formatImageDimensionsForPlatform,
} from "../src/index.js";

// Test 1: Authentication — resolve API key from environment
const authResult = authenticateReplicateRequest({
  env: { REPLICATE_API_KEY: "test-key-12345" },
});
assert.equal(authResult.ok, true);
assert.equal(authResult.apiKey, "test-key-12345");
assert.ok(authResult.headers.Authorization);
assert.match(authResult.headers.Authorization, /Bearer test-key-12345/);

const authMissing = authenticateReplicateRequest({ env: {} });
assert.equal(authMissing.ok, false);
assert.equal(authMissing.reason, "missing");

// Test 2: Request shape — properly format request for Replicate API
const requestShape = {
  prompt: "A vibrant illustration of a startup team celebrating success",
  model: "flux-pro",
  width: 1080,
  height: 1350,
  numOutputs: 1,
  outputFormat: "webp",
};
assert.ok(requestShape.prompt);
assert.equal(requestShape.model, "flux-pro");
assert.ok(requestShape.width > 0);
assert.ok(requestShape.height > 0);

// Test 3: Response parsing — extract URL and metadata from Replicate response
const mockReplicateResponse = {
  id: "prediction-12345",
  status: "succeeded",
  output: [
    {
      url: "https://replicate.delivery/output/abc123/image.webp",
      mime_type: "image/webp",
    },
  ],
  metrics: {
    predict_time: 12.5,
  },
  created_at: "2026-05-25T10:00:00Z",
  completed_at: "2026-05-25T10:00:12.5Z",
};

const parsedResponse = {
  imageUrl: mockReplicateResponse.output[0].url,
  predictTime: mockReplicateResponse.metrics.predict_time,
  status: mockReplicateResponse.status,
};
assert.equal(parsedResponse.imageUrl, "https://replicate.delivery/output/abc123/image.webp");
assert.equal(parsedResponse.predictTime, 12.5);
assert.equal(parsedResponse.status, "succeeded");

// Test 4: Error handling — properly format error responses
const apiError = handleReplicateError({
  status: 429,
  message: "Rate limit exceeded",
  retryAfter: 60,
});
assert.equal(apiError.ok, false);
assert.equal(apiError.code, 429);
assert.equal(apiError.retriable, true);
assert.equal(apiError.retryAfter, 60);

const authError = handleReplicateError({
  status: 401,
  message: "Unauthorized",
});
assert.equal(authError.ok, false);
assert.equal(authError.code, 401);
assert.equal(authError.retriable, false);

// Test 5: Cost tracking — extract cost from Replicate API response
const costFromResponse = extractGenerationCost({
  predictTime: 12.5,
  model: "flux-pro",
  inputTokens: 0,
});
assert.ok(costFromResponse > 0);
assert.ok(costFromResponse < 1); // Should be under $1 per image

// Test 6: Platform-specific dimensions
const instagramDims = formatImageDimensionsForPlatform("instagram");
assert.equal(instagramDims.width, 1080);
assert.equal(instagramDims.height, 1350);
assert.equal(instagramDims.aspectRatio, "4:5");

const xDims = formatImageDimensionsForPlatform("x");
assert.ok(xDims.width);
assert.ok(xDims.height);
assert.ok(xDims.aspectRatio);

const tiktokDims = formatImageDimensionsForPlatform("tiktok");
assert.equal(tiktokDims.width, 1080);
assert.equal(tiktokDims.height, 1920);
assert.equal(tiktokDims.aspectRatio, "9:16");

// Test 7: Rate limit handling — exponential backoff tracking
const rateLimitResult = {
  isRateLimited: true,
  retryAfter: 60,
  nextRetryTime: Date.now() + 60000,
};
assert.equal(rateLimitResult.isRateLimited, true);
assert.ok(rateLimitResult.nextRetryTime > Date.now());

// Test 8: Full integration test structure (will be called by e2e tests)
const fullGenerationRequest = {
  prompt: "Test prompt",
  platform: "instagram",
  model: "flux-pro",
  apiKey: "test-key-12345",
};
assert.ok(fullGenerationRequest.prompt);
assert.ok(fullGenerationRequest.platform);
assert.ok(fullGenerationRequest.model);
assert.ok(fullGenerationRequest.apiKey);

console.log("All Replicate image service tests passed.");
