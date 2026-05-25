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

Per-post overrides to campaign video defaults (at post level, not campaign level).

**Semantics:**
- `null` = use campaign default
- `true` = force enable
- `false` = force disable

**Type:** object (optional)

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
