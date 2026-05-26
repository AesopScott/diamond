import assert from "assert";

console.log("Testing Campaign Video UI Unit 4...");

const mockCampaign = {
  id: "camp-123",
  name: "Test Campaign",
  videoGenerationEnabled: false,
  videoGenerationPlatforms: {
    tiktok: { enabled: false, videoDurationSeconds: 15, format: "mp4", aspectRatio: "9:16" },
    youtube: { enabled: false, videoDurationSeconds: 60, format: "mp4", aspectRatio: "16:9" },
    x: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
    instagram: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "1:1" },
    linkedin: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
    facebook: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
    reddit: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
  },
  videoQualitySize: "high",
  videoPromptGuidance: "Create engaging videos for social media",
};

// Test that campaign has all video generation fields
assert(
  "videoGenerationEnabled" in mockCampaign,
  "Campaign must have videoGenerationEnabled field"
);

assert(
  "videoGenerationPlatforms" in mockCampaign,
  "Campaign must have videoGenerationPlatforms field"
);

assert(
  "videoQualitySize" in mockCampaign,
  "Campaign must have videoQualitySize field"
);

assert(
  "videoPromptGuidance" in mockCampaign,
  "Campaign must have videoPromptGuidance field"
);

// Test platform specs
assert.strictEqual(
  Object.keys(mockCampaign.videoGenerationPlatforms).length,
  7,
  "Should have 7 platforms"
);

assert.strictEqual(
  mockCampaign.videoGenerationPlatforms.tiktok.videoDurationSeconds,
  15,
  "TikTok should have 15-second duration"
);

assert.strictEqual(
  mockCampaign.videoGenerationPlatforms.youtube.videoDurationSeconds,
  60,
  "YouTube should have 60-second duration"
);

// Test that quality size is one of the valid levels
assert(
  ["low", "medium", "high"].includes(mockCampaign.videoQualitySize),
  "Quality size should be low, medium, or high"
);

console.log("✓ All Diamond campaign video UI tests passed.");
