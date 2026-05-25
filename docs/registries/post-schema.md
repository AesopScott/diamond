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

## Post Package Fields (NEW for Task #9)

### `imageToggleOverrides`

**NEW for Task #9** — Per-platform image generation toggle overrides. Overrides campaign-level `imageGenerationSettings`.

**Type:** object, keyed by platform:
```json
{
  "x": boolean | null,
  "instagram": boolean | null,
  "tiktok": boolean | null,
  "linkedin": boolean | null,
  "youtube": boolean | null,
  "facebook": boolean | null,
  "reddit": boolean | null
}
```

**Semantics:**
- `null` or missing = use campaign default
- `true` = force image generation on (override campaign if it's off)
- `false` = force image generation off (override campaign if it's on)

**Producers**
- `src/renderer/posts-prototype.js:TBD` — post dialog image toggle controls (task #9)
- User changes per-post image toggle in new post dialog

**Consumers**
- `src/content-generation.js:TBD` — evaluates toggle hierarchy (campaign → post override) to decide image generation (task #9)

**Firestore Constraint:** Field is optional; default `{}` or all `null` if omitted

**Status:** ⚠ NEW — task #9 creates this field

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

### `generatedImageMetadata`

**NEW for Task #9** — Metadata of the auto-generated image (if enabled for this platform).

**Type:** object:
```json
{
  "service": "replicate",
  "model": "flux-pro",
  "prompt": "string — the prompt used to generate this image",
  "imageUrl": "string — cloud storage URL to the generated image",
  "dimensions": {
    "width": number,
    "height": number,
    "aspectRatio": "string — e.g., '1:1', '16:9', '9:16'"
  },
  "generationCost": 0.06,
  "generationTimestamp": "ISO string",
  "approvalStatus": "pending|approved|rejected",
  "regenerationCount": number
}
```

**Producers**
- `src/replicate-image-service.js:TBD` — Replicate API call, stores URL and metadata (task #9)
- `src/content-generation.js:TBD` — initiates image generation for draft (task #9)

**Consumers**
- `src/renderer/posts-prototype.js:TBD` — displays image preview in post dialog (task #9)
- `src/platform-browser-adapter.js:TBD` — retrieves image URL for platform upload (task #9)
- `src/platform-proof.js:TBD` — includes image in staging flow (task #9)

**Firestore Constraint:** Field is optional; populated only if image generation was enabled and successful

**Status:** ⚠ NEW — task #9 creates this field

---

## Summary

| Field | Producers | Consumers | Status |
|---|---|---|---|
| `ideaText` | posts-prototype.js, content-generation.js | content-generation.js, posts-prototype.js | ✓ |
| `targetPlatforms` | posts-prototype.js | content-generation.js, posts-prototype.js | ✓ |
| **`imageToggleOverrides`** | **posts-prototype.js** | **content-generation.js** | **⚠ NEW (task #9)** |
| `text` | post-package.js, content-generation.js | posts-prototype.js, platform-proof.js | ✓ |
| `media` | platform-browser-adapter.js, content-generation.js | platform-proof.js, posts-prototype.js | ✓ (extended) |
| **`generatedImageMetadata`** | **replicate-image-service.js, content-generation.js** | **posts-prototype.js, platform-browser-adapter.js, platform-proof.js** | **⚠ NEW (task #9)** |

---

## Audit Trail — Proof of Registry Verification

**Last audit:** 2026-05-25T13:45:00Z (by /cross-boundary-audit)

**Boundaries checked:** Post package and platform draft document fields

**Evidence recorded:**
- 6 entries total (4 existing + 2 NEW)
- 4 entries with complete producer/consumer pairs ✓
- 2 NEW entries (imageToggleOverrides, generatedImageMetadata) with producers/consumers planned ⚠
- New identifiers introduced on task #9: `imageToggleOverrides` and `generatedImageMetadata` fields

**Gaps identified:**
- ⚠ `imageToggleOverrides` — NEW; producer is posts-prototype.js UI, consumer is content-generation.js (currently TBD)
- ⚠ `generatedImageMetadata` — NEW; producers are replicate-image-service.js and content-generation.js, consumers are UI and adapters (currently TBD)

**Status:** Audit complete — registries record planned additions for task #9
