# Environment Variables Registry

Every environment variable used in Diamond. For each: type, required, default, usage, and status.

---

## HeyGen Video Generation (NEW — Task #10)

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

## Kling Video Generation

### `KLING_API_KEY`

Kling API authentication key for the per-draft Kling button.

**Type:** string (secret)
**Required:** yes (if using the Kling button)
**Default:** (none)
**Location:** .env.local or production secret manager

**Consumers**
- `src/video-generation-worker.js` - constructs Authorization header
- `src/electron/main.cjs` - passes config to the renderer through a narrow IPC method

**Status:** optional provider - augments existing HeyGen video generation

---

### `KLING_API_ENDPOINT`

Kling-compatible API base URL.

**Type:** string (URL)
**Required:** no
**Default:** `https://api.klingapi.com/v1`

**Consumers**
- `src/video-generation-worker.js` - base URL for Kling API calls

**Status:** optional provider - endpoint can be overridden for approved Kling gateways

---

### `KLING_MODEL`

Kling model ID to use for generation.

**Type:** string
**Required:** no
**Default:** `kling-v2.6-pro`

**Consumers**
- `src/video-generation-worker.js` - included in Kling generation requests

**Status:** optional provider setting

---

### `KLING_ENABLE_AUDIO`

Whether Kling requests should ask for native audio when the configured model/endpoint supports it.

**Type:** boolean string (`true`/`false`)
**Required:** no
**Default:** `false`

**Consumers**
- `src/electron/main.cjs` - exposes a boolean to renderer generation calls

**Status:** optional provider setting

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

**New variables for task #10:** 8 (6 HeyGen + 2 email)  
- 2 required core (API key, endpoint)  
- 3 optional enhancements (webhook, avatar, voice)  
- 1 required for storage (bucket)  
- 2 required for notifications (email service, sender)

**Status:** Audit complete — environment variables fully specified
