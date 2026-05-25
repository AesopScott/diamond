# Task #10 — Video Generation Feature — Proof Units

This document defines the 11 proof units for Task #10 "build video generation feature". Each unit maps to one or more success criteria and defines RED (failing test) → GREEN (passing test) progression.

---

## Success Criteria Mapping

| SC | Description | Proof Units |
|---|---|---|
| SC1 | Campaign operators can enable/disable video per campaign | 2, 4, 5 |
| SC2 | Per-post toggle overrides campaign default | 3, 6 |
| SC3 | HeyGen API generates & stores URLs in Firestore | 7, 8 |
| SC4 | Interactive errors display with retry | 9 |
| SC5 | Automated failures trigger email | 10 |
| SC6 | Manual validation confirms quality | 11 |
| SC7 | Daily TikTok 15-sec + bi-monthly YouTube 60-sec within $29/month | 1, 11 |

---

## Unit 1: HeyGen Configuration Documented

**Maps to:** SC7 (budget/cadence), SC1 (enable/disable)

**RED test:** `docs/video-generation-approach.md` does not exist or lacks required sections.

**Implementation:** Create comprehensive HeyGen API documentation covering:
- API authentication (key location, header format)
- Credit system (costs per video length, $0.97/min estimate)
- Rate limits and polling strategy
- Request shape (prompt, duration, platform specs)
- Response shape (video URL, job status, credit usage)
- Template/avatar/voice/quality identifiers
- Webhook/callback handling for async completion

**GREEN test:** File exists with all sections, example requests documented.

---

## Unit 2: Campaign Schema Extended with Video Settings

**Maps to:** SC1 (enable/disable), SC7 (platform specs)

**RED test:** Constants lack CAMPAIGN_VIDEO_GENERATION_FIELDS and VIDEO_SPECS_BY_PLATFORM.

**Implementation:** Extend src/constants.js with video generation field definitions.

**GREEN test:** New constants present with full platform specs.

---

## Unit 3: Post Schema Extended with Video References

**Maps to:** SC2 (per-post override), SC3 (storage)

**RED test:** Post schema lacks video fields.

**Implementation:** Add all video fields with proper types and enums.

**GREEN test:** All video fields defined in constants with proper types.

---

## Unit 4: Campaign UI Renders Video Generation Controls

**Maps to:** SC1 (enable/disable)

**RED test:** Campaign settings page has no video generation UI.

**Implementation:** Add toggle and platform dropdowns to campaign settings.

**GREEN test:** Toggle and format dropdowns visible and functional.

---

## Unit 5: Campaign Video Settings Persist to Firestore

**Maps to:** SC1 (enable/disable), SC7 (platform selection)

**RED test:** Settings don't persist to Firestore.

**Implementation:** Wire form save to Firestore with proper schema.

**GREEN test:** Settings persist across reload.

---

## Unit 6: Post UI Shows Video Toggle with Campaign Default

**Maps to:** SC2 (per-post override), SC1 (campaign default)

**RED test:** Post creation has no video toggle.

**Implementation:** Add toggle with campaign default and override logic.

**GREEN test:** Toggle respects campaign default, overrides persist.

---

## Unit 7: Video Generation Worker Makes HeyGen API Calls

**Maps to:** SC3 (HeyGen integration), SC4 (error handling)

**RED test:** Worker module doesn't exist.

**Implementation:** Create video-generation-worker.js with auth, request, and storage functions.

**GREEN test:** Unit tests pass for API calls and error handling.

---

## Unit 8: Video Generation Integrated into Post Creation Flow

**Maps to:** SC3 (HeyGen generates & stores)

**RED test:** Post saved with videoGenerationRequested doesn't trigger generation.

**Implementation:** Wire generation trigger in post creation flow.

**GREEN test:** Video URL populated in Firestore after generation.

---

## Unit 9: Video Generation Errors Surface in Interactive Posts

**Maps to:** SC4 (interactive error display + retry)

**RED test:** No UI feedback on generation failure.

**Implementation:** Add error toast/modal with retry button.

**GREEN test:** Error message appears with retry capability.

---

## Unit 10: Automated Post Failure Triggers Email Notification

**Maps to:** SC5 (automated failure email)

**RED test:** Failed automated post doesn't trigger email.

**Implementation:** Add email notification on failure for automated posts.

**GREEN test:** Email received and post marked as failed.

---

## Unit 11: End-to-End Manual Validation Checklist Complete

**Maps to:** SC6 (manual quality validation), SC7 (budget & cadence)

**RED test:** Manual test plan document doesn't exist.

**Implementation:** Create test plan covering TikTok, YouTube, overrides, errors.

**GREEN test:** All tests pass with operator quality approval.

---

## Summary

All 11 units defined. Implementation phase will execute RED → GREEN for each unit.
