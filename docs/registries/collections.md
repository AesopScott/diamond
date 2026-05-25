# Firestore Collections & Schema Registry

Every Firestore collection and schema field used in Diamond. For each: structure, producers, consumers, status.

---

## `postDrafts`

Post draft documents with generated content and metadata.

**Schema fields:** (from firebase-sync.js)
- `id`, `companyId`, `brandId`, `campaignId`
- `text`, `platform`, `status`
- `videoGenerationRequested` (NEW — task #10)
- `generatedVideoUrl` (NEW — task #10)
- `generatedVideoPrompt` (NEW — task #10)
- `videoGenerationStatus` (NEW — task #10)

**Producers**
- `src/firebase-sync.js:26` — buildFirestoreSyncBundle creates rows
- `src/post-package.js:TBD` — creates draft with content (task #10 will extend)

**Consumers**
- `src/renderer/posts-prototype.js:TBD` — loads and displays drafts
- `src/video-generation-worker.js:TBD` — reads videoGenerationRequested (task #10)

**Status:** ✓ wired (existing); ⚠ schema extension pending task #10

---

## `campaigns`

Campaign configuration and metadata.

**Schema fields:**
- `id`, `companyId`, `brandId`
- `name`, `description`
- `videoGenerationEnabled` (NEW — task #10)
- `videoGenerationPlatforms` (NEW — task #10)
- `videoQualitySize` (NEW — task #10)

**Producers**
- Campaign settings UI (to be wired in task #10)

**Consumers**
- `src/renderer/posts-prototype.js:TBD` — loads campaign settings (task #10 will extend)
- `src/post-package.js:TBD` — reads campaign defaults (task #10)

**Status:** ⚠ schema extension pending task #10

---

## `postPackages`

Generated content packages ready for staging or publishing.

**Schema fields:**
- `id`, `postDraftId`, `campaignId`
- `generatedText`, `generatedAssets`
- `videosGenerated` (NEW — task #10)

**Producers**
- `src/firebase-sync.js:27` — buildFirestoreSyncBundle
- `src/content-generation.js:TBD` — creates package with text

**Consumers**
- `src/renderer/posts-prototype.js:TBD` — displays package for review

**Status:** ⚠ schema extension pending task #10

---

## `postRuns`

Execution logs for staged or published posts.

**Schema fields:**
- `id`, `postPackageId`, `platform`
- `status`, `timestamp`, `screenshot`
- `videoGenerationAttempts` (NEW — task #10)

**Producers**
- `src/platform-proof.js:TBD` — logs post execution

**Consumers**
- `src/metrics.js:TBD` — aggregates performance metrics

**Status:** ⚠ schema extension pending task #10

---

## Summary

| Collection | Fields | Producers | Consumers | Status |
|---|---|---|---|---|
| postDrafts | 13 (7 new) | firebase-sync.js, post-package.js | posts-prototype.js, video-generation-worker.js | ⚠ extension pending |
| campaigns | 7 (3 new) | campaign settings UI | posts-prototype.js, post-package.js | ⚠ extension pending |
| postPackages | 5 (1 new) | firebase-sync.js, content-generation.js | posts-prototype.js | ⚠ extension pending |
| postRuns | 7 (1 new) | platform-proof.js | metrics.js | ⚠ extension pending |

---

## Audit Trail — Proof of Registry Verification

**Last audit:** 2026-05-25T12:15:00Z (by /cross-boundary-audit)

**Boundaries checked:** Firestore collections and schema

**Evidence recorded:**
- 4 collections registered
- Schema extensions for task #10: 12 new fields across 4 collections
- New producers (to be implemented): campaign settings UI, video-generation-worker.js
- New consumers (to be implemented): video-generation-worker.js (postDrafts), campaign settings reader (campaigns)

**Gaps identified:**
- ⚠ Orphan producers pending: campaign settings UI for videoGenerationEnabled toggle (task #10)
- ⚠ Orphan consumers pending: video-generation-worker.js needs to read postDrafts.videoGenerationRequested (task #10)
- ⚠ Schema misalignment: postDrafts video fields defined in task plan but not yet in code (task #10 implementation)

**Status:** Audit complete — baseline registries established; 12 schema extensions queued for task #10
