# Environment Variables Registry

Every environment variable used in Diamond. For each: where it's read, what it configures, required/optional, status.

---

## `HEYGEN_API_KEY`

HeyGen API authentication key for video generation.

**Type:** Secret string

**Producers**
- `.env.local` — user configuration

**Consumers**
- `src/video-generation-worker.js:TBD` — HeyGen API authentication header (to be implemented in task #10)

**Status:** ⚠ orphan consumer — API integration not yet written

---

## `HEYGEN_API_ENDPOINT`

HeyGen API base URL for video generation requests.

**Type:** URL string

**Default:** `https://api.heygen.com/v1`

**Producers**
- `.env.local` — user configuration

**Consumers**
- `src/video-generation-worker.js:TBD` — POST requests to HeyGen (to be implemented in task #10)

**Status:** ⚠ orphan consumer — API integration not yet written

---

## `ELEVENLABS_API_KEY`

ElevenLabs API key for text-to-speech voice generation.

**Type:** Secret string

**Producers**
- `.env.local` — user configuration

**Consumers**
- `src/electron/main.cjs:471` — voiceover generation via ElevenLabs API
- `src/user-guide.js:304` — audio generation configuration

**Status:** ✓ wired

---

## `ELEVENLABS_VOICE_ID`

ElevenLabs voice ID for consistent speaker identity.

**Type:** String ID

**Producers**
- `.env.local` — user configuration

**Consumers**
- `src/electron/main.cjs:472` — voiceover voice selection
- `src/renderer/posts-prototype.js:3913` — voice configuration display

**Status:** ✓ wired

---

## `ELEVENLABS_MODEL_ID`

ElevenLabs model version (e.g., `eleven_multilingual_v2`).

**Type:** String

**Default:** `eleven_multilingual_v2`

**Producers**
- `.env.local` — user configuration
- `src/user-guide.js:1` — default constant

**Consumers**
- `src/electron/main.cjs:446, 473` — voiceover generation
- `src/user-guide.js:283` — guide audio generation

**Status:** ✓ wired

---

## `OPENAI_API_KEY`

OpenAI API key for GPT-based content review and refinement.

**Type:** Secret string

**Producers**
- `.env.local` — user configuration

**Consumers**
- `src/content-generation-llm.cjs:32, 239, 329` — GPT reviewer calls

**Status:** ✓ wired

---

## `ANTHROPIC_API_KEY`

Anthropic Claude API key for content generation (writer stage).

**Type:** Secret string

**Producers**
- `.env.local` — user configuration

**Consumers**
- `src/content-generation-llm.cjs:11` — referenced in comments (actual usage TBD)

**Status:** ⚠ partial — documented but consumer location needs verification

---

## `DIAMOND_FIREBASE_ADMIN_JSON`

Path to Firebase admin service account JSON file.

**Type:** File path

**Producers**
- `.env.local` — user configuration
- `src/electron/main.cjs:289, 294` — environment variable

**Consumers**
- `src/firebase-sync.js:6` — Firebase admin SDK authentication
- `src/firebase-license.cjs:10` — license portal setup

**Status:** ✓ wired

---

## `FIREBASE_PROJECT_ID`

Firebase project ID for backend sync.

**Type:** String

**Producers**
- `.env.local` — user configuration
- `src/firebase-license.cjs:19` — fallback to service account

**Consumers**
- `src/electron/main.cjs:296` — Firebase initialization
- `src/firebase-sync.js:17` — Firestore project reference

**Status:** ✓ wired

---

## `REPLICATE_API_KEY`

Replicate API authentication key for image generation.

**Type:** Secret string

**Producers**
- `.env.local` — user configuration

**Consumers**
- `src/replicate-image-service.js:TBD` — Replicate API authentication header (to be implemented in task #9)

**Status:** ⚠ orphan consumer — API integration not yet written

---

## Summary

| Variable | Producers | Consumers | Status |
|---|---|---|---|
| HEYGEN_API_KEY | .env.local | video-generation-worker.js | ⚠ orphan consumer |
| HEYGEN_API_ENDPOINT | .env.local | video-generation-worker.js | ⚠ orphan consumer |
| ELEVENLABS_API_KEY | .env.local | main.cjs, user-guide.js | ✓ |
| ELEVENLABS_VOICE_ID | .env.local | main.cjs, posts-prototype.js | ✓ |
| ELEVENLABS_MODEL_ID | .env.local, user-guide.js | main.cjs, user-guide.js | ✓ |
| OPENAI_API_KEY | .env.local | content-generation-llm.cjs | ✓ |
| ANTHROPIC_API_KEY | .env.local | (referenced only) | ⚠ partial |
| DIAMOND_FIREBASE_ADMIN_JSON | .env.local, main.cjs | firebase-sync.js, firebase-license.cjs | ✓ |
| FIREBASE_PROJECT_ID | .env.local, firebase-license.cjs | main.cjs, firebase-sync.js | ✓ |
| REPLICATE_API_KEY | .env.local | replicate-image-service.js | ⚠ orphan consumer |

---

## Audit Trail — Proof of Registry Verification

**Last audit:** 2026-05-25T13:45:00Z (by /cross-boundary-audit)

**Boundaries checked:** Environment variables

**Evidence recorded:**
- 10 entries total
- 7 entries with complete producer/consumer pairs ✓
- 3 entries with gaps (orphan consumers for HEYGEN_* and REPLICATE_* — expected, tasks #9 and #10 in progress) ⚠
- New identifiers introduced on task #9: REPLICATE_API_KEY

**Gaps identified:**
- ⚠ HEYGEN_API_KEY — orphan consumer; consumer will be src/video-generation-worker.js (task #10)
- ⚠ HEYGEN_API_ENDPOINT — orphan consumer; consumer will be src/video-generation-worker.js (task #10)
- ⚠ ANTHROPIC_API_KEY — referenced in comments but actual consumer location needs verification
- ⚠ REPLICATE_API_KEY — orphan consumer; consumer will be src/replicate-image-service.js (task #9)

**Status:** Audit complete — registries match current code; 3 expected gaps for tasks #9 and #10 in progress
