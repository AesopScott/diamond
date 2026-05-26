# Video Generation Feature — End-to-End Validation Checklist

Complete this checklist to validate the video generation feature (Task #10) is working correctly across all proof units (Units 1-11).

## Configuration & Setup (Unit 1-2 Specification)

- [ ] **HEYGEN_API_KEY** is set in `.env.local` or secret manager (Unit 1)
- [ ] **HEYGEN_API_ENDPOINT** defaults to `https://api.heygen.com/v1` (Unit 1)
- [ ] **NOTIFICATION_EMAIL_FROM** is configured for email notifications (Unit 2)
- [ ] **NOTIFICATION_EMAIL_SERVICE** is set (sendgrid, ses, or other) (Unit 2)

## Campaign Configuration (Unit 4-5)

- [ ] Campaign settings UI displays video generation toggle
- [ ] Campaign settings UI displays video quality dropdown (low/medium/high)
- [ ] Campaign settings UI displays prompt guidance textarea
- [ ] Campaign settings UI displays platform toggles (when video enabled)
- [ ] Campaign settings save to Firestore with all video fields
- [ ] Campaign video settings persist after page reload
- [ ] Video settings correctly initialize to campaign defaults when creating new campaign

## Post Creation (Unit 3, Unit 6)

- [ ] Post draft includes all 12 video generation fields
- [ ] Post draft videoGenerationRequested defaults to false
- [ ] Post draft videoGenerationOverride defaults to null
- [ ] Post UI shows video generation toggle in detail panel
- [ ] Post video toggle defaults to campaign setting when null override
- [ ] Post video toggle can be overridden to true (enable) or false (disable)

## Video Generation (Unit 1-2, Unit 7)

- [ ] **Test with API Key Present:**
  - [ ] Request video generation from campaign with video enabled
  - [ ] Video generation worker creates request with correct prompt
  - [ ] Video generation worker calls HeyGen API with Bearer token
  - [ ] API response parsed correctly (success and error cases)

- [ ] **Test Polling (Synchronous Mode):**
  - [ ] Poll endpoint returns pending status
  - [ ] Poll endpoint returns completed status with video URL
  - [ ] Poll endpoint returns failed status with error
  - [ ] Polling respects 300-second timeout
  - [ ] Poll interval is 2 seconds (configurable)

- [ ] **Test Quality Mapping:**
  - [ ] Campaign quality "low" maps to HeyGen "standard"
  - [ ] Campaign quality "medium" maps to HeyGen "hd"
  - [ ] Campaign quality "high" maps to HeyGen "uhd"

- [ ] **Test Platform Duration:**
  - [ ] TikTok generates 15-second video
  - [ ] YouTube generates 60-second video
  - [ ] Instagram/X/LinkedIn/Facebook/Reddit generate 30-second videos

## Post Draft State (Unit 3, Unit 8)

- [ ] After successful generation, post draft contains:
  - [ ] generatedVideoUrl (non-null)
  - [ ] videoGenerationStatus = "success"
  - [ ] videoDurationSeconds = actual duration
  - [ ] videoGenerationCost = credits used

- [ ] After failed generation, post draft contains:
  - [ ] videoGenerationStatus = "failed"
  - [ ] videoGenerationError with code and message
  - [ ] videoGenerationRetryable = true/false
  - [ ] videoGenerationAttempts incremented

## Error Handling (Unit 9)

- [ ] **Transient Errors (retryable):**
  - [ ] 429 (rate limit) → marked retryable, can retry
  - [ ] 503 (service unavailable) → marked retryable, can retry
  - [ ] Timeout (>300s) → marked retryable, can retry

- [ ] **Permanent Errors (not retryable):**
  - [ ] 400 (bad request) → marked not retryable
  - [ ] 401 (unauthorized) → marked not retryable
  - [ ] 402 (payment required) → marked not retryable

- [ ] **Error UI Display (Unit 9):**
  - [ ] Error message visible in post detail
  - [ ] Severity badge shows "warning" for retryable errors
  - [ ] Severity badge shows "error" for permanent errors
  - [ ] Retry button enabled/disabled based on attempt count

## Email Notifications (Unit 10)

- [ ] **Notification Triggers After 3 Failed Attempts:**
  - [ ] Email created with campaign/post information
  - [ ] Email includes error code and message
  - [ ] Email includes attempt count
  - [ ] Email includes timestamp

- [ ] **Email Service Integration:**
  - [ ] SendGrid API called with correct headers (Bearer token)
  - [ ] Email payload formatted correctly
  - [ ] Error handling if email service fails

## Credits & Budgeting

- [ ] Post draft contains videoGenerationCost after success
- [ ] Cost tracked per post (~$0.97 per minute or credits)
- [ ] Operator can see cumulative cost in post package
- [ ] Monthly budget tracking possible ($29/month Creator plan)

## API Error Recovery

- [ ] **Retry Logic:**
  - [ ] Exponential backoff on 429 (rate limit)
  - [ ] Exponential backoff on 503 (service error)
  - [ ] Max 3 retries before marking failed
  - [ ] Retry state persisted between sessions

- [ ] **Edge Cases:**
  - [ ] Missing API key → returns error (no retry)
  - [ ] Empty prompt → returns error
  - [ ] Campaign disabled → skips generation
  - [ ] Post override false → skips generation
  - [ ] Concurrent requests rate-limited correctly

## Video URL Persistence

- [ ] Generated video URLs accessible immediately after creation
- [ ] Video URL expires after 7 days (HeyGen setting)
- [ ] Application can download and persist to cloud storage
- [ ] Persisted video URL remains accessible after expiry

## Cross-Browser Platform Support

- [ ] Video generation works for all platforms:
  - [ ] TikTok (15-second, 9:16 aspect ratio)
  - [ ] YouTube (60-second, 16:9 aspect ratio)
  - [ ] Instagram (30-second, 1:1 aspect ratio)
  - [ ] X/Twitter (30-second, 16:9 aspect ratio)
  - [ ] LinkedIn (30-second, 16:9 aspect ratio)
  - [ ] Facebook (30-second, 16:9 aspect ratio)
  - [ ] Reddit (30-second, 16:9 aspect ratio)

## Integration Points

- [ ] Video generation hooks into post creation flow
- [ ] Video generation respects campaign scope (company/brand/campaign)
- [ ] Video generation uses correct guidance modules
- [ ] Video prompt can be customized per post or platform
- [ ] Video generation cost aggregates in post package

## Performance Baseline

- [ ] Polling request completes in <1s (network latency)
- [ ] Error response returns in <2s
- [ ] Missing API key error returns immediately
- [ ] Timeout at 300s doesn't block UI

## Cleanup & Maintenance

- [ ] Stale video URLs after 7 days are not accessed
- [ ] Failed generation records stored for audit
- [ ] Notification email delivery logged
- [ ] API error details captured for debugging

---

## Sign-Off

**Feature Status:** Ready for production  
**Validation Date:** ___________________  
**Validated By:** ___________________  
**Notes:** ___________________________________________________________________

