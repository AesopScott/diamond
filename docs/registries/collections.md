# Firestore Collections & Schema Registry

Every Firestore collection and schema field used in Diamond. For each: structure, producers, consumers, status.

---

## `postDrafts`

Post draft documents with generated content and metadata.

**Schema fields (NEW for task #10 — 12 video fields):**
- `videoGenerationRequested` (boolean) — whether to generate video
- `videoGenerationOverride` (boolean|null) — per-post override (null = campaign default)
- `generatedVideoUrl` (string|null) — URL to generated video
- `generatedVideoPrompt` (string|null) — prompt used
- `videoGenerationStatus` (enum: pending|generating|success|failed|retrying)
- `videoGenerationError` (object|null) — error details {code, message, timestamp}
- `videoGenerationRetryable` (boolean) — whether error can be retried
- `videoGenerationAttempts` (number) — count of attempts
- `operatorNotificationStatus` (enum|null: pending|sent|failed)
- `manualQualityValidation` (object|null) — {status, score, notes, validatedAt}
- `videoDurationSeconds` (number) — actual duration
- `videoGenerationCost` (number|null) — credits used (~$0.97/min)

**Producers**
- `src/firebase-sync.js` — buildFirestoreSyncBundle
- `src/post-package.js` — creates draft
- `src/video-generation-worker.js` — updates video fields

**Consumers**
- `src/renderer/posts-prototype.js` — displays drafts
- `src/video-generation-worker.js` — reads videoGenerationRequested
- `src/platform-browser-adapter.js` — retrieves video URL
- `src/metrics.js` — logs video metrics

**Status:** ✅ implemented — task #10 (12 new video fields, src/draft.js)

---

## `campaigns`

Campaign configuration and metadata.

**Schema fields (NEW for task #10 — 4 video fields):**
- `videoGenerationEnabled` (boolean, default: false)
- `videoGenerationPlatforms` (object) — per-platform config with duration, format, aspect ratio
- `videoQualitySize` (enum: low|medium|high, default: high)
- `videoPromptGuidance` (string) — operator guidance

**Producers**
- `src/renderer/campaign-settings-ui.js` — settings form save
- `src/seed.js` — campaign initialization

**Consumers**
- `src/renderer/posts-prototype.js` — displays settings
- `src/post-package.js` — reads defaults
- `src/content-generation.js` — decides video generation

**Status:** ✅ implemented — task #10 (4 new fields, src/workspace-entities.js)

---

## `postPackages`

Generated content packages ready for staging/publishing.

**Schema fields (NEW for task #10 — 2 video fields):**
- `videosGenerated` (number, default: 0)
- `totalVideoGenerationCost` (number|null)

**Producers**
- `src/firebase-sync.js` — buildFirestoreSyncBundle
- `src/content-generation.js` — creates package

**Consumers**
- `src/renderer/posts-prototype.js` — displays package
- `src/metrics.js` — aggregates metrics

**Status:** ⚠ fields defined in registry — not yet set by implementation code (postPackages video fields, task #10 follow-up)

---

## `postRuns`

Execution logs for staged/published posts.

**Schema fields (NEW for task #10 — 2 video fields):**
- `videoGenerationAttempts` (number)
- `videoGenerationBudgetUsed` (number|null)

**Producers**
- `src/platform-proof.js` — logs execution

**Consumers**
- `src/metrics.js` — aggregates metrics
- `src/budget-tracker.js` — tracks spending

**Status:** ⚠ fields defined in registry — not yet set by implementation code (postRuns video fields, task #10 follow-up)

---

## Summary

| Collection | New Video Fields | Producers | Consumers | Status |
|---|---|---|---|---|
| postDrafts | 12 | firebase-sync, post-package, video-worker | posts-prototype, video-worker, platform-adapter, metrics | ✅ implemented |
| campaigns | 4 | campaign-ui, seed | posts-prototype, post-package, content-generation | ✅ implemented |
| postPackages | 2 | firebase-sync, content-generation | posts-prototype, metrics | ⚠ registry-only (no impl yet) |
| postRuns | 2 | platform-proof | metrics, budget-tracker | ⚠ registry-only (no impl yet) |

Total: 20 new fields across 4 collections

**Status:** Audit complete — schema fully defined for task #10
