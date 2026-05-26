# Campaign Schema Registry

Every top-level field and sub-object in the campaign document. For each: producers, consumers, status. Update whenever a campaign field is added, removed, or its shape changes.

---

## `name`

Campaign display name.

**Type:** string

**Producers**
- `src/account-setup.js:TBD` — campaign creation

**Consumers**
- `src/renderer/posts-prototype.js:TBD` — campaign title display

**Status:** ✓ wired

---

## `postGenerationSettings`

Configuration for post text generation (existing, not task #9 scope).

**Type:** object `{ template: string, tone: string, targetLength: number, ... }`

**Producers**
- `src/renderer/campaign-settings-ui.js:TBD` — campaign settings form

**Consumers**
- `src/content-generation.js:TBD` — text generation configuration

**Status:** ✓ wired

---

## `imageGenerationPlatforms`

**NEW for Task #9** — Per-platform image generation enable flags and dimension specs. Stored as a flat object keyed by platform name. Campaign-level prompt guidance is stored separately in `imagePromptGuidance` (top-level field, not per-platform).

**Type:** object, keyed by platform name:
```json
{
  "x":        { "enabled": boolean, "width": 1200, "height": 675,  "aspectRatio": "16:9",   "format": "webp" },
  "instagram":{ "enabled": boolean, "width": 1080, "height": 1350, "aspectRatio": "4:5",    "format": "webp" },
  "tiktok":   { "enabled": boolean, "width": 1080, "height": 1920, "aspectRatio": "9:16",   "format": "webp" },
  "linkedin": { "enabled": boolean, "width": 1200, "height": 628,  "aspectRatio": "16:9", "format": "webp" },
  "youtube":  { "enabled": boolean, "width": 1280, "height": 720,  "aspectRatio": "16:9", "format": "webp" },
  "facebook": { "enabled": boolean, "width": 1200, "height": 628,  "aspectRatio": "16:9", "format": "webp" },
  "reddit":   { "enabled": boolean, "width": 1200, "height": 628,  "aspectRatio": "16:9", "format": "webp" }
}
```

**Constraints:**
- Platform keys must match `IMAGE_SPECS_BY_PLATFORM` in `src/constants.js`
- `enabled` is required (boolean); defaults to `false` for all platforms
- `width`, `height`, `aspectRatio`, `format` are dimension specs passed to Replicate; defaults from `IMAGE_SPECS_BY_PLATFORM`
- Service choice is fixed as Replicate/Flux Pro; no per-platform override in this version

**Related fields (top-level campaign):**
- `imageGenerationEnabled` — master on/off toggle for the entire campaign
- `imagePromptGuidance` — campaign-wide prompt guidance string combined with post text at generation time

**Producers**
- `src/renderer/posts-prototype.js:saveCampaignWorkspace` — reads per-platform checkboxes and writes full platforms object (task #9)

**Consumers**
- `src/image-generation-integration.js:integrateImageGenerationIntoPostCreation` — reads per-platform enabled flag before calling Replicate (task #9)
- `src/renderer/posts-prototype.js:renderImageGenerationSection` — renders per-platform checkboxes with current enabled state (task #9)

**Status:** ✓ wired — producer and consumers implemented (task #9)

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

## `createdAt`

Campaign creation timestamp.

**Type:** ISO 8601 string

**Producers**
- `src/seed.js:TBD` — seed initialization
- `src/account-setup.js:TBD` — campaign creation form

**Consumers**
- `src/renderer/posts-prototype.js:TBD` — campaign metadata display

**Status:** ✓ wired

---

## `updatedAt`

Campaign last modification timestamp.

**Type:** ISO 8601 string

**Producers**
- Any field update (all producer modules set this)

**Consumers**
- `src/renderer/posts-prototype.js:TBD` — campaign metadata display
- `src/firebase-sync.js:TBD` — sync logic

**Status:** ✓ wired

---

## Summary

| Field | Producers | Consumers | Status |
|---|---|---|---|
| `name` | account-setup.js | posts-prototype.js | ✓ |
| `postGenerationSettings` | campaign-settings-ui.js | content-generation.js | ✓ |
| **`imageGenerationEnabled`** | **posts-prototype.js:saveCampaignWorkspace** | **image-generation-integration.js, posts-prototype.js** | **✓ wired (task #9)** |
| **`imageGenerationPlatforms`** | **posts-prototype.js:saveCampaignWorkspace** | **image-generation-integration.js, posts-prototype.js** | **✓ wired (task #9)** |
| **`imagePromptGuidance`** | **posts-prototype.js:saveCampaignWorkspace** | **image-generation-integration.js:buildImagePrompt** | **✓ wired (task #9)** |
| **`videoGenerationSettings`** | **campaign-settings-ui.js** | **posts-prototype.js, post-package.js, content-generation.js** | **⚠ NEW (task #10)** |
| **`postVideoOverrides`** | **posts-prototype.js** | **post-package.js, content-generation.js** | **⚠ NEW (task #10)** |
| `createdAt` | seed.js, account-setup.js | posts-prototype.js | ✓ |
| `updatedAt` | (all updates) | posts-prototype.js, firebase-sync.js | ✓ |

**New fields for task #10:** 2 (videoGenerationSettings, postVideoOverrides)

**Total new schema fields:** 20 across all collections (postDrafts=12, campaigns=4, postPackages=2, postRuns=2)

---

## Audit Trail — Proof of Registry Verification

**Last audit:** 2026-05-25T18:05:00Z (by /cross-boundary-audit)

**Boundaries checked:** Campaign document top-level fields and sub-objects

**Evidence recorded:**
- 8 entries total (5 existing + 3 NEW across tasks #9 and #10)
- 5 entries with complete producer/consumer pairs ✓
- 3 NEW entries (imageGenerationEnabled, imageGenerationPlatforms, imagePromptGuidance) — all wired ✓ (task #9)
- 2 NEW entries (videoGenerationSettings, postVideoOverrides) — defined, pending implementation ⚠ (task #10)
- New identifiers introduced on task #9: `imageGenerationEnabled`, `imageGenerationPlatforms` (7-platform object), `imagePromptGuidance`
- Producers and consumers confirmed: posts-prototype.js writes; image-generation-integration.js reads
- Field name corrected from earlier planning doc (`imageGenerationSettings` → `imageGenerationPlatforms`) to match implementation

**Gaps identified:**
- ℹ `videoGenerationSettings` — NEW for task #10; full schema defined
- ℹ `postVideoOverrides` — NEW for task #10; full schema defined

**Status:** Audit complete — all task #9 campaign fields wired with confirmed producers and consumers; task #10 fields defined pending implementation
