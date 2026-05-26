# Environment Variables Registry

Every environment variable used in Diamond. For each: producers, consumers, status. Update whenever an env var is added, removed, or its usage changes.

---

## Image Generation (Task #9)

### `REPLICATE_API_KEY`

API authentication key for Replicate.com image generation service (Flux Pro model).

**Type:** string (Bearer token format)

**Producer**
- `.env.local` (local development) or secret manager (production) — set by operator before app startup

**Consumers**
- `src/replicate-image-service.js:22` — `authenticateReplicateRequest()` reads and validates presence
- `src/electron/main.cjs` — `diamond:get-replicate-api-key` IPC handler reads and returns to renderer

**Constraints:**
- Required for image generation to work
- Must be a valid Replicate API key (format: `r8_...`)
- Never logged or exposed in error messages
- Loaded at app startup; missing key fails gracefully with user-facing error

**Status:** ✓ wired — consumer implementation complete (task #9), producer is environment config

---

## Video Generation (Task #10)

### `HEYGEN_API_KEY`

HeyGen API authentication key for video generation.

**Type:** string (secret)
**Required:** yes (if video generation enabled)
**Default:** (none)
**Location:** .env.local or production secret manager

**Consumers**
- `src/video-generation-worker.js` — constructs Authorization header

**Status:** ⚠ NEW — task #10 wires this

---

### `HEYGEN_API_ENDPOINT`

HeyGen API base URL.

**Type:** string (URL)
**Required:** yes (if video generation enabled)
**Default:** `https://api.heygen.com/v1`

**Consumers**
- `src/video-generation-worker.js` — base URL for API calls

**Status:** ⚠ NEW — task #10 wires this

---

### `HEYGEN_WEBHOOK_SECRET`

Shared secret for HeyGen webhook callbacks (async completion).

**Type:** string (secret)
**Required:** no (optional, only if webhooks enabled)
**Default:** (none)

**Consumers**
- `src/video-webhook-handler.js` — validates webhook signatures

**Status:** ⚠ NEW — task #10 optional

---

### `HEYGEN_STORAGE_BUCKET`

Cloud storage bucket for persisting generated videos.

**Type:** string (bucket name)
**Required:** yes (for durable video persistence)
**Default:** (depends on infrastructure)

**Consumers**
- `src/video-storage.js` — uploads videos to persistent storage

**Status:** ⚠ NEW — task #10 planned

---

### `HEYGEN_AVATAR_ID`

HeyGen avatar ID for consistent video styling.

**Type:** string
**Required:** no (optional)
**Default:** (none)

**Consumers**
- `src/video-generation-worker.js` — includes in generation request

**Status:** ⚠ NEW — task #10 optional

---

### `HEYGEN_VOICE_ID`

HeyGen voice ID for video narration.

**Type:** string
**Required:** no (optional)
**Default:** (none)

**Consumers**
- `src/video-generation-worker.js` — includes in generation request

**Status:** ⚠ NEW — task #10 optional

---

## Email Notifications (Task #10)

### `NOTIFICATION_EMAIL_FROM`

Sender email for video generation failure notifications.

**Type:** string (email)
**Required:** yes (if automated posts with video enabled)
**Default:** `noreply@diamond.local`

**Consumers**
- `src/video-error-handler.js` — failure notifications

**Status:** ⚠ NEW — task #10

---

### `NOTIFICATION_EMAIL_SERVICE`

Email service provider.

**Type:** string (enum: sendgrid|ses|mailgun|smtp)
**Required:** yes (if email enabled)
**Default:** `sendgrid`

**Consumers**
- `src/video-error-handler.js` — routes to email service

**Status:** ⚠ NEW — task #10

---

### `SENDGRID_API_KEY`

SendGrid API key for sending video error notification emails.

**Type:** string (secret)
**Required:** yes (if `NOTIFICATION_EMAIL_SERVICE=sendgrid`)
**Default:** (none)
**Location:** .env.local or production secret manager

**Consumers**
- `src/video-error-handler.js` — Authorization header for SendGrid API calls

**Status:** ✅ NEW — task #10

---

## Summary

| Variable | Producer | Consumer | Status |
|---|---|---|---|
| `REPLICATE_API_KEY` | .env.local / secret manager | replicate-image-service.js, main.cjs (IPC) | ✓ (task #9) |
| `HEYGEN_API_KEY` | .env.local / secret manager | video-generation-worker.js | ⚠ NEW (task #10) |
| `HEYGEN_API_ENDPOINT` | .env.local / secret manager | video-generation-worker.js | ⚠ NEW (task #10) |
| `HEYGEN_WEBHOOK_SECRET` | .env.local / secret manager | video-webhook-handler.js | ⚠ optional (task #10) |
| `HEYGEN_STORAGE_BUCKET` | .env.local / secret manager | video-storage.js | ⚠ NEW (task #10) |
| `HEYGEN_AVATAR_ID` | .env.local / secret manager | video-generation-worker.js | ⚠ optional (task #10) |
| `HEYGEN_VOICE_ID` | .env.local / secret manager | video-generation-worker.js | ⚠ optional (task #10) |
| `NOTIFICATION_EMAIL_FROM` | .env.local / config | video-error-handler.js | ⚠ NEW (task #10) |
| `NOTIFICATION_EMAIL_SERVICE` | .env.local / config | video-error-handler.js | ⚠ NEW (task #10) |
| `SENDGRID_API_KEY` | .env.local / secret manager | video-error-handler.js | ⚠ NEW (task #10) |

---

## Audit Trail — Proof of Registry Verification

**Last audit:** 2026-05-25T18:00:00Z (by /cross-boundary-audit, task #9)
**Last audit:** 2026-05-25T19:00:00Z (by /cross-boundary-audit, task #10)

**Boundaries checked:** Environment variables used for external API authentication and notifications

**Evidence recorded:**
- 10 entries total (1 from task #9, 9 from task #10)
- All entries with producer/consumer pairs documented ✓
- 0 orphan producers/consumers

**Status:** Audit complete — all wired (task #9) and planned (task #10) variables documented
