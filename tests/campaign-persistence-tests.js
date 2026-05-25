import assert from "assert";
import { createCampaignRecord, createSeedWorkspace } from "../src/index.js";

console.log("Testing Campaign Video Persistence Unit 5...");

const workspace = createSeedWorkspace();

// Create a campaign with video generation enabled
const campaign = createCampaignRecord({
  companyId: workspace.companies[0]?.id || "company-1",
  brandId: workspace.brands[0]?.id || "brand-1",
  name: "Test Video Campaign",
  videoGenerationEnabled: true,
  videoQualitySize: "high",
  videoPromptGuidance: "Create engaging videos with brand colors",
  videoGenerationPlatforms: {
    tiktok: { enabled: true, videoDurationSeconds: 15, format: "mp4", aspectRatio: "9:16" },
    youtube: { enabled: true, videoDurationSeconds: 60, format: "mp4", aspectRatio: "16:9" },
    x: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
    instagram: { enabled: true, videoDurationSeconds: 30, format: "mp4", aspectRatio: "1:1" },
    linkedin: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
    facebook: { enabled: true, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
    reddit: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
  },
});

// Test that all video fields persist in the campaign record
assert.strictEqual(
  campaign.videoGenerationEnabled,
  true,
  "Campaign should have videoGenerationEnabled set to true"
);

assert.strictEqual(
  campaign.videoQualitySize,
  "high",
  "Campaign should have videoQualitySize set to high"
);

assert.strictEqual(
  campaign.videoPromptGuidance,
  "Create engaging videos with brand colors",
  "Campaign should have videoPromptGuidance persisted"
);

// Test platform configuration persistence
assert(
  campaign.videoGenerationPlatforms.tiktok.enabled,
  "TikTok should be enabled"
);

assert(
  campaign.videoGenerationPlatforms.youtube.enabled,
  "YouTube should be enabled"
);

assert(
  !campaign.videoGenerationPlatforms.x.enabled,
  "X should be disabled"
);

assert(
  campaign.videoGenerationPlatforms.instagram.enabled,
  "Instagram should be enabled"
);

assert(
  campaign.videoGenerationPlatforms.facebook.enabled,
  "Facebook should be enabled"
);

assert(
  !campaign.videoGenerationPlatforms.reddit.enabled,
  "Reddit should be disabled"
);

// Test that campaign without video settings gets sensible defaults
const defaultCampaign = createCampaignRecord({
  companyId: workspace.companies[0]?.id || "company-1",
  brandId: workspace.brands[0]?.id || "brand-1",
  name: "Default Campaign",
});

assert.strictEqual(
  defaultCampaign.videoGenerationEnabled,
  false,
  "Default campaign should have video generation disabled"
);

assert.strictEqual(
  defaultCampaign.videoQualitySize,
  "high",
  "Default campaign should have high quality"
);

assert.strictEqual(
  defaultCampaign.videoPromptGuidance,
  "",
  "Default campaign should have empty prompt guidance"
);

assert(
  defaultCampaign.videoGenerationPlatforms,
  "Default campaign should have platform specs"
);

// All platforms should be disabled by default
Object.values(defaultCampaign.videoGenerationPlatforms).forEach((spec) => {
  assert.strictEqual(
    spec.enabled,
    false,
    "All platforms should be disabled by default"
  );
});

console.log("✓ All Diamond campaign persistence tests passed.");
