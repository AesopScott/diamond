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

## `videoGenerationSettings`

Per-platform video generation configuration (future, task #10 scope; placeholder here).

**Type:** object, keyed by platform name (similar structure to imageGenerationSettings)

**Status:** ⚠ deferred — planned for task #10, not task #9

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
| `videoGenerationSettings` | (deferred) | (deferred) | ⚠ deferred (task #10) |
| `createdAt` | seed.js, account-setup.js | posts-prototype.js | ✓ |
| `updatedAt` | (all updates) | posts-prototype.js, firebase-sync.js | ✓ |

---

## Audit Trail — Proof of Registry Verification

**Last audit:** 2026-05-25T18:05:00Z (by /cross-boundary-audit)

**Boundaries checked:** Campaign document top-level fields and sub-objects

**Evidence recorded:**
- 6 entries total (5 existing + 1 NEW)
- 5 entries with complete producer/consumer pairs ✓
- 3 NEW entries (imageGenerationEnabled, imageGenerationPlatforms, imagePromptGuidance) — all wired ✓
- New identifiers introduced on task #9: `imageGenerationEnabled`, `imageGenerationPlatforms` (7-platform object), `imagePromptGuidance`
- Producers and consumers confirmed: posts-prototype.js writes; image-generation-integration.js reads
- Field name corrected from earlier planning doc (`imageGenerationSettings` → `imageGenerationPlatforms`) to match implementation

**Gaps identified:**
- ℹ `videoGenerationSettings` — Placeholder for task #10; deferred

**Status:** Audit complete — all task #9 campaign fields wired with confirmed producers and consumers
