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

// Duration targets for AI content types.
// videoDurationSeconds is passed to all video generators (Kling, HeyGen, etc.).
// Kling normalises values to 5 or 10; other providers use the value directly.
// supportsImage / supportsVideo flag which generators are appropriate for each type.
export const MEDIA_CONTENT_TYPE_SPECS = Object.freeze({
  "absurdist near-real AI loop":               { label: "Absurdist near-real AI loop",             durationRange: "6–12s",    videoDurationSeconds: 10, supportsImage: false, supportsVideo: true },
  "humorous AI trampoline gag":                { label: "Humorous AI trampoline gag",               durationRange: "5–10s",    videoDurationSeconds: 10, supportsImage: false, supportsVideo: true },
  "AI yacht jump / splash gag":                { label: "AI yacht jump / splash gag",               durationRange: "6–12s",    videoDurationSeconds: 10, supportsImage: false, supportsVideo: true },
  "AI animal/cat reel":                        { label: "AI animal/cat reel",                       durationRange: "8–20s",    videoDurationSeconds: 10, supportsImage: false, supportsVideo: true },
  "surreal AI reel":                           { label: "Surreal AI reel",                          durationRange: "6–15s",    videoDurationSeconds: 10, supportsImage: false, supportsVideo: true },
  "cinematic surreal AI reel":                 { label: "Cinematic surreal AI reel",                durationRange: "10–25s",   videoDurationSeconds: 10, supportsImage: false, supportsVideo: true },
  "cursed horror AI reel":                     { label: "Cursed horror AI reel",                    durationRange: "6–15s",    videoDurationSeconds: 10, supportsImage: false, supportsVideo: true },
  "AI microdrama series":                      { label: "AI microdrama series",                     durationRange: "30–90s",   videoDurationSeconds: 10, supportsImage: false, supportsVideo: true },
  "absurd AI chiropractor physical gag":       { label: "Absurd AI chiropractor gag",               durationRange: "8–20s",    videoDurationSeconds: 10, supportsImage: false, supportsVideo: true },
  "AI cat work/restaurant chaos video":        { label: "AI cat work/restaurant chaos",             durationRange: "10–30s",   videoDurationSeconds: 10, supportsImage: false, supportsVideo: true },
  "AI brainrot creature meme":                 { label: "AI brainrot creature meme",                durationRange: "6–15s",    videoDurationSeconds: 10, supportsImage: false, supportsVideo: true },
  "scary AI water-slide/fall clip":            { label: "Scary AI water-slide/fall clip",           durationRange: "5–12s",    videoDurationSeconds: 10, supportsImage: false, supportsVideo: true },
  "boxed AI action figure portrait":           { label: "Boxed AI action figure portrait",          durationRange: "image or 4–8s reveal",  videoDurationSeconds: 5,  supportsImage: true,  supportsVideo: true },
  "Ghibli-style AI portrait":                  { label: "Ghibli-style AI portrait",                 durationRange: "image or 4–8s reveal",  videoDurationSeconds: 5,  supportsImage: true,  supportsVideo: true },
  "vintage AI portrait":                       { label: "Vintage AI portrait",                      durationRange: "image or 4–8s reveal",  videoDurationSeconds: 5,  supportsImage: true,  supportsVideo: true },
  "hyper-real 3D figurine avatar":             { label: "Hyper-real 3D figurine avatar",            durationRange: "image or 5–10s reveal", videoDurationSeconds: 5,  supportsImage: true,  supportsVideo: true },
  "AI restored family / lost-relative photo":  { label: "AI restored family/lost-relative photo",   durationRange: "image or 8–20s reveal", videoDurationSeconds: 10, supportsImage: true,  supportsVideo: true },
});

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
