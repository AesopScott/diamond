# Firestore Collections Registry

Every Firestore collection used in Diamond. For each: producers, consumers, status. Update whenever a collection is added, removed, or its schema changes.

---

## `companies`

Top-level tenants — each company has multiple brands, campaigns, and accounts.

**Schema:** `{ name, createdAt, updatedAt, ... }`

**Producers**
- `src/seed.js:TBD` — seed data initialization
- `src/workspace-entities.js:TBD` — company creation flow

**Consumers**
- `src/renderer/shell-switch.js:TBD` — company selector in UI
- `src/tenant-context.js:TBD` — multi-tenancy context loading

**Status:** ✓ wired (existing, not task #9 scope)

---

## `companies/{companyId}/brands`

Brand entities under a company. Multiple brands per company.

**Schema:** `{ name, companyId, createdAt, updatedAt, ... }`

**Producers**
- `src/seed.js:TBD` — brand initialization
- `src/account-setup.js:TBD` — brand creation

**Consumers**
- `src/renderer/posts-scope-helpers.js:TBD` — brand list in UI
- `src/tenant-context.js:TBD` — brand context

**Status:** ✓ wired (existing, not task #9 scope)

---

## `companies/{companyId}/brands/{brandId}/campaigns`

Campaign entities under a brand. Contains campaign-level post generation configuration.

**Schema:** 
```json
{
  "name": "string",
  "brandId": "string",
  "companyId": "string",
  "postGenerationSettings": { ... },
  "imageGenerationEnabled": boolean,
  "imagePromptGuidance": "string — campaign-wide prompt guidance combined with post text",
  "imageGenerationPlatforms": {
    "x":        { "enabled": boolean, "width": 1200, "height": 675,  "aspectRatio": "16:9",   "format": "webp" },
    "instagram":{ "enabled": boolean, "width": 1080, "height": 1350, "aspectRatio": "4:5",    "format": "webp" },
    "tiktok":   { "enabled": boolean, "width": 1080, "height": 1920, "aspectRatio": "9:16",   "format": "webp" },
    "linkedin": { "enabled": boolean, "width": 1200, "height": 628,  "aspectRatio": "16:9", "format": "webp" },
    "youtube":  { "enabled": boolean, "width": 1280, "height": 720,  "aspectRatio": "16:9", "format": "webp" },
    "facebook": { "enabled": boolean, "width": 1200, "height": 628,  "aspectRatio": "16:9", "format": "webp" },
    "reddit":   { "enabled": boolean, "width": 1200, "height": 628,  "aspectRatio": "16:9", "format": "webp" }
  },
  "videoGenerationSettings": { ... },
  "createdAt": "ISO string",
  "updatedAt": "ISO string"
}
```

**Producers**
- `src/renderer/posts-prototype.js:saveCampaignWorkspace` — reads campaign settings form and writes `imageGenerationEnabled`, `imageGenerationPlatforms`, `imagePromptGuidance` (task #9)
- `src/workspace-entities.js:createCampaignRecord` — initialises fields with defaults from `IMAGE_SPECS_BY_PLATFORM` (task #9)

**Consumers**
- `src/image-generation-integration.js:integrateImageGenerationIntoPostCreation` — reads per-platform enabled flag and `imagePromptGuidance` to build Replicate prompt (task #9)
- `src/renderer/posts-prototype.js:renderImageGenerationSection` — renders UI controls from campaign fields (task #9)

**Firestore Rule:** Required — access scoped to company/brand/campaign hierarchy

**Status:** ✓ wired — `imageGenerationEnabled`, `imageGenerationPlatforms`, `imagePromptGuidance` all have confirmed producers and consumers (task #9)

---

## `companies/{companyId}/brands/{brandId}/campaigns/{campaignId}/postPackages`

Post packages (ideas) created in a campaign. Multi-platform post bundles.

**Schema:** `{ ideaText, title, targetPlatforms, status, createdAt, updatedAt, ... }`

**Producers**
- `src/renderer/posts-prototype.js:TBD` — post creation UI
- `src/seed.js:TBD` — seed posts

**Consumers**
- `src/content-generation.js:TBD` — post generation (text + images)
- `src/renderer/posts-prototype.js:TBD` — post list display

**Status:** ✓ wired (existing, not task #9 scope)

---

## `companies/{companyId}/brands/{brandId}/campaigns/{campaignId}/postPackages/{postPackageId}/images`

**⛔ DEFERRED — NOT wired in Task #9**

No code in the task #9 diff writes to this sub-collection. Image metadata and URLs are stored directly on `platformDrafts` documents (see below) via `saveProductionState()`. A dedicated `images` sub-collection was planned but not implemented.

**When deferred collection lands:** a follow-on task will extract the `generatedImageMetadata` from the draft document and write it here, enabling per-image cost roll-ups and approval workflows across platforms.

**Status:** ⛔ DEFERRED — no producer or consumer wired in task #9; image data stored on `platformDrafts` instead

---

## `companies/{companyId}/brands/{brandId}/campaigns/{campaignId}/platformDrafts`

Platform-specific drafts (one per platform per post). Text and media ready for staging.

**Schema (task #9 additions in bold):**
```
{ 
  platform, text, media, status, generationStatus, scheduledAt, publishedAt,
  imageGenerationEnabled,   // boolean | null — per-draft override (task #9)
  imageGenerationStatus,    // "generating"|"complete"|"failed"|undefined (task #9)
  generatedImageUrl,        // string | null — Replicate CDN URL (task #9)
  generatedImageMetadata,   // object — full metadata record from createReplicateImageMetadata() (task #9)
  imageGenerationError,     // string | null — human-readable failure reason (task #9)
  ...
}
```

**Note:** Image metadata (`generatedImageMetadata`, `generatedImageUrl`) lives here — on the draft document — not in a separate `images` sub-collection. The sub-collection is deferred (see entry above).

**Producers**
- `src/post-package.js:TBD` — platform draft creation
- `src/content-generation.js:TBD` — platform-specific text generation
- `src/renderer/posts-prototype.js:toggleDraftImageGeneration` — writes `imageGenerationEnabled`, `imageGenerationStatus`, `generatedImageUrl`, `generatedImageMetadata`, `imageGenerationError` via `saveProductionState()` (task #9)
- `src/image-generation-integration.js:integrateImageGenerationIntoPostCreation` — returns `updatedDraft` with image fields set (task #9)

**Consumers**
- `src/renderer/posts-prototype.js:TBD` — draft display and editing
- `src/renderer/posts-prototype.js:renderImageGenerationToggle` — reads `imageGenerationStatus`, `imageGenerationEnabled` for UI state (task #9)
- `src/platform-proof.js:TBD` — staging proofs
- `src/platform-browser-adapter.js:TBD` — staging/publishing flow

**Status:** ✓ wired — extended with task #9 image generation fields (stored via `saveProductionState()`)

---

## Summary

| Collection | Producers | Consumers | Status |
|---|---|---|---|
| `companies` | seed.js, workspace-entities.js | shell-switch.js, tenant-context.js | ✓ |
| `brands` | seed.js, account-setup.js | posts-scope-helpers.js, tenant-context.js | ✓ |
| `campaigns` | posts-prototype.js, workspace-entities.js | image-generation-integration.js, posts-prototype.js | ✓ (imageGenerationEnabled/Platforms/Guidance wired, task #9) |
| `postPackages` | posts-prototype.js, seed.js | content-generation.js, posts-prototype.js | ✓ |
| **`images`** | **— (none wired)** | **— (none wired)** | **⛔ DEFERRED — image data stored on platformDrafts instead (task #9)** |
| **`platformDrafts`** | post-package.js, content-generation.js, **posts-prototype.js:toggleDraftImageGeneration** | posts-prototype.js, platform-proof.js, platform-browser-adapter.js | ✓ **(extended with image generation fields, task #9)** |

---

## Audit Trail — Proof of Registry Verification

**Last audit:** 2026-05-25T23:30:00Z (registry corrected to match implementation — Codex review fix)

**Boundaries checked:** Firestore collections, sub-collections, schema fields

**Changes from previous version:**
- `campaigns.imageGenerationPlatforms` aspect ratios standardised: linkedin/facebook/reddit set to `"16:9"` (standard Flux Pro ratio for 1200×628 landscape)
- `images` sub-collection status changed from `⚠ NEW (planned)` → `⛔ DEFERRED` — no code in task #9 diff writes to this sub-collection; image metadata is stored on `platformDrafts` documents via `saveProductionState()`
- `platformDrafts` schema extended with task #9 image generation fields: `imageGenerationEnabled`, `imageGenerationStatus`, `generatedImageUrl`, `generatedImageMetadata`, `imageGenerationError`
- `platformDrafts` producers/consumers updated to include task #9 functions

**Status:** Audit complete — all task #9 boundaries reflect actual implementation
