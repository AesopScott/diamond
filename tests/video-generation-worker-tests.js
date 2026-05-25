import assert from "assert";
import {
  requestVideoGeneration,
  generateVideoWithHeyGen,
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

console.log("✓ All Diamond video generation worker tests passed.");

}

runTests().catch((error) => {
  console.error("Test error:", error);
  process.exit(1);
});
