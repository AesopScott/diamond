# Video Generation Approach — HeyGen API Integration

This document specifies the HeyGen API design and integration approach for task #10 video generation feature.

---

## API Authentication

**Authentication Method:** Bearer token in Authorization header

**Header Format:**
```
Authorization: Bearer {HEYGEN_API_KEY}
```

**Key Location:** Environment variable `HEYGEN_API_KEY` (required)
- Stored in `.env.local` during development
- Stored in production secret manager during deployment
- Never hardcoded or logged

**Example Request with Auth:**
```bash
curl -X POST https://api.heygen.com/v1/video/generate \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "...", "duration": 15}'
```

---

## Credit System & Pricing

**Model:** Pay-as-you-go credits consumed per video generated

**Pricing (estimated):**
- **Flux Pro:** ~$0.97 per minute of video
  - 15-second video: ~$0.24
  - 30-second video: ~$0.49
  - 60-second video: ~$0.97

**HeyGen Creator Plan ($29/month):**
- 600 monthly credits (~600 minutes of video, or ~1200 x 30-sec videos)
- Covers daily TikTok (15-sec) + twice-monthly YouTube (60-sec) requirements

**Cost Tracking:**
- Each `generatedVideoUrl` response includes `creditsUsed` field
- Store `videoGenerationCost` in Firestore per post
- Track cumulative spend in `postRuns.videoGenerationBudgetUsed`
- Monitor monthly spend against $29/month budget

---

## Rate Limits

**Limits:**
- 100 requests per minute per API key
- 10 concurrent video generation jobs per account
- Job timeout: 300 seconds (5 minutes) for polling

**Handling:**
- If rate limit hit (429 response): exponential backoff, max 3 retries
- If timeout: mark as `videoGenerationStatus: 'failed'`, allow manual retry
- Track `videoGenerationAttempts` count per post (max 3 attempts before email notification)

---

## Request Shape

**Endpoint:** `POST {HEYGEN_API_ENDPOINT}/video/generate`

**Headers:**
```
Authorization: Bearer {HEYGEN_API_KEY}
Content-Type: application/json
```

**Request Body:**
```typescript
{
  prompt: string                        // Video script/description (required)
  duration: number                      // Duration in seconds: 15, 30, or 60 (required)
  quality: 'low' | 'medium' | 'high'   // Video quality from campaign settings (required)
  avatar_id?: string                    // HeyGen avatar ID from HEYGEN_AVATAR_ID (optional)
  voice_id?: string                     // HeyGen voice ID from HEYGEN_VOICE_ID (optional)
  platform?: string                     // Platform name for metadata: tiktok, youtube, etc. (optional)
  webhook_url?: string                  // Webhook callback URL for async completion (optional, requires HEYGEN_WEBHOOK_SECRET)
}
```

**Example Request:**
```json
{
  "prompt": "A sustainable fashion expert explains eco-friendly clothing choices in 30 seconds.",
  "duration": 30,
  "quality": "high",
  "avatar_id": "default",
  "voice_id": "en-us-1",
  "platform": "instagram",
  "webhook_url": "https://diamond.example.com/webhooks/video-complete"
}
```

---

## Response Shape

**Success Response (200):**
```typescript
{
  video_id: string                      // Unique identifier for generated video (required)
  status: 'pending' | 'generating' | 'completed' | 'failed'  // Job status (required)
  video_url?: string                    // Direct URL to generated video (present when status='completed')
  credits_used: number                  // Credits consumed for this video (required)
  duration_seconds: number              // Actual duration of generated video (required when completed)
  created_at: string                    // ISO 8601 timestamp of creation (required)
  expires_at?: string                   // ISO 8601 timestamp when video URL expires (required when completed)
}
```

**Example Success Response:**
```json
{
  "video_id": "vid-abc123def456",
  "status": "completed",
  "video_url": "https://storage.heygen.com/videos/vid-abc123def456.mp4",
  "credits_used": 0.49,
  "duration_seconds": 30,
  "created_at": "2026-05-25T14:30:00Z",
  "expires_at": "2026-06-01T14:30:00Z"
}
```

**Error Response (4xx/5xx):**
```typescript
{
  error: {
    code: string                        // Error code: invalid_prompt, quota_exceeded, etc.
    message: string                     // Human-readable error message
    retry_after?: number                // Seconds to wait before retrying (for 429/503)
  }
}
```

**Example Error Response:**
```json
{
  "error": {
    "code": "quota_exceeded",
    "message": "Monthly credit limit reached",
    "retry_after": null
  }
}
```

---

## Polling Strategy

**For Synchronous Workflow (blocking):**
1. POST request to `/video/generate` returns immediately with `video_id` and `status: pending`
2. Poll `GET /video/{video_id}` every 2 seconds for status updates
3. Continue polling until `status: completed` or `status: failed` (max 300 seconds)
4. On timeout: mark as `videoGenerationStatus: failed`, trigger email notification

**Poll Endpoint:** `GET {HEYGEN_API_ENDPOINT}/video/{video_id}`

**Poll Response:** Same as POST response above

**Example Polling Loop:**
```javascript
const pollVideo = async (videoId, maxWaitMs = 300000) => {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    const response = await fetch(`${HEYGEN_API_ENDPOINT}/video/${videoId}`, {
      headers: { Authorization: `Bearer ${HEYGEN_API_KEY}` }
    });
    const data = await response.json();
    
    if (data.status === 'completed') return data;
    if (data.status === 'failed') throw new Error(data.error?.message);
    
    await sleep(2000); // Wait 2 seconds before next poll
  }
  throw new Error('Video generation timeout (5 minutes)');
};
```

