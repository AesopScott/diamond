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

export const CAMPAIGN_VIDEO_GENERATION_FIELDS = Object.freeze([
  "videoGenerationEnabled",
  "videoGenerationPlatforms",
  "videoQualitySize",
  "videoPromptGuidance",
]);

export const VIDEO_SPECS_BY_PLATFORM = Object.freeze({
  tiktok: {
    enabled: false,
    videoDurationSeconds: 15,
    format: "mp4",
    aspectRatio: "9:16",
  },
  youtube: {
    enabled: false,
    videoDurationSeconds: 60,
    format: "mp4",
    aspectRatio: "16:9",
  },
  "youtube-shorts": {
    enabled: false,
    videoDurationSeconds: 60,
    format: "mp4",
    aspectRatio: "9:16",
  },
  "youtube-longform": {
    enabled: false,
    videoDurationSeconds: 60,
    format: "mp4",
    aspectRatio: "16:9",
  },
  x: {
    enabled: false,
    videoDurationSeconds: 30,
    format: "mp4",
    aspectRatio: "16:9",
  },
  instagram: {
    enabled: false,
    videoDurationSeconds: 30,
    format: "mp4",
    aspectRatio: "1:1",
  },
  linkedin: {
    enabled: false,
    videoDurationSeconds: 30,
    format: "mp4",
    aspectRatio: "16:9",
  },
  facebook: {
    enabled: false,
    videoDurationSeconds: 30,
    format: "mp4",
    aspectRatio: "16:9",
  },
  reddit: {
    enabled: false,
    videoDurationSeconds: 30,
    format: "mp4",
    aspectRatio: "16:9",
  },
});

export const VIDEO_QUALITY_LEVELS = Object.freeze([
  "low",
  "medium",
  "high",
]);

export const CAMPAIGN_IMAGE_GENERATION_FIELDS = Object.freeze([
  "imageGenerationEnabled",
  "imageGenerationPlatforms",
  "imagePromptGuidance",
]);

// Platform-specific image dimensions for Replicate / Flux Pro
export const IMAGE_SPECS_BY_PLATFORM = Object.freeze({
  x:         { enabled: false, width: 1200, height:  675, aspectRatio: "16:9", format: "webp" },
  instagram: { enabled: false, width: 1080, height: 1350, aspectRatio:  "4:5", format: "webp" },
  tiktok:    { enabled: false, width: 1080, height: 1920, aspectRatio:  "9:16", format: "webp" },
  linkedin:  { enabled: false, width: 1200, height:  628, aspectRatio: "16:9", format: "webp" },
  youtube:   { enabled: false, width: 1280, height:  720, aspectRatio: "16:9", format: "webp" },
  facebook:  { enabled: false, width: 1200, height:  628, aspectRatio: "16:9", format: "webp" },
  reddit:    { enabled: false, width: 1200, height:  628, aspectRatio: "16:9", format: "webp" },
});
