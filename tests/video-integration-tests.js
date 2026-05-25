import assert from "assert";
import {
  integrateVideoGenerationIntoPostCreation,
  processVideoGenerationForPostPackage,
} from "../src/video-generation-integration.js";

console.log("Testing Video Generation Integration Unit 8...");

async function runTests() {

const mockPostPackage = {
  id: "pkg-1",
  campaignId: "campaign-1",
  ideaText: "Check out our new product",
};

const mockDraft = {
  id: "draft-1",
  platform: "tiktok",
  text: "Check out our new product",
  videoGenerationOverride: null,
  videoGenerationPrompt: null,
  videoQualitySizeOverride: null,
  videoGenerationStatus: null,
  videoGenerationAttempts: 0,
};

const mockCampaignWithVideo = {
  id: "campaign-1",
  videoGenerationEnabled: true,
  videoQualitySize: "high",
  videoPromptGuidance: "Create engaging product videos",
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

const mockCampaignNoVideo = {
  ...mockCampaignWithVideo,
  videoGenerationEnabled: false,
};

// Test integration with video disabled
const disabledResult = await integrateVideoGenerationIntoPostCreation(
  mockPostPackage,
  mockDraft,
  mockCampaignNoVideo,
  { skipPolling: true }
);

assert.strictEqual(
  disabledResult.ok,
  false,
  "Should fail when campaign video disabled"
);

// Test integration with video enabled but missing API key
const missingKeyResult = await integrateVideoGenerationIntoPostCreation(
  mockPostPackage,
  mockDraft,
  mockCampaignWithVideo,
  { heygenApiKey: "", skipPolling: true }
);

assert.strictEqual(
  missingKeyResult.ok,
  false,
  "Should fail when API key missing"
);

// Test with post override disabling video
const postOverrideDisabled = {
  ...mockDraft,
  videoGenerationOverride: false,
};

const overrideDisabledResult = await integrateVideoGenerationIntoPostCreation(
  mockPostPackage,
  postOverrideDisabled,
  mockCampaignWithVideo,
  { skipPolling: true }
);

assert.strictEqual(
  overrideDisabledResult.ok,
  false,
  "Should fail when post overrides to disabled"
);

// Test processVideoGenerationForPostPackage with multiple drafts
const drafts = [
  { ...mockDraft, id: "draft-1", platform: "tiktok" },
  { ...mockDraft, id: "draft-2", platform: "instagram" },
];

const packageResult = await processVideoGenerationForPostPackage(
  mockPostPackage,
  drafts,
  [mockCampaignWithVideo],
  { heygenApiKey: "", skipPolling: true }
);

assert.strictEqual(
  packageResult.ok,
  false,
  "Should fail when API key missing"
);

assert.strictEqual(
  packageResult.results.length,
  2,
  "Should process all drafts"
);

packageResult.results.forEach((result) => {
  assert.strictEqual(
    result.ok,
    false,
    "Each draft should fail with missing API key"
  );
});

console.log("✓ All Diamond video integration tests passed.");

}

runTests().catch((error) => {
  console.error("Test error:", error);
  process.exit(1);
});