**For Asynchronous Workflow (webhook):**
1. POST request includes `webhook_url` parameter
2. HeyGen calls webhook with video details when generation completes
3. Validate webhook signature using `HEYGEN_WEBHOOK_SECRET`
4. Update post document with `generatedVideoUrl` and `videoGenerationStatus: success`
5. No polling needed (lower latency, better for user experience)

---

## Template/Avatar/Voice/Quality Identifiers

**Avatar ID (`HEYGEN_AVATAR_ID`):**
- Default: `default` (HeyGen's standard avatar)
- Configure per-operator preference in campaign settings (optional)
- Affects video styling and appearance consistency

**Voice ID (`HEYGEN_VOICE_ID`):**
- Default: `en-us-1` (US English male voice)
- Configure per-operator preference (optional)
- Available voices depend on HeyGen subscription tier

**Quality Levels (`videoQualitySize` in campaign settings):**
- `low`: Faster generation, lower quality (2-3 minutes generation time)
- `medium`: Balanced (5-8 minutes generation time)
- `high`: Best quality, slower (10-15 minutes generation time)

**Mapping:**
```javascript
const HEYGEN_QUALITY_MAP = {
  'low': 'standard',
  'medium': 'hd',
  'high': 'uhd'
};
```

---

## Webhook/Callback Handling (Optional)

**When to Use:** For automated posts where immediate video availability isn't critical

**Setup:**
1. Configure `HEYGEN_WEBHOOK_SECRET` in environment
2. Include `webhook_url` in POST request to `/video/generate`
3. HeyGen calls webhook when generation completes

**Webhook Request (from HeyGen to Diamond):**
```
POST {webhook_url}
Authorization: HeyGen-Signature: {signature}
Content-Type: application/json

{
  "video_id": "vid-abc123",
  "status": "completed",
  "video_url": "https://storage.heygen.com/videos/vid-abc123.mp4",
  "credits_used": 0.49
}
```

**Signature Validation:**
```javascript
const validateWebhook = (body, signature) => {
  const computed = crypto
    .createHmac('sha256', HEYGEN_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');
  return computed === signature;
};
```

**Webhook Handler (Diamond):**
1. Validate signature
2. Retrieve post document by `video_id`
3. Update with `generatedVideoUrl` and `videoGenerationStatus: success`
4. Trigger any downstream flows (staging, publishing, etc.)

---

## Error Handling & Retry Logic

**Transient Errors (retry):**
- 429 (rate limit) → exponential backoff, max 3 retries
- 503 (service unavailable) → exponential backoff, max 3 retries
- Timeout (>300s) → allow manual retry via UI

**Permanent Errors (fail):**
- 400 (bad request) → invalid prompt, bad parameters
- 401 (unauthorized) → invalid API key
- 402 (payment required) → credits exhausted
- 404 (not found) → video_id not found

**Post-Level Error Handling:**
- Store `videoGenerationError: { code, message, timestamp }`
- Set `videoGenerationRetryable: true` for transient errors
- Set `videoGenerationRetryable: false` for permanent errors
- After 3 failed attempts, set `videoGenerationStatus: failed`
- Trigger email notification to operator

---

## Storage & Persistence

**Video URL Persistence:**
- HeyGen video URLs expire after 7 days
- For durable storage, download video to cloud storage bucket
- Configure `HEYGEN_STORAGE_BUCKET` to persist videos long-term

**Storage Adapter:**
```javascript
const persistVideo = async (videoUrl, postId) => {
  const response = await fetch(videoUrl);
  const buffer = await response.buffer();
  
  const bucket = admin.storage().bucket(HEYGEN_STORAGE_BUCKET);
  const file = bucket.file(`videos/${postId}.mp4`);
  await file.save(buffer, { metadata: { contentType: 'video/mp4' } });
  
  return `gs://${HEYGEN_STORAGE_BUCKET}/videos/${postId}.mp4`;
};
```

---

## Example cURL Requests

**Generate Video (Synchronous):**
```bash
curl -X POST https://api.heygen.com/v1/video/generate \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain sustainable fashion in 30 seconds",
    "duration": 30,
    "quality": "high",
    "avatar_id": "default",
    "voice_id": "en-us-1"
  }'
```

**Poll Video Status:**
```bash
curl -X GET https://api.heygen.com/v1/video/vid-abc123def456 \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxx"
```

**Generate Video with Webhook (Asynchronous):**
```bash
curl -X POST https://api.heygen.com/v1/video/generate \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain sustainable fashion in 30 seconds",
    "duration": 30,
    "quality": "high",
    "webhook_url": "https://diamond.example.com/webhooks/video-complete"
  }'
```

---

## Summary

HeyGen API integration is straightforward bearer-token authentication with polling or webhook completion. Key design decisions:

- **Polling for interactive posts** (user sees generation in progress)
- **Webhooks for automated posts** (fire-and-forget, email when ready)
- **7-day URL expiry** → persist to cloud storage for long-term retention
- **3 retry limit** → fail after 3 attempts, notify operator
- **Budget tracking** → monitor monthly spend against $29/month Creator plan

All environment variables documented in `docs/registries/env-vars.md`.
