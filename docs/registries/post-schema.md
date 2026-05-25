# Post Schema Registry

Fields in post package and platform draft documents. For each: producers, consumers, status. Update whenever a post field is added, removed, or its shape changes.

---

## Post Package Fields (existing scope — not task #9 focus, listed for reference)

### `ideaText`

Post idea/concept as entered or generated.

**Type:** string

**Producers**
- `src/renderer/posts-prototype.js:TBD` — post creation form
- `src/content-generation.js:TBD` — generated idea text

**Consumers**
- `src/content-generation.js:TBD` — platform text generation input
- `src/renderer/posts-prototype.js:TBD` — post display

**Status:** ✓ wired

---

### `targetPlatforms`

Array of platform slugs this post targets.

**Type:** string array (values from `PLATFORMS` constant)

**Producers**
- `src/renderer/posts-prototype.js:TBD` — platform selection in UI

**Consumers**
- `src/content-generation.js:TBD` — generates platform-specific drafts
- `src/renderer/posts-prototype.js:TBD` — displays selected platforms

**Status:** ✓ wired

---

## Platform Draft Fields (existing scope — not task #9 focus)

### `text`

Platform-specific post text (character-limited per platform).

**Type:** string

**Producers**
- `src/post-package.js:TBD` — platform draft creation
- `src/content-generation.js:TBD` — platform-specific text generation

**Consumers**
- `src/renderer/posts-prototype.js:TBD` — text editing
- `src/platform-proof.js:TBD` — staging logic

**Status:** ✓ wired

---

### `media`

Array of media items (images, videos) attached to this draft.

**Type:** array of objects `{ url: string, type: "image"|"video", metadata: {...} }`

