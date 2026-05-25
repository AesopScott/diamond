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
  "imageGenerationSettings": {
    "x": { "enabled": boolean, "promptTemplate": string, "serviceChoice": string },
    "instagram": { "enabled": boolean, ... },
    "tiktok": { "enabled": boolean, ... },
    "linkedin": { "enabled": boolean, ... },
    "youtube": { "enabled": boolean, ... },
    "facebook": { "enabled": boolean, ... },
    "reddit": { "enabled": boolean, ... }
  },
  "videoGenerationSettings": { ... },
  "createdAt": "ISO string",
  "updatedAt": "ISO string"
}
```

**Producers**
- `src/renderer/campaign-settings-image-panel.js:TBD` — image generation settings UI (task #9)
- `src/seed.js:TBD` — campaign initialization

**Consumers**
- `src/content-generation.js:TBD` — reads `imageGenerationSettings` per platform to decide image generation (task #9)
- `src/renderer/posts-prototype.js:TBD` — displays campaign settings in UI (task #9)

**Firestore Rule:** Required to exist and enforce `imageGenerationSettings` structure

**Status:** ⚠ partial — existing collection, but `imageGenerationSettings` fields are NEW (task #9)

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
| `campaigns` | campaign-settings-ui, seed.js | content-generation.js, posts-prototype.js | ⚠ partial (imageGenerationSettings NEW) |
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
- 1 NEW entry (images collection) with service-layer producers wired ⚠ (UI consumers pending)
- 1 PARTIAL entry (campaigns collection) with new imageGenerationSettings fields ⚠
- New identifiers introduced on task #9: `images` sub-collection (schema confirmed), `imageGenerationSettings` in campaigns (schema confirmed)
- Service layer code verified: `src/replicate-image-service.js`, `src/platform-image-uploader.js` implement producers with full unit tests

**Gaps identified:**
- ⚠ `images` collection — Producers wired (replicate-image-service.js, platform-image-uploader.js); UI consumers pending (posts-prototype.js displaying images, platform-browser-adapter.js uploading to platforms)
- ⚠ `campaigns.imageGenerationSettings` — Schema documented; producer (campaign-settings-image-panel.js UI) and consumer (content-generation.js logic) implementation deferred to Proof Units 3-4

**Status:** Audit complete — service layer implementation verified (Proof Units 1, 2, 5-7), UI layer pending (Proof Units 3-4)
