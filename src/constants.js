export const PLATFORMS = Object.freeze([
  "x",
  "instagram",
  "tiktok",
  "linkedin",
  "youtube-shorts",
  "youtube-longform",
  "facebook",
  "pinterest",
  "reddit",
]);

export const POSTING_MODES = Object.freeze([
  "draft_only",
  "stage_for_review",
  "auto_publish",
]);

export const APPROVAL_LEVELS = Object.freeze([
  "auto_allowed",
  "review_required",
  "blocked",
]);

export const RISK_FLAGS = Object.freeze([
  "money",
  "prize",
  "gambling",
  "regulatory",
  "legal",
  "equity",
  "investment",
  "support_sensitive",
  "hostile",
]);

export const DEFAULT_REVIEW_REQUIRED_FLAGS = Object.freeze([
  "money",
  "prize",
  "gambling",
  "regulatory",
  "legal",
  "equity",
  "investment",
  "support_sensitive",
  "hostile",
]);

export const CAMPAIGN_IMAGE_GENERATION_FIELDS = Object.freeze([
  "imageGenerationEnabled",
  "imageGenerationPlatforms",
  "imagePromptGuidance",
]);

// Platform-specific image dimensions for Replicate / Flux Pro
// Format: webp for efficiency; dimensions match each platform's preferred display size
export const IMAGE_SPECS_BY_PLATFORM = Object.freeze({
  x: {
    enabled: false,
    width: 1200,
    height: 675,
    aspectRatio: "16:9",
    format: "webp",
  },
  instagram: {
    enabled: false,
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    format: "webp",
  },
  tiktok: {
    enabled: false,
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    format: "webp",
  },
  linkedin: {
    enabled: false,
    width: 1200,
    height: 628,
    aspectRatio: "16:9", // standard Flux Pro ratio for 1200×628 landscape
    format: "webp",
  },
  youtube: {
    enabled: false,
    width: 1280,
    height: 720,
    aspectRatio: "16:9",
    format: "webp",
  },
  facebook: {
    enabled: false,
    width: 1200,
    height: 628,
    aspectRatio: "16:9", // standard Flux Pro ratio for 1200×628 landscape
    format: "webp",
  },
  reddit: {
    enabled: false,
    width: 1200,
    height: 628,
    aspectRatio: "16:9", // standard Flux Pro ratio for 1200×628 landscape
    format: "webp",
  },
});
