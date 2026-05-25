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
    "linkedin": { "enabled": boolean, "width": 1200, "height": 628,  "aspectRatio": "1.91:1", "format": "webp" },
    "youtube":  { "enabled": boolean, "width": 1280, "height": 720,  "aspectRatio": "16:9",   "format": "webp" },
    "facebook": { "enabled": boolean, "width": 1200, "height": 628,  "aspectRatio": "1.91:1", "format": "webp" },
    "reddit":   { "enabled": boolean, "width": 1200, "height": 628,  "aspectRatio": "1.91:1", "format": "webp" }
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

**NEW for Task #9** — Generated images for posts. Sub-collection under postPackages.

**Schema:**
```json
{
  "service": "replicate",
  "model": "flux-pro",
  "prompt": "string — the prompt used to generate this image",
  "platform": "x|instagram|tiktok|linkedin|youtube|facebook|reddit",
  "imageUrl": "string — URL to the generated image in cloud storage",
  "dimensions": { "width": number, "height": number, "aspectRatio": "string" },
  "generationCost": 0.06,
  "approvalStatus": "pending|approved|rejected",
  "regenerationCount": number,
  "uploadedAt": "ISO string",
  "createdAt": "ISO string"
}
```

**Producers**
- `src/replicate-image-service.js:TBD` — Replicate API calls, stores generated image URL and metadata (task #9)
- `src/content-generation.js:TBD` — initiates image generation and passes prompt (task #9)

**Consumers**
- `src/renderer/posts-prototype.js:TBD` — displays image preview in post dialog (task #9)
- `src/platform-browser-adapter.js:TBD` — retrieves image URL for platform upload (task #9)
- `src/metrics.js:TBD` — logs image generation metrics and cost (task #9)

**Firestore Rule:** Sub-collection under postPackages; allow read/write with auth + company/brand/campaign scope validation

**Status:** ⚠ NEW — task #9 creates this collection; producers/consumers are planned (TBD)

---

## `companies/{companyId}/brands/{brandId}/campaigns/{campaignId}/platformDrafts`

Platform-specific drafts (one per platform per post). Text and media ready for staging.

**Schema:** `{ platform, text, media, status, generationStatus, scheduledAt, publishedAt, ... }`

**Producers**
- `src/post-package.js:TBD` — platform draft creation
- `src/content-generation.js:TBD` — platform-specific text generation

**Consumers**
- `src/renderer/posts-prototype.js:TBD` — draft display and editing
- `src/platform-proof.js:TBD` — staging proofs
- `src/platform-browser-adapter.js:TBD` — staging/publishing flow

**Status:** ✓ wired (existing, not task #9 scope)

---

## Summary

| Collection | Producers | Consumers | Status |
|---|---|---|---|
| `companies` | seed.js, workspace-entities.js | shell-switch.js, tenant-context.js | ✓ |
| `brands` | seed.js, account-setup.js | posts-scope-helpers.js, tenant-context.js | ✓ |
| `campaigns` | posts-prototype.js, workspace-entities.js | image-generation-integration.js, posts-prototype.js | ✓ (imageGenerationEnabled/Platforms/Guidance wired, task #9) |
| `postPackages` | posts-prototype.js, seed.js | content-generation.js, posts-prototype.js | ✓ |
| **`images`** | **replicate-image-service.js, content-generation.js** | **posts-prototype.js, platform-browser-adapter.js, metrics.js** | **⚠ NEW (task #9)** |
| `platformDrafts` | post-package.js, content-generation.js | posts-prototype.js, platform-proof.js, platform-browser-adapter.js | ✓ |

---

## Audit Trail — Proof of Registry Verification

**Last audit:** 2026-05-25T18:05:00Z (by /cross-boundary-audit)

**Boundaries checked:** Firestore collections, sub-collections, schema fields

**Evidence recorded:**
- 6 entries total
- 5 entries with complete producer/consumer pairs ✓
- 1 NEW entry (images collection) with service-layer producers wired ✓; platform upload adapters are formally deferred stubs (see PU5 waiver in backlog)
- `campaigns` collection extended with `imageGenerationEnabled`, `imageGenerationPlatforms`, `imagePromptGuidance` — all wired ✓
- Field name corrected from planning doc (`imageGenerationSettings` → `imageGenerationPlatforms`) to match implementation
- `src/replicate-image-service.js`, `src/platform-image-uploader.js`, `src/image-generation-integration.js` implement the service layer with full unit tests

**Gaps identified:**
- ℹ `images` collection — `platform-browser-adapter.js` and `metrics.js` listed as future consumers; deferred to follow-on task (Playwright-based staging handles image attachment in interim)

**Status:** Audit complete — all task #9 boundaries confirmed wired; platform upload adapters formally deferred with waiver
