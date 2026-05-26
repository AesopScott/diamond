import assert from "assert";
import {
  requestVideoGeneration,
  generateVideoWithHeyGen,
  generateVideoWithKling,
  updatePostDraftWithVideoResult,
} from "../src/video-generation-worker.js";

console.log("Testing Video Generation Worker Unit 7...");

async function runTests() {

const mockCampaign = {
  id: "campaign-1",
  videoGenerationEnabled: true,
  videoQualitySize: "high",
  videoPromptGuidance: "Create engaging social media videos",
  videoGenerationPlatforms: {
    tiktok: { enabled: true, videoDurationSeconds: 15, format: "mp4", aspectRatio: "9:16" },
    youtube: { enabled: false, videoDurationSeconds: 60, format: "mp4", aspectRatio: "16:9" },
    x: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
    instagram: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "1:1" },
    linkedin: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
    facebook: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
    reddit: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
  },
};

const mockPostDraft = {
  id: "draft-1",
  text: "Check out this amazing product!",
  videoGenerationOverride: null,
  videoGenerationPrompt: null,
  videoQualitySizeOverride: null,
  videoGenerationRequested: false,
  videoGenerationStatus: null,
  videoDurationSeconds: 0,
  videoGenerationCost: null,
  videoGenerationAttempts: 0,
};

// Test requestVideoGeneration
const videoRequest = await requestVideoGeneration(mockPostDraft, mockCampaign);
assert(videoRequest, "Should create a video request");
assert.strictEqual(videoRequest.prompt, mockCampaign.videoPromptGuidance, "Should use campaign guidance for prompt");
assert.strictEqual(videoRequest.quality, "uhd", "Quality should map high to uhd");
assert.strictEqual(videoRequest.provider, "heygen", "Default provider should remain HeyGen");

// Test with campaign video generation disabled
const disabledCampaign = { ...mockCampaign, videoGenerationEnabled: false };
const noVideoRequest = await requestVideoGeneration(mockPostDraft, disabledCampaign);
assert.strictEqual(noVideoRequest, null, "Should not create request when campaign video disabled");

// Test with post-level override
const postWithOverride = { ...mockPostDraft, videoGenerationOverride: true };
const overrideRequest = await requestVideoGeneration(postWithOverride, disabledCampaign);
assert(overrideRequest, "Should create request when post overrides to true");

// Test updatePostDraftWithVideoResult
const successResult = {
  status: "completed",
  videoUrl: "https://example.com/video.mp4",
  videoId: "vid-123",
  durationSeconds: 30,
  creditsUsed: 0.49,
};

const updatedDraft = updatePostDraftWithVideoResult(mockPostDraft, successResult);
assert.strictEqual(
  updatedDraft.videoGenerationStatus,
  "success",
  "Status should be success"
);
assert.strictEqual(
  updatedDraft.generatedVideoUrl,
  "https://example.com/video.mp4",
  "Should set video URL"
);
assert.strictEqual(
  updatedDraft.videoDurationSeconds,
  30,
  "Should set duration"
);
assert.strictEqual(
  updatedDraft.videoGenerationCost,
  0.49,
  "Should set cost"
);

// Test error result
const errorResult = {
  status: "failed",
  error: {
    code: "api_error",
    message: "API returned 500",
    retryable: true,
  },
};

const failedDraft = updatePostDraftWithVideoResult(mockPostDraft, errorResult);
assert.strictEqual(
  failedDraft.videoGenerationStatus,
  "failed",
  "Status should be failed"
);
assert.strictEqual(
  failedDraft.videoGenerationError.code,
  "api_error",
  "Should set error code"
);
assert.strictEqual(
  failedDraft.videoGenerationRetryable,
  true,
  "Should mark as retryable"
);
assert.strictEqual(
  failedDraft.videoGenerationAttempts,
  1,
  "Should increment attempts"
);

// Test timeout result
const timeoutResult = {
  status: "timeout",
  error: {
    code: "timeout",
    message: "Timeout after 300000ms",
    retryable: true,
  },
};

const timedoutDraft = updatePostDraftWithVideoResult(mockPostDraft, timeoutResult);
assert.strictEqual(
  timedoutDraft.videoGenerationStatus,
  "failed",
  "Timeout should result in failed status"
);
assert.strictEqual(
  timedoutDraft.videoGenerationError.code,
  "timeout",
  "Should set timeout error code"
);

// Test generateVideoWithHeyGen with missing API key
const missingKeyResult = await generateVideoWithHeyGen(videoRequest, { heygenApiKey: "" });
assert.strictEqual(
  missingKeyResult.ok,
  false,
  "Should fail when API key missing"
);
assert.strictEqual(
  missingKeyResult.error.code,
  "missing_api_key",
  "Should indicate missing API key"
);

// Test request can target Kling without replacing HeyGen defaults
const klingCampaign = { ...mockCampaign, videoGenerationProvider: "kling" };
const klingRequest = await requestVideoGeneration(mockPostDraft, klingCampaign);
assert.strictEqual(klingRequest.provider, "kling", "Campaign can select Kling provider");
assert.strictEqual(klingRequest.klingMode, "pro", "High quality should map to pro mode for Kling");
assert.strictEqual(klingRequest.aspectRatio, "16:9", "Should include platform aspect ratio for Kling");

const missingKlingKeyResult = await generateVideoWithKling(klingRequest, { klingApiKey: "" });
assert.strictEqual(
  missingKlingKeyResult.ok,
  false,
  "Should fail when Kling API key missing"
);
assert.strictEqual(
  missingKlingKeyResult.error.code,
  "missing_api_key",
  "Should indicate missing Kling API key"
);

const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  assert.strictEqual(url, "https://example.test/v1/videos/text2video", "Should call Kling text-to-video endpoint");
  const payload = JSON.parse(options.body);
  assert.strictEqual(payload.model, "kling-v2.6-pro", "Should use default Kling model");
  assert.strictEqual(payload.duration, 10, "Should normalize Kling duration to 5 or 10 seconds");
  assert.strictEqual(payload.aspect_ratio, "16:9", "Should pass supported aspect ratio");
  return {
    ok: true,
    json: async () => ({ task_id: "kling-task-1", status: "queued", credits_used: 0.33 }),
  };
};
const klingStartResult = await generateVideoWithKling(klingRequest, {
  klingApiKey: "test-key",
  klingApiEndpoint: "https://example.test/v1",
});
globalThis.fetch = originalFetch;
assert.strictEqual(klingStartResult.ok, true, "Should start Kling generation");
assert.strictEqual(klingStartResult.videoId, "kling-task-1", "Should parse Kling task ID");
assert.strictEqual(klingStartResult.provider, "kling", "Should return Kling provider marker");

console.log("✓ All Diamond video generation worker tests passed.");

}

runTests().catch((error) => {
  console.error("Test error:", error);
  process.exit(1);
});
