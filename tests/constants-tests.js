import assert from "assert";
import {
  CAMPAIGN_VIDEO_GENERATION_FIELDS,
  VIDEO_SPECS_BY_PLATFORM,
  VIDEO_QUALITY_LEVELS,
} from "../src/constants.js";

console.log("Testing Video Generation Constants...");

// Test CAMPAIGN_VIDEO_GENERATION_FIELDS
assert(
  CAMPAIGN_VIDEO_GENERATION_FIELDS.includes("videoGenerationEnabled"),
  "CAMPAIGN_VIDEO_GENERATION_FIELDS should contain videoGenerationEnabled"
);
assert(
  CAMPAIGN_VIDEO_GENERATION_FIELDS.includes("videoGenerationPlatforms"),
  "CAMPAIGN_VIDEO_GENERATION_FIELDS should contain videoGenerationPlatforms"
);
assert(
  CAMPAIGN_VIDEO_GENERATION_FIELDS.includes("videoQualitySize"),
  "CAMPAIGN_VIDEO_GENERATION_FIELDS should contain videoQualitySize"
);
assert(
  CAMPAIGN_VIDEO_GENERATION_FIELDS.includes("videoPromptGuidance"),
  "CAMPAIGN_VIDEO_GENERATION_FIELDS should contain videoPromptGuidance"
);
assert.strictEqual(
  CAMPAIGN_VIDEO_GENERATION_FIELDS.length,
  4,
  "CAMPAIGN_VIDEO_GENERATION_FIELDS should have exactly 4 fields"
);

// Test VIDEO_SPECS_BY_PLATFORM
assert.deepStrictEqual(
  VIDEO_SPECS_BY_PLATFORM.tiktok,
  {
    enabled: false,
    videoDurationSeconds: 15,
    format: "mp4",
    aspectRatio: "9:16",
  },
  "TikTok specs should have 15-second duration and 9:16 ratio"
);

assert.deepStrictEqual(
  VIDEO_SPECS_BY_PLATFORM.youtube,
  {
    enabled: false,
    videoDurationSeconds: 60,
    format: "mp4",
    aspectRatio: "16:9",
  },
  "YouTube specs should have 60-second duration and 16:9 ratio"
);

assert.strictEqual(
  VIDEO_SPECS_BY_PLATFORM.instagram.aspectRatio,
  "1:1",
  "Instagram specs should have 1:1 aspect ratio"
);

const thirtySecPlatforms = ["x", "instagram", "linkedin", "facebook", "reddit"];
thirtySecPlatforms.forEach((platform) => {
  assert.strictEqual(
    VIDEO_SPECS_BY_PLATFORM[platform].videoDurationSeconds,
    30,
    `${platform} should have 30-second duration`
  );
});

Object.values(VIDEO_SPECS_BY_PLATFORM).forEach((spec, index) => {
  assert.strictEqual(
    spec.format,
    "mp4",
    `Platform ${index} should have mp4 format`
  );
  assert.strictEqual(
    spec.enabled,
    false,
    `Platform ${index} should be initially disabled`
  );
});

// 7 original platforms + youtube-shorts + youtube-longform = 9
assert.strictEqual(
  Object.keys(VIDEO_SPECS_BY_PLATFORM).length,
  9,
  "VIDEO_SPECS_BY_PLATFORM should contain exactly 9 platforms"
);

// Test VIDEO_QUALITY_LEVELS
assert(
  VIDEO_QUALITY_LEVELS.includes("low"),
  "VIDEO_QUALITY_LEVELS should contain low"
);
assert(
  VIDEO_QUALITY_LEVELS.includes("medium"),
  "VIDEO_QUALITY_LEVELS should contain medium"
);
assert(
  VIDEO_QUALITY_LEVELS.includes("high"),
  "VIDEO_QUALITY_LEVELS should contain high"
);
assert.strictEqual(
  VIDEO_QUALITY_LEVELS.length,
  3,
  "VIDEO_QUALITY_LEVELS should have exactly 3 levels"
);

console.log("✓ All Diamond constants tests passed.");