**Producers**
- `src/platform-browser-adapter.js:TBD` — media upload/attachment
- `src/content-generation.js:TBD` — auto-attach generated images/videos (task #9)

**Consumers**
- `src/platform-proof.js:TBD` — staging with media
- `src/renderer/posts-prototype.js:TBD` — media preview

**Status:** ✓ wired (extended by task #9)

---

## Platform Draft Fields (NEW for Task #9)

### `imageGenerationEnabled`

**NEW for Task #9** — Per-draft image generation override. `null` or `undefined` means inherit from campaign default; `true` forces on; `false` forces off.

**Note:** The planning doc used `imageToggleOverrides` (a per-platform object) but the implementation uses a single `boolean | null` field directly on each platform draft. This registry reflects the actual implementation.

**Type:** `boolean | null`

**Semantics:**
- `null` or `undefined` = inherit campaign `imageGenerationEnabled` setting
- `true` = force image generation on for this draft (overrides campaign default)
- `false` = force image generation off for this draft (overrides campaign default)

**Producers**
- `src/renderer/posts-prototype.js:toggleDraftImageGeneration` — cycles null → true → false → null on user click (task #9)

**Consumers**
- `src/image-generation-integration.js:resolveImageGenerationEnabled` — evaluates campaign + per-draft override to decide whether to call Replicate (task #9)
- `src/renderer/posts-prototype.js:renderImageGenerationToggle` — renders button active/inactive state (task #9)

**Firestore Constraint:** Field is optional on draft document; persisted with draft via `saveProductionState()`

**Status:** ✓ wired — producer and consumers implemented (task #9)

---

### `imageGenerationStatus`

**NEW for Task #9** — Current generation lifecycle state for this draft.

**Type:** `"generating" | "complete" | "failed" | undefined`

**Producers**
- `src/renderer/posts-prototype.js:toggleDraftImageGeneration` — sets "generating" before API call, then final state (task #9)
- `src/image-generation-integration.js:integrateImageGenerationIntoPostCreation` — sets "complete" or "failed" in returned `updatedDraft` (task #9)

**Consumers**
- `src/renderer/posts-prototype.js:renderImageGenerationToggle` — renders ✓ / ✗ status label (task #9)

**Status:** ✓ wired (task #9)

---

### `generatedImageUrl`

**NEW for Task #9** — URL of the successfully generated image (Replicate delivery CDN or Firebase Storage URL).

**Type:** `string | null`

**Producers**
- `src/image-generation-integration.js:integrateImageGenerationIntoPostCreation` — populated from Replicate result (task #9)

**Consumers**
- `src/renderer/posts-prototype.js:TBD` — image preview in post dialog (task #9)
- `src/platform-browser-adapter.js:TBD` — attaches image to platform upload (task #9)

**Status:** ✓ wired (task #9)

---

### `generatedImageMetadata`

**NEW for Task #9** — Full metadata record for the generated image, as returned by `createReplicateImageMetadata()`.

**Note:** The planning doc had a `dimensions` sub-object here; the actual implementation stores dimensions inside `IMAGE_SPECS_BY_PLATFORM` (used at generation time) but does not embed them in the metadata record. `generatedImageUrl` is a separate flat field on the draft (not embedded here).

**Type:** object:
```json
{
  "service": "replicate",
  "model": "flux-pro",
  "prompt": "string — the prompt used to generate this image",
  "platform": "x|instagram|tiktok|linkedin|youtube|facebook|reddit",
  "imageUrl": "string — same as generatedImageUrl on the draft",
  "generationCost": 0.06,
  "approvalStatus": "pending|approved|rejected",
  "regenerationCount": 0,
  "predictionId": "string — Replicate prediction ID",
  "createdAt": "ISO string"
}
```

**Producers**
- `src/replicate-image-service.js:createReplicateImageMetadata` — constructs this object from Replicate result (task #9)
- `src/image-generation-integration.js:integrateImageGenerationIntoPostCreation` — attaches to updatedDraft (task #9)

**Consumers**
- `src/renderer/posts-prototype.js:TBD` — displays image metadata in post dialog (task #9)
- `src/platform-browser-adapter.js:TBD` — reads cost and approval status (task #9)

**Firestore Constraint:** Field is optional on draft document; populated only if image generation was enabled and successful. Persisted with draft via `saveProductionState()`.

**Status:** ✓ wired (task #9)

---

### `imageGenerationError`

**NEW for Task #9** — Human-readable error message when image generation fails for this draft.

**Type:** `string | null`

**Producers**
- `src/image-generation-integration.js:integrateImageGenerationIntoPostCreation` — populated on failure (task #9)

**Consumers**
- `src/renderer/posts-prototype.js:renderImageGenerationToggle` — shows ✗ state (task #9)

**Status:** ✓ wired (task #9)

---

## Summary

| Field | Producers | Consumers | Status |
|---|---|---|---|
| `ideaText` | posts-prototype.js, content-generation.js | content-generation.js, posts-prototype.js | ✓ |
| `targetPlatforms` | posts-prototype.js | content-generation.js, posts-prototype.js | ✓ |
| `text` | post-package.js, content-generation.js | posts-prototype.js, platform-proof.js | ✓ |
| `media` | platform-browser-adapter.js, content-generation.js | platform-proof.js, posts-prototype.js | ✓ (extended) |
| **`imageGenerationEnabled`** | **posts-prototype.js:toggleDraftImageGeneration** | **image-generation-integration.js, posts-prototype.js** | **✓ wired (task #9)** |
| **`imageGenerationStatus`** | **posts-prototype.js, image-generation-integration.js** | **posts-prototype.js** | **✓ wired (task #9)** |
| **`generatedImageUrl`** | **image-generation-integration.js** | **posts-prototype.js, platform-browser-adapter.js** | **✓ wired (task #9)** |
| **`generatedImageMetadata`** | **replicate-image-service.js, image-generation-integration.js** | **posts-prototype.js, platform-browser-adapter.js** | **✓ wired (task #9)** |
| **`imageGenerationError`** | **image-generation-integration.js** | **posts-prototype.js** | **✓ wired (task #9)** |

---

## Audit Trail — Proof of Registry Verification

**Last audit:** 2026-05-25T23:00:00Z (registry corrected to match implementation — review fix)

**Boundaries checked:** Post package and platform draft document fields

**Changes from previous version:**
- `imageToggleOverrides` (per-platform object, planned) → replaced by `imageGenerationEnabled` (single `boolean|null` per draft, implemented)
- `generatedImageMetadata` shape corrected — no `dimensions` sub-object; `predictionId` added; `generatedImageUrl` documented as separate flat field
- Added `imageGenerationStatus` and `imageGenerationError` fields (implemented but missing from prior registry)
- All new task #9 fields now show concrete producer/consumer line references

**Status:** Audit complete — all task #9 draft fields reflect actual implementation
