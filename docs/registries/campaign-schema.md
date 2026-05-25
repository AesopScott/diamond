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

## `imageGenerationSettings`

**NEW for Task #9** — Per-platform image generation configuration.

**Type:** object, keyed by platform name:
```json
{
  "x": {
    "enabled": boolean,
    "promptTemplate": string,
    "serviceChoice": "replicate"
  },
  "instagram": {
    "enabled": boolean,
    "promptTemplate": string,
    "serviceChoice": "replicate"
  },
  "tiktok": { "enabled": boolean, "promptTemplate": string, "serviceChoice": "replicate" },
  "linkedin": { "enabled": boolean, "promptTemplate": string, "serviceChoice": "replicate" },
  "youtube": { "enabled": boolean, "promptTemplate": string, "serviceChoice": "replicate" },
  "facebook": { "enabled": boolean, "promptTemplate": string, "serviceChoice": "replicate" },
  "reddit": { "enabled": boolean, "promptTemplate": string, "serviceChoice": "replicate" }
}
```

**Constraints:**
- Platform keys must match `PLATFORMS` constant in `src/constants.js`
- `enabled` is required (boolean); default `false` for all platforms except `instagram` (default `true` — required)
- `promptTemplate` is required (string); provides guidance for image generation prompt construction
- `serviceChoice` is required (string); currently only `"replicate"` supported

**Producers**
- `src/renderer/campaign-settings-image-panel.js:TBD` — image generation settings UI save (task #9)
- User edits campaign settings and clicks Save

**Consumers**
- `src/content-generation.js:TBD` — reads campaign settings to determine per-platform image generation (task #9)
- `src/renderer/posts-prototype.js:TBD` — displays campaign image settings in UI (task #9)

**Status:** ⚠ NEW — task #9 creates this field; producers/consumers are planned

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
| **`imageGenerationSettings`** | **campaign-settings-image-panel.js** | **content-generation.js, posts-prototype.js** | **⚠ NEW (task #9)** |
| `videoGenerationSettings` | (deferred) | (deferred) | ⚠ deferred (task #10) |
| `createdAt` | seed.js, account-setup.js | posts-prototype.js | ✓ |
| `updatedAt` | (all updates) | posts-prototype.js, firebase-sync.js | ✓ |

---

## Audit Trail — Proof of Registry Verification

**Last audit:** 2026-05-25T13:45:00Z (by /cross-boundary-audit)

**Boundaries checked:** Campaign document top-level fields and sub-objects

**Evidence recorded:**
- 6 entries total (5 existing + 1 NEW)
- 5 entries with complete producer/consumer pairs ✓
- 1 NEW entry (imageGenerationSettings) with 2 producers and 2 consumers planned ⚠
- New identifiers introduced on task #9: `imageGenerationSettings` field with 7 platform sub-objects

**Gaps identified:**
- ⚠ `imageGenerationSettings` — NEW; producers/consumers are task #9 implementation (currently TBD)
- ℹ `videoGenerationSettings` — placeholder; deferred to task #10

**Status:** Audit complete — registries record planned additions for task #9
