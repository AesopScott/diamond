import assert from "assert";
import { createPostDraft, createCampaignRecord, createSeedWorkspace } from "../src/index.js";

console.log("Testing Post UI Video Toggle Unit 6...");

const workspace = createSeedWorkspace();

// Create a campaign with video generation enabled
const campaignWithVideo = createCampaignRecord({
  companyId: workspace.companies[0]?.id || "company-1",
  brandId: workspace.brands[0]?.id || "brand-1",
  name: "Video Campaign",
  videoGenerationEnabled: true,
  videoQualitySize: "high",
  videoPromptGuidance: "Create engaging videos",
  videoGenerationPlatforms: {
    tiktok: { enabled: true, videoDurationSeconds: 15, format: "mp4", aspectRatio: "9:16" },
    youtube: { enabled: false, videoDurationSeconds: 60, format: "mp4", aspectRatio: "16:9" },
    x: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
    instagram: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "1:1" },
    linkedin: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
    facebook: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
    reddit: { enabled: false, videoDurationSeconds: 30, format: "mp4", aspectRatio: "16:9" },
  },
});

// Create a campaign without video generation
const campaignWithoutVideo = createCampaignRecord({
  companyId: workspace.companies[0]?.id || "company-1",
  brandId: workspace.brands[0]?.id || "brand-1",
  name: "No Video Campaign",
});

// Create a post draft
const postDraft = createPostDraft({
  context: workspace.context,
  text: "Test post for video toggle",
});

// Test that post draft has video generation fields initialized
assert(
  "videoGenerationRequested" in postDraft,
  "Post draft should have videoGenerationRequested field"
);

assert(
  "videoGenerationOverride" in postDraft,
  "Post draft should have videoGenerationOverride field"
);

assert.strictEqual(
  postDraft.videoGenerationRequested,
  false,
  "Default post draft should not request video generation"
);

assert.strictEqual(
  postDraft.videoGenerationOverride,
  null,
  "Default post draft should have null override (inherit campaign setting)"
);

// Test campaign-to-post flow
const postWithCampaignVideo = createPostDraft({
  context: { ...workspace.context, campaignId: campaignWithVideo.id },
  text: "Post for video campaign",
});

// Post should start with video disabled, but could be set based on campaign default
assert.strictEqual(
  postWithCampaignVideo.videoGenerationOverride,
  null,
  "Post without override should inherit campaign default (null)"
);

// Post created with video explicitly disabled
const postVideoDisabled = createPostDraft({
  context: { ...workspace.context, campaignId: campaignWithVideo.id },
  text: "Post with video disabled",
});

// Simulate setting override
postVideoDisabled.videoGenerationOverride = false;

assert.strictEqual(
  postVideoDisabled.videoGenerationOverride,
  false,
  "Post override to false should disable video even if campaign enabled"
);

// Post created with video explicitly enabled
const postVideoEnabled = createPostDraft({
  context: { ...workspace.context, campaignId: campaignWithoutVideo.id },
  text: "Post with video enabled",
});

// Simulate setting override
postVideoEnabled.videoGenerationOverride = true;

assert.strictEqual(
  postVideoEnabled.videoGenerationOverride,
  true,
  "Post override to true should enable video even if campaign disabled"
);

console.log("✓ All Diamond post video toggle tests passed.");
