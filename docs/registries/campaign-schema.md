# Campaign Schema Registry

Every top-level field in the campaign document. Update whenever a field is added, removed, or changed.

---

## `videoGenerationSettings` (NEW for Task #10)

Per-campaign video generation configuration.

**Type:** object (optional, default: videoGenerationEnabled = false)

**Schema:**
```typescript
{
  videoGenerationEnabled: boolean
  videoGenerationPlatforms: {
    tiktok: { enabled: boolean, videoDurationSeconds: 15, format: 'mp4', aspectRatio: '9:16' }
    youtube: { enabled: boolean, videoDurationSeconds: 60, format: 'mp4', aspectRatio: '16:9' }
    x: { enabled: boolean, videoDurationSeconds: 30, format: 'mp4', aspectRatio: '16:9' }
    instagram: { enabled: boolean, videoDurationSeconds: 30, format: 'mp4', aspectRatio: '1:1' }
    linkedin: { enabled: boolean, videoDurationSeconds: 30, format: 'mp4', aspectRatio: '16:9' }
    facebook: { enabled: boolean, videoDurationSeconds: 30, format: 'mp4', aspectRatio: '16:9' }
    reddit: { enabled: boolean, videoDurationSeconds: 30, format: 'mp4', aspectRatio: '16:9' }
  }
  videoQualitySize: 'low' | 'medium' | 'high'
  videoPromptGuidance: string
}
```

**Producers**
- `src/renderer/campaign-settings-ui.js` — settings form save

**Consumers**
- `src/renderer/posts-prototype.js` — display settings
- `src/post-package.js` — read defaults
- `src/content-generation.js` — decide generation

**Status:** ⚠ NEW — task #10 creates this field

---

## `postVideoOverrides` (NEW for Task #10)

Per-post overrides to campaign video generation defaults. Stored at post level (in `postDrafts` collection).

**Type:** object (optional, default: all fields null = use campaign defaults)

**Schema:**
```typescript
{
  videoGenerationOverride: boolean | null          // null = use campaign default, true = force on, false = force off
  videoGenerationPlatforms?: {
    [platformName: string]: {
      enabled: boolean | null                      // null = use campaign default
      videoDurationSeconds?: number                // Override duration if non-null
      promptOverride?: string                      // Custom prompt per platform
    }
  }
  videoQualitySizeOverride?: 'low' | 'medium' | 'high' | null
  videoPromptOverride?: string                     // Custom prompt for entire post
}
```

**Constraints:**
- Platform keys must match `PLATFORMS` constant
- `null` in any field means "inherit campaign value"
- `true`/`false` explicitly overrides campaign setting

**Examples:**

_Disable video for this post only:_
```json
{
  "videoGenerationOverride": false
}
```

_Custom prompt without changing enable/disable:_
```json
{
  "videoGenerationOverride": null,
  "videoPromptOverride": "Make this video about sustainable fashion"
}
```

_Per-platform TikTok override (20-second duration):_
```json
{
  "videoGenerationOverride": null,
  "videoGenerationPlatforms": {
    "tiktok": {
      "enabled": true,
      "videoDurationSeconds": 20,
      "promptOverride": "Fast-paced TikTok version"
    }
  }
}
```

**Producers**
- `src/renderer/posts-prototype.js` — post creation form

**Consumers**
- `src/post-package.js` — merge with campaign defaults
- `src/content-generation.js` — read final config

**Status:** ⚠ NEW — task #10 creates this field

---

## Summary

**New fields for task #10:** 2 (videoGenerationSettings, postVideoOverrides)

**Total new schema fields:** 20 across all collections (postDrafts=12, campaigns=4, postPackages=2, postRuns=2)

**Status:** Audit complete — campaign schema fully defined for task #10
