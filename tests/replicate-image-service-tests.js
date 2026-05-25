import assert from "node:assert/strict";
import {
  authenticateReplicateRequest,
  generateImageViaReplicate,
  extractGenerationCost,
  handleReplicateError,
  formatImageDimensionsForPlatform,
  buildReplicateRequestPayload,
  createReplicateImageMetadata,
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

// Test 2: Request shape — buildReplicateRequestPayload constructs the correct Replicate input
const payload = buildReplicateRequestPayload({ prompt: "Startup team celebration", platform: "instagram" });
assert.ok(payload.input, "payload has input key");
assert.equal(payload.input.prompt, "Startup team celebration");
assert.equal(payload.input.aspect_ratio, "4:5", "instagram aspect ratio");
assert.equal(payload.input.output_format, "webp");
assert.equal(payload.input.num_outputs, 1);
assert.equal(payload.version, undefined, "named models must not include a version SHA");

const xPayload = buildReplicateRequestPayload({ prompt: "Bold product shot", platform: "x" });
assert.equal(xPayload.input.aspect_ratio, "16:9");

// Test 3: Metadata extraction — createReplicateImageMetadata builds the correct document shape
const metadata = createReplicateImageMetadata({
  imageUrl: "https://replicate.delivery/output/abc123/image.webp",
  prompt: "A vibrant illustration",
  platform: "instagram",
  cost: 0.19,
  predictionId: "prediction-12345",
});
assert.equal(metadata.imageUrl, "https://replicate.delivery/output/abc123/image.webp");
assert.equal(metadata.service, "replicate");
assert.equal(metadata.model, "flux-pro");
assert.equal(metadata.platform, "instagram");
assert.equal(metadata.generationCost, 0.19);
assert.equal(metadata.approvalStatus, "pending");
assert.equal(metadata.regenerationCount, 0);
assert.ok(metadata.createdAt);

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

// 501 Not Implemented must NOT be retriable
const notImplementedError = handleReplicateError({ status: 501, message: "Not Implemented" });
assert.equal(notImplementedError.retriable, false, "501 must not be retriable");

// 500 and 502 and 503 ARE retriable (transient server errors)
assert.equal(handleReplicateError({ status: 500, message: "Server error" }).retriable, true);
assert.equal(handleReplicateError({ status: 502, message: "Bad gateway" }).retriable, true);
assert.equal(handleReplicateError({ status: 503, message: "Unavailable" }).retriable, true);

// Test 5: Cost tracking — extract cost from Replicate API response
const costFromResponse = extractGenerationCost({
  predictTime: 12.5,
  model: "flux-pro",
});
assert.ok(costFromResponse > 0);
assert.ok(costFromResponse < 1); // Should be under $1 per image
assert.equal(costFromResponse, Math.round(12.5 * 0.015 * 100) / 100, "cost = predictTime * 0.015");

// Test 6: Platform-specific dimensions
const instagramDims = formatImageDimensionsForPlatform("instagram");
assert.equal(instagramDims.width, 1080);
assert.equal(instagramDims.height, 1350);
assert.equal(instagramDims.aspectRatio, "4:5");

const xDims = formatImageDimensionsForPlatform("x");
assert.equal(xDims.width, 1200);
assert.equal(xDims.height, 675);
assert.equal(xDims.aspectRatio, "16:9");

const tiktokDims = formatImageDimensionsForPlatform("tiktok");
assert.equal(tiktokDims.width, 1080);
assert.equal(tiktokDims.height, 1920);
assert.equal(tiktokDims.aspectRatio, "9:16");

assert.throws(
  () => formatImageDimensionsForPlatform("unknown-platform"),
  /Unknown platform/,
  "throws for unknown platform"
);

// Test 7: Rate limit error has correct reason field
const rateLimitErr = handleReplicateError({ status: 429, message: "Too Many Requests", retryAfter: 30 });
assert.equal(rateLimitErr.reason, "rate-limited");
assert.equal(rateLimitErr.retriable, true);
assert.equal(rateLimitErr.retryAfter, 30);

const unauthorizedErr = handleReplicateError({ status: 401, message: "Bad credentials" });
assert.equal(unauthorizedErr.reason, "unauthorized");
assert.equal(unauthorizedErr.retriable, false);

// Test 8: generateImageViaReplicate returns structured error when no API key
const noKeyResult = await generateImageViaReplicate({
  prompt: "Test prompt",
  platform: "instagram",
  apiKey: null,
});
assert.equal(noKeyResult.ok, false);
assert.ok(noKeyResult.error, "error message present");

console.log("All Replicate image service tests passed.");
